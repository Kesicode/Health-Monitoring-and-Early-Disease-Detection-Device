"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { WS_BASE } from "./constants";
import { getAccessToken } from "./auth";

export interface AlertNotification {
  id: number;
  animal_id: number;
  animal_name: string;
  alert_type: string;
  message: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
}

interface UseAlertsWSOptions {
  userId: string;
  enabled?: boolean;
  onAlert?: (alert: AlertNotification) => void;
}

export function useAlertsWS({ userId, enabled = true, onAlert }: UseAlertsWSOptions) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState<AlertNotification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current || !userId) return;
    const token = getAccessToken();
    const url = `${WS_BASE}/ws/alerts/${userId}${token ? `?token=${token}` : ""}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const alert: AlertNotification = JSON.parse(event.data);
        if (mountedRef.current) {
          setRecentAlerts((prev) => [alert, ...prev].slice(0, 10));
          setUnreadCount((c) => c + 1);
          onAlert?.(alert);
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      if (mountedRef.current) {
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    };

    ws.onerror = () => ws.close();
  }, [userId, enabled, onAlert]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const clearUnread = () => setUnreadCount(0);

  return { unreadCount, recentAlerts, clearUnread };
}
