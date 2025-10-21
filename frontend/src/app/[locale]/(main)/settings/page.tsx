import SettingsPage from '@/components/SettingsPage';

export default function Settings() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        <SettingsPage />
      </div>
    </div>
  );
}
