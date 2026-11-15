/**
 * Laya (లయ) Mobile — Free Native Device Voice (TTS) Engine
 * Powered by expo-speech ($0 cost, 100% offline) with Quiet Hours Blackout (Roadmap 1.4)
 */

import * as Speech from 'expo-speech';
import { UserGroup } from '../core/types';

/**
 * Checks if current time is within quiet hours (e.g. 22:00 to 07:30)
 */
export function isInQuietHours(
  now: Date = new Date(),
  startStr: string = '22:00',
  endStr: string = '07:30'
): boolean {
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes > endMinutes) {
    // Crosses midnight (e.g. 22:00 to 07:30)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Delivers an audible voice reminder if allowed by quiet hours (manual taps bypass quiet hours)
 */
export async function speakReminder(
  taskTitle: string,
  group?: UserGroup,
  customMessage?: string,
  isManualTap: boolean = true
): Promise<{ spoken: boolean; reason?: string }> {
  if (!isManualTap) {
    const quietStart = group?.quietHoursStart || '22:00';
    const quietEnd = group?.quietHoursEnd || '07:30';

    if (isInQuietHours(new Date(), quietStart, quietEnd)) {
      return {
        spoken: false,
        reason: `Quiet hours active (${quietStart} – ${quietEnd}). Downgraded to silent notification.`,
      };
    }
  }

  // Phonetic "Laa-yaa" prevents English TTS engines from pronouncing it as "Layer" (/ˈleɪ.ə/)
  const prompt =
    customMessage || `Gentle reminder from Laa-yaa: It is time for ${taskTitle}.`;

  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    Speech.speak(prompt, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.95,
    });

    return { spoken: true };
  } catch (err) {
    return { spoken: false, reason: (err as Error).message };
  }
}

/**
 * Optional Telugu native voice greeting / reminder
 */
export async function speakTeluguPrompt(
  prompt: string
): Promise<{ spoken: boolean }> {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    Speech.speak(prompt, {
      language: 'te-IN',
      pitch: 1.0,
      rate: 0.9,
    });
    return { spoken: true };
  } catch {
    return { spoken: false };
  }
}

/**
 * Native Telugu reminder with authentic script and phonetics
 */
export async function speakTeluguReminder(
  taskTitle: string,
  group?: UserGroup,
  isManualTap: boolean = true
): Promise<{ spoken: boolean; reason?: string }> {
  if (!isManualTap) {
    const quietStart = group?.quietHoursStart || '22:00';
    const quietEnd = group?.quietHoursEnd || '07:30';

    if (isInQuietHours(new Date(), quietStart, quietEnd)) {
      return { spoken: false, reason: 'Quiet hours active.' };
    }
  }

  const prompt = `లయ నుండి సున్నితమైన జ్ఞాపిక: ${taskTitle} సమయం ఆసన్నమైంది.`;
  return speakTeluguPrompt(prompt);
}

