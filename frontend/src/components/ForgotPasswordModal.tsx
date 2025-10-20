'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, ArrowLeft } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onBackToLogin,
}: ForgotPasswordModalProps) {
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

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    setError('');
    onClose();
  };

  const handleBackToLogin = () => {
    setEmail('');
    setSuccess(false);
    setError('');
    onBackToLogin();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-page-primary">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 p-2 text-[var(--text-button)] hover:text-[#8b5cf6] transition"
        aria-label="Close"
      >
        <X size={32} />
      </button>

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

              <button
                onClick={handleBackToLogin}
                className="flex items-center justify-center gap-2 w-full btn-base btn-primary"
              >
                <ArrowLeft size={20} />
                <span>{t('backToLogin')}</span>
              </button>
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
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="link-default inline-flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  <span>{t('backToLogin')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
