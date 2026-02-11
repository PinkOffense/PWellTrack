'use client';

import { useTranslation } from 'react-i18next';
import { Utensils, Pill, X } from 'lucide-react';
import type { Notification } from '@/lib/useNotifications';

interface Props {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ notifications, onDismiss }: Props) {
  const { t } = useTranslation();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2.5 max-w-[360px] w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-xl rounded-2xl border border-white/90 p-4 pr-10 animate-slideDown relative"
          style={{ boxShadow: '0 12px 40px -8px rgba(155,142,200,0.2)' }}
        >
          <button
            onClick={() => onDismiss(n.id)}
            className="absolute top-3 right-3 p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all duration-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              n.type === 'medication_reminder' ? 'bg-purple-50' : 'bg-amber-50'
            }`}>
              {n.type === 'medication_reminder'
                ? <Pill className="w-4.5 h-4.5 text-purple-500" />
                : <Utensils className="w-4.5 h-4.5 text-amber-500" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-0.5">
                {n.type === 'medication_reminder'
                  ? t('notifications.medicationReminder')
                  : t('notifications.feedingReminder')
                }
              </p>
              <p className="text-sm font-medium text-txt leading-snug">
                {n.type === 'medication_reminder'
                  ? t('notifications.medicationMsg', { pet: n.pet_name, med: n.medication_name, dosage: n.dosage })
                  : t('notifications.feedingMsg', { pet: n.pet_name })
                }
              </p>
              <p className="text-[11px] text-txt-muted mt-1">{n.scheduled_time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
