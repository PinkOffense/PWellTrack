import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Pet Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function scheduleEventReminder(
  eventId: number,
  title: string,
  body: string,
  triggerDate: Date,
): Promise<string | null> {
  const now = new Date();
  if (triggerDate <= now) return null;

  const secondsUntil = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { eventId, type: 'event_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntil,
    },
  });

  return id;
}

export async function scheduleMedicationReminder(
  medicationId: number,
  petName: string,
  medicationName: string,
  dosage: string,
): Promise<string | null> {
  // Schedule a daily reminder
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `\u{1F48A} ${petName} - Medication`,
      body: `Time to give ${medicationName} (${dosage})`,
      data: { medicationId, type: 'medication_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  return id;
}

export async function scheduleVaccineReminder(
  vaccineId: number,
  petName: string,
  vaccineName: string,
  dueDate: Date,
): Promise<string | null> {
  // Remind 1 day before the due date
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 1);

  if (reminderDate <= new Date()) return null;

  const secondsUntil = Math.floor((reminderDate.getTime() - new Date().getTime()) / 1000);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `\u{1F489} ${petName} - Vaccine Due`,
      body: `${vaccineName} is due tomorrow!`,
      data: { vaccineId, type: 'vaccine_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntil,
    },
  });

  return id;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}
