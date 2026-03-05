"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { WS_BASE } from "./constants";
import { getAccessToken } from "./auth";

export interface HealthReading {
  id: number;
  animal_id: number;
  temperature: number;
  heart_rate: number;
  activity_level: number;
  rumination_score: number;
  timestamp: string;
}

interface UseHealthWSOptions {
  animalId: number;
  enabled?: boolean;
  onReading?: (reading: HealthReading) => void;
}

export function useHealthWS({ animalId, enabled = true, onReading }: UseHealthWSOptions) {
  const [latestReading, setLatestReading] = useState<HealthReading | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current) return;
    const token = getAccessToken();
    const url = `${WS_BASE}/ws/health/${animalId}${token ? `?token=${token}` : ""}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (mountedRef.current) setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const reading: HealthReading = JSON.parse(event.data);
        if (mountedRef.current) {
          setLatestReading(reading);
          onReading?.(reading);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (mountedRef.current) {
        setIsConnected(false);
        // Reconnect after 3 seconds
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [animalId, enabled, onReading]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { latestReading, isConnected };
}
