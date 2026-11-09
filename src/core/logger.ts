/**
 * Laya (లయ) Mobile — Telemetry Ring Buffer & Logger (ADR-0008)
 * 500-Item In-Memory & AsyncStorage Queue for Offline Resilience with PII-Safe Redaction
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TelemetryPayload } from './types';

const STORAGE_KEY = '@laya:telemetry_buffer';
const MAX_BUFFER_SIZE = 500;

function generateUUID(): string {
  return 'evt_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function sanitizeMetadata(data?: Record<string, unknown>): Record<string, unknown> {
  if (!data) return {};
  const cleaned: Record<string, unknown> = {};
  const sensitiveKeys = ['phone', 'token', 'auth', 'password', 'secret', 'email'];

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      cleaned[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

class TelemetryLogger {
  private buffer: TelemetryPayload[] = [];
  private userId = 'usr_guest';

  public async init(userId: string): Promise<void> {
    this.userId = userId;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.buffer = JSON.parse(stored);
      }
    } catch {
      this.buffer = [];
    }
    this.log('session', 'app_launch', { platform: 'android', nativeExpo: true });
  }

  public log(
    eventType: TelemetryPayload['eventType'],
    eventName: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ): void {
    const payload: TelemetryPayload = {
      eventId: generateUUID(),
      eventType,
      eventName,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      metadata: sanitizeMetadata(metadata),
      errorMessage: error?.message,
      errorStack: error?.stack,
    };

    this.buffer.push(payload);
    if (this.buffer.length > MAX_BUFFER_SIZE) {
      this.buffer.splice(0, this.buffer.length - MAX_BUFFER_SIZE);
    }

    this.persist();
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.buffer));
    } catch {
      // Non-fatal if storage fails
    }
  }

  public async flush(backendUrl: string): Promise<boolean> {
    if (this.buffer.length === 0) return true;

    const eventsToSend = [...this.buffer];
    const formattedEvents = eventsToSend.map((e) => ({
      id: e.eventId,
      timestamp: e.timestamp,
      type: e.eventType,
      name: e.eventName,
      data: {
        ...(e.metadata || {}),
        ...(e.errorMessage ? { errorMessage: e.errorMessage } : {}),
      },
      device: {
        platform: 'android',
        app: 'laya-mobile',
      },
    }));

    try {
      const res = await fetch(`${backendUrl}/api/v1/telemetry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.userId}`,
        },
        body: JSON.stringify({ events: formattedEvents }),
      });

      if (res.ok) {
        this.buffer = this.buffer.filter(
          (b) => !eventsToSend.some((s) => s.eventId === b.eventId)
        );
        await this.persist();
        return true;
      }
      return false;
    } catch {
      return false; // Offline; retained safely in ring buffer
    }
  }

  public getEvents(): TelemetryPayload[] {
    return [...this.buffer];
  }
}

export const logger = new TelemetryLogger();
