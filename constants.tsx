
import { AccountType, IncomeCategoryType, AssetType, MonthData, GlobalOpening } from './types';

export const ACCOUNTS: AccountType[] = ['cash', 'bank1', 'bank2', 'bank3', 'pf'];
export const INCOME_CATS: IncomeCategoryType[] = ['salary', 'bonus', 'other'];
export const ASSETS: AssetType[] = ['mutualFund', 'stock', 'commodities', 'pf'];

export const EMPTY_INCOME_ENTRY: any = { cash: 0, bank1: 0, bank2: 0, bank3: 0, pf: 0 };
export const EMPTY_INVESTMENT_ENTRY: any = { invested: 0, closing: 0 };

export const createEmptyMonth = (): MonthData => ({
  income: {
    salary: { ...EMPTY_INCOME_ENTRY },
    bonus: { ...EMPTY_INCOME_ENTRY },
    other: { ...EMPTY_INCOME_ENTRY }
  },
  closing: { ...EMPTY_INCOME_ENTRY },
  investments: {
    mutualFund: { ...EMPTY_INVESTMENT_ENTRY },
    stock: { ...EMPTY_INVESTMENT_ENTRY },
    commodities: { ...EMPTY_INVESTMENT_ENTRY },
    pf: { ...EMPTY_INVESTMENT_ENTRY }
  },
  investmentOutflow: 0
});

export const INITIAL_GLOBAL_OPENING: GlobalOpening = {
  commodities: 358600,
  bank2: 20440,
  cash: 687195,
  pf: 0,
  bank3: 0,
  bank1: 27670,
  stock: 313000,
  assetPf: 1292256,
  mutualFund: 1017014
};

// Seed data from the user's CSV
export const SEED_DATA_CSV = `
Month,Type,Category,Field,Value
GLOBAL,Opening,Global,commodities,358600
GLOBAL,Opening,Global,bank2,20440
GLOBAL,Opening,Global,cash,687195
GLOBAL,Opening,Global,pf,0
GLOBAL,Opening,Global,bank3,0
GLOBAL,Opening,Global,bank1,27670
GLOBAL,Opening,Global,stock,313000
GLOBAL,Opening,Global,assetPf,1292256
GLOBAL,Opening,Global,mutualFund,1017014
2025-10,Income,salary,cash,394000
2025-10,Income,salary,bank1,310436
2025-10,Income,salary,bank2,0
2025-10,Income,salary,bank3,0
2025-10,Income,salary,pf,60934
2025-10,Income,other,bank1,3614
2025-10,Closing,Account,cash,88500
2025-10,Closing,Account,bank1,103193
2025-10,Closing,Account,bank2,11852
2025-10,Outflow,InvestmentAndPF,Total,210934
2025-10,Investment,mutualFund,invested,50000
2025-10,Investment,mutualFund,closing,1404597
2025-10,Investment,stock,invested,100000
2025-10,Investment,stock,closing,555328
2025-10,Investment,commodities,closing,425000
2025-10,Investment,pf,invested,60934
2025-10,Investment,pf,closing,1687880
2026-01,Income,salary,cash,394000
2026-01,Income,salary,bank1,337116
2026-01,Income,salary,bank3,180893
2026-01,Income,salary,pf,72041
2026-01,Income,other,bank1,761
2026-01,Closing,Account,cash,26000
2026-01,Closing,Account,bank1,110000
2026-01,Closing,Account,bank2,14161
2026-01,Closing,Account,bank3,266196
2026-01,Outflow,InvestmentAndPF,Total,286041
2026-01,Investment,mutualFund,invested,50000
2026-01,Investment,mutualFund,closing,1642829
2026-01,Investment,stock,invested,164000
2026-01,Investment,stock,closing,973252
2026-01,Investment,commodities,closing,548000
2026-01,Investment,pf,invested,72041
2026-01,Investment,pf,closing,2163437
2025-09,Income,salary,cash,394000
2025-09,Income,salary,bank1,363896
2025-09,Income,salary,pf,60934
2025-09,Income,other,bank1,4284
2025-09,Closing,Account,cash,154195
2025-09,Closing,Account,bank1,84779
2025-09,Closing,Account,bank2,21522
2025-09,Outflow,InvestmentAndPF,Total,110934
2025-09,Investment,mutualFund,invested,20000
2025-09,Investment,mutualFund,closing,1385560
2025-09,Investment,stock,invested,30000
2025-09,Investment,stock,closing,461242
2025-09,Investment,commodities,closing,401500
2025-09,Investment,pf,invested,60934
2025-09,Investment,pf,closing,1554570
2025-11,Income,salary,cash,594000
2025-11,Income,salary,bank1,337166
2025-11,Income,salary,pf,60934
2025-11,Income,other,bank1,4526
2025-11,Closing,Account,cash,33000
2025-11,Closing,Account,bank1,103409
2025-11,Closing,Account,bank2,10511
2025-11,Outflow,InvestmentAndPF,Total,160934
2025-11,Investment,mutualFund,closing,1431464
2025-11,Investment,stock,invested,100000
2025-11,Investment,stock,closing,674127
2025-11,Investment,commodities,closing,449000
2025-11,Investment,pf,invested,72041
2025-11,Investment,pf,closing,1847285
2025-08,Income,salary,cash,394000
2025-08,Income,salary,bank1,363896
2025-08,Income,salary,pf,60934
2025-08,Income,other,cash,656667
2025-08,Income,other,bank1,1289
2025-08,Closing,Account,cash,166695
2025-08,Closing,Account,bank1,282677
2025-08,Closing,Account,bank2,26649
2025-08,Outflow,InvestmentAndPF,Total,361399
2025-08,Investment,mutualFund,invested,250465
2025-08,Investment,mutualFund,closing,1297624
2025-08,Investment,stock,invested,50000
2025-08,Investment,stock,closing,385807
2025-08,Investment,commodities,closing,364000
2025-08,Investment,pf,invested,60934
2025-08,Investment,pf,closing,1424033
2025-12,Income,salary,cash,394000
2025-12,Income,salary,bank1,337116
2025-12,Income,salary,bank3,188893
2025-12,Income,salary,pf,72041
2025-12,Closing,Account,cash,73500
2025-12,Closing,Account,bank1,67627
2025-12,Closing,Account,bank2,18761
2025-12,Closing,Account,bank3,136981
2025-12,Outflow,InvestmentAndPF,Total,231051
2025-12,Investment,mutualFund,invested,100000
2025-12,Investment,mutualFund,closing,1561003
2025-12,Investment,stock,invested,59010
2025-12,Investment,stock,closing,757054
2025-12,Investment,commodities,closing,463000
2025-12,Investment,pf,invested,72041
2025-12,Investment,pf,closing,2004290
`;
