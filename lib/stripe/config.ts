export const STRIPE_CONFIG = {
  // Product and Price IDs
  PRODUCT_ID: 'prod_Te3cf0IeO2XcdR',
  PRICE_ID_KRW: 'price_1SglVfIGSqpGTA9i1HIxPO7T', // ₩12,000/year
  PRICE_ID_USD: 'price_1SglVgIGSqpGTA9i9TIdIQ2K', // $12/year

  // Pricing details
  PRICES: {
    KRW: {
      amount: 12000,
      currency: 'KRW',
      symbol: '₩',
      priceId: 'price_1SglVfIGSqpGTA9i1HIxPO7T',
    },
    USD: {
      amount: 12,
      currency: 'USD',
      symbol: '$',
      priceId: 'price_1SglVgIGSqpGTA9i9TIdIQ2K',
    },
  },

  // URLs
  SUCCESS_URL: '/premium/success',
  CANCEL_URL: '/premium',
} as const;
