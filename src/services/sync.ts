/**
 * Laya (లయ) Mobile — Network & Offline Sync Service (ADR-0003, ADR-0008)
 * Reconciles local AsyncStorage events with backend Fastify engine
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../core/logger';
import { Task, CompletionEvent, UserGroup } from '../core/types';

export interface SyncResult {
  isOnline: boolean;
  syncedEvents: number;
  telemetrySent: boolean;
  message: string;
}

const KEYS = {
  TASKS: '@laya:tasks',
  EVENTS: '@laya:events',
  GROUPS: '@laya:groups',
  LAST_SYNC: '@laya:last_sync_timestamp',
};

export class SyncService {
  /**
   * Health ping to check connectivity
   */
  public static async pingBackend(backendUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${backendUrl}/api/v1/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Sync local tasks and idempotent events with the backend
   */
  public static async syncWithBackend(backendUrl: string, userId: string): Promise<SyncResult> {
    const isOnline = await this.pingBackend(backendUrl);

    if (!isOnline) {
      return {
        isOnline: false,
        syncedEvents: 0,
        telemetrySent: false,
        message: 'Offline mode active. Progress is safely saved locally.',
      };
    }

    try {
      // 1. Gather local data
      const [groupsRaw, tasksRaw, eventsRaw] = await Promise.all([
        AsyncStorage.getItem(KEYS.GROUPS),
        AsyncStorage.getItem(KEYS.TASKS),
        AsyncStorage.getItem(KEYS.EVENTS),
      ]);

      const groups: UserGroup[] = groupsRaw ? JSON.parse(groupsRaw) : [];
      const tasks: Task[] = tasksRaw ? JSON.parse(tasksRaw) : [];
      const events: CompletionEvent[] = eventsRaw ? JSON.parse(eventsRaw) : [];

      // 2. Prepare payload formatted for backend import API
      const formattedTasks = tasks.map((t) => ({
        id: t.id,
        userId,
        groupId: t.groupId,
        title: t.title,
        taskType: t.flavor,
        recurrence: t.frequency,
        targetValue: t.targetAmount,
        unit: t.unit,
        sortOrder: t.sortOrder,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      const formattedEvents = events.map((e) => ({
        id: e.id,
        taskId: e.taskId,
        userId,
        status: e.status,
        progressPercentage: e.percentage ?? (e.status === 'completed' ? 100 : 0),
        notes: e.notes,
        occurredAt: e.occurredAt,
        recordedAt: e.occurredAt,
      }));

      // 3. Post to bulk import endpoint (Idempotent merge)
      const importRes = await fetch(`${backendUrl}/api/v1/data/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({
          groups,
          tasks: formattedTasks,
          milestones: [],
          events: formattedEvents,
        }),
      });

      // 4. Flush telemetry buffer
      const telemetrySent = await logger.flush(backendUrl);

      if (importRes.ok) {
        await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
        logger.log('action', 'sync_success', { syncedEvents: events.length });
        return {
          isOnline: true,
          syncedEvents: events.length,
          telemetrySent,
          message: `Synced ${events.length} events successfully.`,
        };
      }

      return {
        isOnline: true,
        syncedEvents: 0,
        telemetrySent,
        message: 'Connected, but data sync returned non-200.',
      };
    } catch (err: any) {
      logger.log('error', 'sync_failed', { message: err?.message });
      return {
        isOnline: false,
        syncedEvents: 0,
        telemetrySent: false,
        message: 'Sync interrupted. Stored safely offline.',
      };
    }
  }
}
