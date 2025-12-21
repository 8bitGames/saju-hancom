export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
export type UsageActionType = 'pdf_download' | 'kakao_share' | 'save_result';

export interface UserProfile {
  id: string;
  email: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SajuResult {
  id: string;
  user_id: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  birth_minute: number;
  gender: string;
  is_lunar: boolean;
  city: string;
  result_data: any;
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  action_type: UsageActionType;
  saju_result_id: string | null;
  metadata: any;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan: string;
  amount_krw: number;
  amount_usd: number;
  payment_method: string | null;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}
