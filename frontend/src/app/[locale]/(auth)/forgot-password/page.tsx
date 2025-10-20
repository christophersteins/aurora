'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement forgot password API call
      // const response = await authService.forgotPassword({ email });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-page-primary">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-heading mb-2">Aurora</h1>
          <p className="text-muted">{t('resetPasswordTitle')}</p>
        </div>

        {/* Reset Password Card */}
        <div
          className="relative bg-page-primary rounded-lg p-8 border border-[#2f3336]"
          style={{
            boxShadow:
              '0 0 60px rgba(139, 92, 246, 0.4), 0 0 100px rgba(139, 92, 246, 0.2), inset 0 0 1px rgba(139, 92, 246, 0.3)',
          }}
        >
          <h2 className="text-2xl mb-2 text-heading">{t('resetPassword')}</h2>
          <p className="text-muted text-sm mb-6">{t('resetPasswordSubtitle')}</p>

          {success ? (
            /* Success Message */
            <div className="space-y-6">
              <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-400 font-medium mb-2">{t('resetLinkSent')}</p>
                <p className="text-muted text-sm">{t('resetLinkSentMessage')}</p>
              </div>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full btn-base btn-primary"
              >
                <ArrowLeft size={20} />
                <span>{t('backToLogin')}</span>
              </Link>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-error-light border border-error rounded-lg">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('email')}
                  className="w-full px-4 py-3 bg-page-secondary border border-default rounded-lg focus:outline-none text-body"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-base btn-primary mt-6"
              >
                {loading ? t('loading') : t('sendResetLink')}
              </button>

              {/* Back to Login Link */}
              <div className="mt-6 text-center">
                <Link href="/login" className="link-default inline-flex items-center gap-2">
                  <ArrowLeft size={16} />
                  <span>{t('backToLogin')}</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
