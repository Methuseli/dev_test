"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { useSSE } from "../hooks/useSSE";

interface SSEStats {
  totalConnections: number;
  connectedUsers: number;
  userConnections: number;
  sessionConnections: number;
  staleConnections: number;
  isHealthy: boolean;
}

const SSETestPanel = () => {
  const { isConnected, lastEvent, events, connectionAttempts, connect, disconnect, clearEvents } = useSSE();
  const [stats, setStats] = useState<SSEStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendTestEvent = async (type: string, message?: string, data?: unknown) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sse/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("Test event sent:", result);
    } catch (error) {
      console.error("Error sending test event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/sse/test");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">SSE Test Panel</h2>
        <p className="text-gray-600">Test Server-Sent Events functionality</p>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Connection Status</h3>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={isConnected ? 'text-green-700' : 'text-red-700'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {connectionAttempts > 0 && (
            <span className="text-orange-600">
              (Attempts: {connectionAttempts})
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Button 
            onClick={connect} 
            disabled={isConnected}
            size="sm"
            variant="outline"
          >
            Connect
          </Button>
          <Button 
            onClick={disconnect} 
            disabled={!isConnected}
            size="sm"
            variant="outline"
          >
            Disconnect
          </Button>
          <Button 
            onClick={fetchStats}
            size="sm"
            variant="outline"
          >
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* Server Stats */}
      {stats && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Server Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Connections:</span>
              <span className="ml-2 font-medium">{stats.totalConnections}</span>
            </div>
            <div>
              <span className="text-gray-600">Connected Users:</span>
              <span className="ml-2 font-medium">{stats.connectedUsers}</span>
            </div>
            <div>
              <span className="text-gray-600">User Connections:</span>
              <span className="ml-2 font-medium">{stats.userConnections}</span>
            </div>
            <div>
              <span className="text-gray-600">Session Connections:</span>
              <span className="ml-2 font-medium">{stats.sessionConnections}</span>
            </div>
            <div>
              <span className="text-gray-600">Stale Connections:</span>
              <span className="ml-2 font-medium">{stats.staleConnections}</span>
            </div>
            <div>
              <span className="text-gray-600">Health Status:</span>
              <span className={`ml-2 font-medium ${stats.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {stats.isHealthy ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Test Controls */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Send Test Events</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Button
            onClick={() => sendTestEvent("notification", "Test notification message")}
            disabled={isLoading || !isConnected}
            size="sm"
          >
            Notification
          </Button>
          <Button
            onClick={() => sendTestEvent("announcement", "Important announcement")}
            disabled={isLoading || !isConnected}
            size="sm"
          >
            Announcement
          </Button>
          <Button
            onClick={() => sendTestEvent("update", "Data updated", { version: "1.2.3" })}
            disabled={isLoading || !isConnected}
            size="sm"
          >
            Update
          </Button>
          <Button
            onClick={() => sendTestEvent("progress", "Processing...", { percentage: 75 })}
            disabled={isLoading || !isConnected}
            size="sm"
          >
            Progress
          </Button>
          <Button
            onClick={() => sendTestEvent("custom", "Custom event data", { custom: true })}
            disabled={isLoading || !isConnected}
            size="sm"
          >
            Custom
          </Button>
          <Button
            onClick={clearEvents}
            variant="outline"
            size="sm"
          >
            Clear Events
          </Button>
        </div>
      </div>

      {/* Latest Event */}
      {lastEvent && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Latest Event</h3>
          <div className="bg-white p-3 rounded border">
            <div className="text-sm text-gray-600 mb-1">
              Type: <span className="font-medium text-blue-600">{lastEvent.type}</span>
              {lastEvent.id && (
                <span className="ml-4">
                  ID: <span className="font-mono text-xs">{lastEvent.id}</span>
                </span>
              )}
            </div>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(lastEvent.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Event History */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">
            Event History ({events.length})
          </h3>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">No events received yet</p>
          ) : (
            events.slice().reverse().map((event, index) => (
              <div key={index} className="bg-white p-2 rounded border text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-blue-600">{event.type}</span>
                  {event.id && (
                    <span className="font-mono text-gray-500">{event.id}</span>
                  )}
                </div>
                <pre className="text-gray-700 overflow-x-auto">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SSETestPanel;