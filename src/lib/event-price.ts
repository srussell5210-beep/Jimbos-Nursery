// event.price stays the existing free-text display field ("Free", "$45",
// "$85/person"). Ecwid needs a number, so we pull the first number out of it.
// Anything unparseable (including "Free") is treated as a free event.
//
// No server-only dependencies — safe to import from client components too.

export function parseEventPrice(priceText: string | undefined | null): number | null {
  if (!priceText) return null;
  const match = priceText.replace(/,/g, '').match(/\d+(\.\d+)?/);
  if (!match) return null;
  const value = parseFloat(match[0]);
  return Number.isFinite(value) && value > 0 ? value : null;
}
