// Sale prices stay a plain number in the database. The gallery's appearance
// setting decides which currency is written in front of that number.
export const CURRENCIES = [
  { key: 'ksh', label: 'Kenyan shilling (KSh)', prefix: 'KSh', spaced: true },
  { key: 'usd', label: 'US dollar ($)', prefix: '$', spaced: false },
  { key: 'eur', label: 'Euro (€)', prefix: '€', spaced: false },
  { key: 'gbp', label: 'British pound (£)', prefix: '£', spaced: false },
  { key: 'ugx', label: 'Ugandan shilling (USh)', prefix: 'USh', spaced: true },
  { key: 'tzs', label: 'Tanzanian shilling (TSh)', prefix: 'TSh', spaced: true },
  { key: 'rwf', label: 'Rwandan franc (RWF)', prefix: 'RWF', spaced: true },
  { key: 'zar', label: 'South African rand (R)', prefix: 'R', spaced: true },
  { key: 'ngn', label: 'Nigerian naira (₦)', prefix: '₦', spaced: false },
  { key: 'aed', label: 'UAE dirham (AED)', prefix: 'AED', spaced: true },
  { key: 'inr', label: 'Indian rupee (₹)', prefix: '₹', spaced: false },
];

const BY_KEY = Object.fromEntries(CURRENCIES.map((currency) => [currency.key, currency]));

export const currencyByKey = (key) => BY_KEY[key] || BY_KEY.ksh;

export function priceFieldLabel(currency) {
  return `Sale price (${currencyByKey(currency).prefix})`;
}

// A sale price with two decimal places and thousands separators.
// Returns null when the artwork has no listed price.
export function formatPrice(value, currency = 'ksh') {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const amount = number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const spec = currencyByKey(currency);
  return spec.spaced ? `${spec.prefix} ${amount}` : `${spec.prefix}${amount}`;
}
