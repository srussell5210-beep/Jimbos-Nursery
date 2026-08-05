'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Loader2, ArrowLeft, CreditCard } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CloverElements {
  create(
    type: 'CARD_NUMBER' | 'CARD_DATE' | 'CARD_CVV' | 'CARD_POSTAL_CODE',
    styles?: object,
  ): { mount: (selector: string) => void };
}

interface CloverToken {
  id: string;
}

interface CloverInstance {
  elements(): CloverElements;
  createToken(): Promise<{
    token?: CloverToken;
    errors?: Record<string, string>;
  }>;
}

declare global {
  interface Window {
    Clover?: new (
      apiKey: string,
      options?: { environment?: string },
    ) => CloverInstance;
  }
}

interface OrderResult {
  giftCardNumber: string;
  amount: number;
  recipientName: string;
  recipientEmail: string;
  chargeId: string;
}

interface CloverCheckoutConfig {
  checkoutReady: boolean;
  apiAccessKey?: string;
  environment?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_AMOUNTS = [25, 50, 100, 150, 200];

const CLOVER_INPUT_STYLES = {
  body: { fontFamily: 'inherit', fontSize: '15px', background: 'transparent' },
  input: {
    color: '#0f172a',
    fontSize: '15px',
    fontFamily: 'inherit',
    background: 'transparent',
    outline: 'none',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function GiftCardForm() {
  // Step control
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');

  // Details fields
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');

  // Payment state
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cloverReady, setCloverReady] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const cloverRef = useRef<CloverInstance | null>(null);

  const activeAmount = useCustom ? parseFloat(customAmount || '0') : amount;

  // Load Clover SDK and mount card iframes when entering payment step
  useEffect(() => {
    if (step !== 'payment') return;

    let cancelled = false;

    async function loadClover() {
      setCloverReady(false);
      setError('');

      let config: CloverCheckoutConfig;
      try {
        const res = await fetch('/api/gift-cards/config', { cache: 'no-store' });
        config = await res.json();
      } catch {
        if (!cancelled) setError('Could not check Clover payment configuration.');
        return;
      }

      if (cancelled) return;
      if (!config.checkoutReady || !config.apiAccessKey) {
        setError('Gift card checkout is not available yet. Please call the nursery to purchase a gift card.');
        return;
      }

      const existing = document.getElementById('clover-sdk');
      if (existing) {
        initClover(config.apiAccessKey, config.environment ?? 'sandbox');
        return;
      }

      const script = document.createElement('script');
      script.id = 'clover-sdk';
      script.src = 'https://checkout.clover.com/sdk.js';
      script.onload = () => {
        if (!cancelled) initClover(config.apiAccessKey!, config.environment ?? 'sandbox');
      };
      script.onerror = () => {
        if (!cancelled) setError('Failed to load Clover SDK. Check your connection.');
      };
      document.head.appendChild(script);
    }

    loadClover();

    return () => {
      cancelled = true;
    };
  }, [step]);

  function initClover(apiKey: string, environment: string) {
    if (!window.Clover) {
      setError('Clover SDK did not load correctly.');
      return;
    }
    const clover = new window.Clover(apiKey, { environment });
    cloverRef.current = clover;
    const elements = clover.elements();
    elements.create('CARD_NUMBER',      CLOVER_INPUT_STYLES).mount('#clover-card-number');
    elements.create('CARD_DATE',        CLOVER_INPUT_STYLES).mount('#clover-card-date');
    elements.create('CARD_CVV',         CLOVER_INPUT_STYLES).mount('#clover-card-cvv');
    elements.create('CARD_POSTAL_CODE', CLOVER_INPUT_STYLES).mount('#clover-card-postal');
    setCloverReady(true);
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (activeAmount < 5)   { setError('Minimum gift card amount is $5.00.');   return; }
    if (activeAmount > 500) { setError('Maximum gift card amount is $500.00.'); return; }
    if (!recipientEmail.includes('@')) { setError('Enter a valid recipient email.'); return; }
    setStep('payment');
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cloverRef.current || !cloverReady) {
      setError('Payment not ready yet. Wait a moment and try again.');
      return;
    }
    setSubmitting(true);
    setError('');
    setCardErrors({});

    const { token, errors } = await cloverRef.current.createToken();

    if (errors && Object.keys(errors).length) {
      setCardErrors(errors);
      setSubmitting(false);
      return;
    }
    if (!token?.id) {
      setError('Could not generate a payment token. Check card details and retry.');
      setSubmitting(false);
      return;
    }

    const res = await fetch('/api/gift-cards/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: activeAmount,
        recipientName,
        recipientEmail,
        senderName,
        message,
        paymentToken: token.id,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.error || 'Order failed. Please try again.');
      setSubmitting(false);
      return;
    }

    setResult(data);
    setStep('success');
    setSubmitting(false);
  }

