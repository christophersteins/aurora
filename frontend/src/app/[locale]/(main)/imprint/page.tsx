'use client';

import { useTranslations } from 'next-intl';

export default function ImprintPage() {
  const t = useTranslations('imprint');

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-8">{t('title')}</h1>

          <div className="space-y-8 text-body">
            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('provider.title')}</h2>
              <div className="space-y-2 text-muted">
                <p>{t('provider.companyName')}</p>
                <p>{t('provider.address')}</p>
                <p>{t('provider.city')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('contact.title')}</h2>
              <div className="space-y-2 text-muted">
                <p>{t('contact.phone')}: {t('contact.phoneNumber')}</p>
                <p>{t('contact.email')}: {t('contact.emailAddress')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('representative.title')}</h2>
              <p className="text-muted">{t('representative.name')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('register.title')}</h2>
              <div className="space-y-2 text-muted">
                <p>{t('register.court')}: {t('register.courtName')}</p>
                <p>{t('register.number')}: {t('register.registerNumber')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('vat.title')}</h2>
              <p className="text-muted">{t('vat.id')}: {t('vat.vatNumber')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('disclaimer.title')}</h2>
              <div className="space-y-4 text-muted">
                <div>
                  <h3 className="font-semibold text-body mb-2">{t('disclaimer.content.title')}</h3>
                  <p>{t('disclaimer.content.text')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-body mb-2">{t('disclaimer.links.title')}</h3>
                  <p>{t('disclaimer.links.text')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-body mb-2">{t('disclaimer.copyright.title')}</h3>
                  <p>{t('disclaimer.copyright.text')}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
