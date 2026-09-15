import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Camera } from 'lucide-react';
import Header from './components/Header';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import CommandOverview from './components/CommandOverview';
import ReportForm from './components/ReportForm';
import type { DistrictProperties } from './types';
import './i18n';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
  },
});

function AppContent() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictProperties | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showCommandPanel, setShowCommandPanel] = useState(true);

  const handleDistrictSelectFromOverview = (district: DistrictProperties) => {
    setSelectedDistrict(district);
  };

  return (
    <div className="app-layout">
      {/* Top Operations Command Header */}
      <Header onOpenReportModal={() => setShowReportForm(true)} />

      {/* Main Workspace (Left Panel + Map) */}
      <main className="app-body">
        {selectedDistrict ? (
          <Sidebar
            selectedDistrict={selectedDistrict}
            onDistrictSelect={setSelectedDistrict}
            onClose={() => setSelectedDistrict(null)}
          />
        ) : showCommandPanel ? (
          <CommandOverview
            onDistrictSelect={handleDistrictSelectFromOverview}
            onClose={() => setShowCommandPanel(false)}
          />
        ) : (
          <button
            type="button"
            className="left-panel-toggle"
            onClick={() => setShowCommandPanel(true)}
            title="Open Command Overview"
          >
            ☰
          </button>
        )}
        <MapView
          onDistrictSelect={setSelectedDistrict}
          selectedDistrict={selectedDistrict}
        />
      </main>

      {/* Geotagged Field Report Modal */}
      {showReportForm && <ReportForm onClose={() => setShowReportForm(false)} />}

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '0.875rem',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
