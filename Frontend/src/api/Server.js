const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const api = {
  getVenues: async () => {
    const res = await fetch(`${API_BASE}/venues/`);
    if (!res.ok) throw new Error('Failed to fetch venues');
    return res.json();
  },
  
  getAccessPoints: async () => {
    const res = await fetch(`${API_BASE}/access-points/`);
    if (!res.ok) throw new Error('Failed to fetch access points');
    return res.json();
  },
  
  getSessions: async (page = 1, limit = 10) => {
    const res = await fetch(`${API_BASE}/sessions/?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },
  
  triggerSync: async (simulateFailure = false) => {
    const url = `${API_BASE}/sync/${simulateFailure ? '?simulate_failure=true' : ''}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger sync');
    return res.json();
  },
  
  getSyncStatus: async () => {
    const res = await fetch(`${API_BASE}/sync/status`);
    if (!res.ok) {
      if (res.status === 404) return null; // No syncs yet
      throw new Error('Failed to fetch sync status');
    }
    return res.json();
  },

  getSyncLogs: async () => {
    const res = await fetch(`${API_BASE}/sync/logs`);
    if (!res.ok) throw new Error('Failed to fetch sync logs');
    return res.json();
  }
};
