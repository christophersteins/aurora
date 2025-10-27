'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: t('question1'),
      answer: t('answer1')
    },
    {
      question: t('question2'),
      answer: t('answer2')
    },
    {
      question: t('question3'),
      answer: t('answer3')
    },
    {
      question: t('question4'),
      answer: t('answer4')
    },
    {
      question: t('question5'),
      answer: t('answer5')
    },
    {
      question: t('question6'),
      answer: t('answer6')
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen py-8 bg-page-primary">
      <div className="mx-auto" style={{
          maxWidth: 'var(--max-content-width)',
          paddingLeft: 'var(--content-padding-x)',
          paddingRight: 'var(--content-padding-x)'
        }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted">
            {t('subtitle')}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg border border-[#2f3336] bg-page-primary overflow-hidden transition-all hover:border-[#8b5cf6]"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-heading pr-8">
                  {faq.question}
                </h3>
                <ChevronDown
                  size={24}
                  className={`text-[#8b5cf6] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4 pt-2">
                  <p className="text-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-8 rounded-lg border border-[#2f3336] bg-page-primary text-center">
          <h2 className="text-2xl font-bold text-heading mb-3">
            {t('contactTitle')}
          </h2>
          <p className="text-muted mb-6">
            {t('contactText')}
          </p>
          <Link
            href="/contact"
            className="btn-base btn-primary inline-block"
          >
            {t('contactButton')}
          </Link>
        </div>
      </div>
    </main>
  );
}
