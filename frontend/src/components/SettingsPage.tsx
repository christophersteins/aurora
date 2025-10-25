'use client';

import { useState, useTransition, useEffect } from 'react';
import { ArrowLeft, User, Lock, Shield, Bell, Star, Accessibility, Globe, AlertCircle, Check, MessageCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' }
];

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { user, updateUser } = useAuthStore();

  // Mobile navigation state - null means menu is shown, string means section is shown
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Desktop sidebar navigation state - tracks active section on desktop
  const [activeSidebarSection, setActiveSidebarSection] = useState<string>('konto');

  // Track if component is mounting (to disable animations on initial load)
  const [isMounting, setIsMounting] = useState(true);

  // Define sections array
  const sections = [
    { id: 'konto', label: t('sections.account'), icon: User },
    { id: 'sicherheit', label: t('sections.security'), icon: Lock },
    { id: 'datenschutz', label: t('sections.privacy'), icon: Shield },
    { id: 'mitteilungen', label: t('sections.notifications'), icon: Bell },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'premium', label: t('sections.premium'), icon: Star },
    { id: 'barrierefreiheit', label: t('sections.accessibility'), icon: Accessibility },
    { id: 'sprache', label: t('sections.language'), icon: Globe },
  ];

  // Account settings state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [daysUntilUsernameChange, setDaysUntilUsernameChange] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Chat settings state
  const [readReceipts, setReadReceipts] = useState(true);

  // Load read receipts setting from user
  useEffect(() => {
    if (user) {
      setReadReceipts(user.readReceipts ?? true);
    }
  }, [user]);

  // Update read receipts setting
  const handleReadReceiptsChange = async (value: boolean) => {
    setReadReceipts(value);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.patch(
        'http://localhost:4000/users/settings/chat',
        { readReceipts: value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error updating chat settings:', error);
      // Revert on error
      setReadReceipts(!value);
    }
  };

  // Load saved section from localStorage on mount
  useEffect(() => {
    const savedSection = localStorage.getItem('settings-active-section');
    if (savedSection) {
      setActiveSidebarSection(savedSection);
      setActiveSection(savedSection);
    }
    // After initial load, set isMounting to false
    setIsMounting(false);

    // Check username change availability only if user is authenticated
    if (user && typeof window !== 'undefined') {
      checkUsernameAvailability();
    }

    // Cleanup: Remove saved section when component unmounts (user leaves settings page)
    return () => {
      localStorage.removeItem('settings-active-section');
    };
  }, [user]);

  const checkUsernameAvailability = async () => {
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:4000/users/username-check/availability', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCanChangeUsername(response.data.canChange);
      if (response.data.daysRemaining !== undefined) {
        setDaysUntilUsernameChange(response.data.daysRemaining);
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) return;

    setIsLoading(true);
    setUsernameError('');
    setUsernameSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:4000/users/account/username',
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser(response.data);
      setUsernameSuccess(true);
      setIsEditingUsername(false);
      setNewUsername('');
      await checkUsernameAvailability();

      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch (error: any) {
      setUsernameError(error.response?.data?.message || t('account.username.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!newEmail.trim()) return;

    setIsLoading(true);
    setEmailError('');
    setEmailSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:4000/users/account/email',
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser(response.data);
      setEmailSuccess(true);
      setIsEditingEmail(false);
      setNewEmail('');

      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (error: any) {
      setEmailError(error.response?.data?.message || t('account.email.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) return;

    setIsLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:4000/users/account/password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordSuccess(true);
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');

      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || t('account.password.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Language switching
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;

    // Save current section before language switch
    localStorage.setItem('settings-active-section', 'sprache');

    // Replace the locale in the current pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);

    startTransition(() => {
      router.replace(newPathname);
    });
  };

  const handleTabClick = (sectionId: string) => {
    setActiveSidebarSection(sectionId);
  };

  return (
    <div>
      {/* Überschrift */}
      <h1 className="text-3xl font-bold text-heading mb-6">{t('title')}</h1>

      {/* Mobile/Tablet Navigation - shown only when no section is active */}
      {activeSection === null && (
        <div className={`lg:hidden mb-6 ${!isMounting ? 'animate-slide-in-left' : ''}`}>
          <div className="border border-[#2f3336] shadow-md bg-page-primary rounded-lg overflow-hidden">
            <nav>
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isLast = index === sections.length - 1;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      localStorage.setItem('settings-active-section', section.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-medium transition-colors cursor-pointer text-body hover:text-[#b8b9bb] ${
                      !isLast ? 'border-b border-[#2f3336]' : ''
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-left flex-1">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Back Button - Mobile/Tablet only, shown when a section is active */}
      {activeSection !== null && (
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-2 text-sm font-medium transition-all text-action-primary hover:text-action-primary-hover cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </button>
        </div>
      )}

      <div className="flex gap-0 lg:gap-6">
        {/* Sidebar Navigation - Desktop only */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-24 lg:self-start border border-[#2f3336] shadow-md bg-page-primary rounded-lg lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <nav>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSidebarSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleTabClick(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-medium transition-colors cursor-pointer group ${
                    isActive
                      ? 'text-action-primary'
                      : 'text-body'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? '' : 'group-hover:text-[#b8b9bb]'}`} />
                  <span className={`text-left transition-colors ${isActive ? '' : 'group-hover:text-[#b8b9bb]'}`}>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

      {/* Main Content */}
      <div className={`flex-1 ${activeSection === null ? 'hidden lg:block' : 'block lg:block'} ${activeSection !== null && !isMounting ? 'animate-slide-in-right lg:animate-none' : ''}`}>
        <div className={`bg-page-primary border border-[#2f3336] shadow-md rounded-lg ${activeSection !== null ? 'p-0 border-0 shadow-none rounded-none lg:p-6 lg:border lg:shadow-md lg:rounded-lg' : 'p-6'}`}>
          {/* Content */}
          <div className="space-y-8">
            {/* Konto Section */}
            <div
              id="konto"
              className={`mb-12 ${
                activeSection === 'konto'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'konto'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">{t('account.title')}</h2>

              <div className="space-y-6">
                {/* Username Field */}
                <div className="lg:flex lg:items-start lg:gap-6">
                  <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                    {t('account.username.label')}
                  </label>
                  <div className="lg:flex-1">
                    {!isEditingUsername ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-body">{user?.username}</p>
                          <button
                            onClick={() => {
                              if (canChangeUsername) {
                                setIsEditingUsername(true);
                                setNewUsername(user?.username || '');
                              }
                            }}
                            disabled={!canChangeUsername}
                            className={`text-sm font-medium ${
                              canChangeUsername
                                ? 'text-action-primary hover:underline cursor-pointer'
                                : 'text-muted cursor-not-allowed'
                            }`}
                          >
                            {t('account.username.change')}
                          </button>
                        </div>
                        {!canChangeUsername && daysUntilUsernameChange !== null && (
                          <div className="flex items-start gap-2 text-sm text-muted">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>{t('account.username.availableIn', { days: daysUntilUsernameChange })}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder={t('account.username.placeholder')}
                          className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                        />
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <p>{t('account.username.restriction')}</p>
                        </div>
                        {usernameError && (
                          <p className="text-sm text-red-500">{usernameError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={handleUsernameUpdate}
                            disabled={isLoading}
                            className="px-4 py-2 bg-action-primary text-white rounded-lg hover:bg-action-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {t('account.username.save')}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingUsername(false);
                              setNewUsername('');
                              setUsernameError('');
                            }}
                            disabled={isLoading}
                            className="px-4 py-2 border border-default rounded-lg text-body hover:bg-page-secondary transition-colors cursor-pointer"
                          >
                            {t('account.username.cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                    {usernameSuccess && (
                      <p className="mt-2 text-sm text-green-500">{t('account.username.success')}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="lg:flex lg:items-start lg:gap-6">
                  <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                    {t('account.email.label')}
                  </label>
                  <div className="lg:flex-1">
                    {!isEditingEmail ? (
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-body">{user?.email}</p>
                        <button
                          onClick={() => {
                            setIsEditingEmail(true);
                            setNewEmail(user?.email || '');
                          }}
                          className="text-sm font-medium text-action-primary hover:underline cursor-pointer"
                        >
                          {t('account.email.change')}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder={t('account.email.placeholder')}
                          className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                        />
                        {emailError && (
                          <p className="text-sm text-red-500">{emailError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={handleEmailUpdate}
                            disabled={isLoading}
                            className="px-4 py-2 bg-action-primary text-white rounded-lg hover:bg-action-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {t('account.email.save')}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingEmail(false);
                              setNewEmail('');
                              setEmailError('');
                            }}
                            disabled={isLoading}
                            className="px-4 py-2 border border-default rounded-lg text-body hover:bg-page-secondary transition-colors cursor-pointer"
                          >
                            {t('account.email.cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                    {emailSuccess && (
                      <p className="mt-2 text-sm text-green-500">{t('account.email.success')}</p>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="lg:flex lg:items-start lg:gap-6">
                  <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                    {t('account.password.label')}
                  </label>
                  <div className="lg:flex-1">
                    {!isEditingPassword ? (
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-body">••••••••</p>
                        <button
                          onClick={() => setIsEditingPassword(true)}
                          className="text-sm font-medium text-action-primary hover:underline cursor-pointer"
                        >
                          {t('account.password.change')}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder={t('account.password.current')}
                          className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                        />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t('account.password.new')}
                          className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                        />
                        {passwordError && (
                          <p className="text-sm text-red-500">{passwordError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={handlePasswordUpdate}
                            disabled={isLoading}
                            className="px-4 py-2 bg-action-primary text-white rounded-lg hover:bg-action-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {t('account.password.save')}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingPassword(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setPasswordError('');
                            }}
                            disabled={isLoading}
                            className="px-4 py-2 border border-default rounded-lg text-body hover:bg-page-secondary transition-colors cursor-pointer"
                          >
                            {t('account.password.cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                    {passwordSuccess && (
                      <p className="mt-2 text-sm text-green-500">{t('account.password.success')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sicherheit Section */}
            <div
              id="sicherheit"
              className={`mb-12 ${
                activeSection === 'sicherheit'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'sicherheit'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Sicherheit</h2>
              <p className="text-muted">Sicherheitseinstellungen werden hier angezeigt.</p>
            </div>

            {/* Datenschutz Section */}
            <div
              id="datenschutz"
              className={`mb-12 ${
                activeSection === 'datenschutz'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'datenschutz'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Datenschutz</h2>
              <p className="text-muted">Datenschutzeinstellungen werden hier angezeigt.</p>
            </div>

            {/* Mitteilungen Section */}
            <div
              id="mitteilungen"
              className={`mb-12 ${
                activeSection === 'mitteilungen'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'mitteilungen'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Mitteilungen</h2>
              <p className="text-muted">Mitteilungseinstellungen werden hier angezeigt.</p>
            </div>

            {/* Chat Section */}
            <div
              id="chat"
              className={`mb-12 ${
                activeSection === 'chat'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'chat'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Chat</h2>

              <div className="space-y-6">
                {/* Read Receipts Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-body mb-1">Lesebestätigungen</h3>
                    <p className="text-sm text-muted">
                      Zeige anderen an, wenn du ihre Nachrichten gelesen hast
                    </p>
                  </div>
                  <button
                    onClick={() => handleReadReceiptsChange(!readReceipts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      readReceipts ? 'bg-success' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        readReceipts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Section */}
            <div
              id="premium"
              className={`mb-12 ${
                activeSection === 'premium'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'premium'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Premium</h2>
              <p className="text-muted">Premium-Einstellungen werden hier angezeigt.</p>
            </div>

            {/* Barrierefreiheit Section */}
            <div
              id="barrierefreiheit"
              className={`mb-12 ${
                activeSection === 'barrierefreiheit'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'barrierefreiheit'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Barrierefreiheit</h2>
              <p className="text-muted">Barrierefreiheitseinstellungen werden hier angezeigt.</p>
            </div>

            {/* Sprache Section */}
            <div
              id="sprache"
              className={`${
                activeSection === 'sprache'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'sprache'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">{t('language.title')}</h2>
              <p className="text-muted mb-6">{t('language.description')}</p>

              <div className="space-y-3">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => switchLanguage(language.code)}
                    disabled={isPending}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      language.code === locale
                        ? 'border-default bg-page-secondary'
                        : 'border-default hover:border-action-primary hover:bg-page-secondary'
                    } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {/* Flag */}
                    <div className="text-3xl">{language.flag}</div>

                    {/* Language Info */}
                    <div className="flex-1 text-left">
                      <div className="text-body font-medium">{language.nativeName}</div>
                      <div className="text-muted text-sm">{language.name}</div>
                    </div>

                    {/* Checkmark for selected language */}
                    {language.code === locale && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-action-primary">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {isPending && (
                <div className="mt-4 text-sm text-muted flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-action-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('language.switching')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
