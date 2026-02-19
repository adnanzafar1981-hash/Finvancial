
import { FinancialState, MonthData, GlobalOpening } from '../types';
import { INITIAL_GLOBAL_OPENING, createEmptyMonth } from '../constants';

const STORAGE_KEY = 'finvancial_data';

export const storageService = {
  saveData: (state: FinancialState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  loadData: (): FinancialState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        monthlyData: {},
        globalOpening: INITIAL_GLOBAL_OPENING
      };
    }
    return JSON.parse(saved);
  },

  parseCSV: (csv: string): FinancialState => {
    const lines = csv.split('\n').slice(1);
    const newMonthly: Record<string, MonthData> = {};
    const newGlobal: GlobalOpening = { ...INITIAL_GLOBAL_OPENING };

    lines.forEach(line => {
      if (!line.trim()) return;
      const [m, type, cat, field, val] = line.split(',');
      const numVal = Number(val) || 0;

      if (m === 'GLOBAL') {
        (newGlobal as any)[field] = numVal;
        return;
      }

      if (!newMonthly[m]) {
        newMonthly[m] = createEmptyMonth();
      }

      const month = newMonthly[m];
      if (type === 'Income') (month.income as any)[cat.toLowerCase()][field.toLowerCase()] = numVal;
      if (type === 'Closing') (month.closing as any)[field.toLowerCase()] = numVal;
      if (type === 'Investment') (month.investments as any)[cat][field.toLowerCase()] = numVal;
      if (type === 'Outflow') month.investmentOutflow = numVal;
    });

    return {
      monthlyData: newMonthly,
      globalOpening: newGlobal
    };
  }
};
