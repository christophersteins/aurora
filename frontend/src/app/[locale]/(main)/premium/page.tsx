'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Star, TrendingUp, BarChart3, Shield, Zap } from 'lucide-react';

interface PricingPlan {
  id: string;
  duration: string;
  price: number;
  savePercent?: number;
  popular?: boolean;
}

export default function PremiumPage() {
  const t = useTranslations('premium');
  const [selectedPlan, setSelectedPlan] = useState<string>('quarterly');

  const features = [
    {
      icon: Star,
      title: t('features.feature1.title'),
      description: t('features.feature1.description')
    },
    {
      icon: TrendingUp,
      title: t('features.feature2.title'),
      description: t('features.feature2.description')
    },
    {
      icon: BarChart3,
      title: t('features.feature3.title'),
      description: t('features.feature3.description')
    },
    {
      icon: Shield,
      title: t('features.feature4.title'),
      description: t('features.feature4.description')
    },
    {
      icon: Zap,
      title: t('features.feature5.title'),
      description: t('features.feature5.description')
    },
    {
      icon: Check,
      title: t('features.feature6.title'),
      description: t('features.feature6.description')
    }
  ];

  const pricingPlans: PricingPlan[] = [
    {
      id: 'monthly',
      duration: t('plans.monthly'),
      price: 49.99
    },
    {
      id: 'quarterly',
      duration: t('plans.quarterly'),
      price: 39.99,
      savePercent: 20,
      popular: true
    },
    {
      id: 'yearly',
      duration: t('plans.yearly'),
      price: 29.99,
      savePercent: 40
    }
  ];

  return (
    <main className="min-h-screen py-12 bg-page-primary">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed] mb-6">
            <Star size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-heading mb-3">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-[#2f3336] bg-page-primary hover:border-[#8b5cf6] transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center mb-4 group-hover:bg-[#8b5cf6]/20 transition">
                    <Icon size={24} className="text-[#8b5cf6]" />
                  </div>
                  <h3 className="text-xl font-semibold text-heading mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-heading mb-3">
              {t('plans.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-8 rounded-lg border transition-all ${
                  selectedPlan === plan.id
                    ? 'border-[#8b5cf6] bg-[#8b5cf6]/5'
                    : 'border-[#2f3336] bg-page-primary hover:border-[#8b5cf6]/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#8b5cf6] text-white text-sm font-medium rounded-full">
                    {t('plans.mostPopular')}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-heading mb-2">
                    {plan.duration}
                  </h3>
                  {plan.savePercent && (
                    <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/50 rounded-full text-green-400 text-sm font-medium mb-3">
                      {t('plans.savePercent', { percent: plan.savePercent })}
                    </div>
                  )}
                  <div className="mb-1">
                    <span className="text-4xl font-bold text-heading">
                      €{plan.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-muted text-sm">
                    {t('plans.perMonth')}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full btn-base transition ${
                    selectedPlan === plan.id
                      ? 'btn-primary'
                      : 'btn-secondary hover:border-[#8b5cf6]'
                  }`}
                >
                  {t('plans.selectPlan')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative rounded-lg overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/10 via-[#4d7cfe]/10 to-[#b845ed]/10"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
            }}
          />
          <div className="relative p-12 border border-[#2f3336] text-center">
            <h2 className="text-3xl font-bold text-heading mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <button className="btn-base btn-primary text-lg px-8 py-4">
              {t('cta.button')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
