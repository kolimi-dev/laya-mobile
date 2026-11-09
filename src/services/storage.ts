/**
 * Laya (లయ) Mobile — Local-First Storage Adapter
 * Pure Offline Resilience with AsyncStorage (ADR-0003, ADR-0005)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CompletionEvent, UserGroup, PinnedChart } from '../core/types';

const KEYS = {
  TASKS: '@laya:tasks',
  EVENTS: '@laya:events',
  GROUPS: '@laya:groups',
  PINNED_CHARTS: '@laya:pinned_charts',
};

export function generateUUID(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export class StorageService {
  public static async loadInitialData(userId: string = 'usr_friend_1'): Promise<{
    groups: UserGroup[];
    tasks: Task[];
    events: CompletionEvent[];
    pinnedCharts: PinnedChart[];
  }> {
    let [groupsJson, tasksJson, eventsJson, chartsJson] = await Promise.all([
      AsyncStorage.getItem(KEYS.GROUPS),
      AsyncStorage.getItem(KEYS.TASKS),
      AsyncStorage.getItem(KEYS.EVENTS),
      AsyncStorage.getItem(KEYS.PINNED_CHARTS),
    ]);

    let groups: UserGroup[] = groupsJson ? JSON.parse(groupsJson) : [];
    let tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
    let events: CompletionEvent[] = eventsJson ? JSON.parse(eventsJson) : [];
    let pinnedCharts: PinnedChart[] = chartsJson ? JSON.parse(chartsJson) : [];

    // Seed default groups (ADR-0005: Only Personal and Work)
    if (groups.length === 0) {
      groups = [
        {
          id: 'grp_personal',
          userId,
          name: 'Personal',
          color: '#94A3B8',
          sortOrder: 1,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:30',
        },
        {
          id: 'grp_work',
          userId,
          name: 'Work',
          color: '#38BDF8',
          sortOrder: 2,
          quietHoursStart: '20:00',
          quietHoursEnd: '08:30',
        },
      ];
      await AsyncStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
    }

    // Seed sample habits if empty
    if (tasks.length === 0) {
      tasks = [
        {
          id: 'tsk_water',
          userId,
          groupId: 'grp_personal',
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
          groupId: 'grp_personal',
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
      await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    }

    return { groups, tasks, events, pinnedCharts };
  }

  public static async saveTask(task: Task): Promise<void> {
    const raw = await AsyncStorage.getItem(KEYS.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  }

  public static async appendEvent(event: CompletionEvent): Promise<CompletionEvent[]> {
    const raw = await AsyncStorage.getItem(KEYS.EVENTS);
    const events: CompletionEvent[] = raw ? JSON.parse(raw) : [];
    // Idempotent check (ADR-0003)
    const existing = events.findIndex((e) => e.id === event.id);
    if (existing >= 0) {
      events[existing] = event;
    } else {
      events.push(event);
    }
    await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
    return events;
  }

  public static async savePinnedCharts(charts: PinnedChart[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.PINNED_CHARTS, JSON.stringify(charts));
  }
}

