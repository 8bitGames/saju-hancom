export const STRIPE_CONFIG = {
  // Product and Price IDs - 청기운 프리미엄
  PRODUCT_ID: 'prod_TedmkFfXlhNMxZ',
  PRICE_ID_KRW: 'price_1ShKUdIGSqpGTA9iNkwLBxjk', // ₩12,000/year
  PRICE_ID_USD: 'price_1ShKUfIGSqpGTA9icC31lLrz', // $12/year

  // Pricing details
  PRICES: {
    KRW: {
      amount: 12000,
      currency: 'KRW',
      symbol: '₩',
      priceId: 'price_1ShKUdIGSqpGTA9iNkwLBxjk',
    },
    USD: {
      amount: 12,
      currency: 'USD',
      symbol: '$',
      priceId: 'price_1ShKUfIGSqpGTA9icC31lLrz',
    },
  },

  // URLs
  SUCCESS_URL: '/premium/success',
  CANCEL_URL: '/premium',
} as const;
