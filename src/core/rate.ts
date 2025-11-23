export const MIN_RATE = 0.5;
export const MAX_RATE = 2.0;
export const RATE_STEP = 0.25;

export function clampRate(value: string | number): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  if (Number.isNaN(parsed)) return 1.0;

  const bounded = Math.min(Math.max(parsed, MIN_RATE), MAX_RATE);
  const steps = Math.round((bounded - MIN_RATE) / RATE_STEP);
  const rounded = MIN_RATE + steps * RATE_STEP;

  return Number.parseFloat(rounded.toFixed(2));
}

export function formatRateLabel(value: string | number): string {
  const normalized = clampRate(value);
  const twoDecimals = normalized.toFixed(2).replace(/0$/, '');
  const base = normalized % 1 === 0 ? normalized.toFixed(1) : twoDecimals;
  return `${base}x`;
}
