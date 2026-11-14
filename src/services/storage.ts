/**
 * Laya (లయ) Mobile — Local-First Storage Adapter (ADR-0003, ADR-0011)
 * User-Scoped Storage, Lifecycle Machine & 30-Day Trash
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CompletionEvent, UserGroup, PinnedChart, UserDashboard } from '../core/types';

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
      DASHBOARDS: `@laya:${uid}:dashboards`,
    };
  }

  public static async loadInitialData(userId: string = 'usr_guest'): Promise<{
    groups: UserGroup[];
    tasks: Task[];
    events: CompletionEvent[];
    pinnedCharts: PinnedChart[];
    dashboards: UserDashboard[];
  }> {
    this.setUserId(userId);
    const keys = this.getKeys(userId);

    const [groupsJson, tasksJson, eventsJson, chartsJson, dashboardsJson] = await Promise.all([
      AsyncStorage.getItem(keys.GROUPS),
      AsyncStorage.getItem(keys.TASKS),
      AsyncStorage.getItem(keys.EVENTS),
      AsyncStorage.getItem(keys.PINNED_CHARTS),
      AsyncStorage.getItem(keys.DASHBOARDS),
    ]);

    let groups: UserGroup[] = groupsJson ? JSON.parse(groupsJson) : [];
    let tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
    const events: CompletionEvent[] = eventsJson ? JSON.parse(eventsJson) : [];
    const pinnedCharts: PinnedChart[] = chartsJson ? JSON.parse(chartsJson) : [];
    let dashboards: UserDashboard[] = dashboardsJson ? JSON.parse(dashboardsJson) : [];

    // Seed default groups (ADR-0005)
    if (groups.length === 0) {
      groups = [
        { id: `grp_personal_${userId}`, userId, name: 'Personal', color: '#94A3B8', sortOrder: 1 },
        { id: `grp_work_${userId}`, userId, name: 'Work', color: '#38BDF8', sortOrder: 2 },
      ];
      await AsyncStorage.setItem(keys.GROUPS, JSON.stringify(groups));
    }

    // Seed default overview dashboard
    if (dashboards.length === 0) {
      dashboards = [
        { id: `dash_overview_${userId}`, userId, title: 'Overview', icon: '📊', sortOrder: 1, createdAt: new Date().toISOString() },
      ];
      await AsyncStorage.setItem(keys.DASHBOARDS, JSON.stringify(dashboards));
    }

    // Auto-purge trash older than 30 days (ADR-0011)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const purged = tasks.filter((t) => {
      if (!t.deletedAt) return true;
      return new Date(t.deletedAt).getTime() > thirtyDaysAgo;
    });
    if (purged.length !== tasks.length) {
      tasks = purged;
      await AsyncStorage.setItem(keys.TASKS, JSON.stringify(tasks));
    }

    return { groups, tasks, events, pinnedCharts, dashboards };
  }

  public static async saveTask(task: Task, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index >= 0) tasks[index] = task;
    else tasks.push(task);
    await AsyncStorage.setItem(keys.TASKS, JSON.stringify(tasks));
  }

  public static async softDeleteTask(taskId: string, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      target.deletedAt = new Date().toISOString();
      await AsyncStorage.setItem(keys.TASKS, JSON.stringify(tasks));
    }
  }

  public static async restoreTask(taskId: string, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      target.deletedAt = null;
      target.archivedAt = null;
      target.lifecycleStatus = 'active';
      await AsyncStorage.setItem(keys.TASKS, JSON.stringify(tasks));
    }
  }

  public static async purgeTaskPermanently(taskId: string, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    const remaining = tasks.filter((t) => t.id !== taskId);
    await AsyncStorage.setItem(keys.TASKS, JSON.stringify(remaining));
  }

  public static async emptyTrash(userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    const remaining = tasks.filter((t) => !t.deletedAt);
    await AsyncStorage.setItem(keys.TASKS, JSON.stringify(remaining));
  }

  public static async updateTaskLifecycle(
    taskId: string,
    status: 'active' | 'completed' | 'paused' | 'retired',
    userId?: string
  ): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      target.lifecycleStatus = status;
      target.archivedAt = status === 'active' ? null : new Date().toISOString();
      await AsyncStorage.setItem(keys.TASKS, JSON.stringify(tasks));
    }
  }

  public static async appendEvent(event: CompletionEvent, userId?: string): Promise<CompletionEvent[]> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.EVENTS);
    const events: CompletionEvent[] = raw ? JSON.parse(raw) : [];
    const existing = events.findIndex((e) => e.id === event.id);
    if (existing >= 0) events[existing] = event;
    else events.push(event);
    await AsyncStorage.setItem(keys.EVENTS, JSON.stringify(events));
    return events;
  }

  public static async savePinnedCharts(charts: PinnedChart[], userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    await AsyncStorage.setItem(keys.PINNED_CHARTS, JSON.stringify(charts));
  }

  public static async saveDashboards(dashboards: UserDashboard[], userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    await AsyncStorage.setItem(keys.DASHBOARDS, JSON.stringify(dashboards));
  }

  public static async saveDashboard(dash: UserDashboard, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.DASHBOARDS);
    const list: UserDashboard[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((d) => d.id === dash.id);
    if (idx >= 0) list[idx] = dash;
    else list.push(dash);
    await AsyncStorage.setItem(keys.DASHBOARDS, JSON.stringify(list));
  }

  public static async deleteDashboard(dashboardId: string, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.DASHBOARDS);
    const list: UserDashboard[] = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem(keys.DASHBOARDS, JSON.stringify(list.filter((d) => d.id !== dashboardId)));
  }

  public static async saveGroups(groups: UserGroup[], userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    await AsyncStorage.setItem(keys.GROUPS, JSON.stringify(groups));
  }

  public static async saveGroup(group: UserGroup, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.GROUPS);
    const list: UserGroup[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((g) => g.id === group.id);
    if (idx >= 0) list[idx] = group;
    else list.push(group);
    await AsyncStorage.setItem(keys.GROUPS, JSON.stringify(list));
  }

  public static async deleteGroup(groupId: string, userId?: string): Promise<void> {
    const keys = this.getKeys(userId);
    const raw = await AsyncStorage.getItem(keys.GROUPS);
    const list: UserGroup[] = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem(keys.GROUPS, JSON.stringify(list.filter((g) => g.id !== groupId)));
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
