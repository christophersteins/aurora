'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTermsError('');
    setSuccess(false);

    // Check if terms are agreed
    if (!agreedToTerms) {
      setTermsError(t('mustAgreeToTerms'));
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        email,
      });

      // Registration successful - show success message
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('registrationFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`${provider} Registration - will be implemented later`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-heading mb-2">Aurora</h1>
          <p className="text-muted">{t('registerTitle')}</p>
        </div>

        {/* Register Card */}
        <div className="relative bg-page-primary rounded-lg p-8 border border-[#2f3336]" style={{
          boxShadow: '0 0 60px rgba(139, 92, 246, 0.4), 0 0 100px rgba(139, 92, 246, 0.2), inset 0 0 1px rgba(139, 92, 246, 0.3)'
        }}>
          <h2 className="text-2xl mb-6 text-heading">{t('registerButton')}</h2>

          {error && (
            <div className="mb-6 p-4 bg-error-light border border-error rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">
                {t('registrationSuccess')}
              </p>
            </div>
          )}

          {/* Social Register Buttons */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialRegister('Google')}
              className="w-full btn-base btn-secondary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{t('registerWith', { provider: 'Google' })}</span>
            </button>

            {/* X (Twitter) */}
            <button
              type="button"
              onClick={() => handleSocialRegister('X')}
              className="w-full btn-base btn-secondary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>{t('registerWith', { provider: 'X' })}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-default"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-page-primary text-muted">{tCommon('or')}</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Terms Checkbox */}
            <div>
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-[#8b5cf6] focus:ring-[#8b5cf6] focus:ring-1"
                />
                <label htmlFor="terms" className="text-sm text-muted leading-relaxed font-normal">
                  {t('agreeToTermsPart1')}{' '}
                  <Link href="/privacy" className="link-default">
                    {t('privacyPolicy')}
                  </Link>
                  {t('agreeToTermsPart2')}
                </label>
              </div>
              {termsError && (
                <div className="mt-2 flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-error flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <p className="text-error text-sm">{termsError}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-base btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : tCommon('continue')}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-muted">
              {t('alreadyAccount')}{' '}
              <Link href="/login" className="link-default">
                {t('loginNow')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
