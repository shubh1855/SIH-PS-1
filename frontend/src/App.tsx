import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import ReportForm from './components/ReportForm';
import type { DistrictProperties } from './types';
import './i18n';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
});

function AppContent() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictProperties | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <MapView onDistrictSelect={setSelectedDistrict} />
        <Sidebar
          selectedDistrict={selectedDistrict}
          onClose={() => setSelectedDistrict(null)}
        />
      </div>

      {/* Floating action button for field reports */}
      <button
        className="fab"
        onClick={() => setShowReportForm(true)}
        title="Submit Field Report"
      >
        📷
      </button>

      {showReportForm && <ReportForm onClose={() => setShowReportForm(false)} />}
      <Toaster position="bottom-right" />
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
