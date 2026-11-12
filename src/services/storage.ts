/**
 * Laya (లయ) Mobile — Local-First Storage Adapter
 * Pure Offline Resilience with User-Scoped AsyncStorage (ADR-0003, ADR-0005)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CompletionEvent, UserGroup, PinnedChart } from '../core/types';

export function generateUUID(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export class StorageService {
  private static currentUserId: string = 'usr_guest';

  public static setUserId(userId: string) {
    this.currentUserId = userId || 'usr_guest';
  }

  public static getKeys(userId?: string) {
    const uid = userId || this.currentUserId;
    return {
      TASKS: `@laya:${uid}:tasks`,
      EVENTS: `@laya:${uid}:events`,
      GROUPS: `@laya:${uid}:groups`,
      PINNED_CHARTS: `@laya:${uid}:pinned_charts`,
    };
  }

  public static async loadInitialData(userId: string = 'usr_guest'): Promise<{
    groups: UserGroup[];
    tasks: Task[];
    events: CompletionEvent[];
    pinnedCharts: PinnedChart[];
  }> {
    this.setUserId(userId);
    const keys = this.getKeys(userId);

    let [groupsJson, tasksJson, eventsJson, chartsJson] = await Promise.all([
      AsyncStorage.getItem(keys.GROUPS),
      AsyncStorage.getItem(keys.TASKS),
      AsyncStorage.getItem(keys.EVENTS),
      AsyncStorage.getItem(keys.PINNED_CHARTS),
    ]);

    // Backward compatibility: migrate un-namespaced keys if present for guest
    if (!tasksJson && userId === 'usr_guest') {
      const legacyTasks = await AsyncStorage.getItem('@laya:tasks');
      if (legacyTasks) {
        tasksJson = legacyTasks;
        await AsyncStorage.setItem(keys.TASKS, legacyTasks);
      }
    }

    let groups: UserGroup[] = groupsJson ? JSON.parse(groupsJson) : [];
    let tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
    let events: CompletionEvent[] = eventsJson ? JSON.parse(eventsJson) : [];
    let pinnedCharts: PinnedChart[] = chartsJson ? JSON.parse(chartsJson) : [];

    // Seed default groups (ADR-0005: Personal and Work)
    if (groups.length === 0) {
      groups = [
        {
          id: `grp_personal_${userId}`,
          userId,
          name: 'Personal',
          color: '#94A3B8',
          sortOrder: 1,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:30',
        },
        {
          id: `grp_work_${userId}`,
          userId,
          name: 'Work',
          color: '#38BDF8',
          sortOrder: 2,
          quietHoursStart: '20:00',
          quietHoursEnd: '08:30',
        },
      ];
      await AsyncStorage.setItem(keys.GROUPS, JSON.stringify(groups));
    }

    // Only seed sample habits for unauthenticated guests, never for authenticated users
    if (tasks.length === 0 && userId === 'usr_guest') {
      tasks = [
        {
          id: 'tsk_water',
          userId,
          groupId: `grp_personal_${userId}`,
          title: 'Drink 4 L Water',
          flavor: 'checklist',
          frequency: 'daily',
          targetAmount: 4,
          unit: 'L',
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'tsk_workout',
          userId,
          groupId: `grp_personal_${userId}`,
          title: 'Daily Fitness Routine',
          flavor: 'milestone',
          frequency: 'daily',
          milestones: [
            { id: 'm1', label: 'Stretches', points: 1 },
            { id: 'm2', label: 'Pushups & Squats', points: 1 },
            { id: 'm3', label: 'Post-Workout Hydration', points: 1 },
          ],
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      await AsyncStorage.setItem(keys.TASKS, JSON.stringify(tasks));
    }

    return { groups, tasks, events, pinnedCharts };
  }

  public static async saveTask(task: Task, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    await AsyncStorage.setItem(keys.TASKS, JSON.stringify(tasks));
  }

  public static async deleteTask(taskId: string, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    const remaining = tasks.filter((t) => t.id !== taskId);
    await AsyncStorage.setItem(keys.TASKS, JSON.stringify(remaining));
  }

  public static async appendEvent(event: CompletionEvent, userId?: string): Promise<CompletionEvent[]> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.EVENTS);
    const events: CompletionEvent[] = raw ? JSON.parse(raw) : [];
    const existing = events.findIndex((e) => e.id === event.id);
    if (existing >= 0) {
      events[existing] = event;
    } else {
      events.push(event);
    }
    await AsyncStorage.setItem(keys.EVENTS, JSON.stringify(events));
    return events;
  }

  public static async savePinnedCharts(charts: PinnedChart[], userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    await AsyncStorage.setItem(keys.PINNED_CHARTS, JSON.stringify(charts));
  }

  public static async saveAllData(
    userId: string,
    data: { groups?: UserGroup[]; tasks?: Task[]; events?: CompletionEvent[] }
  ): Promise<void> {
    const keys = this.getKeys(userId);
    if (data.groups) await AsyncStorage.setItem(keys.GROUPS, JSON.stringify(data.groups));
    if (data.tasks) await AsyncStorage.setItem(keys.TASKS, JSON.stringify(data.tasks));
    if (data.events) await AsyncStorage.setItem(keys.EVENTS, JSON.stringify(data.events));
  }
}
