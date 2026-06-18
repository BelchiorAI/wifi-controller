import React, { useState, useEffect } from 'react';
import { api } from '../api/Server';
import { Wifi, WifiOff } from 'lucide-react';

const AccessPointsTable = ({ refreshTrigger }) => {
  const [aps, setAps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAccessPoints()
      .then(setAps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) return <div className="p-4 text-center text-gray-400">Loading access points...</div>;

  if (aps.length === 0) return <div className="empty-state">No access points synced yet.</div>;

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Name</th>
            <th>MAC Address</th>
            <th>Venue ID</th>
          </tr>
        </thead>
        <tbody>
          {aps.map(ap => {
            const isOnline = ap.status === 'online';
            return (
              <tr key={ap.id}>
                <td>{ap.id}</td>
                <td>
                  <span className={`status-badge ${isOnline ? 'status-success' : 'status-error'}`}>
                    {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {ap.status}
                  </span>
                </td>
                <td className="font-medium">{ap.name}</td>
                <td className="font-mono text-sm text-gray-400">{ap.mac_address}</td>
                <td>{ap.venue_id}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AccessPointsTable;
