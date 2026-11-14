/**
 * Laya (లయ) Mobile — Network & Offline Sync Service (ADR-0003, ADR-0008)
 * Reconciles user-scoped AsyncStorage events with backend Fastify engine
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../core/logger';
import { Task, CompletionEvent, UserGroup, TaskFlavor, FrequencyType } from '../core/types';
import { StorageService } from './storage';
import { AuthService } from './auth';

export interface SyncResult {
  isOnline: boolean;
  syncedEvents: number;
  telemetrySent: boolean;
  message: string;
  updatedData?: {
    groups?: UserGroup[];
    tasks?: Task[];
    events?: CompletionEvent[];
  };
}

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
      const session = await AuthService.getStoredSession();
      if (!session?.accessToken) {
        return {
          isOnline: true,
          syncedEvents: 0,
          telemetrySent: false,
          message: 'Local session active. Progress safely preserved.',
        };
      }
      const token = session.accessToken;
      const keys = StorageService.getKeys(userId);

      // 1. Gather local data
      const [groupsRaw, tasksRaw, eventsRaw] = await Promise.all([
        AsyncStorage.getItem(keys.GROUPS),
        AsyncStorage.getItem(keys.TASKS),
        AsyncStorage.getItem(keys.EVENTS),
      ]);

      const groups: UserGroup[] = groupsRaw ? JSON.parse(groupsRaw) : [];
      const tasks: Task[] = tasksRaw ? JSON.parse(tasksRaw) : [];
      const events: CompletionEvent[] = eventsRaw ? JSON.parse(eventsRaw) : [];

      // 2. Prepare payload enriched with full mobile schema attributes
      const formattedTasks = tasks.map((t) => ({
        id: t.id,
        userId,
        groupId: t.groupId,
        title: t.title,
        taskType: t.flavor,
        recurrence: t.frequency,
        targetValue: t.targetAmount,
        stepAmount: t.stepAmount,
        milestones: t.milestones,
        milestoneMode: t.milestoneMode,
        baselineCriteria: t.baselineCriteria,
        schedule: (t as any).schedule,
        lifecycleStatus: t.lifecycleStatus,
        deletedAt: t.deletedAt,
        targetDate: t.targetDate,
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
        recordedAt: e.recordedAt || e.occurredAt,
      }));

      // 3. Post to bulk import endpoint with valid Bearer JWT
      const importRes = await fetch(`${backendUrl}/api/v1/data/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groups,
          tasks: formattedTasks,
          milestones: [],
          events: formattedEvents,
        }),
      });

      // 4. Pull server updates and merge non-destructively
      let updatedData;
      if (importRes.ok) {
        try {
          const exportRes = await fetch(`${backendUrl}/api/v1/data/export`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (exportRes.ok) {
            const json = await exportRes.json();
            const serverTasks = json.data?.tasks;
            if (Array.isArray(serverTasks) && serverTasks.length > 0) {
              const localMap = new Map(tasks.map((t) => [t.id, t]));
              const mergedTasks: Task[] = [];

              for (const st of serverTasks) {
                const local = localMap.get(st.id);
                if (local?.deletedAt) {
                  mergedTasks.push(local); // Never resurrect deleted tasks
                  localMap.delete(st.id);
                  continue;
                }
                const merged: Task = {
                  id: st.id,
                  userId: st.userId || userId,
                  groupId: st.groupId || local?.groupId || 'grp_personal',
                  title: st.title || local?.title || '',
                  flavor: (st.taskType as TaskFlavor) || local?.flavor || 'checklist',
                  frequency: (st.recurrence as FrequencyType) || local?.frequency || 'daily',
                  targetAmount: st.targetValue !== undefined ? st.targetValue : local?.targetAmount,
                  unit: st.unit !== undefined ? st.unit : local?.unit,
                  sortOrder: st.sortOrder !== undefined ? st.sortOrder : (local?.sortOrder ?? 0),
                  createdAt: local?.createdAt || st.createdAt || new Date().toISOString(),
                  updatedAt: st.updatedAt || local?.updatedAt || new Date().toISOString(),
                  stepAmount: local?.stepAmount ?? st.stepAmount,
                  milestones: local?.milestones ?? st.milestones,
                  milestoneMode: local?.milestoneMode ?? st.milestoneMode,
                  baselineCriteria: local?.baselineCriteria ?? st.baselineCriteria,
                  schedule: local?.schedule ?? st.schedule,
                  lifecycleStatus: local?.lifecycleStatus ?? st.lifecycleStatus ?? 'active',
                  targetDate: local?.targetDate ?? st.targetDate,
                  reminderTime: local?.reminderTime ?? st.reminderTime,
                  voiceReminder: local?.voiceReminder ?? st.voiceReminder,
                  archivedAt: local?.archivedAt ?? st.archivedAt,
                  deletedAt: local?.deletedAt ?? st.deletedAt,
                };
                mergedTasks.push(merged);
                localMap.delete(st.id);
              }
              for (const remaining of localMap.values()) {
                mergedTasks.push(remaining);
              }
              await AsyncStorage.setItem(keys.TASKS, JSON.stringify(mergedTasks));
              updatedData = { tasks: mergedTasks };
            }
          }
        } catch {
          // Soft failure on export fetch; local remains intact
        }
      }

      // 5. Flush telemetry buffer
      const telemetrySent = await logger.flush(backendUrl);

      if (importRes.ok) {
        await AsyncStorage.setItem(`@laya:${userId}:last_sync`, new Date().toISOString());
        logger.log('action', 'sync_success', { syncedEvents: events.length });
        return {
          isOnline: true,
          syncedEvents: events.length,
          telemetrySent,
          message: `Synced ${events.length} events successfully.`,
          updatedData,
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
