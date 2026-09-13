import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmitReport } from '../api/hooks';
import toast from 'react-hot-toast';

interface ReportFormProps {
  onClose: () => void;
}

export default function ReportForm({ onClose }: ReportFormProps) {
  const { t } = useTranslation();
  const submitReport = useSubmitReport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('description', description);

    if (fileInputRef.current?.files?.[0]) {
      formData.append('photo', fileInputRef.current.files[0]);
    }

    submitReport.mutate(formData, {
      onSuccess: () => {
        toast.success(t('submit_report') + ' ✓');
        onClose();
      },
      onError: () => {
        toast.error('Failed to submit report');
      },
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '12px',
          width: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          color: '#e2e8f0',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📷 {t('submit_report')}</h3>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="number"
            step="any"
            placeholder={t('latitude')}
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="number"
            step="any"
            placeholder={t('longitude')}
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <textarea
          placeholder={t('description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
          {t('photo')}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'block', marginTop: '0.25rem' }}
          />
        </label>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <button
            type="submit"
            disabled={submitReport.isPending}
            style={{
              flex: 1,
              padding: '0.6rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {submitReport.isPending ? '...' : t('submit_report')}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6rem 1rem',
              backgroundColor: '#334155',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {t('close')}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #475569',
  backgroundColor: '#0f172a',
  color: '#f8fafc',
  fontSize: '0.875rem',
};
