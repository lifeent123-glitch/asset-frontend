import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, Download, Search, TrendingUp, TrendingDown, DollarSign, Info, Eye, EyeOff, HelpCircle, ArrowUpRight, ArrowDownRight, FileText, Calendar, RefreshCw, Plus, AlertCircle, Clock, FileSpreadsheet } from 'lucide-react';
/* =========================
 * 為替レート（月別平均レート）
 * ========================= */
const MONTHLY_EXCHANGE_RATES = {
    '2025-01': { USD: 148.5, AED: 40.4, NTD: 4.68, EUR: 161.2 },
    '2025-02': { USD: 149.2, AED: 40.6, NTD: 4.70, EUR: 162.1 },
    '2025-03': { USD: 150.1, AED: 40.8, NTD: 4.72, EUR: 163.0 },
    '2025-04': { USD: 151.3, AED: 41.2, NTD: 4.75, EUR: 164.2 },
    '2025-05': { USD: 150.8, AED: 41.0, NTD: 4.73, EUR: 163.8 },
    '2025-06': { USD: 150.5, AED: 40.9, NTD: 4.71, EUR: 163.5 },
    '2025-07': { USD: 151.0, AED: 41.1, NTD: 4.74, EUR: 164.0 },
};
/* =========================
 * カテゴリ色定義
 * ========================= */
const CATEGORY_COLORS = {
    現金: 'bg-green-100 text-green-800 border-green-300',
    銀行口座: 'bg-blue-100 text-blue-800 border-blue-300',
    仮想通貨: 'bg-purple-100 text-purple-800 border-purple-300',
    社債: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    不動産: 'bg-red-100 text-red-800 border-red-300',
    定期預金: 'bg-orange-100 text-orange-800 border-orange-300',
    株式: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    事業投資: 'bg-pink-100 text-pink-800 border-pink-300',
};
/* =========================
 * モックデータ
 * ========================= */
