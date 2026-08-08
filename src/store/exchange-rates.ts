export interface ExchangeRates {
  KRW: number; // USD to KRW rate (e.g., 1385)
  KZT: number; // USD to KZT rate (e.g., 475)
  updatedAt: number;
}

let cachedRates: ExchangeRates | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // Cache for 30 minutes

export async function fetchExchangeRates(): Promise<{ KRW: number; KZT: number; updatedAt: number }> {
  const now = Date.now();
  if (cachedRates && now - cachedRates.updatedAt < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        const krw = Math.round(data.rates.KRW || 1380);
        const kzt = Math.round(data.rates.KZT || 475);
        cachedRates = { KRW: krw, KZT: kzt, updatedAt: now };
        return cachedRates;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch live exchange rates from API, using fallback rates:", err);
  }

  // Fallback defaults if offline
  return { KRW: 1380, KZT: 475, updatedAt: now };
}

export function convertAndFormatCurrency(
  usdPrice: number,
  rate: number,
  symbol: string,
  currencyCode: string
): { raw: number; formatted: string } {
  const convertedInt = Math.round(usdPrice * rate); // Rounded to whole integer without decimals
  const formatted = `${symbol} ${convertedInt.toLocaleString("en-US")} ${currencyCode}`;
  return { raw: convertedInt, formatted };
}
