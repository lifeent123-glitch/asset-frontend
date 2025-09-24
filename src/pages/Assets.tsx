import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ChevronDown, ChevronUp, Download, Filter, Search, 
  TrendingUp, TrendingDown, DollarSign, Info, 
  Eye, EyeOff, HelpCircle, ArrowUpRight, ArrowDownRight,
  FileText, Calendar, RefreshCw, Settings, X, Plus,
  AlertCircle, CheckCircle, Clock, FileSpreadsheet
} from 'lucide-react';

// 為替レート（月別平均レート）
const MONTHLY_EXCHANGE_RATES = {
  '2025-01': { USD: 148.5, AED: 40.4, NTD: 4.68, EUR: 161.2 },
  '2025-02': { USD: 149.2, AED: 40.6, NTD: 4.70, EUR: 162.1 },
  '2025-03': { USD: 150.1, AED: 40.8, NTD: 4.72, EUR: 163.0 },
  '2025-04': { USD: 151.3, AED: 41.2, NTD: 4.75, EUR: 164.2 },
  '2025-05': { USD: 150.8, AED: 41.0, NTD: 4.73, EUR: 163.8 },
  '2025-06': { USD: 150.5, AED: 40.9, NTD: 4.71, EUR: 163.5 },
  '2025-07': { USD: 151.0, AED: 41.1, NTD: 4.74, EUR: 164.0 },
};

// カテゴリ色定義
const CATEGORY_COLORS = {
  '現金': 'bg-green-100 text-green-800 border-green-300',
  '銀行口座': 'bg-blue-100 text-blue-800 border-blue-300',
  '仮想通貨': 'bg-purple-100 text-purple-800 border-purple-300',
  '社債': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  '不動産': 'bg-red-100 text-red-800 border-red-300',
  '定期預金': 'bg-orange-100 text-orange-800 border-orange-300',
  '株式': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  '事業投資': 'bg-pink-100 text-pink-800 border-pink-300'
};

// モックデータ生成
const generateMockAssets = () => {
  const assets = [
    // 法人資産
    { id: 1, section: '法人資産', category: '現金', name: '大阪トランク（紙袋＆トランク）', currency: 'JPY', balance: 1500000, prevBalance: 1200000, manager: 'T', remarks: '確認待ち' },
    { id: 2, section: '法人資産', category: '現金', name: 'ドバイ現金', currency: 'AED', balance: 45000, prevBalance: 42000, manager: 'B' },
    { id: 3, section: '法人資産', category: '銀行口座', name: 'ADCB(個)法人預金口座', currency: 'AED', balance: 3269856.55, prevBalance: 3200000, manager: 'B', accountNo: '13162288920001' },
    { id: 4, section: '法人資産', category: '仮想通貨', name: 'コールドウォレット Ledger ERC', currency: 'USDT', balance: 1000000, prevBalance: 950000, manager: 'B', chain: 'Ethereum' },
    
    // 個人資産
    { id: 5, section: '個人資産', category: '現金', name: '富山トランク', currency: 'JPY', balance: 300000000, prevBalance: 295000000, manager: '富山', remarks: '金庫保管' },
    { id: 6, section: '個人資産', category: '現金', name: '大阪トランク', currency: 'JPY', balance: 49000000, prevBalance: 48500000, manager: '大阪' },
    { id: 7, section: '個人資産', category: '銀行口座', name: 'Mashreq個人預金口座(AED)', currency: 'AED', balance: 225436.79, prevBalance: 220000, manager: 'B', accountNo: '019101192805' },
    { id: 8, section: '個人資産', category: '仮想通貨', name: 'コールドウォレット Ledger TRC', currency: 'USDT', balance: 471304.9, prevBalance: 470000, manager: 'B', chain: 'Tron' },
    
    // 法人投資
    { id: 9, section: '法人投資', category: '社債', name: 'CITIバンク Nomura社債', currency: 'USD', balance: 201220, prevBalance: 200000, manager: 'AK' },
    { id: 10, section: '法人投資', category: '不動産', name: '不動産投資 Il primo', currency: 'AED', balance: 174470, prevBalance: 170000, manager: 'AK' },
    { id: 11, section: '法人投資', category: '株式', name: 'HK50インデックス', currency: 'USD', balance: 350396, prevBalance: 348000, manager: 'AK' },
    
    // 個人投資
    { id: 12, section: '個人投資', category: '社債', name: 'Mashreqバンク個人 HSBC社債', currency: 'USD', balance: 718180.40, prevBalance: 715000, manager: 'AK' },
    { id: 13, section: '個人投資', category: '定期預金', name: 'カンボジアバンク定期預金', currency: 'USD', balance: 150000, prevBalance: 150000, manager: 'B', remarks: '2026.4.5満期' },
    { id: 14, section: '個人投資', category: '事業投資', name: '和牛エンペラー投資', currency: 'NTD', balance: 20000000, prevBalance: 20000000, manager: 'T' },
  ];
  
  return assets;
};

