
export type AccountType = 'cash' | 'bank1' | 'bank2' | 'bank3' | 'pf';
export type IncomeCategoryType = 'salary' | 'bonus' | 'other';
export type AssetType = 'mutualFund' | 'stock' | 'commodities' | 'pf';

export interface IncomeEntry {
  cash: number;
  bank1: number;
  bank2: number;
  bank3: number;
  pf: number;
}

export interface InvestmentEntry {
  invested: number;
  closing: number;
}

export interface MonthData {
  income: Record<IncomeCategoryType, IncomeEntry>;
  closing: IncomeEntry;
  investments: Record<AssetType, InvestmentEntry>;
  investmentOutflow: number;
}

export interface GlobalOpening {
  cash: number;
  bank1: number;
  bank2: number;
  bank3: number;
  pf: number;
  mutualFund: number;
  stock: number;
  commodities: number;
  assetPf: number;
}

export interface FinancialState {
  monthlyData: Record<string, MonthData>;
  globalOpening: GlobalOpening;
}
