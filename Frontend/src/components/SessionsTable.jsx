import React, { useState, useEffect } from 'react';
import { api } from '../api/Server';
import { Smartphone, Clock, Database, ChevronLeft, ChevronRight } from 'lucide-react';

const SessionsTable = ({ refreshTrigger }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    setLoading(true);
    api.getSessions(page, LIMIT)
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshTrigger, page]);

  useEffect(() => {
    setPage(1);
  }, [refreshTrigger]);

  if (loading && sessions.length === 0) return <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
    <span>Loading sessions...</span>
  </div>;

  if (sessions.length === 0 && page === 1) return <div className="empty-state">No sessions synced yet.</div>;

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 MB';
    return `${bytes.toFixed(2)} MB`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="table-container">
      {sessions.length === 0 ? (
        <div className="empty-state">No sessions found on this page.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Device MAC</th>
              <th>Connected At</th>
              <th>Duration</th>
              <th>Data Usage</th>
              <th>Venue / AP</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session.id}>
                <td>{session.id}</td>
                <td className="font-mono text-sm">
                  <span className="flex items-center gap-2">
                    <Smartphone size={16} className="text-gray-400" />
                    {session.device_mac}
                  </span>
                </td>
                <td className="text-sm">
                  {session.connected_at ? new Date(session.connected_at + 'Z').toLocaleString() : '-'}
                </td>
                <td>
                  <span className="flex items-center gap-1 text-sm">
                    <Clock size={14} className="text-gray-400" />
                    {formatDuration(session.duration_seconds)}
                  </span>
                </td>
                <td>
                  <span className="flex items-center gap-1 text-sm">
                    <Database size={14} className="text-accent-primary" />
                    {formatBytes(session.data_usage_mb)}
                  </span>
                </td>
                <td className="text-xs text-gray-400">
                  V:{session.venue_id} / AP:{session.access_point_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <div className="pagination-container">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="btn btn-outline inline-flex"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <span className="text-sm text-gray-300 font-medium">Page {page}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={sessions.length < LIMIT || loading}
          className="btn btn-outline inline-flex"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SessionsTable;
