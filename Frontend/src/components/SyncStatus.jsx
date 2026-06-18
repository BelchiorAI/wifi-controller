import React, { useEffect, useState } from 'react';
import { api } from '../api/Server';
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const SyncStatus = ({ refreshTrigger }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const data = await api.getSyncStatus();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 5 seconds if currently in progress
    const interval = setInterval(() => {
      if (status && status.status === 'in_progress') {
        fetchStatus();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [status?.status, refreshTrigger]);

  if (loading) return <div className="glass-card animate-pulse"><div className="h-20 bg-gray-700 rounded w-full"></div></div>;

  if (!status) return (
    <div className="glass-card flex items-center gap-3">
      <Activity className="text-gray-400" />
      <span className="text-gray-400">No sync history available.</span>
    </div>
  );

  const isSuccess = status.status === 'success';
  const isFailed = status.status === 'failed';
  const isInProgress = status.status === 'in_progress';

  return (
    <div className="glass-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity size={20} className="text-accent-secondary" /> 
          Latest Sync Status
        </h3>
        <span className={`status-badge ${isSuccess ? 'status-success' : isFailed ? 'status-error' : 'status-info'}`}>
          {isInProgress && <RefreshCw size={14} className="animate-spin inline mr-1" />}
          {status.status.replace('_', ' ')}
        </span>
      </div>

      <div className="text-sm text-gray-300 mb-4 flex items-center gap-2">
        <Clock size={16} /> 
        Started: {new Date(status.started_at + 'Z').toLocaleString()}
        {status.completed_at && ` • Completed: ${new Date(status.completed_at + 'Z').toLocaleString()}`}
      </div>

      {isSuccess && (
        <div className="stat-grid mt-2">
          <div className="stat-item">
            <span className="stat-label">Venues</span>
            <span className="stat-value text-accent-secondary">{status.venues_synced || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Access Points</span>
            <span className="stat-value text-accent-primary">{status.access_points_synced || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sessions</span>
            <span className="stat-value text-success">{status.sessions_synced || 0}</span>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 flex items-start gap-2 text-sm">
          <XCircle size={18} className="mt-0.5 flex-shrink-0" />
          <p>{status.error_message || 'Unknown error occurred.'}</p>
        </div>
      )}
    </div>
  );
};

export default SyncStatus;
