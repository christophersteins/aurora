'use client';

import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-8">{t('title')}</h1>

          <div className="space-y-8 text-body">
            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('intro.title')}</h2>
              <p className="text-muted">{t('intro.text')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('controller.title')}</h2>
              <div className="space-y-2 text-muted">
                <p>{t('controller.companyName')}</p>
                <p>{t('controller.address')}</p>
                <p>{t('controller.city')}</p>
                <p>{t('controller.email')}: {t('controller.emailAddress')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('dataCollection.title')}</h2>
              <div className="space-y-4 text-muted">
                <div>
                  <h3 className="font-semibold text-body mb-2">{t('dataCollection.personal.title')}</h3>
                  <p>{t('dataCollection.personal.text')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-body mb-2">{t('dataCollection.usage.title')}</h3>
                  <p>{t('dataCollection.usage.text')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-body mb-2">{t('dataCollection.location.title')}</h3>
                  <p>{t('dataCollection.location.text')}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('cookies.title')}</h2>
              <p className="text-muted">{t('cookies.text')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('thirdParty.title')}</h2>
              <p className="text-muted">{t('thirdParty.text')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('rights.title')}</h2>
              <div className="space-y-2 text-muted">
                <p>{t('rights.access')}</p>
                <p>{t('rights.rectification')}</p>
                <p>{t('rights.erasure')}</p>
                <p>{t('rights.restriction')}</p>
                <p>{t('rights.portability')}</p>
                <p>{t('rights.objection')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('security.title')}</h2>
              <p className="text-muted">{t('security.text')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('changes.title')}</h2>
              <p className="text-muted">{t('changes.text')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading mb-4">{t('contact.title')}</h2>
              <p className="text-muted">{t('contact.text')}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