// 取引明細モックデータ
const generateTransactionDetails = (assetId) => {
  // 取引明細モックデータ
  const sources = ['手入力', 'PDF取込', 'CSV取込'];
  const types = ['入金', '出金', '振替', '配当', '利息'];
  
  return Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
    id: `${assetId}-tx-${i}`,
    date: `2025/07/${Math.floor(Math.random() * 28) + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.floor(Math.random() * 1000000) + 10000,
    description: `取引詳細 ${i + 1}`,
    source: sources[Math.floor(Math.random() * sources.length)],
    sourceFile: Math.random() > 0.5 ? 'bank_statement_202507.pdf' : null
  }));
};

const AssetManagementPage = () => {
  const [assets, setAssets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [showAmounts, setShowAmounts] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showManualAdjustment, setShowManualAdjustment] = useState(false);
  const [manualAdjustments, setManualAdjustments] = useState({});
  const [currencyDisplay, setCurrencyDisplay] = useState('both'); // 'jpy', 'usd', 'both'

  // 初期データロード
  useEffect(() => {
    setAssets(generateMockAssets());
  }, []);

  // 前月の計算
  const getPreviousMonth = (month) => {
    const date = new Date(month + '-01');
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  };

  const previousMonth = getPreviousMonth(selectedMonth);

  // 為替レート取得
  const getExchangeRate = useCallback((currency, month) => {
    if (currency === 'JPY') return 1;
    const rates = MONTHLY_EXCHANGE_RATES[month] || MONTHLY_EXCHANGE_RATES['2025-07'];
    if (currency === 'USDT' || currency === 'USDC') return rates.USD;
    return rates[currency] || rates.USD;
  }, []);

  // 通貨換算
  const convertToJPY = useCallback((amount, currency, month = selectedMonth) => {
    const rate = getExchangeRate(currency, month);
    return amount * rate;
  }, [getExchangeRate, selectedMonth]);

  const convertToUSD = useCallback((amount, currency, month = selectedMonth) => {
    const jpy = convertToJPY(amount, currency, month);
    const usdRate = getExchangeRate('USD', month);
    return jpy / usdRate;
  }, [convertToJPY, getExchangeRate, selectedMonth]);

  // フィルタリング
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = searchTerm === '' || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection = filterSection === 'all' || asset.section === filterSection;
      const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
      const matchesCurrency = filterCurrency === 'all' || asset.currency === filterCurrency;
      
      return matchesSearch && matchesSection && matchesCategory && matchesCurrency;
    });
  }, [assets, searchTerm, filterSection, filterCategory, filterCurrency]);

  // ソート
  const sortedAssets = useMemo(() => {
    if (!sortConfig.key) return filteredAssets;
    
    return [...filteredAssets].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'change') {
        aValue = a.balance - a.prevBalance;
        bValue = b.balance - b.prevBalance;
      } else if (sortConfig.key === 'changeRate') {
        aValue = ((a.balance - a.prevBalance) / a.prevBalance) * 100;
        bValue = ((b.balance - b.prevBalance) / b.prevBalance) * 100;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAssets, sortConfig]);

  // セクション別グループ化
  const groupedAssets = useMemo(() => {
    const groups = {
      '法人資産': [],
      '個人資産': [],
      '法人投資': [],
      '個人投資': []
    };
    
    sortedAssets.forEach(asset => {
      if (groups[asset.section]) {
        groups[asset.section].push(asset);
      }
    });
    
    return groups;
  }, [sortedAssets]);

  // 集計計算
  const calculateSummary = useCallback(() => {
    const summary = {
      sections: {},
      total: { 
        balance: 0, 
        prevBalance: 0, 
        balanceJPY: 0, 
        prevBalanceJPY: 0, 
        balanceUSD: 0, 
        prevBalanceUSD: 0 
      }
    };

    Object.entries(groupedAssets).forEach(([section, assets]) => {
      const sectionSummary = {
        balance: 0,
        prevBalance: 0,
        balanceJPY: 0,
        prevBalanceJPY: 0,
        balanceUSD: 0,
        prevBalanceUSD: 0
      };

      assets.forEach(asset => {
        const adjustedBalance = asset.balance + (manualAdjustments[asset.id]?.balance || 0);
        const adjustedPrevBalance = asset.prevBalance + (manualAdjustments[asset.id]?.prevBalance || 0);
        
        sectionSummary.balanceJPY += convertToJPY(adjustedBalance, asset.currency);
        sectionSummary.prevBalanceJPY += convertToJPY(adjustedPrevBalance, asset.currency, previousMonth);
        sectionSummary.balanceUSD += convertToUSD(adjustedBalance, asset.currency);
        sectionSummary.prevBalanceUSD += convertToUSD(adjustedPrevBalance, asset.currency, previousMonth);
      });

      summary.sections[section] = sectionSummary;
      summary.total.balanceJPY += sectionSummary.balanceJPY;
      summary.total.prevBalanceJPY += sectionSummary.prevBalanceJPY;
      summary.total.balanceUSD += sectionSummary.balanceUSD;
      summary.total.prevBalanceUSD += sectionSummary.prevBalanceUSD;
    });

    return summary;
  }, [groupedAssets, manualAdjustments, convertToJPY, convertToUSD, previousMonth]);

  const summary = calculateSummary();

  // 行展開トグル
  const toggleRowExpansion = (assetId) => {
    setExpandedRows(prev => ({
      ...prev,
      [assetId]: !prev[assetId]
    }));
  };

  // ソート処理
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 手動補正値の更新
  const updateManualAdjustment = (assetId, field, value) => {
    setManualAdjustments(prev => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  // エクスポート処理
  const handleExport = (format) => {
    console.log(`Exporting data in ${format} format...`);
    alert(`${format}形式でのエクスポートを開始しました`);
  };

  // 金額フォーマット
  const formatAmount = (amount, options = {}) => {
    const { currency = 'JPY', hideAmount = false } = options;
    
    if (hideAmount) return '***,***';
    
    if (currency === 'JPY') {
      return amount.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
    }
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // 変化率計算
  const calculateChangeRate = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // 変化表示コンポーネント
  const ChangeDisplay = ({ current, previous, currency = 'JPY', whiteText = false }) => {
    const change = current - previous;
    const changeRate = calculateChangeRate(current, previous);
    const isPositive = change >= 0;
    const colorClass = whiteText 
      ? (isPositive ? 'text-green-300' : 'text-red-300')
      : (isPositive ? 'text-green-600' : 'text-red-600');

    return (
      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 ${colorClass}`}>
          {isPositive ? (
            <>
              <span className="text-xs">+</span>
              <ArrowUpRight size={14} />
            </>
          ) : (
            <>
              <span className="text-xs">−</span>
              <ArrowDownRight size={14} />
            </>
          )}
          {formatAmount(Math.abs(change), { currency, hideAmount: !showAmounts })}
        </span>
        <span className={`text-sm ${colorClass}`}>
          ({isPositive ? '+' : ''}{changeRate.toFixed(1)}%)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-gray-100" style={{ borderBottom: '1px solid #ccc' }}>
        <div className="flex items-center justify-between" style={{ height: '50px' }}>
          {/* ロゴ（左側） */}
          <div style={{ paddingLeft: '20px' }}>
            <h1 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 'bold' }}>資産管理システム</h1>
          </div>
          
          {/* ナビゲーション（右側） */}
          <nav className="flex items-center" style={{ paddingRight: '20px' }}>
            <a
              href="/"
              className="hover:bg-gray-200"
              style={{
                padding: '15px 18px',
                fontSize: '14px',
                fontWeight: '400',
                textDecoration: 'none',
                display: 'inline-block',
                position: 'relative',
                color: '#333',
              }}
            >
              ダッシュボード
            </a>
            <a
              href="/assets"
              style={{
                padding: '15px 18px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                position: 'relative',
                color: 'white',
                backgroundColor: '#4a90e2',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
              }}
            >
              資産管理
            </a>
            <a
              href="/files"
              className="hover:bg-gray-200"
              style={{
                padding: '15px 18px',
                fontSize: '14px',
                fontWeight: '400',
                textDecoration: 'none',
                display: 'inline-block',
                position: 'relative',
                color: '#333',
              }}
            >
              ファイル管理
            </a>
            <a
              href="/manual-entry"
              className="hover:bg-gray-200"
              style={{
                padding: '15px 18px',
                fontSize: '14px',
                fontWeight: '400',
                textDecoration: 'none',
                display: 'inline-block',
                position: 'relative',
                color: '#333',
              }}
            >
              手入力
            </a>
            <a
              href="/reports"
              className="hover:bg-gray-200"
              style={{
                padding: '15px 18px',
                fontSize: '14px',
                fontWeight: '400',
                textDecoration: 'none',
                display: 'inline-block',
                position: 'relative',
                color: '#333',
              }}
            >
              レポート出力
            </a>
            <a
              href="/admin"
              className="hover:bg-gray-200"
              style={{
                padding: '15px 18px',
                fontSize: '14px',
                fontWeight: '400',
                textDecoration: 'none',
                display: 'inline-block',
                position: 'relative',
                color: '#333',
              }}
            >
              管理者設定
            </a>
          </nav>
        </div>
      </header>

      {/* 総資産サマリー */}
      <div className="bg-white border-b px-6 py-5">
        <div className="max-w-full">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900">総資産サマリー（{selectedMonth}）</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAmounts(!showAmounts)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={showAmounts ? "金額を隠す" : "金額を表示"}
              >
                {showAmounts ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport('CSV')}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  <FileSpreadsheet size={14} />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExport('Excel')}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  <Download size={14} />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3 mt-4">
            {/* 総資産 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">総資産</span>
                <DollarSign size={18} className="opacity-70" />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold">
                  ¥{formatAmount(summary.total.balanceJPY, { hideAmount: !showAmounts })}
                </div>
                <div className="text-sm opacity-90">
                  ${formatAmount(summary.total.balanceUSD, { currency: 'USD', hideAmount: !showAmounts })}
                </div>
                <div className="pt-2 border-t border-white/20">
                  <ChangeDisplay 
                    current={summary.total.balanceJPY} 
                    previous={summary.total.prevBalanceJPY}
                    whiteText={true}
                  />
                </div>
              </div>
            </div>

            {/* 各セクション */}
            {Object.entries(summary.sections).map(([section, data]) => (
              <div key={section} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">{section}</span>
                  <Info size={16} className="opacity-70" />
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold">
                    ¥{formatAmount(data.balanceJPY, { hideAmount: !showAmounts })}
                  </div>
                  <div className="text-sm opacity-90">
                    ${formatAmount(data.balanceUSD, { currency: 'USD', hideAmount: !showAmounts })}
                  </div>
                  <div className="pt-2 border-t border-white/20">
                    <div className={`text-sm flex items-center gap-1 ${
                      data.balanceJPY - data.prevBalanceJPY >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {data.balanceJPY - data.prevBalanceJPY >= 0 ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      <span>
                        {calculateChangeRate(data.balanceJPY, data.prevBalanceJPY).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* フィルター・操作バー */}
      <div className="bg-white border-b px-6 py-4 sticky top-[50px] z-30">
        <div className="flex flex-wrap gap-3 items-center">
          {/* 月選択 */}
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* 通貨表示切替 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrencyDisplay('jpy')}
              className={`px-3 py-1 rounded text-sm ${currencyDisplay === 'jpy' ? 'bg-white shadow-sm' : ''}`}
            >
              円のみ
            </button>
            <button
              onClick={() => setCurrencyDisplay('usd')}
              className={`px-3 py-1 rounded text-sm ${currencyDisplay === 'usd' ? 'bg-white shadow-sm' : ''}`}
            >
              ドルのみ
            </button>
            <button
              onClick={() => setCurrencyDisplay('both')}
              className={`px-3 py-1 rounded text-sm ${currencyDisplay === 'both' ? 'bg-white shadow-sm' : ''}`}
            >
              両方
            </button>
          </div>

          {/* フィルター */}
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">全区分</option>
            <option value="法人資産">法人資産</option>
            <option value="個人資産">個人資産</option>
            <option value="法人投資">法人投資</option>
            <option value="個人投資">個人投資</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">全カテゴリ</option>
            <option value="現金">現金</option>
            <option value="銀行口座">銀行口座</option>
            <option value="仮想通貨">仮想通貨</option>
            <option value="社債">社債</option>
            <option value="不動産">不動産</option>
            <option value="株式">株式</option>
            <option value="定期預金">定期預金</option>
            <option value="事業投資">事業投資</option>
          </select>

          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">全通貨</option>
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
            <option value="AED">AED</option>
            <option value="NTD">NTD</option>
            <option value="USDT">USDT</option>
          </select>

          {/* 検索 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="資産名・カテゴリで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* 手動補正切替 */}
          <button
            onClick={() => setShowManualAdjustment(!showManualAdjustment)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showManualAdjustment ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Plus size={16} />
            手動補正
          </button>

          {/* リフレッシュ */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* メインテーブルエリア */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">
                    種類/カテゴリー
                  </th>
                  <th className="sticky left-[120px] bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[200px]">
                    アカウント名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    通貨
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('balance')}>
                    残高
                    {sortConfig.key === 'balance' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    前月比
                    <HelpCircle size={14} className="inline ml-1 text-gray-400" />
                  </th>
                  {(currencyDisplay === 'jpy' || currencyDisplay === 'both') && (
                    <>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-blue-50">
                        円建て金額
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-blue-50">
                        前月比(円)
                      </th>
                    </>
                  )}
                  {(currencyDisplay === 'usd' || currencyDisplay === 'both') && (
                    <>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-green-50">
                        ドル建て金額
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-green-50">
                        前月比($)
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    備考
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(groupedAssets).map(([section, sectionAssets]) => (
                  <React.Fragment key={section}>
                    {/* セクションヘッダー */}
                    <tr className="bg-gray-100">
                      <td colSpan={10} className="px-4 py-2 font-semibold text-gray-700">
                        {section} ({sectionAssets.length}件)
                      </td>
                    </tr>

                    {/* 資産行 */}
                    {sectionAssets.map(asset => {
                      const adjustedBalance = asset.balance + (manualAdjustments[asset.id]?.balance || 0);
                      const adjustedPrevBalance = asset.prevBalance + (manualAdjustments[asset.id]?.prevBalance || 0);
                      const balanceJPY = convertToJPY(adjustedBalance, asset.currency);
                      const prevBalanceJPY = convertToJPY(adjustedPrevBalance, asset.currency, previousMonth);
                      const balanceUSD = convertToUSD(adjustedBalance, asset.currency);
                      const prevBalanceUSD = convertToUSD(adjustedPrevBalance, asset.currency, previousMonth);

                      return (
                        <React.Fragment key={asset.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="sticky left-0 bg-white px-4 py-3 text-sm whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                CATEGORY_COLORS[asset.category] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {asset.category}
                              </span>
                            </td>
                            <td className="sticky left-[120px] bg-white px-4 py-3 text-sm font-medium whitespace-nowrap">
                              <button
                                onClick={() => toggleRowExpansion(asset.id)}
                                className="flex items-center gap-2 hover:text-blue-600"
                              >
                                {expandedRows[asset.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {asset.name}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                              <span className="font-mono">{asset.currency}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap font-medium">
                              {formatAmount(adjustedBalance, { currency: asset.currency, hideAmount: !showAmounts })}
                            </td>
                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                              <ChangeDisplay current={adjustedBalance} previous={adjustedPrevBalance} currency={asset.currency} />
                            </td>
                            {(currencyDisplay === 'jpy' || currencyDisplay === 'both') && (
                              <>
                                <td className="px-4 py-3 text-sm text-right whitespace-nowrap font-medium bg-blue-50">
                                  ¥{formatAmount(balanceJPY, { hideAmount: !showAmounts })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right whitespace-nowrap bg-blue-50">
                                  <ChangeDisplay current={balanceJPY} previous={prevBalanceJPY} />
                                </td>
                              </>
                            )}
                            {(currencyDisplay === 'usd' || currencyDisplay === 'both') && (
                              <>
                                <td className="px-4 py-3 text-sm text-right whitespace-nowrap font-medium bg-green-50">
                                  ${formatAmount(balanceUSD, { currency: 'USD', hideAmount: !showAmounts })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right whitespace-nowrap bg-green-50">
                                  <ChangeDisplay current={balanceUSD} previous={prevBalanceUSD} currency="USD" />
                                </td>
                              </>
                            )}
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {asset.remarks && (
                                <span className="flex items-center gap-1">
                                  <AlertCircle size={14} className="text-yellow-500" />
                                  {asset.remarks}
                                </span>
                              )}
                            </td>
                          </tr>

                          {/* 展開された取引詳細 */}
                          {expandedRows[asset.id] && (
                            <tr>
                              <td colSpan={10} className="bg-gray-50 px-8 py-4">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm text-gray-700">取引内訳</h4>
                                  <div className="bg-white rounded-lg border overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">日付</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">種別</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">金額</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">説明</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">データソース</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {generateTransactionDetails(asset.id).map(tx => (
                                          <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm">{tx.date}</td>
                                            <td className="px-4 py-2 text-sm">
                                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                tx.type === '入金' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                              }`}>
                                                {tx.type}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right font-medium">
                                              {formatAmount(tx.amount, { currency: asset.currency })}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-600">{tx.description}</td>
                                            <td className="px-4 py-2 text-sm">
                                              <span className="flex items-center gap-1">
                                                {tx.source === '手入力' ? (
                                                  <Clock size={14} className="text-blue-500" />
                                                ) : (
                                                  <FileText size={14} className="text-green-500" />
                                                )}
                                                {tx.source}
                                                {tx.sourceFile && (
                                                  <span className="text-xs text-gray-500">({tx.sourceFile})</span>
                                                )}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* セクション小計 */}
                    <tr className="bg-yellow-50 font-semibold">
                      <td className="sticky left-0 bg-yellow-50 px-4 py-3 text-sm" colSpan={3}>
                        {section} 小計
                      </td>
                      <td className="px-4 py-3 text-sm text-right" colSpan={2}>
                        -
                      </td>
                      {(currencyDisplay === 'jpy' || currencyDisplay === 'both') && (
                        <>
                          <td className="px-4 py-3 text-sm text-right bg-yellow-100">
                            ¥{formatAmount(summary.sections[section].balanceJPY, { hideAmount: !showAmounts })}
                          </td>
                          <td className="px-4 py-3 text-sm text-right bg-yellow-100">
                            <ChangeDisplay 
                              current={summary.sections[section].balanceJPY}
                              previous={summary.sections[section].prevBalanceJPY}
                            />
                          </td>
                        </>
                      )}
                      {(currencyDisplay === 'usd' || currencyDisplay === 'both') && (
                        <>
                          <td className="px-4 py-3 text-sm text-right bg-yellow-100">
                            ${formatAmount(summary.sections[section].balanceUSD, { currency: 'USD', hideAmount: !showAmounts })}
                          </td>
                          <td className="px-4 py-3 text-sm text-right bg-yellow-100">
                            <ChangeDisplay 
                              current={summary.sections[section].balanceUSD}
                              previous={summary.sections[section].prevBalanceUSD}
                              currency="USD"
                            />
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3"></td>
                    </tr>
                  </React.Fragment>
                ))}

                {/* 手動補正行 */}
                {showManualAdjustment && (
                  <tr className="bg-orange-50">
                    <td colSpan={10} className="px-4 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={16} className="text-orange-600" />
                          <span className="font-medium text-sm text-orange-800">手動補正</span>
                          <span className="text-xs text-orange-600">※ 一時的な調整用。監査ログに記録されます</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          {filteredAssets.slice(0, 5).map(asset => (
                            <div key={asset.id} className="bg-white rounded p-3 border border-orange-200">
                              <div className="text-xs font-medium text-gray-700 mb-2">{asset.name}</div>
                              <input
                                type="number"
                                placeholder="残高調整"
                                className="w-full px-2 py-1 text-sm border rounded"
                                onChange={(e) => updateManualAdjustment(asset.id, 'balance', e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* 総合計 */}
                <tr className="bg-gray-800 text-white font-bold">
                  <td className="sticky left-0 bg-gray-800 px-4 py-4 text-sm" colSpan={3}>
                    総合計
                  </td>
                  <td className="px-4 py-4 text-sm text-right" colSpan={2}>
                    -
                  </td>
                  {(currencyDisplay === 'jpy' || currencyDisplay === 'both') && (
                    <>
                      <td className="px-4 py-4 text-sm text-right bg-gray-700">
                        ¥{formatAmount(summary.total.balanceJPY, { hideAmount: !showAmounts })}
                      </td>
                      <td className="px-4 py-4 text-sm text-right bg-gray-700">
                        <div className={`flex items-center justify-end gap-2 ${
                          summary.total.balanceJPY - summary.total.prevBalanceJPY >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {summary.total.balanceJPY - summary.total.prevBalanceJPY >= 0 ? (
                            <ArrowUpRight size={16} />
                          ) : (
                            <ArrowDownRight size={16} />
                          )}
                          ¥{formatAmount(Math.abs(summary.total.balanceJPY - summary.total.prevBalanceJPY), { hideAmount: !showAmounts })}
                        </div>
                      </td>
                    </>
                  )}
                  {(currencyDisplay === 'usd' || currencyDisplay === 'both') && (
                    <>
                      <td className="px-4 py-4 text-sm text-right bg-gray-700">
                        ${formatAmount(summary.total.balanceUSD, { currency: 'USD', hideAmount: !showAmounts })}
                      </td>
                      <td className="px-4 py-4 text-sm text-right bg-gray-700">
                        <div className={`flex items-center justify-end gap-2 ${
                          summary.total.balanceUSD - summary.total.prevBalanceUSD >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {summary.total.balanceUSD - summary.total.prevBalanceUSD >= 0 ? (
                            <ArrowUpRight size={16} />
                          ) : (
                            <ArrowDownRight size={16} />
                          )}
                          ${formatAmount(Math.abs(summary.total.balanceUSD - summary.total.prevBalanceUSD), { currency: 'USD', hideAmount: !showAmounts })}
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 注意事項・免責事項 */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-gray-400 mt-0.5" />
            <div className="space-y-1">
              <p>※ 前月比は月末残高を基準に算出しています。為替レートは各月の平均レートを使用。</p>
              <p>※ 株価・仮想通貨価格は参考値であり、実際の取引価格とは異なる場合があります。</p>
              <p>※ データは手入力ページおよびファイル管理ページから自動連携されています。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManagementPage;