import React, { useState } from 'react';
import { api } from '../api/Server';
import { RefreshCw, XCircle } from 'lucide-react';

const SyncButton = ({ onSyncSuccess }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const handleSync = async (simulateFailure = false) => {
    setIsSyncing(true);
    setError(null);
    try {
      await api.triggerSync(simulateFailure);
      if (onSyncSuccess) {
        onSyncSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => handleSync(false)} 
          disabled={isSyncing}
          className="btn btn-primary"
        >
          <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Trigger Sync'}
        </button>
        <button 
          onClick={() => handleSync(true)} 
          disabled={isSyncing}
          className="btn btn-danger"
        >
          <XCircle size={18} />
          {isSyncing ? 'Syncing...' : 'Trigger Failing Sync'}
        </button>
      </div>
      {error && <span className="text-error text-sm">{error}</span>}
    </div>
  );
};

export default SyncButton;