  // ─── Success ───────────────────────────────────────────────────────────────

  if (step === 'success' && result) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-14 h-14 text-nursery-sage mx-auto mb-5" />
        <h3 className="text-2xl font-serif text-nursery-midnight mb-2">Gift Card Sent!</h3>
        <p className="text-nursery-midnight/60 mb-8 leading-relaxed">
          A <span className="font-semibold">${result.amount.toFixed(2)}</span> gift card was sent to{' '}
          <span className="font-semibold">{result.recipientEmail}</span>.
        </p>
        <div className="bg-nursery-sage/10 border border-nursery-sage/30 rounded-2xl px-8 py-6 inline-block mb-2">
          <p className="text-xs tracking-widest text-nursery-midnight/40 uppercase mb-2">Gift Card Code</p>
          <p className="text-xl font-mono font-bold text-nursery-midnight tracking-[0.2em]">
            {result.giftCardNumber}
          </p>
        </div>
        <p className="text-xs text-nursery-midnight/40 mb-8">Charge ID: {result.chargeId}</p>
        <button
          onClick={() => {
            setStep('details');
            setResult(null);
            setRecipientName('');
            setRecipientEmail('');
            setSenderName('');
            setMessage('');
            setAmount(50);
            setUseCustom(false);
            setCustomAmount('');
          }}
          className="text-sm text-nursery-terracotta underline underline-offset-2"
        >
          Order another gift card
        </button>
      </div>
    );
  }

  // ─── Payment step ──────────────────────────────────────────────────────────

  if (step === 'payment') {
    return (
      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => { setStep('details'); setError(''); setCardErrors({}); }}
            className="flex items-center gap-1 text-sm text-nursery-midnight/50 hover:text-nursery-midnight transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm font-semibold text-nursery-terracotta">
            ${activeAmount.toFixed(2)} gift card
          </span>
        </div>

        <div className="bg-nursery-sage/5 border border-nursery-sage/20 rounded-2xl p-4 text-sm text-nursery-midnight/70">
          To: <strong>{recipientName}</strong> · {recipientEmail}
          <br />
          From: <strong>{senderName}</strong>
          {message && <><br /><span className="italic">"{message}"</span></>}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-nursery-midnight/40" />
            <span className="font-medium text-nursery-midnight">Card Details</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-nursery-midnight/50 uppercase tracking-wider block mb-1">
                Card Number
              </label>
              <div
                id="clover-card-number"
                className="h-11 px-4 border border-nursery-sage/30 rounded-xl bg-white flex items-center"
              />
              {cardErrors.CARD_NUMBER && (
                <p className="text-xs text-red-500 mt-1">{cardErrors.CARD_NUMBER}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-nursery-midnight/50 uppercase tracking-wider block mb-1">
                  Expiry
                </label>
                <div
                  id="clover-card-date"
                  className="h-11 px-4 border border-nursery-sage/30 rounded-xl bg-white flex items-center"
                />
                {cardErrors.CARD_DATE && (
                  <p className="text-xs text-red-500 mt-1">{cardErrors.CARD_DATE}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-nursery-midnight/50 uppercase tracking-wider block mb-1">
                  CVV
                </label>
                <div
                  id="clover-card-cvv"
                  className="h-11 px-4 border border-nursery-sage/30 rounded-xl bg-white flex items-center"
                />
                {cardErrors.CARD_CVV && (
                  <p className="text-xs text-red-500 mt-1">{cardErrors.CARD_CVV}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-nursery-midnight/50 uppercase tracking-wider block mb-1">
                  ZIP
                </label>
                <div
                  id="clover-card-postal"
                  className="h-11 px-4 border border-nursery-sage/30 rounded-xl bg-white flex items-center"
                />
                {cardErrors.CARD_POSTAL_CODE && (
                  <p className="text-xs text-red-500 mt-1">{cardErrors.CARD_POSTAL_CODE}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !cloverReady}
          className="w-full h-14 bg-nursery-terracotta text-white font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-nursery-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
          ) : !cloverReady ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Loading payment…</>
          ) : (
            `Pay $${activeAmount.toFixed(2)}`
          )}
        </button>

        <p className="text-center text-xs text-nursery-midnight/30">
          Secured by Clover · All transactions encrypted
        </p>
      </form>
    );
  }

  // ─── Details step ──────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleDetailsSubmit} className="space-y-6">

      {/* Amount selector */}
      <div>
        <label className="text-xs font-medium text-nursery-midnight/50 uppercase tracking-wider block mb-3">
          Select Amount
        </label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {PRESET_AMOUNTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setAmount(p); setUseCustom(false); }}
              className={`h-11 rounded-xl text-sm font-semibold border transition-all ${
                !useCustom && amount === p
                  ? 'bg-nursery-terracotta text-white border-nursery-terracotta'
                  : 'bg-white text-nursery-midnight border-nursery-sage/30 hover:border-nursery-terracotta/50'
              }`}
            >
              ${p}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nursery-midnight/40 font-medium">$</span>
          <input
            type="number"
            min={5}
            max={500}
            placeholder="Custom amount"
            value={customAmount}
            onFocus={() => setUseCustom(true)}
            onChange={(e) => { setCustomAmount(e.target.value); setUseCustom(true); }}
            className={`w-full h-11 pl-8 pr-4 border rounded-xl text-sm transition-colors outline-none focus:ring-2 focus:ring-nursery-terracotta/20 ${
              useCustom
                ? 'border-nursery-terracotta bg-white'
                : 'border-nursery-sage/30 bg-white'
            }`}
          />
        </div>
      </div>

      {/* Recipient */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-nursery-midnight/50 uppercase tracking-wider block">
          Recipient
        </label>
        <input
          required
          type="text"
          placeholder="Recipient's full name"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="w-full h-11 px-4 border border-nursery-sage/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-nursery-terracotta/20 focus:border-nursery-terracotta/50"
        />
        <input
          required
          type="email"
          placeholder="Recipient's email address"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          className="w-full h-11 px-4 border border-nursery-sage/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-nursery-terracotta/20 focus:border-nursery-terracotta/50"
        />
      </div>

      {/* Sender */}
      <div>
        <label className="text-xs font-medium text-nursery-midnight/50 uppercase tracking-wider block mb-3">
          From
        </label>
        <input
          required
          type="text"
          placeholder="Your name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          className="w-full h-11 px-4 border border-nursery-sage/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-nursery-terracotta/20 focus:border-nursery-terracotta/50"
        />
      </div>

      {/* Message */}
      <div>
        <label className="text-xs font-medium text-nursery-midnight/50 uppercase tracking-wider block mb-3">
          Personal Message <span className="normal-case text-nursery-midnight/30">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Add a personal note…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 border border-nursery-sage/30 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-nursery-terracotta/20 focus:border-nursery-terracotta/50"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        className="w-full h-14 bg-nursery-terracotta text-white font-semibold rounded-2xl hover:bg-nursery-terracotta/90 transition-colors"
      >
        Continue to Payment →
      </button>
    </form>
  );
}
