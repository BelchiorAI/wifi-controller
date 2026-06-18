import React, { useState } from 'react';
import SyncButton from './components/SyncButton';
import SyncStatus from './components/SyncStatus';
import VenuesTable from './components/VenuesTable';
import AccessPointsTable from './components/AccessPointsTable';
import SessionsTable from './components/SessionsTable';
import SyncLogsTable from './components/SyncLogsTable';
import { Wifi } from 'lucide-react';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSyncSuccess = () => {
    // Increment trigger to re-fetch status and tables
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent-primary/20 rounded-xl text-accent-primary">
            <Wifi size={28} />
          </div>
          <div>
            <h1 className="header-title">Wi-Fi Controller</h1>
            <p className="text-text-muted text-sm mt-1">Manage and sync external network infrastructure</p>
          </div>
        </div>
        <SyncButton onSyncSuccess={handleSyncSuccess} />
      </header>

      <main className="dashboard-grid">
        {/* Sync Status spans full width on mobile, half on desktop */}
        <section className="col-span-full">
          <SyncStatus refreshTrigger={refreshTrigger} />
        </section>

        {/* Tables */}
        <section className="col-span-half glass-card flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-white">Venues</h2>
          <div className="flex-1 overflow-hidden">
            <VenuesTable refreshTrigger={refreshTrigger} />
          </div>
        </section>

        <section className="col-span-half glass-card flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-white">Access Points</h2>
          <div className="flex-1 overflow-hidden">
            <AccessPointsTable refreshTrigger={refreshTrigger} />
          </div>
        </section>

        <section className="col-span-full glass-card flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-white">Connected Sessions</h2>
          <div className="flex-1 overflow-hidden">
            <SessionsTable refreshTrigger={refreshTrigger} />
          </div>
        </section>

        <section className="col-span-full glass-card flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-white">Sync Logs</h2>
          <div className="flex-1 overflow-hidden">
            <SyncLogsTable refreshTrigger={refreshTrigger} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
