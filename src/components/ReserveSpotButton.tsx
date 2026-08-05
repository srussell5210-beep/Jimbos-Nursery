'use client';

import { useState } from 'react';
import { X, CheckCircle, Loader2, ShoppingCart } from 'lucide-react';
import { addProductToCart, goToEcwidCheckout } from '@/lib/ecwid-client';

interface TimeSlot {
  id: string;
  label: string;
  capacity?: number | null;
}

interface AddOnOption {
  id: string;
  label: string;
  price?: number | null;
}

interface AddOn {
  id: string;
  name: string;
  capacity?: number | null;
  price?: number | null;
  ecwidProductId?: number | null;
  optionLabel?: string;
  options?: AddOnOption[];
}

interface ReserveSpotButtonProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  capacity?: number;
  reserved?: number;
  timeSlots?: TimeSlot[];
  slotCounts?: Record<string, number>;
  addOns?: AddOn[];
  addOnCounts?: Record<string, number>;
  ecwidProductId?: number | null;
  ticketPrice?: number | null;
}

export default function ReserveSpotButton({
  eventId, eventTitle, eventDate, eventTime, eventLocation,
  capacity, reserved = 0,
  timeSlots = [], slotCounts = {},
  addOns = [], addOnCounts = {},
  ecwidProductId = null, ticketPrice = null,
}: ReserveSpotButtonProps) {
  const paid = Boolean(ecwidProductId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [addOnQuantities, setAddOnQuantities] = useState<Record<string, number>>({});
  const [addOnOptionIds, setAddOnOptionIds] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ count: number; slotLabel?: string | null; addOns: { name: string; quantity: number }[] } | null>(null);

  const hasLimit = typeof capacity === 'number' && capacity > 0;
  const remaining = hasLimit ? Math.max(capacity - reserved, 0) : null;

  const slotsWithAvailability = timeSlots.map((slot) => {
    const slotReserved = slotCounts[slot.id] ?? 0;
    const hasSlotLimit = typeof slot.capacity === 'number' && slot.capacity > 0;
    const slotRemaining = hasSlotLimit ? Math.max(slot.capacity! - slotReserved, 0) : null;
    return { ...slot, slotRemaining, full: hasSlotLimit && slotRemaining === 0 };
  });
  const hasSlots = slotsWithAvailability.length > 0;
  const allSlotsFull = hasSlots && slotsWithAvailability.every((s) => s.full);

  const addOnsWithAvailability = addOns.map((addOn) => {
    const addOnReserved = addOnCounts[addOn.id] ?? 0;
    const hasAddOnLimit = typeof addOn.capacity === 'number' && addOn.capacity > 0;
    const addOnRemaining = hasAddOnLimit ? Math.max(addOn.capacity! - addOnReserved, 0) : null;
    return { ...addOn, addOnRemaining, full: hasAddOnLimit && addOnRemaining === 0 };
  });

  const soldOut = (hasLimit && remaining === 0) || allSlotsFull;

  const selectedSlot = slotsWithAvailability.find((s) => s.id === selectedSlotId);
  const slotMax = selectedSlot?.slotRemaining ?? null;
  const maxGuests = Math.max(1, Math.min(hasLimit ? remaining! : 20, slotMax ?? 20));

  // A chosen dropdown option adds its price on top of the add-on's base price,
  // matching the ABSOLUTE priceModifier sent to Ecwid in ecwid-sync.ts.
  function addOnUnitPrice(addOn: AddOn): number {
    const chosen = (addOn.options ?? []).find((o) => o.id === addOnOptionIds[addOn.id]);
    return (addOn.price ?? 0) + (chosen?.price ?? 0);
  }

  const addOnsTotal = addOnsWithAvailability.reduce(
    (sum, addOn) => sum + (addOnQuantities[addOn.id] ?? 0) * addOnUnitPrice(addOn),
    0,
  );
  const total = (ticketPrice ?? 0) * guests + addOnsTotal;

  const missingOption = addOnsWithAvailability.find(
    (addOn) => (addOnQuantities[addOn.id] ?? 0) > 0 && (addOn.options?.length ?? 0) > 0 && !addOnOptionIds[addOn.id],
  );

  const reset = () => {
    setOpen(false);
    setName('');
    setEmail('');
    setGuests(1);
    setSelectedSlotId('');
    setAddOnQuantities({});
    setAddOnOptionIds({});
    setAddedToCart(false);
    setError('');
    setResult(null);
  };

  function setAddOnQuantity(id: string, quantity: number) {
    setAddOnQuantities((prev) => ({ ...prev, [id]: quantity }));
  }

  function setAddOnOption(id: string, optionId: string) {
    setAddOnOptionIds((prev) => ({ ...prev, [id]: optionId }));
  }

  // Pushes the ticket and every selected add-on into the Ecwid cart. Shared by
  // "Add to Cart & Keep Shopping" and "Continue to Checkout" so both paths add
  // exactly the same line items.
  async function addEverythingToCart() {
    const options = hasSlots && selectedSlot ? { 'Time Slot': selectedSlot.label } : undefined;
    await addProductToCart(ecwidProductId as number, guests, options);
    for (const addOn of addOnsWithAvailability) {
      const quantity = addOnQuantities[addOn.id] ?? 0;
      if (quantity > 0 && addOn.ecwidProductId) {
        const chosen = (addOn.options ?? []).find((o) => o.id === addOnOptionIds[addOn.id]);
        const addOnOptions = chosen ? { [addOn.optionLabel?.trim() || 'Option']: chosen.label } : undefined;
        await addProductToCart(addOn.ecwidProductId, quantity, addOnOptions);
      }
    }
  }

  async function handleAddToCart() {
    if (missingOption) {
      setError(`Please choose an option for ${missingOption.name}.`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addEverythingToCart();
      setAddedToCart(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Could not add these items to your cart.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (missingOption) {
      setError(`Please choose an option for ${missingOption.name}.`);
      setSubmitting(false);
      return;
    }

    if (paid) {
      try {
        // Already in the cart from "Add to Cart & Keep Shopping" — don't double-add.
        if (!addedToCart) await addEverythingToCart();
        await goToEcwidCheckout();
        reset();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Could not start checkout. Please try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      const selectedAddOns = Object.entries(addOnQuantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([id, quantity]) => ({ id, quantity, optionId: addOnOptionIds[id] ?? null }));

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId, name, email, guests,
          timeSlotId: hasSlots ? selectedSlotId : undefined,
          addOns: selectedAddOns,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not reserve your spot. Please try again.');
        return;
      }
      setResult({
        count: data.count,
        slotLabel: selectedSlot?.label,
        addOns: selectedAddOns.map((a) => {
          const definition = addOns.find((ao) => ao.id === a.id);
          const choice = (definition?.options ?? []).find((o) => o.id === a.optionId);
          return {
            name: choice ? `${definition?.name ?? ''} (${choice.label})` : definition?.name ?? '',
            quantity: a.quantity,
          };
        }),
      });
    } catch (err) {
      console.error(err);
      setError('Could not reserve your spot. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => !soldOut && setOpen(true)}
        disabled={soldOut}
        className={`w-full py-4 rounded-xl font-bold transition-colors ${
          soldOut
            ? 'bg-nursery-midnight/20 text-nursery-midnight/40 cursor-not-allowed'
            : 'bg-nursery-midnight text-nursery-ivory hover:bg-nursery-terracotta'
        }`}
      >
        {soldOut ? 'Sold Out' : paid ? 'Reserve & Pay' : 'Reserve Your Spot'}
      </button>
      {hasLimit && !soldOut && (
        <p className="mt-2 text-center text-xs text-nursery-midnight/45">{remaining} spot{remaining === 1 ? '' : 's'} left</p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close" onClick={reset} className="absolute inset-0 bg-nursery-midnight/60 backdrop-blur-sm" />
          <div className="relative z-10 flex w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: 'min(90vh, 700px)' }}>
            <div className="flex shrink-0 items-center justify-between border-b border-nursery-sage/20 px-6 py-4">
              <h3 className="font-serif text-xl text-nursery-midnight">{result ? "You're on the list!" : paid ? 'Reserve & Pay' : 'Reserve Your Spot'}</h3>
              <button type="button" onClick={reset} className="rounded-lg p-1.5 text-nursery-midnight/40 transition hover:bg-nursery-sage/10 hover:text-nursery-midnight">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {result ? (
                <div className="py-2 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-nursery-sage" />
                  <p className="leading-relaxed text-nursery-midnight/70">
                    Thanks, <span className="font-semibold">{name}</span> — you&apos;re registered for{' '}
                    <span className="font-semibold">{eventTitle}</span>
                    {result.slotLabel ? <> at <span className="font-semibold">{result.slotLabel}</span></> : null}.
                  </p>
                  {result.addOns.length > 0 && (
                    <p className="mt-2 text-sm text-nursery-midnight/60">
                      Add-ons: {result.addOns.map((a) => `${a.quantity}× ${a.name}`).join(', ')}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-nursery-midnight/50">
                    {result.count} {result.count === 1 ? 'spot has' : 'spots have'} been reserved for this event so far.
                    {hasLimit && ` ${Math.max(capacity! - result.count, 0)} spot${Math.max(capacity! - result.count, 0) === 1 ? '' : 's'} left.`}
                  </p>
                  <button type="button" onClick={reset} className="mt-6 text-sm text-nursery-terracotta underline underline-offset-2">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="rounded-xl border border-nursery-sage/20 bg-nursery-sage/5 px-4 py-3 text-sm text-nursery-midnight/70">
                    <p className="font-semibold text-nursery-midnight">{eventTitle}</p>
                    <p className="mt-1">{eventDate} · {eventTime} · {eventLocation}</p>
                  </div>

                  {paid && (
                    <p className="rounded-xl border border-nursery-sage/20 bg-nursery-sage/5 px-4 py-3 text-xs text-nursery-midnight/60">
                      You&apos;ll enter your name, email, and payment details on the next step (secure checkout).
                    </p>
                  )}

                  {!paid && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-nursery-midnight/50">Your Name</label>
                        <input
                          required
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11 w-full rounded-xl border border-nursery-sage/30 px-4 text-sm outline-none focus:border-nursery-terracotta/50 focus:ring-2 focus:ring-nursery-terracotta/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-nursery-midnight/50">Email</label>
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 w-full rounded-xl border border-nursery-sage/30 px-4 text-sm outline-none focus:border-nursery-terracotta/50 focus:ring-2 focus:ring-nursery-terracotta/20"
                        />
                      </div>
                    </>
                  )}

                  {hasSlots && (
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-nursery-midnight/50">Time Slot</label>
                      <select
                        required
                        value={selectedSlotId}
                        onChange={(e) => setSelectedSlotId(e.target.value)}
                        className="h-11 w-full rounded-xl border border-nursery-sage/30 px-4 text-sm outline-none focus:border-nursery-terracotta/50 focus:ring-2 focus:ring-nursery-terracotta/20"
                      >
                        <option value="" disabled>Select a time</option>
                        {slotsWithAvailability.map((slot) => (
                          <option key={slot.id} value={slot.id} disabled={slot.full}>
                            {slot.label}{slot.slotRemaining !== null ? (slot.full ? ' (Full)' : ` (${slot.slotRemaining} left)`) : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-nursery-midnight/50">Number of Guests</label>
                    <input
                      required
                      type="number"
                      min={1}
                      max={maxGuests}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-nursery-sage/30 px-4 text-sm outline-none focus:border-nursery-terracotta/50 focus:ring-2 focus:ring-nursery-terracotta/20"
                    />
                    {(hasLimit || slotMax !== null) && (
                      <p className="mt-1 text-xs text-nursery-midnight/40">{maxGuests} spot{maxGuests === 1 ? '' : 's'} available</p>
                    )}
                  </div>

                  {addOnsWithAvailability.length > 0 && (
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-nursery-midnight/50">Add-Ons</label>
                      <div className="space-y-2">
                        {addOnsWithAvailability.map((addOn) => {
                          const qty = addOnQuantities[addOn.id] ?? 0;
                          const addOnMax = addOn.addOnRemaining ?? 20;
                          const choices = addOn.options ?? [];
                          const unitPrice = addOnUnitPrice(addOn);
                          return (
                            <div key={addOn.id} className="rounded-xl border border-nursery-sage/20 px-4 py-2.5">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-nursery-midnight">
                                    {addOn.name}
                                    {paid && unitPrice > 0 ? <span className="text-nursery-midnight/50"> (+${unitPrice.toFixed(2)} each)</span> : null}
                                  </p>
                                  {addOn.addOnRemaining !== null && (
                                    <p className="text-xs text-nursery-midnight/40">{addOn.full ? 'Sold out' : `${addOn.addOnRemaining} left`}</p>
                                  )}
                                </div>
                                <input
                                  type="number"
                                  min={0}
                                  max={addOnMax}
                                  disabled={addOn.full}
                                  value={qty}
                                  aria-label={`Quantity for ${addOn.name}`}
                                  onChange={(e) => setAddOnQuantity(addOn.id, Math.max(0, Math.min(addOnMax, Number(e.target.value))))}
                                  className="h-9 w-16 rounded-lg border border-nursery-sage/30 px-2 text-center text-sm outline-none focus:border-nursery-terracotta/50 focus:ring-2 focus:ring-nursery-terracotta/20 disabled:opacity-40"
                                />
                              </div>
                              {choices.length > 0 && (
                                <select
                                  value={addOnOptionIds[addOn.id] ?? ''}
                                  disabled={addOn.full}
                                  aria-label={`${addOn.optionLabel?.trim() || 'Option'} for ${addOn.name}`}
                                  onChange={(e) => setAddOnOption(addOn.id, e.target.value)}
                                  className="mt-2 h-10 w-full rounded-lg border border-nursery-sage/30 px-3 text-sm outline-none focus:border-nursery-terracotta/50 focus:ring-2 focus:ring-nursery-terracotta/20 disabled:opacity-40"
                                >
                                  <option value="" disabled>
                                    Select {addOn.optionLabel?.trim() || 'an option'}
                                  </option>
                                  {choices.map((choice) => (
                                    <option key={choice.id} value={choice.id}>
                                      {choice.label}
                                      {paid && choice.price ? ` (+$${choice.price.toFixed(2)})` : ''}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {paid && (
                    <div className="flex items-center justify-between rounded-xl border border-nursery-sage/20 bg-nursery-sage/5 px-4 py-3 text-sm">
                      <span className="text-nursery-midnight/60">Total</span>
                      <span className="font-semibold text-nursery-midnight">${total.toFixed(2)}</span>
                    </div>
                  )}

                  {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

                  {addedToCart && (
                    <p className="flex items-start gap-2 rounded-xl border border-nursery-sage/30 bg-nursery-sage/10 px-4 py-3 text-sm text-nursery-midnight/70">
                      <ShoppingCart className="mt-0.5 h-4 w-4 shrink-0 text-nursery-sage" />
                      <span>
                        Added to your cart. Keep browsing and check out when you&apos;re ready — or head to checkout now.
                      </span>
                    </p>
                  )}

                  {paid && !addedToCart && (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={submitting}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-nursery-midnight/20 bg-white font-semibold text-nursery-midnight transition-colors hover:border-nursery-terracotta hover:text-nursery-terracotta disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                      Add to Cart &amp; Keep Shopping
                    </button>
                  )}

                  {paid && addedToCart && (
                    <button
                      type="button"
                      onClick={reset}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-nursery-midnight/20 bg-white font-semibold text-nursery-midnight transition-colors hover:border-nursery-terracotta hover:text-nursery-terracotta"
                    >
                      Keep Shopping
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-nursery-terracotta font-semibold text-white transition-colors hover:bg-nursery-terracotta/90 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> {paid ? 'Starting checkout…' : 'Reserving…'}
                      </>
                    ) : paid ? (
                      addedToCart ? 'Go to Checkout' : 'Continue to Checkout'
                    ) : (
                      'Confirm My Spot'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