const generateMockAssets = () => [
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
    { id: 12, section: '個人投資', category: '社債', name: 'Mashreqバンク個人 HSBC社債', currency: 'USD', balance: 718180.4, prevBalance: 715000, manager: 'AK' },
    { id: 13, section: '個人投資', category: '定期預金', name: 'カンボジアバンク定期預金', currency: 'USD', balance: 150000, prevBalance: 150000, manager: 'B', remarks: '2026.4.5満期' },
    { id: 14, section: '個人投資', category: '事業投資', name: '和牛エンペラー投資', currency: 'NTD', balance: 20000000, prevBalance: 20000000, manager: 'T' },
];
const generateTransactionDetails = (assetId) => {
    const sources = ['手入力', 'PDF取込', 'CSV取込'];
    const types = ['入金', '出金', '振替', '配当', '利息'];
    return Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
        id: `${assetId}-tx-${i}`,
        date: `2025/07/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        type: types[Math.floor(Math.random() * types.length)],
        amount: Math.floor(Math.random() * 1000000) + 10000,
        description: `取引詳細 ${i + 1}`,
        source: sources[Math.floor(Math.random() * sources.length)],
        sourceFile: Math.random() > 0.5 ? 'bank_statement_202507.pdf' : null,
    }));
};
/* =========================
 * コンポーネント
 * ========================= */
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
    const [currencyDisplay, setCurrencyDisplay] = useState('both');
    // 初期データロード
    useEffect(() => {
        setAssets(generateMockAssets());
    }, []);
    // 前月（YYYY-MM）算出
    const getPreviousMonth = (month) => {
        const date = new Date(`${month}-01T00:00:00`);
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().slice(0, 7);
    };
    const previousMonth = getPreviousMonth(selectedMonth);
    // 為替レート取得
    const getExchangeRate = useCallback((currency, month) => {
        if (currency === 'JPY')
            return 1;
        const rates = MONTHLY_EXCHANGE_RATES[month] || MONTHLY_EXCHANGE_RATES['2025-07'];
        if (currency === 'USDT' || currency === 'USDC')
            return rates.USD;
        return rates[currency] ?? rates.USD;
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
        return assets.filter((asset) => {
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
        if (!sortConfig.key)
            return filteredAssets;
        return [...filteredAssets].sort((a, b) => {
            let aValue;
            let bValue;
            if (sortConfig.key === 'balance') {
                aValue = a.balance;
                bValue = b.balance;
            }
            else if (sortConfig.key === 'change') {
                aValue = a.balance - a.prevBalance;
                bValue = b.balance - b.prevBalance;
            }
            else {
                // 'changeRate'
                aValue = ((a.balance - a.prevBalance) / (a.prevBalance || 1)) * 100;
                bValue = ((b.balance - b.prevBalance) / (b.prevBalance || 1)) * 100;
            }
            if (aValue < bValue)
                return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue)
                return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredAssets, sortConfig]);
    // セクション別グループ化
    const groupedAssets = useMemo(() => {
        const groups = {
            法人資産: [],
            個人資産: [],
            法人投資: [],
            個人投資: [],
        };
        sortedAssets.forEach((asset) => {
            groups[asset.section].push(asset);
        });
        return groups;
    }, [sortedAssets]);
    // 集計計算
    const summary = useMemo(() => {
        const init = {
            balance: 0, prevBalance: 0, balanceJPY: 0, prevBalanceJPY: 0, balanceUSD: 0, prevBalanceUSD: 0,
        };
        const s = {
            sections: {
                法人資産: { ...init },
                個人資産: { ...init },
                法人投資: { ...init },
                個人投資: { ...init },
            },
            total: { ...init },
        };
        Object.entries(groupedAssets).forEach(([section, arr]) => {
            const sec = s.sections[section];
            arr.forEach((asset) => {
                const adjBal = asset.balance + (manualAdjustments[asset.id]?.balance ?? 0);
                const adjPrev = asset.prevBalance + (manualAdjustments[asset.id]?.prevBalance ?? 0);
                sec.balance += adjBal;
                sec.prevBalance += adjPrev;
                sec.balanceJPY += convertToJPY(adjBal, asset.currency);
                sec.prevBalanceJPY += convertToJPY(adjPrev, asset.currency, previousMonth);
                sec.balanceUSD += convertToUSD(adjBal, asset.currency);
                sec.prevBalanceUSD += convertToUSD(adjPrev, asset.currency, previousMonth);
            });
            s.total.balance += sec.balance;
            s.total.prevBalance += sec.prevBalance;
            s.total.balanceJPY += sec.balanceJPY;
            s.total.prevBalanceJPY += sec.prevBalanceJPY;
            s.total.balanceUSD += sec.balanceUSD;
            s.total.prevBalanceUSD += sec.prevBalanceUSD;
        });
        return s;
    }, [groupedAssets, manualAdjustments, convertToJPY, convertToUSD, previousMonth]);
    // 行展開トグル
    const toggleRowExpansion = (assetId) => {
        setExpandedRows((prev) => ({ ...prev, [assetId]: !prev[assetId] }));
    };
    // ソート処理
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };
    // 手動補正値の更新
    const updateManualAdjustment = (assetId, field, value) => {
        setManualAdjustments((prev) => ({
            ...prev,
            [assetId]: {
                ...prev[assetId],
                [field]: Number.isFinite(parseFloat(value)) ? parseFloat(value) : 0,
            },
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
        if (hideAmount)
            return '***,***';
        if (currency === 'JPY') {
            return amount.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
        }
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    // 変化率計算
    const calculateChangeRate = (current, previous) => {
        if (!previous)
            return 0;
        return ((current - previous) / previous) * 100;
    };
    // 変化表示コンポーネント
    const ChangeDisplay = ({ current, previous, currency = 'JPY', whiteText = false, }) => {
        const change = current - previous;
        const changeRate = calculateChangeRate(current, previous);
        const isPositive = change >= 0;
        const colorClass = whiteText
            ? isPositive ? 'text-green-300' : 'text-red-300'
            : isPositive ? 'text-green-600' : 'text-red-600';
        return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `flex items-center gap-1 ${colorClass}`, children: [isPositive ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-xs", children: "+" }), _jsx(ArrowUpRight, { size: 14 })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-xs", children: "\u2212" }), _jsx(ArrowDownRight, { size: 14 })] })), formatAmount(Math.abs(change), { currency, hideAmount: !showAmounts })] }), _jsxs("span", { className: `text-sm ${colorClass}`, children: ["(", isPositive ? '+' : '', changeRate.toFixed(1), "%)"] })] }));
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-gray-100", style: { borderBottom: '1px solid #ccc' }, children: _jsxs("div", { className: "flex items-center justify-between", style: { height: '50px' }, children: [_jsx("div", { style: { paddingLeft: '20px' }, children: _jsx("h1", { className: "text-gray-900", style: { fontSize: '16px', fontWeight: 'bold' }, children: "\u8CC7\u7523\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }) }), _jsxs("nav", { className: "flex items-center", style: { paddingRight: '20px' }, children: [_jsx("a", { href: "/", className: "hover:bg-gray-200", style: { padding: '15px 18px', fontSize: '14px', fontWeight: 400, textDecoration: 'none', color: '#333' }, children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx("a", { href: "/assets", style: {
                                        padding: '15px 18px', fontSize: '14px', fontWeight: 600,
                                        textDecoration: 'none', color: 'white', backgroundColor: '#4a90e2',
                                        borderTopLeftRadius: 4, borderTopRightRadius: 4,
                                    }, children: "\u8CC7\u7523\u7BA1\u7406" }), _jsx("a", { href: "/files", className: "hover:bg-gray-200", style: { padding: '15px 18px', fontSize: '14px', fontWeight: 400, textDecoration: 'none', color: '#333' }, children: "\u30D5\u30A1\u30A4\u30EB\u7BA1\u7406" }), _jsx("a", { href: "/manual-entry", className: "hover:bg-gray-200", style: { padding: '15px 18px', fontSize: '14px', fontWeight: 400, textDecoration: 'none', color: '#333' }, children: "\u624B\u5165\u529B" }), _jsx("a", { href: "/reports", className: "hover:bg-gray-200", style: { padding: '15px 18px', fontSize: '14px', fontWeight: 400, textDecoration: 'none', color: '#333' }, children: "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B" }), _jsx("a", { href: "/admin", className: "hover:bg-gray-200", style: { padding: '15px 18px', fontSize: '14px', fontWeight: 400, textDecoration: 'none', color: '#333' }, children: "\u7BA1\u7406\u8005\u8A2D\u5B9A" })] })] }) }), _jsx("div", { className: "bg-white border-b px-6 py-5", children: _jsxs("div", { className: "max-w-full", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900", children: ["\u7DCF\u8CC7\u7523\u30B5\u30DE\u30EA\u30FC\uFF08", selectedMonth, "\uFF09"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => setShowAmounts(!showAmounts), className: "p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors", title: showAmounts ? '金額を隠す' : '金額を表示', children: showAmounts ? _jsx(Eye, { size: 20 }) : _jsx(EyeOff, { size: 20 }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => handleExport('CSV'), className: "flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors", children: [_jsx(FileSpreadsheet, { size: 14 }), _jsx("span", { children: "CSV" })] }), _jsxs("button", { onClick: () => handleExport('Excel'), className: "flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors", children: [_jsx(Download, { size: 14 }), _jsx("span", { children: "Excel" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-5 gap-3 mt-4", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm opacity-90", children: "\u7DCF\u8CC7\u7523" }), _jsx(DollarSign, { size: 18, className: "opacity-70" })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "text-xl font-bold", children: ["\u00A5", formatAmount(summary.total.balanceJPY, { hideAmount: !showAmounts })] }), _jsxs("div", { className: "text-sm opacity-90", children: ["$", formatAmount(summary.total.balanceUSD, { currency: 'USD', hideAmount: !showAmounts })] }), _jsx("div", { className: "pt-2 border-t border-white/20", children: _jsx(ChangeDisplay, { current: summary.total.balanceJPY, previous: summary.total.prevBalanceJPY, whiteText: true }) })] })] }), Object.entries(summary.sections).map(([section, data]) => {
                                    const d = data; // 明示型済み
                                    const positive = d.balanceJPY - d.prevBalanceJPY >= 0;
                                    return (_jsxs("div", { className: "bg-white rounded-lg p-4 border", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsx("span", { className: "text-sm font-medium text-gray-700", children: section }) }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "text-lg font-semibold", children: ["\u00A5", formatAmount(d.balanceJPY, { hideAmount: !showAmounts })] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["$", formatAmount(d.balanceUSD, { currency: 'USD', hideAmount: !showAmounts })] }), _jsx("div", { className: "pt-2 border-t border-gray-200", children: _jsxs("div", { className: `text-sm flex items-center gap-1 ${positive ? 'text-green-600' : 'text-red-600'}`, children: [positive ? _jsx(TrendingUp, { size: 14 }) : _jsx(TrendingDown, { size: 14 }), _jsxs("span", { children: [calculateChangeRate(d.balanceJPY, d.prevBalanceJPY).toFixed(1), "%"] })] }) })] })] }, section));
                                })] })] }) }), _jsx("div", { className: "bg-white border-b px-6 py-4 sticky top-[50px] z-30", children: _jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { size: 18, className: "text-gray-500" }), _jsx("input", { type: "month", value: selectedMonth, onChange: (e) => setSelectedMonth(e.target.value), className: "px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" })] }), _jsxs("div", { className: "flex items-center gap-1 bg-gray-100 rounded-lg p-1", children: [_jsx("button", { onClick: () => setCurrencyDisplay('jpy'), className: `px-3 py-1 rounded text-sm ${currencyDisplay === 'jpy' ? 'bg-white shadow-sm' : ''}`, children: "\u5186\u306E\u307F" }), _jsx("button", { onClick: () => setCurrencyDisplay('usd'), className: `px-3 py-1 rounded text-sm ${currencyDisplay === 'usd' ? 'bg-white shadow-sm' : ''}`, children: "\u30C9\u30EB\u306E\u307F" }), _jsx("button", { onClick: () => setCurrencyDisplay('both'), className: `px-3 py-1 rounded text-sm ${currencyDisplay === 'both' ? 'bg-white shadow-sm' : ''}`, children: "\u4E21\u65B9" })] }), _jsxs("select", { value: filterSection, onChange: (e) => setFilterSection(e.target.value), className: "px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm", children: [_jsx("option", { value: "all", children: "\u5168\u533A\u5206" }), _jsx("option", { value: "\u6CD5\u4EBA\u8CC7\u7523", children: "\u6CD5\u4EBA\u8CC7\u7523" }), _jsx("option", { value: "\u500B\u4EBA\u8CC7\u7523", children: "\u500B\u4EBA\u8CC7\u7523" }), _jsx("option", { value: "\u6CD5\u4EBA\u6295\u8CC7", children: "\u6CD5\u4EBA\u6295\u8CC7" }), _jsx("option", { value: "\u500B\u4EBA\u6295\u8CC7", children: "\u500B\u4EBA\u6295\u8CC7" })] }), _jsxs("select", { value: filterCategory, onChange: (e) => setFilterCategory(e.target.value), className: "px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm", children: [_jsx("option", { value: "all", children: "\u5168\u30AB\u30C6\u30B4\u30EA" }), _jsx("option", { value: "\u73FE\u91D1", children: "\u73FE\u91D1" }), _jsx("option", { value: "\u9280\u884C\u53E3\u5EA7", children: "\u9280\u884C\u53E3\u5EA7" }), _jsx("option", { value: "\u4EEE\u60F3\u901A\u8CA8", children: "\u4EEE\u60F3\u901A\u8CA8" }), _jsx("option", { value: "\u793E\u50B5", children: "\u793E\u50B5" }), _jsx("option", { value: "\u4E0D\u52D5\u7523", children: "\u4E0D\u52D5\u7523" }), _jsx("option", { value: "\u682A\u5F0F", children: "\u682A\u5F0F" }), _jsx("option", { value: "\u5B9A\u671F\u9810\u91D1", children: "\u5B9A\u671F\u9810\u91D1" }), _jsx("option", { value: "\u4E8B\u696D\u6295\u8CC7", children: "\u4E8B\u696D\u6295\u8CC7" })] }), _jsxs("select", { value: filterCurrency, onChange: (e) => setFilterCurrency(e.target.value), className: "px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm", children: [_jsx("option", { value: "all", children: "\u5168\u901A\u8CA8" }), _jsx("option", { value: "JPY", children: "JPY" }), _jsx("option", { value: "USD", children: "USD" }), _jsx("option", { value: "AED", children: "AED" }), _jsx("option", { value: "NTD", children: "NTD" }), _jsx("option", { value: "USDT", children: "USDT" })] }), _jsx("div", { className: "flex-1 max-w-md", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400", size: 18 }), _jsx("input", { type: "text", placeholder: "\u8CC7\u7523\u540D\u30FB\u30AB\u30C6\u30B4\u30EA\u3067\u691C\u7D22...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" })] }) }), _jsxs("button", { onClick: () => setShowManualAdjustment(!showManualAdjustment), className: `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${showManualAdjustment ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`, children: [_jsx(Plus, { size: 16 }), "\u624B\u52D5\u88DC\u6B63"] }), _jsx("button", { className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", onClick: () => setAssets(generateMockAssets()), children: _jsx(RefreshCw, { size: 18 }) })] }) }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow-sm overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 sticky top-0 z-20", children: _jsxs("tr", { children: [_jsx("th", { className: "sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]", children: "\u7A2E\u985E/\u30AB\u30C6\u30B4\u30EA\u30FC" }), _jsx("th", { className: "sticky left-[120px] bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[200px]", children: "\u30A2\u30AB\u30A6\u30F3\u30C8\u540D" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider", children: "\u901A\u8CA8" }), _jsxs("th", { className: "px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100", onClick: () => handleSort('balance'), children: ["\u6B8B\u9AD8", sortConfig.key === 'balance' && _jsx("span", { className: "ml-1", children: sortConfig.direction === 'asc' ? '↑' : '↓' })] }), _jsxs("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider", children: ["\u524D\u6708\u6BD4", _jsx(HelpCircle, { size: 14, className: "inline ml-1 text-gray-400" })] }), (currencyDisplay === 'jpy' || currencyDisplay === 'both') && (_jsxs(_Fragment, { children: [_jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-blue-50", children: "\u5186\u5EFA\u3066\u91D1\u984D" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-blue-50", children: "\u524D\u6708\u6BD4(\u5186)" })] })), (currencyDisplay === 'usd' || currencyDisplay === 'both') && (_jsxs(_Fragment, { children: [_jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-green-50", children: "\u30C9\u30EB\u5EFA\u3066\u91D1\u984D" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider bg-green-50", children: "\u524D\u6708\u6BD4($)" })] })), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider", children: "\u5099\u8003" })] }) }), _jsxs("tbody", { className: "divide-y divide-gray-200", children: [Object.entries(groupedAssets).map(([section, sectionAssets]) => (_jsxs(React.Fragment, { children: [_jsx("tr", { className: "bg-gray-100", children: _jsxs("td", { colSpan: 10, className: "px-4 py-2 font-semibold text-gray-700", children: [section, "\uFF08", sectionAssets.length, "\u4EF6\uFF09"] }) }), sectionAssets.map((asset) => {
                                                        const adjustedBalance = asset.balance + (manualAdjustments[asset.id]?.balance || 0);
                                                        const adjustedPrevBalance = asset.prevBalance + (manualAdjustments[asset.id]?.prevBalance || 0);
                                                        const balanceJPY = convertToJPY(adjustedBalance, asset.currency);
                                                        const prevBalanceJPY = convertToJPY(adjustedPrevBalance, asset.currency, previousMonth);
                                                        const balanceUSD = convertToUSD(adjustedBalance, asset.currency);
                                                        const prevBalanceUSD = convertToUSD(adjustedPrevBalance, asset.currency, previousMonth);
                                                        return (_jsxs(React.Fragment, { children: [_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "sticky left-0 bg-white px-4 py-3 text-sm whitespace-nowrap", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[asset.category] || 'bg-gray-100 text-gray-800'}`, children: asset.category }) }), _jsx("td", { className: "sticky left-[120px] bg-white px-4 py-3 text-sm font-medium whitespace-nowrap", children: _jsxs("button", { onClick: () => toggleRowExpansion(asset.id), className: "flex items-center gap-2 hover:text-blue-600", children: [expandedRows[asset.id] ? _jsx(ChevronUp, { size: 16 }) : _jsx(ChevronDown, { size: 16 }), asset.name] }) }), _jsx("td", { className: "px-4 py-3 text-sm whitespace-nowrap", children: _jsx("span", { className: "font-mono", children: asset.currency }) }), _jsx("td", { className: "px-4 py-3 text-sm text-right whitespace-nowrap font-medium", children: formatAmount(adjustedBalance, { currency: asset.currency === 'USD' ? 'USD' : 'JPY', hideAmount: !showAmounts }) }), _jsx("td", { className: "px-4 py-3 text-sm text-right whitespace-nowrap", children: _jsx(ChangeDisplay, { current: adjustedBalance, previous: adjustedPrevBalance, currency: asset.currency }) }), (currencyDisplay === 'jpy' || currencyDisplay === 'both') && (_jsxs(_Fragment, { children: [_jsxs("td", { className: "px-4 py-3 text-sm text-right whitespace-nowrap font-medium bg-blue-50", children: ["\u00A5", formatAmount(balanceJPY, { hideAmount: !showAmounts })] }), _jsx("td", { className: "px-4 py-3 text-sm text-right whitespace-nowrap bg-blue-50", children: _jsx(ChangeDisplay, { current: balanceJPY, previous: prevBalanceJPY }) })] })), (currencyDisplay === 'usd' || currencyDisplay === 'both') && (_jsxs(_Fragment, { children: [_jsxs("td", { className: "px-4 py-3 text-sm text-right whitespace-nowrap font-medium bg-green-50", children: ["$", formatAmount(balanceUSD, { currency: 'USD', hideAmount: !showAmounts })] }), _jsx("td", { className: "px-4 py-3 text-sm text-right whitespace-nowrap bg-green-50", children: _jsx(ChangeDisplay, { current: balanceUSD, previous: prevBalanceUSD, currency: "USD" }) })] })), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 whitespace-nowrap", children: asset.remarks && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(AlertCircle, { size: 14, className: "text-yellow-500" }), asset.remarks] })) })] }), expandedRows[asset.id] && (_jsx("tr", { children: _jsx("td", { colSpan: 10, className: "bg-gray-50 px-8 py-4", children: _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-sm text-gray-700", children: "\u53D6\u5F15\u5185\u8A33" }), _jsx("div", { className: "bg-white rounded-lg border overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-600", children: "\u65E5\u4ED8" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-600", children: "\u7A2E\u5225" }), _jsx("th", { className: "px-4 py-2 text-right text-xs font-medium text-gray-600", children: "\u91D1\u984D" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-600", children: "\u8AAC\u660E" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-600", children: "\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: generateTransactionDetails(asset.id).map((tx) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2 text-sm", children: tx.date }), _jsx("td", { className: "px-4 py-2 text-sm", children: _jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.type === '入金' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: tx.type }) }), _jsx("td", { className: "px-4 py-2 text-sm text-right font-medium", children: formatAmount(tx.amount, { currency: asset.currency }) }), _jsx("td", { className: "px-4 py-2 text-sm text-gray-600", children: tx.description }), _jsx("td", { className: "px-4 py-2 text-sm", children: _jsxs("span", { className: "flex items-center gap-1", children: [tx.source === '手入力' ? (_jsx(Clock, { size: 14, className: "text-blue-500" })) : (_jsx(FileText, { size: 14, className: "text-green-500" })), tx.source, tx.sourceFile && _jsxs("span", { className: "text-xs text-gray-500", children: ["\uFF08", tx.sourceFile, "\uFF09"] })] }) })] }, tx.id))) })] }) })] }) }) }))] }, asset.id));
                                                    }), _jsxs("tr", { className: "bg-yellow-50 font-semibold", children: [_jsxs("td", { className: "sticky left-0 bg-yellow-50 px-4 py-3 text-sm", colSpan: 3, children: [section, " \u5C0F\u8A08"] }), _jsx("td", { className: "px-4 py-3 text-sm text-right", colSpan: 2, children: "-" }), (currencyDisplay === 'jpy' || currencyDisplay === 'both') && (_jsxs(_Fragment, { children: [_jsxs("td", { className: "px-4 py-3 text-sm text-right bg-yellow-100", children: ["\u00A5", formatAmount(summary.sections[section].balanceJPY, { hideAmount: !showAmounts })] }), _jsx("td", { className: "px-4 py-3 text-sm text-right bg-yellow-100", children: _jsx(ChangeDisplay, { current: summary.sections[section].balanceJPY, previous: summary.sections[section].prevBalanceJPY }) })] })), (currencyDisplay === 'usd' || currencyDisplay === 'both') && (_jsxs(_Fragment, { children: [_jsxs("td", { className: "px-4 py-3 text-sm text-right bg-yellow-100", children: ["$", formatAmount(summary.sections[section].balanceUSD, { currency: 'USD', hideAmount: !showAmounts })] }), _jsx("td", { className: "px-4 py-3 text-sm text-right bg-yellow-100", children: _jsx(ChangeDisplay, { current: summary.sections[section].balanceUSD, previous: summary.sections[section].prevBalanceUSD, currency: "USD" }) })] })), _jsx("td", { className: "px-4 py-3" })] })] }, section))), showManualAdjustment && (_jsx("tr", { className: "bg-orange-50", children: _jsx("td", { colSpan: 10, className: "px-4 py-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { size: 16, className: "text-orange-600" }), _jsx("span", { className: "font-medium text-sm text-orange-800", children: "\u624B\u52D5\u88DC\u6B63" }), _jsx("span", { className: "text-xs text-orange-600", children: "\u203B \u4E00\u6642\u7684\u306A\u8ABF\u6574\u7528\u3002\u76E3\u67FB\u30ED\u30B0\u306B\u8A18\u9332\u3055\u308C\u307E\u3059" })] }), _jsx("div", { className: "grid grid-cols-4 gap-4", children: filteredAssets.slice(0, 5).map((asset) => (_jsxs("div", { className: "bg-white rounded p-3 border border-orange-200", children: [_jsx("div", { className: "text-xs font-medium text-gray-700 mb-2", children: asset.name }), _jsx("input", { type: "number", placeholder: "\u6B8B\u9AD8\u8ABF\u6574", className: "w-full px-2 py-1 text-sm border rounded", onChange: (e) => updateManualAdjustment(asset.id, 'balance', e.target.value) })] }, asset.id))) })] }) }) })), _jsxs("tr", { className: "bg-gray-800 text-white font-bold", children: [_jsx("td", { className: "sticky left-0 bg-gray-800 px-4 py-4 text-sm", colSpan: 3, children: "\u7DCF\u5408\u8A08" }), _jsx("td", { className: "px-4 py-4 text-sm text-right", colSpan: 2, children: "-" }), (currencyDisplay === 'jpy' || currencyDisplay === 'both') && (_jsxs(_Fragment, { children: [_jsxs("td", { className: "px-4 py-4 text-sm text-right bg-gray-700", children: ["\u00A5", formatAmount(summary.total.balanceJPY, { hideAmount: !showAmounts })] }), _jsx("td", { className: "px-4 py-4 text-sm text-right bg-gray-700", children: _jsxs("div", { className: `flex items-center justify-end gap-2 ${summary.total.balanceJPY - summary.total.prevBalanceJPY >= 0 ? 'text-green-400' : 'text-red-400'}`, children: [summary.total.balanceJPY - summary.total.prevBalanceJPY >= 0 ? _jsx(ArrowUpRight, { size: 16 }) : _jsx(ArrowDownRight, { size: 16 }), "\u00A5", formatAmount(Math.abs(summary.total.balanceJPY - summary.total.prevBalanceJPY), { hideAmount: !showAmounts })] }) })] })), (currencyDisplay === 'usd' || currencyDisplay === 'both') && (_jsxs(_Fragment, { children: [_jsxs("td", { className: "px-4 py-4 text-sm text-right bg-gray-700", children: ["$", formatAmount(summary.total.balanceUSD, { currency: 'USD', hideAmount: !showAmounts })] }), _jsx("td", { className: "px-4 py-4 text-sm text-right bg-gray-700", children: _jsxs("div", { className: `flex items-center justify-end gap-2 ${summary.total.balanceUSD - summary.total.prevBalanceUSD >= 0 ? 'text-green-400' : 'text-red-400'}`, children: [summary.total.balanceUSD - summary.total.prevBalanceUSD >= 0 ? _jsx(ArrowUpRight, { size: 16 }) : _jsx(ArrowDownRight, { size: 16 }), "$", formatAmount(Math.abs(summary.total.balanceUSD - summary.total.prevBalanceUSD), { currency: 'USD', hideAmount: !showAmounts })] }) })] })), _jsx("td", { className: "px-4 py-4" })] })] })] }) }) }), _jsx("div", { className: "mt-6 bg-gray-100 rounded-lg p-4 text-xs text-gray-600", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Info, { size: 16, className: "text-gray-400 mt-0.5" }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { children: "\u203B \u524D\u6708\u6BD4\u306F\u6708\u672B\u6B8B\u9AD8\u3092\u57FA\u6E96\u306B\u7B97\u51FA\u3057\u3066\u3044\u307E\u3059\u3002\u70BA\u66FF\u30EC\u30FC\u30C8\u306F\u5404\u6708\u306E\u5E73\u5747\u30EC\u30FC\u30C8\u3092\u4F7F\u7528\u3002" }), _jsx("p", { children: "\u203B \u682A\u4FA1\u30FB\u4EEE\u60F3\u901A\u8CA8\u4FA1\u683C\u306F\u53C2\u8003\u5024\u3067\u3042\u308A\u3001\u5B9F\u969B\u306E\u53D6\u5F15\u4FA1\u683C\u3068\u306F\u7570\u306A\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002" }), _jsx("p", { children: "\u203B \u30C7\u30FC\u30BF\u306F\u624B\u5165\u529B\u30DA\u30FC\u30B8\u304A\u3088\u3073\u30D5\u30A1\u30A4\u30EB\u7BA1\u7406\u30DA\u30FC\u30B8\u304B\u3089\u81EA\u52D5\u9023\u643A\u3055\u308C\u3066\u3044\u307E\u3059\u3002" })] })] }) })] })] }));
};
export default AssetManagementPage;
