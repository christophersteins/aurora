'use client';

import { Hourglass } from 'lucide-react';

interface PriceOption {
  duration: string;
  price: string;
  category: 'short' | 'standard' | 'premium' | 'special';
}

interface PricingDisplayProps {
  prices?: {
    price30Min?: number;
    price1Hour?: number;
    price2Hours?: number;
    price3Hours?: number;
    price6Hours?: number;
    price12Hours?: number;
    price24Hours?: number;
    priceOvernight?: number;
    priceWeekend?: number;
  };
}

export default function PricingDisplay({ prices }: PricingDisplayProps) {
  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const priceOptions: PriceOption[] = [
    {
      duration: '30 Minuten',
      price: formatPrice(prices?.price30Min) || '150 €',
      category: 'short',
    },
    {
      duration: '1 Stunde',
      price: formatPrice(prices?.price1Hour) || '250 €',
      category: 'standard',
    },
    {
      duration: '2 Stunden',
      price: formatPrice(prices?.price2Hours) || '450 €',
      category: 'standard',
    },
    {
      duration: '3 Stunden',
      price: formatPrice(prices?.price3Hours) || '600 €',
      category: 'premium',
    },
    {
      duration: '6 Stunden',
      price: formatPrice(prices?.price6Hours) || '1.000 €',
      category: 'premium',
    },
    {
      duration: '12 Stunden',
      price: formatPrice(prices?.price12Hours) || '1.800 €',
      category: 'premium',
    },
    {
      duration: '24 Stunden',
      price: formatPrice(prices?.price24Hours) || '3.000 €',
      category: 'special',
    },
    {
      duration: 'Übernachtung',
      price: formatPrice(prices?.priceOvernight) || '2.500 €',
      category: 'special',
    },
    {
      duration: 'Wochenende',
      price: formatPrice(prices?.priceWeekend) || '5.000 €',
      category: 'special',
    },
  ].filter(option => option.price !== null);

  const getCardStyle = () => {
    return {
      gradient: 'var(--background-secondary)',
      border: 'var(--border)',
      borderWidth: '1px',
    };
  };

  return (
    <div className="space-y-3">
      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {priceOptions.map((option) => {
          const style = getCardStyle();

          return (
            <div
              key={option.duration}
              className="rounded-lg overflow-hidden"
              style={{
                background: style.gradient,
                border: `${style.borderWidth} solid ${style.border}`,
              }}
            >
              <div className="p-3">
                <div className="flex items-center justify-between gap-3">
                  {/* Left side: Icon + Duration */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'var(--color-primary)',
                      }}
                    >
                      <Hourglass
                        className="w-4 h-4"
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                        {option.duration}
                      </h4>
                    </div>
                  </div>

                  {/* Right side: Price */}
                  <div className="text-right flex-shrink-0">
                    <span
                      className="text-xl font-bold"
                      style={{ color: 'var(--text-heading)' }}
                    >
                      {option.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
