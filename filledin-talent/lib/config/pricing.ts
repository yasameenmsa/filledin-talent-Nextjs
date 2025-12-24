/**
 * Pricing Configuration
 * Centralized configuration for service pricing and revenue tracking
 */

export const pricingConfig = {
  // Job posting fees
  jobPosting: {
    basic: {
      amount: 0, // Free for basic posting
      currency: 'USD',
      features: ['standard_listing', 'basic_support']
    },
    premium: {
      amount: 49.99,
      currency: 'USD',
      features: ['premium_listing', 'priority_support', 'analytics']
    }
  },

  // Feature upgrades
  features: {
    featured: {
      amount: 19.99,
      currency: 'USD',
      duration: 30, // days
      description: 'Featured job listing for higher visibility'
    },
    urgent: {
      amount: 9.99,
      currency: 'USD',
      duration: 7, // days
      description: 'Urgent badge to attract quick applications'
    },
    highlighted: {
      amount: 14.99,
      currency: 'USD',
      duration: 14, // days
      description: 'Highlighted display in search results'
    }
  },

  // Subscription plans (for employers)
  subscriptions: {
    starter: {
      amount: 29.99,
      currency: 'USD',
      interval: 'monthly',
      jobPostings: 5,
      features: ['basic_analytics', 'email_support']
    },
    professional: {
      amount: 79.99,
      currency: 'USD',
      interval: 'monthly',
      jobPostings: 20,
      features: ['advanced_analytics', 'priority_support', 'featured_jobs']
    },
    enterprise: {
      amount: 199.99,
      currency: 'USD',
      interval: 'monthly',
      jobPostings: -1, // unlimited
      features: ['full_analytics', 'dedicated_support', 'api_access', 'white_label']
    }
  },

  // Currency settings
  currencies: {
    supported: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    default: 'USD',
    exchangeRates: {
      // These would typically come from an external API
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      CAD: 1.25,
      AUD: 1.35
    }
  },

  // Payment methods
  paymentMethods: {
    supported: ['stripe', 'paypal', 'bank_transfer'],
    default: 'stripe'
  },

  // Tax settings (simplified)
  tax: {
    defaultRate: 0.08, // 8%
    exemptCountries: ['US'], // Simplified tax exemption
  }
} as const;

export type PricingConfig = typeof pricingConfig;

// Helper functions
export function getJobPostingPrice(tier: 'basic' | 'premium' = 'basic'): number {
  return pricingConfig.jobPosting[tier].amount;
}

export function getFeaturePrice(feature: keyof typeof pricingConfig.features): number {
  return pricingConfig.features[feature].amount;
}

export function getSubscriptionPrice(plan: keyof typeof pricingConfig.subscriptions): number {
  return pricingConfig.subscriptions[plan].amount;
}

export function calculateTax(amount: number, country: string = 'US'): number {
  if (pricingConfig.tax.exemptCountries.includes(country)) {
    return 0;
  }
  return amount * pricingConfig.tax.defaultRate;
}

export function convertCurrency(amount: number, from: string, to: string): number {
  const fromRate = pricingConfig.currencies.exchangeRates[from as keyof typeof pricingConfig.currencies.exchangeRates] || 1;
  const toRate = pricingConfig.currencies.exchangeRates[to as keyof typeof pricingConfig.currencies.exchangeRates] || 1;

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}
