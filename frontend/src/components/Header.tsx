import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'as', label: 'অসমীয়া' },
];

export default function Header() {
  const { t, i18n } = useTranslation();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e293b',
        color: '#f8fafc',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
        🏔️ {t('app_title')}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label htmlFor="lang-select" style={{ fontSize: '0.875rem' }}>
          {t('language')}:
        </label>
        <select
          id="lang-select"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          style={{
            padding: '0.35rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid #475569',
            backgroundColor: '#334155',
            color: '#f8fafc',
            fontSize: '0.875rem',
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
