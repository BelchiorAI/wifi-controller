import React, { useState, useEffect } from 'react';
import { api } from '../api/Server';
import { MapPin } from 'lucide-react';

const VenuesTable = ({ refreshTrigger }) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVenues()
      .then(setVenues)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) return <div className="p-4 text-center text-gray-400">Loading venues...</div>;

  if (venues.length === 0) return <div className="empty-state">No venues synced yet.</div>;

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>External ID</th>
          </tr>
        </thead>
        <tbody>
          {venues.map(venue => (
            <tr key={venue.id}>
              <td>{venue.id}</td>
              <td className="font-medium text-white flex items-center gap-2">
                <MapPin size={16} className="text-accent-secondary" />
                {venue.name}
              </td>
              <td>{venue.address || '-'}</td>
              <td className="text-gray-400 text-xs font-mono">{venue.external_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VenuesTable;
