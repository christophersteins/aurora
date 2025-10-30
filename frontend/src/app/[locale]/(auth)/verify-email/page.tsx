'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { FaUserSecret, FaPersonDress, FaBuilding } from 'react-icons/fa6';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'escort' | 'business'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setTokenError(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);

    try {
      const response = await authService.verifyEmail({
        token,
        username,
        password,
        role,
      });

      // Store auth data
      setAuth(response.access_token, response.user);

      // Redirect based on role
      // Customers go to home page, escorts go to their profile
      if (role === 'customer') {
        router.push('/');
      } else if (role === 'escort') {
        router.push('/profile');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('verificationFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-heading mb-2">Aurora</h1>
            <p className="text-muted">{t('verifyEmailTitle')}</p>
          </div>

          <div
            className="relative bg-page-primary rounded-lg p-8 border border-[#2f3336]"
            style={{
              boxShadow: '0 0 60px rgba(139, 92, 246, 0.4), 0 0 100px rgba(139, 92, 246, 0.2), inset 0 0 1px rgba(139, 92, 246, 0.3)'
            }}
            suppressHydrationWarning
          >
            <div className="mb-6 p-4 bg-error-light border border-error rounded-lg">
              <p className="text-error text-sm">{t('invalidVerificationLink')}</p>
            </div>

            <Link href="/login" className="w-full btn-base btn-primary block text-center">
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-heading mb-2">Aurora</h1>
          <p className="text-muted">{t('completeRegistration')}</p>
        </div>

        {/* Verification Card */}
        <div
          className="relative bg-page-primary rounded-lg p-8 border border-[#2f3336]"
          style={{
            boxShadow: '0 0 60px rgba(139, 92, 246, 0.4), 0 0 100px rgba(139, 92, 246, 0.2), inset 0 0 1px rgba(139, 92, 246, 0.3)'
          }}
          suppressHydrationWarning
        >
          <h2 className="text-2xl mb-6 text-heading">{t('almostDone')}</h2>

          {error && (
            <div className="mb-6 p-4 bg-error-light border border-error rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm mb-3 text-muted">{t('registerAs')}</label>
              <div className="space-y-3">
                {/* Customer */}
                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  role === 'customer'
                    ? 'border-primary bg-primary/10'
                    : 'bg-page-secondary border-default hover:border-primary/50'
                }`}>
                  <input
                    type="radio"
                    value="customer"
                    checked={role === 'customer'}
                    onChange={(e) => setRole(e.target.value as 'customer')}
                    className="absolute opacity-0"
                  />
                  <FaUserSecret className={`w-6 h-6 mr-4 flex-shrink-0 ${role === 'customer' ? 'text-primary' : 'text-muted'}`} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium mb-0.5 ${role === 'customer' ? 'text-primary' : 'text-body'}`}>
                      {t('roleCustomer')}
                    </div>
                    <div className="text-xs text-muted">{t('roleCustomerDesc')}</div>
                  </div>
                </label>

                {/* Escort */}
                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  role === 'escort'
                    ? 'border-primary bg-primary/10'
                    : 'bg-page-secondary border-default hover:border-primary/50'
                }`}>
                  <input
                    type="radio"
                    value="escort"
                    checked={role === 'escort'}
                    onChange={(e) => setRole(e.target.value as 'escort')}
                    className="absolute opacity-0"
                  />
                  <FaPersonDress className={`w-6 h-6 mr-4 flex-shrink-0 ${role === 'escort' ? 'text-primary' : 'text-muted'}`} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium mb-0.5 ${role === 'escort' ? 'text-primary' : 'text-body'}`}>
                      {t('roleEscort')}
                    </div>
                    <div className="text-xs text-muted">{t('roleEscortDesc')}</div>
                  </div>
                </label>

                {/* Business */}
                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  role === 'business'
                    ? 'border-primary bg-primary/10'
                    : 'bg-page-secondary border-default hover:border-primary/50'
                }`}>
                  <input
                    type="radio"
                    value="business"
                    checked={role === 'business'}
                    onChange={(e) => setRole(e.target.value as 'business')}
                    className="absolute opacity-0"
                  />
                  <FaBuilding className={`w-6 h-6 mr-4 flex-shrink-0 ${role === 'business' ? 'text-primary' : 'text-muted'}`} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium mb-0.5 ${role === 'business' ? 'text-primary' : 'text-body'}`}>
                      {t('roleBusiness')}
                    </div>
                    <div className="text-xs text-muted">{t('roleBusinessDesc')}</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Account Details Label */}
            <div>
              <label className="block text-sm mb-3 text-muted">{t('accountDetails')}</label>
            </div>

            {/* Username */}
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={t('username')}
                className="w-full px-4 py-3 bg-page-secondary border border-default rounded-lg focus:outline-none text-body"
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder={t('password')}
                className="w-full px-4 py-3 bg-page-secondary border border-default rounded-lg focus:outline-none text-body"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-base btn-primary mt-6"
            >
              {loading ? t('loading') : t('completeRegistration')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
