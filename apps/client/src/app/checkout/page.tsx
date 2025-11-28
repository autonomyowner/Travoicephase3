'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useLanguage } from '../../components/LanguageProvider';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const _plan = searchParams.get('plan') || 'pro';
  void _plan; // Reserved for future use
  const billing = searchParams.get('billing') || 'monthly';

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
    country: language === 'en' ? 'United States' : 'France',
  });

  const currency = language === 'en' ? '$' : '€';
  const price = billing === 'yearly' ? 144 : 15;
  const priceLabel = billing === 'yearly' ? `144${currency}/${language === 'en' ? 'year' : 'an'}` : `15${currency}/${language === 'en' ? 'month' : 'mois'}`;
  const savings = language === 'en' ? `$36` : `36€`;

  const features = language === 'en'
    ? [
        'Unlimited analyses',
        'Complete psychological profile',
        'All cognitive biases detected',
        'Monthly progress tracking',
        'AI chat for deeper insights',
        'Priority support',
      ]
    : [
        'Analyses illimitées',
        'Profil psychologique complet',
        'Tous les biais cognitifs détectés',
        'Suivi de progression mensuel',
        'Chat IA pour approfondir',
        'Support prioritaire',
      ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted.slice(0, 19) });
      return;
    }

    // Format expiry date
    if (name === 'expiry') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 2) {
        setFormData({ ...formData, [name]: `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` });
      } else {
        setFormData({ ...formData, [name]: cleaned });
      }
      return;
    }

    // CVC max 3 digits
    if (name === 'cvc') {
      setFormData({ ...formData, [name]: value.slice(0, 3) });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Redirect to success page or dashboard
    router.push('/dashboard?upgraded=true');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          background: 'rgba(252, 250, 245, 0.9)',
          borderColor: 'var(--border-soft)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--matcha-600)',
            }}
          >
            Matcha
          </Link>
          <Link
            href="/pricing"
            className="text-sm hover:underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t.checkout.backToPricing}
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <h2
                className="text-xl mb-6"
                style={{
                  fontFamily: 'var(--font-dm-serif), Georgia, serif',
                  color: 'var(--text-primary)',
                }}
              >
                {t.checkout.orderSummary}
              </h2>

              {/* Plan Details */}
              <div
                className="p-4 rounded-xl mb-6"
                style={{ background: 'var(--cream-100)' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2"
                      style={{
                        background: 'var(--matcha-500)',
                        color: 'white',
                      }}
                    >
                      Pro
                    </span>
                    <h3
                      className="font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t.checkout.planTransformation}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {billing === 'yearly' ? t.checkout.billedYearly : t.checkout.billedMonthly}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {priceLabel}
                    </p>
                    {billing === 'yearly' && (
                      <p className="text-xs" style={{ color: 'var(--matcha-600)' }}>
                        {t.checkout.save} {savings}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Features included */}
              <div className="mb-6">
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.checkout.includedInSub}
                </p>
                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--matcha-500)' }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Divider */}
              <div
                className="h-px my-6"
                style={{ background: 'var(--border-soft)' }}
              />

              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span style={{ color: 'var(--text-secondary)' }}>{t.checkout.subtotal}</span>
                <span style={{ color: 'var(--text-primary)' }}>{price}{currency}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span style={{ color: 'var(--text-secondary)' }}>{t.checkout.vat}</span>
                <span style={{ color: 'var(--text-primary)' }}>{(price * 0.2).toFixed(2)}{currency}</span>
              </div>
              <div
                className="h-px my-4"
                style={{ background: 'var(--border-soft)' }}
              />
              <div className="flex justify-between items-center">
                <span
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.checkout.total}
                </span>
                <span
                  className="text-xl font-bold"
                  style={{ color: 'var(--matcha-600)' }}
                >
                  {(price * 1.2).toFixed(2)}{currency}
                </span>
              </div>

              {/* Guarantee */}
              <div
                className="mt-6 p-4 rounded-xl text-center"
                style={{ background: 'var(--cream-100)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {t.checkout.guarantee}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="order-1 lg:order-2">
            <h1
              className="text-2xl mb-2"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {t.checkout.finalizeSubscription}
            </h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              {t.checkout.securePayment}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.checkout.emailAddress}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={language === 'en' ? 'you@example.com' : 'vous@exemple.com'}
                  className="w-full px-4 py-3 rounded-xl text-base transition-all outline-none"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-soft)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Card Details */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.checkout.cardInfo}
                </label>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--border-soft)' }}
                >
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    placeholder={t.checkout.cardPlaceholder}
                    className="w-full px-4 py-3 text-base outline-none"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border-soft)',
                    }}
                  />
                  <div className="flex">
                    <input
                      type="text"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      required
                      placeholder="MM/YY"
                      className="w-1/2 px-4 py-3 text-base outline-none"
                      style={{
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        borderRight: '1px solid var(--border-soft)',
                      }}
                    />
                    <input
                      type="text"
                      name="cvc"
                      value={formData.cvc}
                      onChange={handleInputChange}
                      required
                      placeholder="CVC"
                      className="w-1/2 px-4 py-3 text-base outline-none"
                      style={{
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.checkout.nameOnCard}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t.checkout.namePlaceholder}
                  className="w-full px-4 py-3 rounded-xl text-base transition-all outline-none"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-soft)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.checkout.country}
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-base transition-all outline-none"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-soft)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {language === 'en' ? (
                    <>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="France">France</option>
                    </>
                  ) : (
                    <>
                      <option value="France">{t.checkout.france}</option>
                      <option value="Belgique">{t.checkout.belgium}</option>
                      <option value="Suisse">{t.checkout.switzerland}</option>
                      <option value="Canada">{t.checkout.canada}</option>
                      <option value="Luxembourg">{t.checkout.luxembourg}</option>
                    </>
                  )}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl font-medium text-base transition-all disabled:opacity-70"
                style={{
                  background: isProcessing
                    ? 'var(--matcha-400)'
                    : 'linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-600) 100%)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(104, 166, 125, 0.4)',
                }}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.checkout.processing}
                  </span>
                ) : (
                  `${t.checkout.pay} ${(price * 1.2).toFixed(2)}${currency}`
                )}
              </button>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>{t.checkout.secureSSL}</span>
              </div>

              {/* Terms */}
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                {t.checkout.termsAccept}{' '}
                <Link href="/terms" className="underline hover:no-underline">
                  {t.checkout.termsOfUse}
                </Link>{' '}
                {t.checkout.and}{' '}
                <Link href="/privacy" className="underline hover:no-underline">
                  {t.checkout.privacyPolicy}
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Stripe Badge */}
      <div className="pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: 'var(--cream-200)' }}
        >
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t.checkout.poweredBy}
          </span>
          <span
            className="font-semibold"
            style={{ color: 'var(--text-secondary)' }}
          >
            stripe
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream-50)' }}>
        <div className="w-8 h-8 border-2 border-[var(--matcha-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
