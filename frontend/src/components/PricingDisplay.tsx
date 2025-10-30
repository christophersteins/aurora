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

  const priceOptions: PriceOption[] = [];

  if (prices?.price30Min) {
    priceOptions.push({
      duration: '30 Minuten',
      price: formatPrice(prices.price30Min)!,
      category: 'short',
    });
  }

  if (prices?.price1Hour) {
    priceOptions.push({
      duration: '1 Stunde',
      price: formatPrice(prices.price1Hour)!,
      category: 'standard',
    });
  }

  if (prices?.price2Hours) {
    priceOptions.push({
      duration: '2 Stunden',
      price: formatPrice(prices.price2Hours)!,
      category: 'standard',
    });
  }

  if (prices?.price3Hours) {
    priceOptions.push({
      duration: '3 Stunden',
      price: formatPrice(prices.price3Hours)!,
      category: 'premium',
    });
  }

  if (prices?.price6Hours) {
    priceOptions.push({
      duration: '6 Stunden',
      price: formatPrice(prices.price6Hours)!,
      category: 'premium',
    });
  }

  if (prices?.price12Hours) {
    priceOptions.push({
      duration: '12 Stunden',
      price: formatPrice(prices.price12Hours)!,
      category: 'premium',
    });
  }

  if (prices?.price24Hours) {
    priceOptions.push({
      duration: '24 Stunden',
      price: formatPrice(prices.price24Hours)!,
      category: 'special',
    });
  }

  if (prices?.priceOvernight) {
    priceOptions.push({
      duration: 'Übernachtung',
      price: formatPrice(prices.priceOvernight)!,
      category: 'special',
    });
  }

  if (prices?.priceWeekend) {
    priceOptions.push({
      duration: 'Wochenende',
      price: formatPrice(prices.priceWeekend)!,
      category: 'special',
    });
  }

  const getCardStyle = () => {
    return {
      gradient: 'var(--background-secondary)',
      border: 'var(--border)',
      borderWidth: '1px',
    };
  };

  // Show empty state if no prices are available
  if (priceOptions.length === 0) {
    return (
      <div
        className="text-center py-12 px-6 rounded-lg border"
        style={{
          background: 'var(--background-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
          }}
        >
          <Hourglass className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
        </div>
        <p className="text-base font-medium mb-2" style={{ color: 'var(--text-heading)' }}>
          Keine Preise hinterlegt
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Dieses Profil hat noch keine Preisinformationen eingetragen.
        </p>
      </div>
    );
  }

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
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'var(--color-primary)',
                    }}
                  >
                    <Hourglass className="w-4 h-4" style={{ color: 'white' }} />
                  </div>

                  {/* Duration */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-heading)' }}>
                      {option.duration}
                    </h4>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <span
                      className="text-lg font-bold"
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
