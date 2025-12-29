/**
 * Environment Variables Validation Script
 * Run: npx tsx scripts/check-env.ts
 */

const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    example: 'https://xxx.supabase.co',
    required: true,
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key (public)',
    example: 'eyJ...',
    required: true,
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key (server-only)',
    example: 'eyJ...',
    required: true,
  },

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    description: 'Stripe publishable key',
    example: 'pk_live_... or pk_test_...',
    required: true,
  },
  STRIPE_SECRET_KEY: {
    description: 'Stripe secret key',
    example: 'sk_live_... or sk_test_...',
    required: true,
  },
  STRIPE_WEBHOOK_SECRET: {
    description: 'Stripe webhook signing secret',
    example: 'whsec_...',
    required: true,
  },

  // AI
  GOOGLE_GENERATIVE_AI_API_KEY: {
    description: 'Google AI (Gemini) API key',
    example: 'AIza...',
    required: true,
  },

  // App
  NEXT_PUBLIC_SITE_URL: {
    description: 'Production site URL',
    example: 'https://yourdomain.com',
    required: true,
  },
} as const;

const optionalEnvVars = {
  OPENAI_API_KEY: {
    description: 'OpenAI API key (optional fallback)',
    example: 'sk-...',
  },
  KAKAO_JAVASCRIPT_KEY: {
    description: 'Kakao JavaScript SDK key',
    example: 'abc123...',
  },
} as const;

function checkEnv() {
  console.log('🔍 Checking environment variables...\n');

  let hasError = false;
  const missing: string[] = [];
  const configured: string[] = [];

  // Check required variables
  console.log('📋 Required Variables:');
  console.log('─'.repeat(50));

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];
    if (value) {
      const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      console.log(`  ✅ ${key}: ${masked}`);
      configured.push(key);
    } else {
      console.log(`  ❌ ${key}: NOT SET`);
      console.log(`     └─ ${config.description}`);
      console.log(`     └─ Example: ${config.example}`);
      missing.push(key);
      hasError = true;
    }
  }

  console.log('\n📋 Optional Variables:');
  console.log('─'.repeat(50));

  for (const [key, config] of Object.entries(optionalEnvVars)) {
    const value = process.env[key];
    if (value) {
      const masked = value.substring(0, 8) + '...';
      console.log(`  ✅ ${key}: ${masked}`);
    } else {
      console.log(`  ⚪ ${key}: not set (optional)`);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Summary:');
  console.log(`   Configured: ${configured.length}/${Object.keys(requiredEnvVars).length}`);

  if (hasError) {
    console.log(`   Missing: ${missing.length} required variable(s)`);
    console.log('\n❌ Environment validation FAILED');
    console.log('\nTo fix, add the missing variables to your .env.local file:');
    missing.forEach((key) => {
      const config = requiredEnvVars[key as keyof typeof requiredEnvVars];
      console.log(`\n${key}=${config.example}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ Environment validation PASSED');
  }
}

checkEnv();
