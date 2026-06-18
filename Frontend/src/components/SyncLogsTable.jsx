import React, { useState, useEffect } from 'react';
import { api } from '../api/Server';
import { FileText, CheckCircle, XCircle, Loader } from 'lucide-react';

const SyncLogsTable = ({ refreshTrigger }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSyncLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) return <div className="p-4 text-center text-gray-400">Loading sync logs...</div>;

  if (logs.length === 0) return <div className="empty-state">No sync logs yet.</div>;

  const statusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={14} />;
      case 'failed': return <XCircle size={14} />;
      case 'in_progress': return <Loader size={14} className="animate-spin" />;
      default: return null;
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case 'success': return 'status-success';
      case 'failed': return 'status-error';
      case 'in_progress': return 'status-info';
      default: return 'status-neutral';
    }
  };

  const formatDuration = (start, end) => {
    if (!end) return '—';
    const ms = new Date(end + 'Z') - new Date(start + 'Z');
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Started</th>
            <th>Duration</th>
            <th>Venues</th>
            <th>APs</th>
            <th>Sessions</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td className="font-mono text-sm">#{log.id}</td>
              <td>
                <span className={`status-badge ${statusClass(log.status)}`}>
                  {statusIcon(log.status)}
                  {log.status.replace('_', ' ')}
                </span>
              </td>
              <td className="text-sm">
                {new Date(log.started_at + 'Z').toLocaleString()}
              </td>
              <td className="text-sm font-mono">
                {formatDuration(log.started_at, log.completed_at)}
              </td>
              <td className="text-center">{log.venues_synced}</td>
              <td className="text-center">{log.access_points_synced}</td>
              <td className="text-center">{log.sessions_synced}</td>
              <td className="text-sm text-red-400 max-w-xs truncate">
                {log.error_message || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SyncLogsTable;
