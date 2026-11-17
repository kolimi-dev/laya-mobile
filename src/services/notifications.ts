/**
 * Laya (లయ) Mobile — Offline Local Notifications Engine (ADR-0010, ADR-0012)
 * Scheduled Alarms & Task Reminders with Silent Fallback
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../core/types';

// Configure standard notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  /**
   * Requests local notification permissions if not already granted
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
        return true;
      }
      const request = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      return request.granted;
    } catch {
      return false;
    }
  },

  /**
   * Cancels any scheduled reminders for a specific task ID
   */
  async cancelTaskReminder(taskId: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        const data = notif.content.data as { taskId?: string } | undefined;
        if (data?.taskId === taskId) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch {
      // Non-fatal
    }
  },

  /**
   * Cancels any scheduled EOD Evening Rhythm Review reminders
   */
  async cancelEodReviewReminder(): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        const data = notif.content.data as { type?: string } | undefined;
        if (data?.type === 'eod-review') {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch {
      // Non-fatal
    }
  },

  /**
   * Schedules offline local reminders for a task at its specified reminderTime ("HH:mm")
   */
  async scheduleTaskReminder(task: Task): Promise<void> {
    if (
      !task.reminderTime ||
      !task.reminderTime.includes(':') ||
      task.deletedAt ||
      task.archivedAt ||
      (task.lifecycleStatus && task.lifecycleStatus !== 'active')
    ) {
      await this.cancelTaskReminder(task.id);
      return;
    }

    try {
      const granted = await this.requestPermissions();
      if (!granted) return;

      await this.cancelTaskReminder(task.id);

      const [hourStr, minuteStr] = task.reminderTime.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (isNaN(hour) || isNaN(minute)) return;

      const title = `⏰ Laya: ${task.title}`;
      const body = `Natural cadence reminder for ${task.title}. Move at your own tempo!`;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('habit-reminders', {
          name: 'Habit Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#38BDF8',
        });
      }

      if (task.frequency === 'days_of_week' && task.daysOfWeek && task.daysOfWeek.length > 0) {
        for (const day of task.daysOfWeek) {
          const weekday = day + 1;
          await Notifications.scheduleNotificationAsync({
            content: { title, body, data: { taskId: task.id } },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday,
              hour,
              minute,
              channelId: 'habit-reminders',
            },
          });
        }
      } else if (task.frequency === 'one_time' && task.targetDate) {
        const [y, m, d] = task.targetDate.split('-').map(Number);
        const triggerDate = new Date(y, m - 1, d, hour, minute, 0);
        if (triggerDate.getTime() > Date.now()) {
          await Notifications.scheduleNotificationAsync({
            content: { title, body, data: { taskId: task.id } },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: triggerDate,
              channelId: 'habit-reminders',
            },
          });
        }
      } else {
        await Notifications.scheduleNotificationAsync({
          content: { title, body, data: { taskId: task.id } },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: 'habit-reminders',
          },
        });
      }
    } catch {
      // Non-fatal notification failure
    }
  },

  /**
   * Schedules offline daily End-of-Day (EOD) Review notification at sleeping time
   */
  async scheduleEodReviewReminder(sleepingTime: string = '20:00', enabled: boolean = true): Promise<void> {
    await this.cancelEodReviewReminder();
    if (!enabled || !sleepingTime || !sleepingTime.includes(':')) return;

    try {
      const granted = await this.requestPermissions();
      if (!granted) return;

      const [hourStr, minuteStr] = sleepingTime.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (isNaN(hour) || isNaN(minute)) return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('eod-review', {
          name: 'Evening Rhythm Review',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 200, 200],
          lightColor: '#818CF8',
        });
      }

      const title = '🌙 Evening Rhythm Review';
      const body = 'Review today’s habits and wind down without streak guilt!';

      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { type: 'eod-review' } },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'eod-review',
        },
      });
    } catch {
      // Non-fatal notification failure
    }
  },
};
