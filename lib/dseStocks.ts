export type DseStock = {
  symbol: string;
  name: string;
};

import { DSE_COMPANY_NAMES } from './dseCompanyNames';

const ALL_DSE_STOCKS: DseStock[] = Object.entries(DSE_COMPANY_NAMES)
  .map(([symbol, name]) => ({
    symbol,
    name,
  }))
  .sort((a, b) => a.symbol.localeCompare(b.symbol));

export async function getAllDseStocks(): Promise<DseStock[]> {
  // Simulate an async DB or API request backed by local roster data.
  return Promise.resolve(ALL_DSE_STOCKS);
}
