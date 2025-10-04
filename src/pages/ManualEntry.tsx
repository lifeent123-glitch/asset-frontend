import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  Plus, Search, Download, Upload, Edit, Trash2, 
  TrendingUp, TrendingDown, Save, Calendar, Filter, 
  ChevronDown, AlertCircle, Check, Copy, History, HelpCircle, X 
} from 'lucide-react';

const ManualInputPage = () => {
  // 選択状態
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [selectedCurrency, setSelectedCurrency] = useState('ALL');
  const [excludeFundTransfer, setExcludeFundTransfer] = useState(true);
  
  // INカテゴリ定義
  const inCategories = [
    '資金移動', 'サイト収益', 'その他収益', 
    '投資収益', '社債金利収益', 'その他投資収益', '立替費用'
  ];
  
  // OUTカテゴリ定義
  const outCategories = [
    '資金移動', '法人支出', '個人支出', 
    '立替費用', '投資支出', 'その他支出'
  ];
  
  // キャッシュフローカテゴリ定義
  const cashflowCategories = ['IN', 'OUT', 'その他'];
  
  // 通貨リスト
  const currencies = ['USDT', '円', 'AED', 'USD', 'IDR', 'NT$', 'ETH', 'WBTC'];
  
  const [transactions, setTransactions] = useState([]);

// 初期ロード＆月や通貨変更時に再取得
useEffect(() => {
  console.log('[manual-entry] useEffect fired with month:', selectedMonth, 'currency:', selectedCurrency); // ★追加

  const fetchTransactions = async () => {
    try {
      const url = `/api/manual-entry?month=${selectedMonth}&segment=total&currency=${selectedCurrency}&exclude_transfer=true`;
      console.log('[manual-entry] fetching:', url);  // ★追加
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('[manual-entry] rows:', Array.isArray(data.rows) ? data.rows.length : 'no rows'); // ★追加

      const rows = (data.rows || []).map((r: any) => ({
        id: Number(r.id),
        date: String(r.date).slice(0, 10),        // 'YYYY-MM-DD'
        account: r.account ?? '',
        type: r.type ?? 'IN',
        category: r.category_name ?? '',
        category_id: r.category_id ?? null,
        content: r.memo ?? '',
        amount: Number(r.amount ?? 0),
        currency: r.currency ?? 'JPY',
        rate: r.rate == null ? null : Number(r.rate),
        jpyAmount: Number(r.jpy_amount ?? 0),
        remarks: r.memo ?? '',
        segment: r.segment ?? 'total',
        status: 'confirmed',
      }));

      setTransactions(rows);
    } catch (err) {
      console.error('manual-entry fetch error', err);
    }
  };

  fetchTransactions();
}, [selectedMonth, selectedCurrency]);
  
  // 新規行の追加用テンプレート
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    account: '',
    type: 'IN',
    category: '',
    content: '',
    amount: '',
    currency: 'USDT',
    rate: 147.5,
    jpyAmount: 0,
    remarks: '',
    status: 'draft'
  });
  
  // 編集中の行ID
  const [editingId, setEditingId] = useState(null);
  
  // エラー状態
  const [errors, setErrors] = useState({});
  
  // Ref for input fields
  const accountInputRef = useRef(null);
  const amountInputRef = useRef(null);
  
  // CSVアップロード
  const fileInputRef = useRef(null);
  
  // ページロード時に口座名入力欄にフォーカス
  useEffect(() => {
    accountInputRef.current?.focus();
  }, []);
  
  // タイプに応じたカテゴリを取得
  const getCategoriesForType = (type) => {
    if (type === 'IN') return inCategories;
    if (type === 'OUT') return outCategories;
    if (type === 'キャッシュフロー') return cashflowCategories;
    return [];
  };
  
  // タイプのスタイルを取得
  const getTypeStyle = (type) => {
    if (type === 'IN') return 'bg-green-50 border-green-300 text-green-700';
    if (type === 'OUT') return 'bg-red-50 border-red-300 text-red-700';
    if (type === 'キャッシュフロー') return 'bg-blue-50 border-blue-300 text-blue-700';
    return '';
  };
  
  // タイプのバッジスタイルを取得
  const getTypeBadgeStyle = (type) => {
    if (type === 'IN') return 'bg-green-100 text-green-800';
    if (type === 'OUT') return 'bg-red-100 text-red-800';
    if (type === 'キャッシュフロー') return 'bg-blue-100 text-blue-800';
    return '';
  };
  
  // フィルタリング
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // 月フィルター
      if (transaction.date.substring(0, 7) !== selectedMonth) return false;
      
      // 通貨フィルター
      if (selectedCurrency !== 'ALL' && transaction.currency !== selectedCurrency) return false;
      
      return true;
    });
  }, [transactions, selectedMonth, selectedCurrency]);
  
  // 集計
  const summary = useMemo(() => {
    const result = {
      in: { total: 0, byCategory: {}, byCurrency: {} },
      out: { total: 0, byCategory: {}, byCurrency: {} },
      cashflow: { total: 0, byCategory: {}, byCurrency: {} },
      balance: 0
    };
    
    filteredTransactions.forEach(t => {
      // 資金移動を除外する設定の場合はスキップ
      if (excludeFundTransfer && t.category === '資金移動') return;
      
      if (t.type === 'IN') {
        result.in.total += t.jpyAmount;
        result.in.byCategory[t.category] = (result.in.byCategory[t.category] || 0) + t.jpyAmount;
        result.in.byCurrency[t.currency] = (result.in.byCurrency[t.currency] || 0) + t.amount;
      } else if (t.type === 'OUT') {
        result.out.total += t.jpyAmount;
        result.out.byCategory[t.category] = (result.out.byCategory[t.category] || 0) + t.jpyAmount;
        result.out.byCurrency[t.currency] = (result.out.byCurrency[t.currency] || 0) + t.amount;
      } else if (t.type === 'キャッシュフロー') {
        // キャッシュフローの場合、カテゴリがINならプラス、OUTならマイナスで計算
        if (t.category === 'IN') {
          result.cashflow.total += t.jpyAmount;
        } else if (t.category === 'OUT') {
          result.cashflow.total -= t.jpyAmount;
        }
        result.cashflow.byCategory[t.category] = (result.cashflow.byCategory[t.category] || 0) + t.jpyAmount;
        result.cashflow.byCurrency[t.currency] = (result.cashflow.byCurrency[t.currency] || 0) + t.amount;
      }
    });
    
    result.balance = result.in.total - result.out.total;
    return result;
  }, [filteredTransactions, excludeFundTransfer]);
  
  // 口座名の候補リスト
  const accountSuggestions = useMemo(() => {
    const accounts = new Set(transactions.map(t => t.account));
    return Array.from(accounts);
  }, [transactions]);
  
  // レート変更時の円換算
  const calculateJpyAmount = useCallback((amount, currency, rate) => {
    if (currency === '円') return amount;
    return Math.round(amount * rate);
  }, []);
  
  // 新規追加
  const handleAddTransaction = () => {
    const newErrors = {};
    
    // バリデーション
    if (!newTransaction.account.trim()) {
      newErrors.account = '口座名は必須です';
      accountInputRef.current?.focus();
    }
    
    if (!newTransaction.amount || Number(newTransaction.amount) <= 0) {
      newErrors.amount = '金額は必須です';
      if (!newErrors.account) {
        amountInputRef.current?.focus();
      }
    }
    
    if (!newTransaction.category) {
      newErrors.category = 'カテゴリを選択してください';
    }
    
    // エラーがある場合
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // エラーをクリア
    setErrors({});
    
    const jpyAmount = calculateJpyAmount(
      Number(newTransaction.amount), 
      newTransaction.currency, 
      Number(newTransaction.rate)
    );
    
    setTransactions([...transactions, {
      ...newTransaction,
      id: Date.now(),
      amount: Number(newTransaction.amount),
      rate: Number(newTransaction.rate),
      jpyAmount,
      status: 'confirmed'
    }]);
    
    // リセット（日付、type、currency、rateは保持）
    setNewTransaction({
      ...newTransaction,
      account: '',
      category: '',
      content: '',
      amount: '',
      remarks: ''
    });
    
    // 口座名入力欄にフォーカスを戻す
    accountInputRef.current?.focus();
  };
  
  // 編集
  const handleEdit = (id) => {
    setEditingId(id);
  };
  
  // 保存
  const handleSave = (id, updatedData) => {
    const jpyAmount = calculateJpyAmount(
      Number(updatedData.amount), 
      updatedData.currency, 
      Number(updatedData.rate)
    );
    
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, ...updatedData, jpyAmount } : t
    ));
    setEditingId(null);
  };
  
  // 削除
  const handleDelete = (id) => {
    if (confirm('このデータを削除してもよろしいですか？')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const uploadCsv = async (file: File) => {
    try {
      // 1) /api/csv-import へアップロード
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/csv-import', { method: 'POST', body: fd });
      if (!up.ok) throw new Error(await up.text());

      // 2) /api/csv-import/commit で確定
      const cm = await fetch('/api/csv-import/commit', { method: 'POST' });
      if (!cm.ok) throw new Error(await cm.text());

      // 3) 一覧を再取得（既存マッピングに合わせて成形）
      const q = `/api/manual-entry?month=${selectedMonth}&segment=total&currency=${selectedCurrency}&exclude_transfer=${excludeFundTransfer}`;
      const res = await fetch(q);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const rows = (data.rows || []).map((r: any) => ({
        id: Number(r.id),
        date: String(r.date).slice(0, 10),
        account: r.account ?? '',
        type: r.type ?? 'IN',
        category: r.category_name ?? '',
        category_id: r.category_id ?? null,
        content: r.memo ?? '',
        amount: Number(r.amount ?? 0),
        currency: r.currency ?? 'JPY',
        rate: r.rate == null ? null : Number(r.rate),
        jpyAmount: Number(r.jpy_amount ?? 0),
        remarks: r.memo ?? '',
        segment: r.segment ?? 'total',
        status: 'confirmed',
      }));

      setTransactions(rows);
      alert('CSV取り込みが完了しました。');
    } catch (e) {
      console.error('csv upload error', e);
      alert('CSV取り込みでエラーが発生しました。コンソールを確認してください。');
    } finally {
      if (fileInputRef.current) (fileInputRef as any).current.value = '';
    }
  };
  
  // 過去データのコピー
  const handleCopyTransaction = (transaction) => {
    setNewTransaction({
      ...newTransaction,
      account: transaction.account,
      type: transaction.type,
      category: transaction.category,
      content: transaction.content,
      currency: transaction.currency,
      rate: transaction.rate,
      // 金額と備考は空にする
      amount: '',
      remarks: ''
    });
    accountInputRef.current?.focus();
  };
  
  // CSVエクスポート
  const exportToCSV = () => {
    const headers = ['日付', '口座・ウォレット名', 'タイプ', 'カテゴリ', '内容', '金額', '通貨', 'レート', '円換算金額', '備考'];
    const csvData = filteredTransactions.map(t => [
      t.date,
      t.account,
      t.type,
      t.category,
      t.content,
      t.amount,
      t.currency,
      t.rate,
      t.jpyAmount,
      t.remarks
    ]);
    
    alert('CSV出力機能を実行します');
  };
  
  // 金額フォーマット
  const formatAmount = (amount, currency) => {
    if (currency === '円' || currency === 'NT$' || currency === 'IDR') {
      return amount.toLocaleString();
    }
    return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
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

      {/* メインコンテンツ */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ページタイトル */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">手入力</h2>
          <p className="mt-1 text-sm text-gray-500">IN/OUT/キャッシュフローの収支データを登録・確認・修正・集計</p>
        </div>

        {/* 操作バー */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* 左側：月・通貨選択 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 月選択 */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {/* ▼ ここを 7月を先頭にして追加 */}
                  <option value="2025-07">2025年7月</option>
                  <option value="2025-06">2025年6月</option>
                  <option value="2025-05">2025年5月</option>
                  <option value="2025-04">2025年4月</option>
                </select>
              </div>
              
              {/* 通貨フィルター */}
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">全通貨</option>
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              
              {/* 資金移動除外 */}
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={excludeFundTransfer}
                  onChange={(e) => setExcludeFundTransfer(e.target.checked)}
                  className="mr-2 rounded border-gray-300"
                />
                資金移動を除外
              </label>
            </div>
            
            {/* 右側：アクションボタン */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                CSVアップロード
              </button>
              
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                CSVダウンロード
              </button>
              
              <input
  ref={fileInputRef}
  type="file"
  accept=".csv"
  className="hidden"
  onChange={(e) => {
    const f = e.target.files?.[0];
    if (f) uploadCsv(f);
  }}
/>
            </div>
          </div>
        </div>

        {/* サマリー情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  IN（収入）
                  {excludeFundTransfer && <span className="text-xs">※資金移動除外</span>}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ¥{summary.in.total.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">OUT（支出）</p>
                <p className="text-2xl font-bold text-red-600">
                  ¥{summary.out.total.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">キャッシュフロー</p>
                <p className={`text-2xl font-bold ${summary.cashflow.total >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ¥{summary.cashflow.total.toLocaleString()}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full ${summary.cashflow.total >= 0 ? 'bg-blue-100' : 'bg-orange-100'} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${summary.cashflow.total >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  CF
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">収支差額</p>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ¥{summary.balance.toLocaleString()}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full ${summary.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {summary.balance >= 0 ? '+' : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* データテーブル */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* 新規入力行 */}
          <div className="bg-blue-50 p-4 border-b-2 border-blue-200 relative">
            <div className="absolute top-2 right-2">
              <button
                className="text-blue-600 hover:text-blue-800"
                title="必須項目: 口座名、金額、カテゴリ&#10;Enterキーで追加"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-1">
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              
              <div className="col-span-2">
                <input
                  ref={accountInputRef}
                  type="text"
                  value={newTransaction.account}
                  onChange={(e) => {
                    setNewTransaction({...newTransaction, account: e.target.value});
                    if (errors.account) setErrors({...errors, account: ''});
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTransaction()}
                  placeholder="口座・ウォレット名"
                  list="account-suggestions"
                  className={`w-full px-2 py-1 text-sm border rounded ${
                    errors.account ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <datalist id="account-suggestions">
                  {accountSuggestions.map((account, index) => (
                    <option key={index} value={account} />
                  ))}
                </datalist>
                {errors.account && (
                  <p className="text-xs text-red-500 mt-1">{errors.account}</p>
                )}
              </div>
              
              <div className="col-span-1">
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({
                    ...newTransaction, 
                    type: e.target.value,
                    category: '' // カテゴリをリセット
                  })}
                  className={`w-full px-2 py-1 text-sm border rounded font-medium ${getTypeStyle(newTransaction.type)}`}
                >
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="キャッシュフロー">キャッシュフロー</option>
                </select>
              </div>
              
              <div className="col-span-1">
                <select
                  value={newTransaction.category}
                  onChange={(e) => {
                    setNewTransaction({...newTransaction, category: e.target.value});
                    if (errors.category) setErrors({...errors, category: ''});
                  }}
                  className={`w-full px-2 py-1 text-sm border rounded ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">カテゴリ選択</option>
                  {getCategoriesForType(newTransaction.type).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                )}
              </div>
              
              <div className="col-span-2">
                <input
                  type="text"
                  value={newTransaction.content}
                  onChange={(e) => setNewTransaction({...newTransaction, content: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTransaction()}
                  placeholder="内容"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              
              <div className="col-span-1">
                <input
                  ref={amountInputRef}
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => {
                    setNewTransaction({...newTransaction, amount: e.target.value});
                    if (errors.amount) setErrors({...errors, amount: ''});
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTransaction()}
                  placeholder="金額"
                  className={`w-full px-2 py-1 text-sm border rounded ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.amount && (
                  <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                )}
                {/* リアルタイム円換算表示 */}
                {newTransaction.amount && newTransaction.currency !== '円' && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ ¥{calculateJpyAmount(Number(newTransaction.amount), newTransaction.currency, Number(newTransaction.rate)).toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="col-span-1">
                <select
                  value={newTransaction.currency}
                  onChange={(e) => {
                    const newCurrency = e.target.value;
                    setNewTransaction({
                      ...newTransaction, 
                      currency: newCurrency,
                      rate: newCurrency === '円' ? 1 : 147.5
                    });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-1">
                <input
                  type="number"
                  value={newTransaction.rate}
                  onChange={(e) => setNewTransaction({...newTransaction, rate: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTransaction()}
                  placeholder="レート"
                  step="0.01"
                  min="0.01"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  disabled={newTransaction.currency === '円'}
                />
                {newTransaction.rate === 1 && newTransaction.currency !== '円' && (
                  <p className="text-xs text-orange-500 mt-1">レート確認</p>
                )}
              </div>
              
              <div className="col-span-1">
                <input
                  type="text"
                  value={newTransaction.remarks}
                  onChange={(e) => setNewTransaction({...newTransaction, remarks: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTransaction()}
                  placeholder="備考"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              
              <div className="col-span-1">
                <button
                  onClick={handleAddTransaction}
                  className="w-full px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  title="データを追加 (Enter)"
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
            
            {/* エラーサマリー */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  入力内容を確認してください
                </p>
              </div>
            )}
          </div>

          {/* テーブルヘッダー */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    口座・ウォレット
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    内容
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    通貨
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    レート
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    円換算
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    備考
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className={`hover:bg-gray-50 ${
                      transaction.category === '資金移動' 
                        ? 'bg-gray-50/50 opacity-75' 
                        : transaction.type === 'IN' 
                        ? 'bg-green-50/30' 
                        : transaction.type === 'OUT'
                        ? 'bg-red-50/30'
                        : 'bg-blue-50/30'
                    }`}
                  >
                    {editingId === transaction.id ? (
                      // 編集モード
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            defaultValue={transaction.date}
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            defaultValue={transaction.account}
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeStyle(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <select className="w-full px-2 py-1 text-sm border rounded">
                            <option>{transaction.category}</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            defaultValue={transaction.content}
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            defaultValue={transaction.amount}
                            className="w-full px-2 py-1 text-sm border rounded text-right"
                          />
                        </td>
                        <td className="px-4 py-2 text-center text-sm">
                          {transaction.currency}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            defaultValue={transaction.rate}
                            className="w-full px-2 py-1 text-sm border rounded text-right"
                          />
                        </td>
                        <td className="px-4 py-2 text-right text-sm">
                          ¥{transaction.jpyAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            defaultValue={transaction.remarks}
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSave(transaction.id, transaction)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // 表示モード
                      <>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {transaction.date}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.account}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeStyle(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {transaction.category === '資金移動' && (
                              <span className="mr-1 text-blue-500">⇄</span>
                            )}
                            {transaction.category}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {transaction.content}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                          <span className={
                            transaction.type === 'IN' ? 'text-green-600' : 
                            transaction.type === 'OUT' ? 'text-red-600' : 
                            transaction.type === 'キャッシュフロー' && transaction.category === 'OUT' ? 'text-orange-600' :
                            'text-blue-600'
                          }>
                            {formatAmount(transaction.amount, transaction.currency)}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900">
                          {transaction.currency}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          {transaction.currency !== '円' ? transaction.rate : '-'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          ¥{transaction.jpyAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {transaction.remarks || '-'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleCopyTransaction(transaction)}
                              className="text-gray-600 hover:text-gray-900"
                              title="コピー"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(transaction.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="編集"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="text-red-600 hover:text-red-900"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">該当するデータがありません</p>
            </div>
          )}
        </div>

        {/* カテゴリ別集計 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* INカテゴリ別 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              IN カテゴリ別集計
            </h3>
            <div className="space-y-2">
              {Object.entries(summary.in.byCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category}</span>
                  <span className="text-sm font-medium text-green-600">
                    ¥{amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* OUTカテゴリ別 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
              OUT カテゴリ別集計
            </h3>
            <div className="space-y-2">
              {Object.entries(summary.out.byCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category}</span>
                  <span className="text-sm font-medium text-red-600">
                    ¥{amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* キャッシュフローカテゴリ別 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-blue-600">CF</span>
              </div>
              キャッシュフロー カテゴリ別集計
            </h3>
            <div className="space-y-2">
              {Object.entries(summary.cashflow.byCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category}</span>
                  <span className={`text-sm font-medium ${
                    category === 'IN' ? 'text-blue-600' : 
                    category === 'OUT' ? 'text-orange-600' : 
                    'text-gray-600'
                  }`}>
                    ¥{amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManualInputPage;