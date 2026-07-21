let cachedCurrency = "RWF";

export const setCurrency = (currency: string) => {
  cachedCurrency = currency;
};

export const formatPrice = (price: number, currency?: string) => {
  const cur = currency || cachedCurrency;
  const hasDecimals = price % 1 !== 0;

  // Map currency codes to locale
  const localeMap: Record<string, string> = {
    RWF: "en-RW",
    USD: "en-US",
    EUR: "en-EU",
    GBP: "en-GB",
    KES: "en-KE",
    UGX: "en-UG",
    TZS: "en-TZ",
  };

  try {
    const formatted = new Intl.NumberFormat(localeMap[cur] || "en-US", {
      style: "currency",
      currency: cur,
      currencyDisplay: "code",
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(price);
    // Ensure a clean "CODE 1,234" layout (e.g. "RWF 5,000")
    return formatted;
  } catch {
    return `${cur} ${price.toLocaleString()}`;
  }
};