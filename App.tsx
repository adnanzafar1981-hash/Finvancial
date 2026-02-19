
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Banknote,
  Save,
  BarChart3,
  Download,
  Upload,
  Calendar,
  Trash2,
  CheckCircle2,
  ArrowRightLeft,
  LineChart,
  ExternalLink,
  PiggyBank,
  Coins,
  Filter,
  Calculator,
  PieChart,
  ChevronRight,
  Plus,
  LayoutDashboard
} from 'lucide-react';
import { ACCOUNTS, INCOME_CATS, ASSETS, createEmptyMonth, SEED_DATA_CSV } from './constants';
import { storageService } from './services/storageService';
import { FinancialState, MonthData, AccountType, AssetType, IncomeCategoryType } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<FinancialState>({
    monthlyData: {},
    globalOpening: { cash: 0, bank1: 0, bank2: 0, bank3: 0, pf: 0, mutualFund: 0, stock: 0, commodities: 0, assetPf: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Income');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize data
  useEffect(() => {
    const loaded = storageService.loadData();
    // If no data, seed it
    if (Object.keys(loaded.monthlyData).length === 0) {
      const seeded = storageService.parseCSV(SEED_DATA_CSV);
      setData(seeded);
      storageService.saveData(seeded);
    } else {
      setData(loaded);
    }
    setLoading(false);
  }, []);

  const saveToStorage = (newState?: FinancialState) => {
    const finalState = newState || data;
    storageService.saveData(finalState);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const getPrevMonthStr = (current: string) => {
    const [y, m] = current.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getOpeningBalances = (month: string) => {
    const prevMonth = getPrevMonthStr(month);
    if (data.monthlyData[prevMonth]) {
      return {
        accounts: data.monthlyData[prevMonth].closing,
        assets: {
          mutualFund: data.monthlyData[prevMonth].investments.mutualFund.closing,
          stock: data.monthlyData[prevMonth].investments.stock.closing,
          commodities: data.monthlyData[prevMonth].investments.commodities.closing,
          pf: data.monthlyData[prevMonth].investments.pf.closing,
        }
      };
    }
    return {
      accounts: { 
        cash: data.globalOpening.cash, 
        bank1: data.globalOpening.bank1, 
        bank2: data.globalOpening.bank2, 
        bank3: data.globalOpening.bank3, 
        pf: data.globalOpening.pf 
      },
      assets: { 
        mutualFund: data.globalOpening.mutualFund, 
        stock: data.globalOpening.stock, 
        commodities: data.globalOpening.commodities, 
        pf: data.globalOpening.assetPf 
      }
    };
  };

  const currentMonthData = data.monthlyData[selectedMonth] || createEmptyMonth();

  const calc = useMemo(() => {
    const { accounts: openingAccs, assets: openingAssets } = getOpeningBalances(selectedMonth);
    const totalOpeningAcc = ACCOUNTS.reduce((sum, acc) => sum + (Number(openingAccs[acc]) || 0), 0);
    
    const totalIncome = INCOME_CATS.reduce((acc, cat) => 
      acc + ACCOUNTS.reduce((sum, account) => sum + (Number(currentMonthData.income[cat][account]) || 0), 0), 0);
    
    const totalClosingAcc = ACCOUNTS.reduce((sum, account) => sum + (Number(currentMonthData.closing[account]) || 0), 0);
    const investOutflow = Number(currentMonthData.investmentOutflow) || 0;
    const expense = (totalOpeningAcc + totalIncome) - investOutflow - totalClosingAcc;
    
    const totalOpeningAsset = ASSETS.reduce((sum, asset) => sum + (Number((openingAssets as any)[asset]) || 0), 0);
    const totalMonthlyInvested = ASSETS.reduce((sum, asset) => sum + (Number(currentMonthData.investments[asset].invested) || 0), 0);
    const totalClosingAsset = ASSETS.reduce((sum, asset) => sum + (Number(currentMonthData.investments[asset].closing) || 0), 0);
    const pnl = totalClosingAsset - (totalOpeningAsset + totalMonthlyInvested);

    return {
      totalOpeningAcc, totalIncome, totalClosingAcc, investOutflow,
      expense: expense > 0 ? expense : 0,
      totalOpeningAsset, totalMonthlyInvested, totalClosingAsset, pnl
    };
  }, [selectedMonth, data, currentMonthData]);

  const handleUpdate = (type: string, cat: any, field: any, val: string) => {
    const numVal = Number(val);
    setData(prev => {
      const newMonthly = { ...prev.monthlyData };
      const monthObj = JSON.parse(JSON.stringify(newMonthly[selectedMonth] || createEmptyMonth()));

      if (type === 'income') monthObj.income[cat][field] = numVal;
      if (type === 'closing') monthObj.closing[field] = numVal;
      if (type === 'invest') monthObj.investments[cat][field] = numVal;
      if (type === 'outflow') monthObj.investmentOutflow = numVal;

      return { ...prev, monthlyData: { ...newMonthly, [selectedMonth]: monthObj } };
    });
  };

  const handleDeleteAll = () => {
    const emptyState: FinancialState = {
      monthlyData: {},
      globalOpening: { cash: 0, bank1: 0, bank2: 0, bank3: 0, pf: 0, mutualFund: 0, stock: 0, commodities: 0, assetPf: 0 }
    };
    setData(emptyState);
    storageService.saveData(emptyState);
    setShowDeleteConfirm(false);
  };

  const exportCSV = () => {
    let csv = "Month,Type,Category,Field,Value\n";
    Object.entries(data.globalOpening).forEach(([k, v]) => csv += `GLOBAL,Opening,Global,${k},${v}\n`);
    Object.entries(data.monthlyData).forEach(([m, mData]) => {
      INCOME_CATS.forEach(c => ACCOUNTS.forEach(a => csv += `${m},Income,${c},${a},${mData.income[c][a]}\n`));
      ACCOUNTS.forEach(a => csv += `${m},Closing,Account,${a},${mData.closing[a]}\n`);
      csv += `${m},Outflow,InvestmentAndPF,Total,${mData.investmentOutflow}\n`;
      ASSETS.forEach(s => {
        csv += `${m},Investment,${s},invested,${mData.investments[s].invested}\n`;
        csv += `${m},Investment,${s},closing,${mData.investments[s].closing}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finvancial_backup_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const imported = storageService.parseCSV(result);
        setData(imported);
        storageService.saveData(imported);
      } catch (err) { console.error(err); }
    };
    reader.readAsText(file);
  };

  const renderDashboard = () => {
    let months = Object.keys(data.monthlyData).sort();
    const isFiltered = filterFrom || filterTo;
    if (!isFiltered) {
        months = months.slice(-6);
    } else {
        if (filterFrom) months = months.filter(m => m >= filterFrom);
        if (filterTo) months = months.filter(m => m <= filterTo);
    }

    const summaryData = months.map(m => {
        const d = data.monthlyData[m] as MonthData;
        const inc = INCOME_CATS.reduce((acc, cat) => acc + ACCOUNTS.reduce((sum, account) => sum + (Number(d.income[cat][account]) || 0), 0), 0);
        const invOutflow = Number(d.investmentOutflow) || 0;
        const { accounts: opAccs, assets: opAssets } = getOpeningBalances(m);
        const totalOpAcc = ACCOUNTS.reduce((sum, acc) => sum + (Number(opAccs[acc]) || 0), 0);
        const totalClAcc = ACCOUNTS.reduce((sum, acc) => sum + (Number(d.closing[acc]) || 0), 0);
        const exp = (totalOpAcc + inc) - invOutflow - totalClAcc;
        const savings = inc - invOutflow - (exp > 0 ? exp : 0);
        const totalOpAsset = ASSETS.reduce((sum, asset) => sum + (Number((opAssets as any)[asset]) || 0), 0);
        const totalClAsset = ASSETS.reduce((sum, asset) => sum + (Number(d.investments[asset].closing) || 0), 0);
        const totalMonthlyInv = ASSETS.reduce((sum, asset) => sum + (Number(d.investments[asset].invested) || 0), 0);
        const pnl = totalClAsset - (totalOpAsset + totalMonthlyInv);
        const totalEarning = invOutflow + savings + pnl;
        const growthPct = totalOpAsset > 0 ? (pnl / totalOpAsset) * 100 : 0;
        
        const totalAssetValue = totalClAcc + totalClAsset;
        const cashWeight = totalAssetValue > 0 ? (totalClAcc / totalAssetValue) * 100 : 0;
        const investWeight = totalAssetValue > 0 ? (totalClAsset / totalAssetValue) * 100 : 0;

        return { 
          m, inc, exp, invOutflow, savings, pnl, totalEarning, growthPct,
          totalClAcc, totalClAsset, totalAssetValue, cashWeight, investWeight
        };
    });

    // Calculate Range Averages
    const rangeAvg = months.length > 0 ? {
        liquidAssets: summaryData.reduce((s, x) => s + x.totalClAcc, 0) / months.length,
        investAssets: summaryData.reduce((s, x) => s + x.totalClAsset, 0) / months.length,
        totalNetAsset: summaryData.reduce((s, x) => s + x.totalAssetValue, 0) / months.length,
        growthPct: summaryData.reduce((s, x) => s + x.growthPct, 0) / months.length,
        pnl: summaryData.reduce((s, x) => s + x.pnl, 0) / months.length,
        totalPnl: summaryData.reduce((s, x) => s + x.pnl, 0),
        cumulativeReturn: summaryData.reduce((s, x) => s + x.growthPct, 0)
    } : null;

    const grandTotals = {
        inc: summaryData.reduce((s, x) => s + x.inc, 0),
        exp: summaryData.reduce((s, x) => s + x.exp, 0),
        inv: summaryData.reduce((s, x) => s + x.invOutflow, 0),
        savings: summaryData.reduce((s, x) => s + x.savings, 0),
        pnl: summaryData.reduce((s, x) => s + x.pnl, 0),
        earning: summaryData.reduce((s, x) => s + x.totalEarning, 0)
    };

    const avg = months.length > 0 ? {
        inc: grandTotals.inc / months.length,
        exp: grandTotals.exp / months.length,
        inv: grandTotals.inv / months.length,
        savings: grandTotals.savings / months.length,
        pnl: grandTotals.pnl / months.length,
        earning: grandTotals.earning / months.length,
        growthPct: summaryData.reduce((s, x) => s + x.growthPct, 0) / months.length
    } : null;

    if (months.length === 0) {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
              <Filter size={16} /> Filter Range:
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">From</span>
              <input type="month" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">To</span>
              <input type="month" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
            </div>
          </div>
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <BarChart3 className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-bold">No data found in your selected months.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-slate-600 font-black text-xs uppercase tracking-wider">
            <Filter size={16} className="text-blue-500" /> Timeline:
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase">From</span>
            <input 
              type="month" 
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20" 
              value={filterFrom} 
              onChange={(e) => setFilterFrom(e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase">To</span>
            <input 
              type="month" 
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20" 
              value={filterTo} 
              onChange={(e) => setFilterTo(e.target.value)} 
            />
          </div>
          {(filterFrom || filterTo) && (
            <button 
              onClick={() => { setFilterFrom(''); setFilterTo(''); }} 
              className="px-4 py-2 text-xs font-black text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors uppercase tracking-tight"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={20} />
            Month-wise Detailed Summary
          </h3>
          <div className="space-y-4">
            {summaryData.map(({ m, inc, exp, invOutflow, savings, pnl, totalEarning }) => (
                <div key={m} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                  <div className="flex flex-wrap justify-between items-center gap-6">
                    <div className="min-w-[100px]">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Timeline</span>
                      <span className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors">{m}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 flex-1">
                      <div>
                        <span className="text-[9px] font-black text-green-500 uppercase block mb-1">Income</span>
                        <span className="text-base font-bold text-slate-700">Rs. {inc.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-orange-500 uppercase block mb-1">Expenses</span>
                        <span className="text-base font-bold text-slate-700">Rs. {exp.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-indigo-500 uppercase block mb-1">Investment</span>
                        <span className="text-base font-bold text-slate-700">Rs. {invOutflow.toLocaleString()}</span>
                      </div>
                      <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <span className="text-[9px] font-black text-emerald-600 uppercase block mb-1 flex items-center gap-1">
                          <PiggyBank size={10} /> Saving
                        </span>
                        <span className={`text-base font-black ${savings >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          Rs. {Math.round(savings).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                        <span className="text-[9px] font-black text-indigo-600 uppercase block mb-1 flex items-center gap-1">
                          <TrendingUp size={10} /> Market P/L
                        </span>
                        <span className={`text-base font-black ${pnl >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
                          Rs. {Math.round(pnl).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg shadow-sm border border-slate-700">
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 flex items-center gap-1">
                          <Coins size={10} className="text-yellow-500" /> Earning
                        </span>
                        <span className="text-base font-black text-white">
                          Rs. {Math.round(totalEarning).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>

          {avg && (
            <div className="space-y-6 mt-6">
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Calculator size={80} className="text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                      <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full">Period Average</span>
                      <span className="text-slate-400 text-xs font-bold">Based on {months.length} month(s)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
                        <div>
                          <span className="text-[9px] font-black text-green-400 uppercase block mb-1">Avg Income</span>
                          <span className="text-lg font-black text-white">Rs. {Math.round(avg.inc).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-orange-400 uppercase block mb-1">Avg Expense</span>
                          <span className="text-lg font-black text-white">Rs. {Math.round(avg.exp).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-indigo-400 uppercase block mb-1">Avg Invest</span>
                          <span className="text-lg font-black text-white">Rs. {Math.round(avg.inv).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-emerald-400 uppercase block mb-1">Avg Saving</span>
                          <span className="text-lg font-black text-emerald-400">Rs. {Math.round(avg.savings).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-indigo-400 uppercase block mb-1">Avg P/L</span>
                          <span className="text-lg font-black text-indigo-400">Rs. {Math.round(avg.pnl).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-yellow-400 uppercase block mb-1">Avg Earning</span>
                          <span className="text-xl font-black text-white">Rs. {Math.round(avg.earning).toLocaleString()}</span>
                        </div>
                  </div>
              </div>

              {/* RESTORED: Period Grand Total Values Section */}
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                      <TrendingUp size={120} className="text-slate-900" />
                  </div>
                  <div className="flex items-center gap-3 mb-8">
                      <span className="px-3 py-1 bg-slate-800 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm">Period Grand Total Values</span>
                      <span className="text-slate-400 text-xs font-bold italic tracking-tight">Cumulative for {months.length} month(s)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 relative z-10">
                        <div>
                          <span className="text-[10px] font-black text-green-600 uppercase block mb-1 tracking-widest">Total Income</span>
                          <span className="text-xl font-black text-slate-800">Rs. {grandTotals.inc.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-orange-600 uppercase block mb-1 tracking-widest">Total Expense</span>
                          <span className="text-xl font-black text-slate-800">Rs. {grandTotals.exp.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-indigo-600 uppercase block mb-1 tracking-widest">Total Invest</span>
                          <span className="text-xl font-black text-slate-800">Rs. {grandTotals.inv.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-emerald-600 uppercase block mb-1 tracking-widest">Total Saving</span>
                          <span className={`text-xl font-black ${grandTotals.savings >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            Rs. {grandTotals.savings.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-indigo-600 uppercase block mb-1 tracking-widest">Total P/L</span>
                          <span className={`text-xl font-black ${grandTotals.pnl >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
                            Rs. {grandTotals.pnl.toLocaleString()}
                          </span>
                        </div>
                        <div className="lg:col-span-1 xl:col-start-6">
                          <span className="text-[10px] font-black text-blue-700 uppercase block mb-1 tracking-widest">Grand Total Earning</span>
                          <span className="text-3xl font-black text-slate-900 tabular-nums border-b-4 border-blue-500 pb-1 inline-block">
                            Rs. {grandTotals.earning.toLocaleString()}
                          </span>
                        </div>
                  </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="text-emerald-500" size={20} />
              Asset Composition & Allocation
            </h3>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full">Month-wise Asset Breakdown</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Month</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Liquid Assets (Cash/Bank/PF)</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Weight %</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Investment Assets (MF/Stocks/etc)</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Weight %</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Total Net Asset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summaryData.map(({ m, totalClAcc, totalClAsset, totalAssetValue, cashWeight, investWeight }) => (
                  <tr key={m} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-black text-slate-800 text-sm">{m}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-600">Rs. {totalClAcc.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                        {cashWeight.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-600">Rs. {totalClAsset.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100">
                        {investWeight.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">Rs. {totalAssetValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              {rangeAvg && (
                <tfoot>
                  <tr className="bg-slate-900 text-white font-black overflow-hidden border-t-4 border-slate-800">
                    <td className="py-5 px-4 text-[11px] uppercase tracking-widest rounded-bl-xl">Range Avg</td>
                    <td className="py-5 px-4 text-sm">Rs. {Math.round(rangeAvg.liquidAssets).toLocaleString()}</td>
                    <td className="py-5 px-4 text-center text-blue-400 text-[11px]">
                      {((rangeAvg.liquidAssets / rangeAvg.totalNetAsset) * 100).toFixed(1)}%
                    </td>
                    <td className="py-5 px-4 text-sm">Rs. {Math.round(rangeAvg.investAssets).toLocaleString()}</td>
                    <td className="py-5 px-4 text-center text-indigo-400 text-[11px]">
                      {((rangeAvg.investAssets / rangeAvg.totalNetAsset) * 100).toFixed(1)}%
                    </td>
                    <td className="py-5 px-4 text-right text-emerald-400 text-base rounded-br-xl">Rs. {Math.round(rangeAvg.totalNetAsset).toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <LineChart className="text-indigo-500" size={20} />
            Growth Trends
          </h3>
          <div className="space-y-6">
            {summaryData.map(({ m, growthPct, pnl }) => (
                 <div key={m} className="space-y-2">
                   <div className="flex justify-between items-end">
                     <span className="text-xs font-black text-slate-400">{m}</span>
                     <span className={`text-xs font-black ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {pnl >= 0 ? '+' : ''}{growthPct.toFixed(1)}% (Rs. {Math.round(pnl).toLocaleString()})
                     </span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full transition-all duration-1000 ${pnl >= 0 ? 'bg-green-500' : 'bg-red-400'}`} 
                       style={{ width: `${Math.min(Math.max(Math.abs(growthPct) * 5, 2), 100)}%` }}
                     />
                   </div>
                 </div>
            ))}
          </div>

          {rangeAvg && (
            <div className="mt-10 space-y-4">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm flex justify-between items-center transition-all hover:bg-white hover:border-blue-200">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                      <TrendingUp size={20} />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Overall Average Growth</h4>
                      <p className="text-xs font-bold text-slate-400">Selected Period</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-black text-emerald-500">+{rangeAvg.growthPct.toFixed(2)}%</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase">Avg Rs. {Math.round(rangeAvg.pnl).toLocaleString()}/MO</div>
                </div>
              </div>

              <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl flex justify-between items-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <LayoutDashboard size={80} />
                 </div>
                 <div className="flex items-center gap-4 relative z-10">
                   <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                      <BarChart3 size={20} />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Overall Total Growth</h4>
                      <p className="text-xs font-bold text-slate-400">Total Cumulative Return %</p>
                   </div>
                </div>
                <div className="text-right relative z-10">
                   <div className="text-3xl font-black text-white">{rangeAvg.cumulativeReturn.toFixed(2)}%</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase">Net Value: Rs. {Math.round(rangeAvg.totalPnl).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse text-blue-600 font-bold">Initializing Tracker...</div></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-100">
      {showSaveMessage && (
        <div className="fixed top-20 right-8 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-right">
          <CheckCircle2 className="text-green-500" size={20} />
          <span className="text-sm font-bold">Data Saved to Device</span>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-black">Wipe All Data?</h3>
            <p className="text-slate-500 text-sm mb-6">This will permanently delete your records from this device.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleDeleteAll} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-800">Finvancial</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-inner">
              <Calendar size={18} className="text-slate-400 ml-1" />
              <input 
                type="month" 
                className="bg-transparent border-none text-sm font-black text-slate-700 outline-none focus:ring-0" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
              />
            </div>
            
            <button 
              onClick={exportCSV} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-[10px] font-black uppercase transition-all shadow-sm active:scale-95"
            >
              <Download size={16} /> Export
            </button>
            
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-[10px] font-black uppercase transition-all shadow-sm active:scale-95"
            >
              <Upload size={16} /> Import
            </button>
            
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl text-red-600 text-[10px] font-black uppercase transition-all active:scale-95"
            >
              <Trash2 size={16} /> Wipe
            </button>

            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={importCSV} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-2">Opening Balance</span>
            <div className="text-2xl font-black text-slate-800 tabular-nums">Rs. {calc.totalOpeningAcc.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-green-500 transition-all hover:shadow-md">
            <span className="text-green-500 text-[10px] font-black uppercase tracking-widest block mb-2">Income</span>
            <div className="text-2xl font-black text-slate-800 tabular-nums">Rs. {calc.totalIncome.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-400 transition-all hover:shadow-md">
            <span className="text-indigo-500 text-[10px] font-black uppercase tracking-widest block mb-2">Invest/PF Out</span>
            <div className="text-2xl font-black text-slate-800 tabular-nums">Rs. {calc.investOutflow.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500 transition-all hover:shadow-md">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest block mb-2">Closing Balance</span>
            <div className="text-2xl font-black text-slate-800 tabular-nums">Rs. {calc.totalClosingAcc.toLocaleString()}</div>
          </div>
          <div className="bg-orange-600 p-6 rounded-3xl shadow-xl shadow-orange-100 transition-all hover:scale-[1.02]">
            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest block mb-2">Expenses</span>
            <div className="text-2xl font-black text-white tabular-nums">Rs. {calc.expense.toLocaleString()}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-2xl w-fit mb-8 overflow-x-auto max-w-full no-scrollbar sticky top-24 z-30 backdrop-blur-md">
          {['Income', 'Investment', 'Dashboard', 'Global Setup'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab === 'Dashboard' && renderDashboard()}
          
          {activeTab === 'Income' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Banknote size={20} /></div>
                    Income Entries (Rs.)
                  </h3>
                  <button onClick={() => saveToStorage()} className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95">
                    <Save size={18} /> Save Progress
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {INCOME_CATS.map((cat) => (
                    <div key={cat} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{cat}</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {ACCOUNTS.map((acc) => (
                          <div key={acc} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                              <ChevronRight size={10} className="text-blue-500" /> {acc}
                            </label>
                            <input 
                              type="number" 
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                              value={currentMonthData.income[cat][acc] || ''} 
                              onChange={(e) => handleUpdate('income', cat, acc, e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet size={20} /></div>
                  End-of-Month Account Balances (Rs.)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {ACCOUNTS.map((acc) => (
                    <div key={acc} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{acc}</label>
                      <input 
                        type="number" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                        value={currentMonthData.closing[acc] || ''} 
                        onChange={(e) => handleUpdate('closing', null, acc, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Investment' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><ArrowRightLeft size={20} /></div>
                    Monthly Asset Outflows (Rs.)
                  </h3>
                  <button onClick={() => saveToStorage()} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                    <Save size={18} /> Save Progress
                  </button>
                </div>
                <div className="max-w-md space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Investment & PF Contribution This Month</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg font-black text-indigo-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all" 
                    value={currentMonthData.investmentOutflow || ''} 
                    onChange={(e) => handleUpdate('outflow', null, null, e.target.value)}
                    placeholder="Enter total outflow..."
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic font-medium">This amount is subtracted from liquid accounts and added to expenses if not matched with closing balances.</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ExternalLink size={20} /></div>
                  Current Market Valuation (Rs.)
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {ASSETS.map((asset) => (
                    <div key={asset} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-8 items-start md:items-center">
                      <div className="min-w-[150px]">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{asset}</h4>
                        <div className="text-[10px] font-bold text-slate-400 mt-1">Portfolio Component</div>
                      </div>
                      <div className="grid grid-cols-2 gap-8 flex-1 w-full">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">New Funds Added</label>
                          <input 
                            type="number" 
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none" 
                            value={currentMonthData.investments[asset].invested || ''} 
                            onChange={(e) => handleUpdate('invest', asset, 'invested', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Total Market Value</label>
                          <input 
                            type="number" 
                            className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm font-black text-indigo-700 focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm" 
                            value={currentMonthData.investments[asset].closing || ''} 
                            onChange={(e) => handleUpdate('invest', asset, 'closing', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Global Setup' && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Calculator size={20} /></div>
                    Base Opening Setup
                  </h3>
                  <button 
                    onClick={() => saveToStorage()} 
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-black transition-all active:scale-95"
                  >
                    <Save size={18} /> Set Base
                  </button>
                </div>
                <div className="p-4 bg-blue-50/50 text-blue-700 rounded-2xl text-xs font-bold mb-8 border border-blue-100">
                  <p>Important: These values serve as the "starting point" for your tracking. They are only utilized if there is no record for the preceding month.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {Object.keys(data.globalOpening).map((key) => (
                    <div key={key} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{key}</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700 focus:ring-4 focus:ring-slate-100 outline-none" 
                        value={data.globalOpening[key as keyof typeof data.globalOpening]} 
                        onChange={(e) => setData(prev => ({ ...prev, globalOpening: { ...prev.globalOpening, [key]: Number(e.target.value) } }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center">
                 <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4 text-slate-400"><Plus size={32} /></div>
                 <h4 className="font-black text-slate-800 mb-2">Advanced Configuration</h4>
                 <p className="text-sm text-slate-500 max-w-sm mx-auto">Future updates will allow custom accounts and categories. Currently using standard Bank/Cash/PF structure.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
