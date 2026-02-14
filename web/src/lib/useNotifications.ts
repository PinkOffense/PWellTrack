'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { tokenStorage } from './api';

export interface Notification {
  id: string;
  type: 'medication_reminder' | 'feeding_reminder';
  pet_id: number;
  pet_name: string;
  medication_name?: string;
  dosage?: string;
  scheduled_time: string;
  timestamp: number;
}

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  .replace(/^http/, 'ws');

export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const pingTimer = useRef<ReturnType<typeof setInterval>>();
  const dismissTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const connect = useCallback(() => {
    const token = tokenStorage.get();
    if (!token || !enabled) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(`${WS_BASE}/ws/notifications?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Keep-alive ping every 30 seconds
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 30_000);
    };

    ws.onmessage = (event) => {
      if (event.data === 'pong') return;
      try {
        const data = JSON.parse(event.data);
        const notif: Notification = {
          id: `${data.type}-${data.pet_id}-${data.scheduled_time}-${Date.now()}`,
          type: data.type,
          pet_id: data.pet_id,
          pet_name: data.pet_name,
          medication_name: data.medication_name,
          dosage: data.dosage,
          scheduled_time: data.scheduled_time,
          timestamp: Date.now(),
        };
        setNotifications(prev => [notif, ...prev]);

        // Auto-dismiss after 15 seconds (tracked for cleanup)
        const timer = setTimeout(() => {
          dismiss(notif.id);
          dismissTimers.current.delete(timer);
        }, 15_000);
        dismissTimers.current.add(timer);
      } catch { /* ignore malformed messages */ }
    };

    ws.onclose = () => {
      clearInterval(pingTimer.current);
      // Reconnect after 5 seconds
      reconnectTimer.current = setTimeout(connect, 5_000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [enabled, dismiss]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      clearInterval(pingTimer.current);
      // Clear all auto-dismiss timers
      dismissTimers.current.forEach(t => clearTimeout(t));
      dismissTimers.current.clear();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { notifications, dismiss };
}
