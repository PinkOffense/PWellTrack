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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

const INITIAL_RETRY_DELAY = 5_000;
const MAX_RETRY_DELAY = 120_000; // 2 minutes max between retries
const MAX_RETRIES = 10;

export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const pingTimer = useRef<ReturnType<typeof setInterval>>();
  const dismissTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const retryCount = useRef(0);
  const mountedRef = useRef(true);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const connect = useCallback(() => {
    const token = tokenStorage.get();
    if (!token || !enabled || !mountedRef.current) return;

    if (retryCount.current >= MAX_RETRIES) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Ping the HTTP endpoint first to wake up Render from cold start
    fetch(`${API_BASE}/health`, { method: 'GET' }).catch(() => {});

    const ws = new WebSocket(`${WS_BASE}/ws/notifications`);
    wsRef.current = ws;
    let authenticated = false;

    ws.onopen = () => {
      // Send token as first message instead of in URL (SEC-02)
      ws.send(JSON.stringify({ type: 'auth', token }));
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
        // Handle auth confirmation
        if (data.type === 'auth_ok') {
          authenticated = true;
          retryCount.current = 0; // Reset backoff on successful auth
          return;
        }
        if (data.type === 'auth_error') {
          console.warn('[WS] Auth failed, closing connection');
          ws.close();
          return;
        }
        // Ignore messages before auth
        if (!authenticated) return;

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
      if (!mountedRef.current) return;
      if (retryCount.current >= MAX_RETRIES) return;

      // Exponential backoff: 5s, 10s, 20s, 40s, 80s, 120s, 120s...
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, retryCount.current),
        MAX_RETRY_DELAY
      );
      retryCount.current++;
      reconnectTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // Let onclose handle reconnection
      ws.close();
    };
  }, [enabled, dismiss]);

  useEffect(() => {
    mountedRef.current = true;
    retryCount.current = 0;
    connect();
    return () => {
      mountedRef.current = false;
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
