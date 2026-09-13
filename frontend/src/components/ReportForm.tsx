import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmitReport } from '../api/hooks';
import toast from 'react-hot-toast';
import {
  Camera,
  MapPin,
  Navigation,
  UploadCloud,
  X,
  FileText,
  Loader2,
} from 'lucide-react';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Auto-detect GPS Coordinates
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(5));
        setLongitude(position.coords.longitude.toFixed(5));
        setIsLocating(false);
        toast.success('GPS coordinates retrieved');
      },
      (error) => {
        setIsLocating(false);
        toast.error(`GPS Error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Photo selection & preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude || !description.trim()) {
      toast.error('Please complete all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('description', description.trim());

    if (fileInputRef.current?.files?.[0]) {
      formData.append('photo', fileInputRef.current.files[0]);
    }

    submitReport.mutate(formData, {
      onSuccess: () => {
        toast.success(t('alert_sent'));
        onClose();
      },
      onError: (err) => {
        toast.error(`Submission failed: ${err.message}`);
      },
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="modal-title">{t('submit_report')}</h3>
              <p className="modal-subtitle">Geotagged slope instability observations</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" title={t('close')}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Coordinates Row with GPS button */}
          <div className="form-group">
            <div className="group-label-row">
              <label className="field-label">
                <MapPin size={13} />
                <span>Geographic Coordinates *</span>
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="gps-btn"
              >
                {isLocating ? <Loader2 size={12} className="spin" /> : <Navigation size={12} />}
                <span>{t('gps_detect')}</span>
              </button>
            </div>

            <div className="coords-row">
              <div className="input-affix-wrapper">
                <span className="affix-label">Lat</span>
                <input
                  type="number"
                  step="any"
                  placeholder="25.5788"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                  className="modal-input"
                />
              </div>

              <div className="input-affix-wrapper">
                <span className="affix-label">Lon</span>
                <input
                  type="number"
                  step="any"
                  placeholder="91.8933"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                  className="modal-input"
                />
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="form-group">
            <label className="field-label">
              <FileText size={13} />
              <span>{t('description')} *</span>
            </label>
            <textarea
              placeholder="Detail tension cracks, rockfall debris, mud flow, drainage blockage, or road obstruction..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="modal-textarea"
            />
          </div>

          {/* Photo Attachment with Drag / Preview */}
          <div className="form-group">
            <label className="field-label">
              <Camera size={13} />
              <span>{t('photo')}</span>
            </label>

            <div
              className="photo-upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />

              {previewUrl ? (
                <div className="photo-preview-container">
                  <img src={previewUrl} alt="Preview" className="photo-preview-img" />
                  <span className="change-photo-badge">Change Image</span>
                </div>
              ) : (
                <div className="dropzone-empty">
                  <UploadCloud size={24} className="text-cyan" />
                  <span className="dropzone-text">{t('upload_hint')}</span>
                  <span className="dropzone-sub">PNG, JPG, WEBP up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button
              type="submit"
              disabled={submitReport.isPending}
              className="modal-submit-btn"
            >
              {submitReport.isPending ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Submitting Observation...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={15} />
                  <span>{t('submit_report')}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitReport.isPending}
              className="modal-cancel-btn"
            >
              {t('close')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
