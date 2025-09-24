import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, DollarSign, TrendingUp, TrendingDown, AlertCircle, Check, MessageSquare, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

// カテゴリ別収支コンポーネント
const CategorySummaryItem = ({ category, amountJPY, amountUSD, details, type, isExportMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(isExportMode);
  
  // エクスポートモードが変更されたときに展開状態を更新
  useEffect(() => {
    if (isExportMode) {
      setIsExpanded(true);
    }
  }, [isExportMode]);
  const isIncome = type === 'income';
  const isCashflow = type === 'cashflow';
  
  let bgColor, textColor, borderColor;
  
  if (isCashflow) {
    bgColor = 'bg-blue-50 hover:bg-blue-100';
    textColor = 'text-blue-700';
    borderColor = 'border-blue-200';
  } else if (isIncome) {
    bgColor = 'bg-green-50 hover:bg-green-100';
    textColor = 'text-green-700';
    borderColor = 'border-green-200';
  } else {
    bgColor = 'bg-red-50 hover:bg-red-100';
    textColor = 'text-red-700';
    borderColor = 'border-red-200';
  }

  return (
    <div className={`border ${borderColor} rounded-lg mb-3 overflow-hidden transition-all`}>
      <div
        className={`${bgColor} p-4 ${!isExportMode ? 'cursor-pointer' : ''} transition-colors`}
        onClick={() => !isExportMode && setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <span className={`font-medium ${textColor}`}>{category}</span>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className={`font-semibold ${textColor}`}>¥{amountJPY.toLocaleString()}</span>
              <span className={`text-sm ${textColor} ml-2`}>${amountUSD.toLocaleString()}</span>
            </div>
            {!isExportMode && (isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </div>
        </div>
      </div>
      
      {isExpanded && details && details.length > 0 && (
        <div className="bg-white border-t">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">日付</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">詳細</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">通貨</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">金額</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">円換算額</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">備考</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {details.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{item.date}</td>
                  <td className="px-3 py-3 text-sm text-gray-900">{item.detail}</td>
                  <td className="px-3 py-3 text-sm text-center text-gray-900">{item.currency || 'JPY'}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-gray-700 whitespace-nowrap">
                    {item.currency === 'JPY' || !item.currency ? 
                      `¥${item.originalAmount?.toLocaleString() || item.amountJPY.toLocaleString()}` : 
                      item.currency === 'USD' ?
                      `${item.originalAmount?.toLocaleString() || item.amountUSD.toLocaleString()}` :
                      item.currency === 'USDT' ?
                      `${item.originalAmount?.toLocaleString()} USDT` :
                      item.currency === 'AED' ?
                      `${item.originalAmount?.toLocaleString()} AED` :
                      `${item.originalAmount?.toLocaleString()} ${item.currency}`
                    }</td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-gray-700 whitespace-nowrap">
                    ¥{item.amountJPY.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600">{item.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ReportAndCashflowPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-06');
  const [reportData, setReportData] = useState(null);
  const [showApprovalSection, setShowApprovalSection] = useState(false);
  const [currency, setCurrency] = useState('both');
  const [comment, setComment] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isExportMode, setIsExportMode] = useState(false);

  // カテゴリ定義
  const incomeCategories = ['サイト収益', 'その他収益', '投資収益', '社債金利収益', 'その他投資収益'];
  const expenseCategories = ['法人支出', '個人支出', '立替分', '投資支出', 'その他支出'];
  const cashflowCategories = ['IN', 'OUT'];

  // ダミーデータ（ファイル管理・手入力から反映されたデータを想定）
  const [cashflowDetails] = useState({
    // 収支のINセクション（フロー種別でINを選択されたもののみ）
    income: [
      { date: '2025-06-03', category: 'サイト収益', detail: 'プラットフォームA - 5月分', currency: 'JPY', originalAmount: 15000000, amountJPY: 15000000, amountUSD: 100671, note: 'サイト広告収益' },
      { date: '2025-06-05', category: 'サイト収益', detail: 'プラットフォームB - 5月分', currency: 'JPY', originalAmount: 8500000, amountJPY: 8500000, amountUSD: 57047, note: 'サイトアフィリエイト' },
      { date: '2025-06-12', category: 'サイト収益', detail: 'プラットフォームC - 5月分', currency: 'JPY', originalAmount: 5000000, amountJPY: 5000000, amountUSD: 33557, note: 'サイト会員収益' },
      { date: '2025-06-10', category: '投資収益', detail: '米国株配当金', currency: 'USD', originalAmount: 16779, amountJPY: 2500000, amountUSD: 16779, note: 'AAPL配当' },
      { date: '2025-06-20', category: '投資収益', detail: '投資信託分配金', currency: 'JPY', originalAmount: 2000000, amountJPY: 2000000, amountUSD: 13423, note: 'インデックスファンド' },
      { date: '2025-06-15', category: '社債金利収益', detail: '社債利息', currency: 'JPY', originalAmount: 2000000, amountJPY: 2000000, amountUSD: 13423, note: '年率3％社債' },
      { date: '2025-06-18', category: 'その他収益', detail: '為替差益', currency: 'USD', originalAmount: 58248, amountJPY: 8678900, amountUSD: 58248, note: 'USD/JPY為替差益' },
      { date: '2025-06-25', category: 'その他収益', detail: '雑収入', currency: 'JPY', originalAmount: 2000000, amountJPY: 2000000, amountUSD: 13423, note: '返金・その他' }
    ],
    // 収支のOUTセクション（フロー種別でOUTを選択されたもののみ）
    expense: [
      { date: '2025-06-01', category: '法人支出', detail: '給与支払い', currency: 'JPY', originalAmount: 12000000, amountJPY: 12000000, amountUSD: 80537, note: '法人支出：月次給与' },
      { date: '2025-06-01', category: '法人支出', detail: 'オフィス賃料', currency: 'JPY', originalAmount: 3500000, amountJPY: 3500000, amountUSD: 23490, note: '東京オフィス' },
      { date: '2025-06-05', category: '法人支出', detail: '通信費・光熱費', currency: 'JPY', originalAmount: 800000, amountJPY: 800000, amountUSD: 5369, note: '月次固定費' },
      { date: '2025-06-08', category: '個人支出', detail: '生活費', currency: 'JPY', originalAmount: 500000, amountJPY: 500000, amountUSD: 3356, note: '個人生活費' },
      { date: '2025-06-15', category: '立替分', detail: '出張費用立替', currency: 'JPY', originalAmount: 300000, amountJPY: 300000, amountUSD: 2013, note: '大阪出張立替' },
      { date: '2025-06-10', category: '投資支出', detail: 'サーバー設備購入', currency: 'USD', originalAmount: 53691, amountJPY: 8000000, amountUSD: 53691, note: 'AWS費用' },
      { date: '2025-06-15', category: '投資支出', detail: 'システム開発費', currency: 'JPY', originalAmount: 4500000, amountJPY: 4500000, amountUSD: 30201, note: '新機能開発' },
      { date: '2025-06-20', category: 'その他支出', detail: '銀行借入返済', currency: 'JPY', originalAmount: 1644400, amountJPY: 1644400, amountUSD: 11034, note: '運転資金返済' }
    ],
    // キャッシュフローセクション（ファイル管理・手入力ページで登録された全ての項目）
    cashflow: [
      // フロー種別: IN
      { date: '2025-06-03', category: 'IN', detail: 'サイト収益: プラットフォームA - 5月分', currency: 'JPY', originalAmount: 15000000, amountJPY: 15000000, amountUSD: 100671, note: 'サイト広告収益' },
      { date: '2025-06-05', category: 'IN', detail: 'サイト収益: プラットフォームB - 5月分', currency: 'JPY', originalAmount: 8500000, amountJPY: 8500000, amountUSD: 57047, note: 'サイトアフィリエイト' },
      { date: '2025-06-12', category: 'IN', detail: 'サイト収益: プラットフォームC - 5月分', currency: 'JPY', originalAmount: 5000000, amountJPY: 5000000, amountUSD: 33557, note: 'サイト会員収益' },
      { date: '2025-06-10', category: 'IN', detail: '投資収益: 米国株配当金', currency: 'USD', originalAmount: 16779, amountJPY: 2500000, amountUSD: 16779, note: 'AAPL配当' },
      { date: '2025-06-20', category: 'IN', detail: '投資収益: 投資信託分配金', currency: 'JPY', originalAmount: 2000000, amountJPY: 2000000, amountUSD: 13423, note: 'インデックスファンド' },
      { date: '2025-06-15', category: 'IN', detail: '社債金利収益: 社債利息', currency: 'JPY', originalAmount: 2000000, amountJPY: 2000000, amountUSD: 13423, note: '年率3％社債' },
      { date: '2025-06-18', category: 'IN', detail: 'その他収益: 為替差益', currency: 'USD', originalAmount: 58248, amountJPY: 8678900, amountUSD: 58248, note: 'USD/JPY為替差益' },
      { date: '2025-06-25', category: 'IN', detail: 'その他収益: 雑収入', currency: 'JPY', originalAmount: 2000000, amountJPY: 2000000, amountUSD: 13423, note: '返金・その他' },
      // フロー種別: キャッシュフロー
      { date: '2025-06-02', category: 'IN', detail: '売掛金回収', currency: 'JPY', originalAmount: 10000000, amountJPY: 10000000, amountUSD: 67114, note: '4月分売掛金' },
      { date: '2025-06-07', category: 'IN', detail: '前受金受領', currency: 'JPY', originalAmount: 5000000, amountJPY: 5000000, amountUSD: 33557, note: '7月分前受' },
      { date: '2025-06-08', category: 'IN', detail: '資金移動: 三菱UFJ銀行 → Binance Wallet', currency: 'JPY', originalAmount: 5000000, amountJPY: 5000000, amountUSD: 33557, note: 'BTC購入用' },
      { date: '2025-06-22', category: 'IN', detail: '資金移動: 現金（大阪） → 三菱UFJ銀行', currency: 'JPY', originalAmount: 2000000, amountJPY: 2000000, amountUSD: 13423, note: '現金預入' },
      { date: '2025-06-21', category: 'IN', detail: 'その他投資収益: 貸付金回収', currency: 'JPY', originalAmount: 2000000, amountJPY: 2000000, amountUSD: 13423, note: '短期貸付回収' },
      // フロー種別: OUT
      { date: '2025-06-01', category: 'OUT', detail: '法人支出: 給与支払い', currency: 'JPY', originalAmount: 12000000, amountJPY: 12000000, amountUSD: 80537, note: '法人支出：月次給与' },
      { date: '2025-06-01', category: 'OUT', detail: '法人支出: オフィス賃料', currency: 'JPY', originalAmount: 3500000, amountJPY: 3500000, amountUSD: 23490, note: '東京オフィス' },
      { date: '2025-06-05', category: 'OUT', detail: '法人支出: 通信費・光熱費', currency: 'JPY', originalAmount: 800000, amountJPY: 800000, amountUSD: 5369, note: '月次固定費' },
      { date: '2025-06-08', category: 'OUT', detail: '個人支出: 生活費', currency: 'JPY', originalAmount: 500000, amountJPY: 500000, amountUSD: 3356, note: '個人生活費' },
      { date: '2025-06-15', category: 'OUT', detail: '立替分: 出張費用立替', currency: 'JPY', originalAmount: 300000, amountJPY: 300000, amountUSD: 2013, note: '大阪出張立替' },
      { date: '2025-06-10', category: 'OUT', detail: '投資支出: サーバー設備購入', currency: 'USD', originalAmount: 53691, amountJPY: 8000000, amountUSD: 53691, note: 'AWS費用' },
      { date: '2025-06-15', category: 'OUT', detail: '投資支出: システム開発費', currency: 'JPY', originalAmount: 4500000, amountJPY: 4500000, amountUSD: 30201, note: '新機能開発' },
      { date: '2025-06-20', category: 'OUT', detail: 'その他支出: 銀行借入返済', currency: 'JPY', originalAmount: 1644400, amountJPY: 1644400, amountUSD: 11034, note: '運転資金返済' },
      // フロー種別: キャッシュフロー
      { date: '2025-06-11', category: 'OUT', detail: '仕入れ支払い', currency: 'JPY', originalAmount: 8000000, amountJPY: 8000000, amountUSD: 53691, note: '商品仕入' },
      { date: '2025-06-16', category: 'OUT', detail: '外注費支払い', currency: 'JPY', originalAmount: 3000000, amountJPY: 3000000, amountUSD: 20134, note: '開発外注費' },
      { date: '2025-06-15', category: 'OUT', detail: '資金移動: ADCB口座 → 台新銀行', currency: 'AED', originalAmount: 73825, amountJPY: 3000000, amountUSD: 20134, note: '運転資金移動' },
      { date: '2025-06-28', category: 'OUT', detail: '資金移動: Ledger Wallet → Binance', currency: 'USDT', originalAmount: 10067, amountJPY: 1500000, amountUSD: 10067, note: 'USDT売却準備' },
      { date: '2025-06-26', category: 'OUT', detail: 'その他支出: 預り金返還', currency: 'JPY', originalAmount: 1500000, amountJPY: 1500000, amountUSD: 10067, note: '一時預り金返還' }
    ]
  });

  // カテゴリ別に集計
  const getCategoryTotals = (transactions, categories) => {
    const totals = {};
    categories.forEach(category => {
      const categoryTransactions = transactions.filter(t => t.category === category);
      totals[category] = {
        amountJPY: categoryTransactions.reduce((sum, t) => sum + t.amountJPY, 0),
        amountUSD: categoryTransactions.reduce((sum, t) => sum + t.amountUSD, 0),
        details: categoryTransactions
      };
    });
    return totals;
  };

  // 収支計算
  const calculateTotals = () => {
    const totalIncomeJPY = cashflowDetails.income.reduce((sum, item) => sum + item.amountJPY, 0);
    const totalIncomeUSD = cashflowDetails.income.reduce((sum, item) => sum + item.amountUSD, 0);
    const totalExpenseJPY = cashflowDetails.expense.reduce((sum, item) => sum + item.amountJPY, 0);
    const totalExpenseUSD = cashflowDetails.expense.reduce((sum, item) => sum + item.amountUSD, 0);
    const netProfitJPY = totalIncomeJPY - totalExpenseJPY;
    const netProfitUSD = totalIncomeUSD - totalExpenseUSD;
    
    return {
      totalIncomeJPY,
      totalIncomeUSD,
      totalExpenseJPY,
      totalExpenseUSD,
      netProfitJPY,
      netProfitUSD
    };
  };

  const totals = calculateTotals();
  const incomeCategoryTotals = getCategoryTotals(cashflowDetails.income, incomeCategories);
  const expenseCategoryTotals = getCategoryTotals(cashflowDetails.expense, expenseCategories);
  const cashflowCategoryTotals = getCategoryTotals(cashflowDetails.cashflow, cashflowCategories);

  // ダミーデータ生成（既存のレポートデータ）
  const generateReportData = () => {
    const data = {
      summary: {
        netProfit: totals.netProfitJPY,
        netProfitUSD: totals.netProfitUSD,
        cashBalance: 450325890,
        cashBalanceUSD: 3076925,
        totalRevenue: totals.totalIncomeJPY,
        totalRevenueUSD: totals.totalIncomeUSD,
        totalExpense: totals.totalExpenseJPY,
        totalExpenseUSD: totals.totalExpenseUSD,
        exchangeRate: 149
      }
    };
    setReportData(data);
  };

  useEffect(() => {
    generateReportData();
  }, [selectedPeriod]);

  const formatCurrency = (value, type = 'JPY') => {
    if (type === 'JPY') {
      return `¥${value.toLocaleString()}`;
    }
    return `$${value.toLocaleString()}`;
  };

  const handlePDFExport = async () => {
    // エクスポートモードをONにして全カテゴリを展開
    setIsExportMode(true);
    
    // 少し待機してDOMが更新されるのを待つ
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // ここで実際のPDF生成処理を実行
    alert('すべてのカテゴリを展開した状態でPDFファイルをダウンロードします');
    
    // エクスポートモードをOFFに戻す
    setIsExportMode(false);
  };

  const handleExcelExport = async () => {
    // エクスポートモードをONにして全カテゴリを展開
    setIsExportMode(true);
    
    // 少し待機してDOMが更新されるのを待つ
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // ここで実際のExcel生成処理を実行
    alert('すべてのカテゴリを展開した状態でExcelファイルをダウンロードします');
    
    // エクスポートモードをOFFに戻す
    setIsExportMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-gray-100" style={{ borderBottom: '1px solid #ccc' }}>
        <div className="flex items-center justify-between" style={{ height: '50px' }}>
          <div style={{ paddingLeft: '20px' }}>
            <h1 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 'bold' }}>資産管理システム</h1>
          </div>
          
          <nav className="flex items-center" style={{ paddingRight: '20px' }}>
            <a href="/" style={{ padding: '15px 18px', fontSize: '14px', fontWeight: '400', textDecoration: 'none', display: 'inline-block', position: 'relative', color: '#333' }} className="hover:bg-gray-200">
              ダッシュボード
            </a>
            <a href="/assets" className="hover:bg-gray-200" style={{ padding: '15px 18px', fontSize: '14px', fontWeight: '400', textDecoration: 'none', display: 'inline-block', position: 'relative', color: '#333' }}>
              資産管理
            </a>
            <a href="/files" className="hover:bg-gray-200" style={{ padding: '15px 18px', fontSize: '14px', fontWeight: '400', textDecoration: 'none', display: 'inline-block', position: 'relative', color: '#333' }}>
              ファイル管理
            </a>
            <a href="/manual-entry" className="hover:bg-gray-200" style={{ padding: '15px 18px', fontSize: '14px', fontWeight: '400', textDecoration: 'none', display: 'inline-block', position: 'relative', color: '#333' }}>
              手入力
            </a>
            <a href="/reports" style={{ padding: '15px 18px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', position: 'relative', color: 'white', backgroundColor: '#4a90e2', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
              レポート出力
            </a>
            <a href="/admin" className="hover:bg-gray-200" style={{ padding: '15px 18px', fontSize: '14px', fontWeight: '400', textDecoration: 'none', display: 'inline-block', position: 'relative', color: '#333' }}>
              管理者設定
            </a>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* ページタイトルとコントロール */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">レポート</h2>
              <p className="mt-1 text-sm text-gray-600">月次収支状況と詳細分析</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="both">円/ドル両方</option>
                <option value="JPY">円のみ</option>
                <option value="USD">ドルのみ</option>
              </select>
              <button
                onClick={handlePDFExport}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF出力
              </button>
              <button
                onClick={handleExcelExport}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel出力
              </button>
            </div>
          </div>
        </div>

        {reportData && (
          <>
            {/* 収支サマリー */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-700">今月の純利益</p>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totals.netProfitJPY)}</p>
                <p className="text-sm text-blue-700 mt-1">{formatCurrency(totals.netProfitUSD, 'USD')}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-purple-700">月末キャッシュ残高</p>
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(reportData.summary.cashBalance)}</p>
                <p className="text-sm text-purple-700 mt-1">{formatCurrency(reportData.summary.cashBalanceUSD, 'USD')}</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-700">IN合計</p>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.totalIncomeJPY)}</p>
                <p className="text-sm text-green-700 mt-1">{formatCurrency(totals.totalIncomeUSD, 'USD')}</p>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg shadow-sm border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-red-700">OUT合計</p>
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(totals.totalExpenseJPY)}</p>
                <p className="text-sm text-red-700 mt-1">{formatCurrency(totals.totalExpenseUSD, 'USD')}</p>
              </div>
            </div>

            {/* IN/OUT カテゴリ別表示 */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
                収支サマリー
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                {/* IN（収入）セクション */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    IN（収入）
                  </h3>
                  {incomeCategories.map(category => (
                    <CategorySummaryItem
                      key={category}
                      category={category}
                      amountJPY={incomeCategoryTotals[category].amountJPY}
                      amountUSD={incomeCategoryTotals[category].amountUSD}
                      details={incomeCategoryTotals[category].details}
                      type="income"
                      isExportMode={isExportMode}
                    />
                  ))}
                  <div className="mt-4 pt-4 border-t-2 border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-700">IN合計</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-700">¥{totals.totalIncomeJPY.toLocaleString()}</span>
                        <span className="text-sm text-green-700 ml-2">${totals.totalIncomeUSD.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* OUT（支出）セクション */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                    OUT（支出）
                  </h3>
                  {expenseCategories.map(category => (
                    <CategorySummaryItem
                      key={category}
                      category={category}
                      amountJPY={expenseCategoryTotals[category].amountJPY}
                      amountUSD={expenseCategoryTotals[category].amountUSD}
                      details={expenseCategoryTotals[category].details}
                      type="expense"
                      isExportMode={isExportMode}
                    />
                  ))}
                  <div className="mt-4 pt-4 border-t-2 border-red-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-red-700">OUT合計</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-red-700">¥{totals.totalExpenseJPY.toLocaleString()}</span>
                        <span className="text-sm text-red-700 ml-2">${totals.totalExpenseUSD.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* キャッシュフローセクション */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                キャッシュフロー
              </h3>
              
              {/* INとOUTを横並びに配置 */}
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* IN */}
                <div>
                  <CategorySummaryItem
                    category="IN"
                    amountJPY={cashflowCategoryTotals['IN'].amountJPY}
                    amountUSD={cashflowCategoryTotals['IN'].amountUSD}
                    details={cashflowCategoryTotals['IN'].details}
                    type="cashflow"
                    isExportMode={isExportMode}
                  />
                </div>
                
                {/* OUT */}
                <div>
                  <CategorySummaryItem
                    category="OUT"
                    amountJPY={cashflowCategoryTotals['OUT'].amountJPY}
                    amountUSD={cashflowCategoryTotals['OUT'].amountUSD}
                    details={cashflowCategoryTotals['OUT'].details}
                    type="cashflow"
                    isExportMode={isExportMode}
                  />
                </div>
              </div>
              
              <div className={`mt-4 pt-4 border-t-2 ${(cashflowCategoryTotals['IN'].amountJPY - cashflowCategoryTotals['OUT'].amountJPY) >= 0 ? 'border-blue-200' : 'border-red-200'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-bold ${(cashflowCategoryTotals['IN'].amountJPY - cashflowCategoryTotals['OUT'].amountJPY) >= 0 ? 'text-blue-700' : 'text-red-700'}`}>キャッシュフロー合計（IN - OUT）</span>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${(cashflowCategoryTotals['IN'].amountJPY - cashflowCategoryTotals['OUT'].amountJPY) >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      ¥{(cashflowCategoryTotals['IN'].amountJPY - cashflowCategoryTotals['OUT'].amountJPY).toLocaleString()}
                    </span>
                    <span className={`text-sm ${(cashflowCategoryTotals['IN'].amountUSD - cashflowCategoryTotals['OUT'].amountUSD) >= 0 ? 'text-blue-700' : 'text-red-700'} ml-2`}>
                      ${(cashflowCategoryTotals['IN'].amountUSD - cashflowCategoryTotals['OUT'].amountUSD).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* コメント・承認セクション */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">コメント・備考</h3>
                <button
                  onClick={() => setShowApprovalSection(!showApprovalSection)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showApprovalSection ? '承認欄を非表示' : '承認欄を表示'}
                </button>
              </div>
              
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="決算メモ、注記事項などをご記入ください..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              {showApprovalSection && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="approval"
                        checked={isApproved}
                        onChange={(e) => setIsApproved(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="approval" className="ml-2 text-sm text-gray-700">
                        このレポートを承認する
                      </label>
                    </div>
                    {isApproved && (
                      <div className="flex items-center text-green-600">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">承認済み</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 為替レート情報 */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>為替レート: 1 USD = {reportData.summary.exchangeRate} JPY（{selectedPeriod}月平均レート）</span>
              </div>
              <div className="mt-1">
                <span>データ取得元: 三菱UFJ銀行 / 最終更新: {new Date().toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ReportAndCashflowPage;