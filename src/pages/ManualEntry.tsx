// src/pages/ManualEntry.tsx
import { byFlow, normalizeCategory2, Category2Def, toName as cat2Name } from '../../shared/category2';
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Plus, Search, Download, Upload, Edit, Trash2,
  TrendingUp, TrendingDown, Save, Calendar, Filter,
  ChevronDown, AlertCircle, Check, Copy, History, HelpCircle, X
} from 'lucide-react';
import Header from "../components/Header";

// カテゴリ1（資産種類）— 一旦ここで定義（後で shared/categories.ts に移設）
const CATEGORY1_OPTIONS = [
  "現金",
  "銀行口座",
  "仮想通貨",
  "社債",
  "不動産",
  "株式",
  "定期預金",
  "事業投資",
] as const;

// --- 型定義（手入力の1行分のデータ）---
type Transaction = {
  id: number;
  date: string;  // YYYY-MM-DD
  account: string;
  type: 'IN' | 'OUT' | 'キャッシュフロー';
  category: string;        // カテゴリ1（資産種類）
  content: string;
  amount: number;
  currency: string;
  rate: number | null;
  jpyAmount: number;
  status: 'confirmed' | 'draft';
  segment?: '法人資産' | '個人資産' | '法人投資' | '個人投資';
  category2?: string;      // カテゴリ2（収益／支出の細目：key）
};
// ---------------------------------------

const ManualInputPage = () => {
  // --- カテゴリ2：選択状態＆選択肢ロジック（INを初期値）
  const [entryType, setEntryType] = useState<'IN' | 'OUT'>('IN');
  const [category2Key, setCategory2Key] = useState<string>('');   // 保存用キー（例: 'site_revenue'）
  const category2Options = useMemo(() => byFlow(entryType), [entryType]);

  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [selectedCurrency, setSelectedCurrency] = useState('ALL');
  const [excludeFundTransfer, setExcludeFundTransfer] = useState(true);

  // 参考用（使用はしていない：UIからはCATEGORY1_OPTIONS/カテゴリ2を利用）
  const inCategories = [
    '資金移動', 'サイト収益', 'その他収益',
    '投資収益', '社債金利収益', 'その他投資収益', '立替費用'
  ];
  const outCategories = [
    '資金移動', '法人支出', '個人支出',
    '立替費用', '投資支出', 'その他支出'
  ];
  const cashflowCategories = ['IN', 'OUT', 'その他'];

  const currencies = ['USDT', '円', 'AED', 'USD', 'IDR', 'NT$', 'ETH', 'WBTC'];

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 初期ロード＆月や通貨変更時に再取得
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const url = `/api/manual-entry?month=${selectedMonth}&segment=total&currency=${selectedCurrency}&exclude_transfer=true`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const rows = (data.rows || []).map((r: any) => {
  // ★ 補正：category_name がカテゴリ2語彙なら category2 に回す
  const rawCat1 = r.category_name ?? '';
  const detectedCat2 = normalizeCategory2(rawCat1); // key が返ればカテゴリ2語彙

  return {
    id: Number(r.id),
    date: String(r.date).slice(0, 10),
    account: r.account ?? '',
    type: r.type ?? 'IN',
    // cat2語彙が検出されたらカテゴリ1は空にし、カテゴリ2へ回す
    category: detectedCat2 ? '' : rawCat1,
    category2: (r.category2_name ?? r.category2 ?? (detectedCat2 ?? '')),
    category_id: r.category_id ?? null,
    content: r.memo ?? '',
    amount: Number(r.amount ?? 0),
    currency: r.currency ?? 'JPY',
    rate: r.rate == null ? null : Number(r.rate),
    jpyAmount: Number(r.jpy_amount ?? 0),
    remarks: r.memo ?? '',
    segment: r.segment ?? 'total',
    status: 'confirmed',
  };
});

        setTransactions(rows);
      } catch (err) {
        console.error('manual-entry fetch error', err);
      }
    };

    fetchTransactions();
  }, [selectedMonth, selectedCurrency]);

  // 新規行の追加用テンプレート
  const [newTransaction, setNewTransaction] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    account: '',
    type: 'IN',
    category: '',
    category2: '',
    content: '',
    amount: '',
    currency: 'USDT',
    rate: 147.5,
    jpyAmount: 0,
    status: 'draft',
    segment: "法人資産",
  });

  // 編集中の行ID
  const [editingId, setEditingId] = useState<number | null>(null);

  // エラー状態
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ref for input fields
  const accountInputRef = useRef<HTMLInputElement | null>(null);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  // 英→日 表示ラベル
  const segLabel = (s?: string) => {
    switch (s) {
      case "corporate":         return "法人資産";
      case "personal":          return "個人資産";
      case "corporate_invest":  return "法人投資";
      case "personal_invest":   return "個人投資";
      default:                  return "—";
    }
  };

  // 日本語→英語コード（DB/内部保存用）
  const segCode = (label?: string) => {
    switch (label) {
      case "法人資産":     return "corporate";
      case "個人資産":     return "personal";
      case "法人投資":     return "corporate_invest";
      case "個人投資":     return "personal_invest";
      // すでに英語コードならそのまま通す
      case "corporate":
      case "personal":
      case "corporate_invest":
      case "personal_invest":
        return label;
      default:
        return undefined;
    }
  };

  // CSVアップロード
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ページロード時に口座名入力欄にフォーカス
  useEffect(() => {
    accountInputRef.current?.focus();
  }, []);

  // タイプに応じたカテゴリ（旧）：未使用
  const getCategoriesForType = (type: string) => {
    if (type === 'IN') return inCategories;
    if (type === 'OUT') return outCategories;
    if (type === 'キャッシュフロー') return cashflowCategories;
    return [];
  };

  // タイプのスタイル
  const getTypeStyle = (type: string) => {
    if (type === 'IN') return 'bg-green-50 border-green-300 text-green-700';
    if (type === 'OUT') return 'bg-red-50 border-red-300 text-red-700';
    if (type === 'キャッシュフロー') return 'bg-blue-50 border-blue-300 text-blue-700';
    return '';
  };

  // タイプのバッジスタイル
  const getTypeBadgeStyle = (type: string) => {
    if (type === 'IN') return 'bg-green-100 text-green-800';
    if (type === 'OUT') return 'bg-red-100 text-red-800';
    if (type === 'キャッシュフロー') return 'bg-blue-100 text-blue-800';
    return '';
  };

  // フィルタリング
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      if (transaction.date.substring(0, 7) !== selectedMonth) return false;
      if (selectedCurrency !== 'ALL' && transaction.currency !== selectedCurrency) return false;
      return true;
    });
  }, [transactions, selectedMonth, selectedCurrency]);

  // 集計
  const summary = useMemo(() => {
    const result: any = {
      in: { total: 0, byCategory: {} as Record<string, number>, byCurrency: {} as Record<string, number> },
      out: { total: 0, byCategory: {} as Record<string, number>, byCurrency: {} as Record<string, number> },
      cashflow: { total: 0, byCategory: {} as Record<string, number>, byCurrency: {} as Record<string, number> },
      balance: 0
    };

    filteredTransactions.forEach(t => {
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
        if (t.category === 'IN') result.cashflow.total += t.jpyAmount;
        else if (t.category === 'OUT') result.cashflow.total -= t.jpyAmount;

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
  const calculateJpyAmount = useCallback((amount: number, currency: string, rate: number) => {
    if (currency === '円') return amount;
    return Math.round(amount * rate);
  }, []);

  // 新規追加
  const handleAddTransaction = () => {
    const newErrors: Record<string, string> = {};

    if (!newTransaction.account.trim()) {
      newErrors.account = '口座名は必須です';
      accountInputRef.current?.focus();
    }
    if (!newTransaction.amount || Number(newTransaction.amount) <= 0) {
      newErrors.amount = '金額は必須です';
      if (!newErrors.account) amountInputRef.current?.focus();
    }
    if (!newTransaction.category) {
      newErrors.category = 'カテゴリを選択してください';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
      status: 'confirmed',
      segment: segCode(newTransaction.segment),
    }]);

    setNewTransaction({
      ...newTransaction,
      account: '',
      category: '',
      content: '',
      amount: '',
      memo: '',
      segment: "法人資産",
    });

    accountInputRef.current?.focus();
  };

  // 編集
  const handleEdit = (id: number) => setEditingId(id);

  // 保存
  const handleSave = (id: number, updatedData: any) => {
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
  const handleDelete = (id: number) => {
    if (confirm('このデータを削除してもよろしいですか？')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // CSVアップロード
  const uploadCsv = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/csv-import', { method: 'POST', body: fd });
      if (!up.ok) throw new Error(await up.text());

      const cm = await fetch('/api/csv-import/commit', { method: 'POST' });
      if (!cm.ok) throw new Error(await cm.text());

      const q = `/api/manual-entry?month=${selectedMonth}&segment=total&currency=${selectedCurrency}&exclude_transfer=${excludeFundTransfer}`;
      const res = await fetch(q);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const rows = (data.rows || []).map((r: any) => {
  // ★ 補正：category_name がカテゴリ2語彙なら category2 に回す
  const rawCat1 = r.category_name ?? '';
  const detectedCat2 = normalizeCategory2(rawCat1); // key が返ればカテゴリ2語彙

  return {
    id: Number(r.id),
    date: String(r.date).slice(0, 10),
    account: r.account ?? '',
    type: r.type ?? 'IN',
    // cat2語彙が検出されたらカテゴリ1は空にし、カテゴリ2へ回す
    category: detectedCat2 ? '' : rawCat1,
    category2: (r.category2_name ?? r.category2 ?? (detectedCat2 ?? '')),
    category_id: r.category_id ?? null,
    content: r.memo ?? '',
    amount: Number(r.amount ?? 0),
    currency: r.currency ?? 'JPY',
    rate: r.rate == null ? null : Number(r.rate),
    jpyAmount: Number(r.jpy_amount ?? 0),
    remarks: r.memo ?? '',
    segment: r.segment ?? 'total',
    status: 'confirmed',
  };
});

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
  const handleCopyTransaction = (transaction: Transaction) => {
    setNewTransaction({
      ...newTransaction,
      account: transaction.account,
      type: transaction.type,
      category: transaction.category,
      content: transaction.content,
      currency: transaction.currency,
      rate: transaction.rate,
      amount: '',
      memo: ''
    });
    accountInputRef.current?.focus();
  };

  // CSVエクスポート（カテゴリ2列を含む）
  const exportToCSV = () => {
    const headers = [
      "日付","口座・ウォレット名","区分","タイプ","カテゴリ","カテゴリ2","内容","金額","通貨","レート","円換算金額"
    ];

    // CSV用のエスケープ処理（カンマ・改行・ダブルクォート対応）
    const esc = (v: any) => {
      const s = String(v ?? "");
      if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const rows = filteredTransactions.map(t => ([
      t.date,
      t.account,
      t.segment ?? "",
      t.type,
      t.category,
      t.category2 ?? "",
      t.content,
      t.amount,
      t.currency,
      t.rate ?? "",
      t.jpyAmount
    ].map(esc).join(",")));

    const csv = [headers.map(esc).join(","), ...rows].join("\r\n");
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `manual-entry_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // 金額フォーマット
  const formatAmount = (amount: number, currency: string) => {
    if (currency === '円' || currency === 'NT$' || currency === 'IDR') {
      return amount.toLocaleString();
    }
    return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 共通ヘッダー */}
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* タイトル */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">手入力</h2>
          <p className="mt-1 text-sm text-gray-500">IN/OUT/キャッシュフローの収支データを登録・確認・修正・集計</p>
        </div>

        {/* 操作バー */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* 左側：月・通貨・資金移動除外 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 月選択 */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  min="2025-01"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
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

            {/* 右側：CSV */}
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

        {/* サマリー4枚 */}
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
                <span className={`text-xs font-bold ${summary.cashflow.total >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>CF</span>
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

        {/* 入力行（新規追加） */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* 日付 */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">日付</label>
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            {/* 口座・ウォレット名 */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">口座・ウォレット名</label>
              <input
                ref={accountInputRef}
                value={newTransaction.account}
                onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}
                list="account-suggest"
                className={`w-full border rounded px-3 py-2 text-sm ${errors.account ? 'border-red-400' : ''}`}
                placeholder="例：三井住友 A口座 / Binance 等"
              />
              <datalist id="account-suggest">
                {accountSuggestions.map(a => <option key={a} value={a} />)}
              </datalist>
              {errors.account && <p className="text-xs text-red-500 mt-1">{errors.account}</p>}
            </div>

            {/* タイプ */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">タイプ</label>
              <select
                value={newTransaction.type}
                onChange={(e) => {
                  const newType = e.target.value as 'IN' | 'OUT' | 'キャッシュフロー';
                  setNewTransaction({ ...newTransaction, type: newType, category: '' });
                  if (newType === 'IN' || newType === 'OUT') {
                    setEntryType(newType);   // カテゴリ2の候補切り替え
                    setCategory2Key('');     // 前回の選択をリセット
                  }
                }}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="IN">IN（収入）</option>
                <option value="OUT">OUT（支出）</option>
                <option value="キャッシュフロー">キャッシュフロー</option>
              </select>
            </div>

            {/* 区分 */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">区分</label>
              <select
                value={newTransaction.segment}
                onChange={(e) => setNewTransaction({ ...newTransaction, segment: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="法人資産">法人資産</option>
                <option value="個人資産">個人資産</option>
                <option value="法人投資">法人投資</option>
                <option value="個人投資">個人投資</option>
              </select>
            </div>

            {/* カテゴリ1/カテゴリ2 横並び行（ここが今回の改善点） */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 左：カテゴリ（資産種類） */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  {CATEGORY1_OPTIONS.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* 右：カテゴリ2（IN/OUT連動） */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">カテゴリ2（収益／支出）</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={category2Key}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCategory2Key(value);
                    setNewTransaction({ ...newTransaction, category2: value });
                  }}
                  disabled={newTransaction.type === 'キャッシュフロー'}
                >
                  <option value="">選択してください</option>
                  {category2Options.map((opt) => (
                    <option key={opt.key} value={opt.key}>{opt.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 内容 */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">内容</label>
              <input
                value={newTransaction.content}
                onChange={(e) => setNewTransaction({ ...newTransaction, content: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="メモ・摘要"
              />
            </div>

            {/* 金額 */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">金額</label>
              <input
                ref={amountInputRef}
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                className={`w-full border rounded px-3 py-2 text-sm text-right ${errors.amount ? 'border-red-400' : ''}`}
                placeholder="0"
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>

            {/* 通貨 */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">通貨</label>
              <select
                value={newTransaction.currency}
                onChange={(e) => setNewTransaction({ ...newTransaction, currency: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* レート */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">レート</label>
              <input
                type="number"
                step="0.0001"
                value={newTransaction.rate}
                onChange={(e) => setNewTransaction({ ...newTransaction, rate: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm text-right"
                placeholder="0.0"
              />
            </div>

            {/* 追加ボタン */}
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={handleAddTransaction}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                title="明細を1行追加"
              >
                追加
              </button>
            </div>
          </div>
        </div>

        {/* 取引一覧テーブル */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">日付</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">口座</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">区分</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">タイプ</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">カテゴリ</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">内容</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">金額</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">通貨</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">円換算</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm">{t.date}</td>
                  <td className="px-3 py-2 text-sm">{t.account || <span className="text-gray-400">—</span>}</td>
                  <td className="px-3 py-2 text-sm">{segLabel(t.segment)}</td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeBadgeStyle(t.type)}`}>{t.type}</span>
                  </td>
                  <td className="px-3 py-2 text-sm">
  <div className="flex items-center gap-1 flex-wrap">
    {/* カテゴリ1（資産種類） */}
    {t.category ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {t.category}
      </span>
    ) : (
      <span className="text-gray-400">—</span>
    )}

    {/* カテゴリ2（収益／支出） */}
{t.category2 ? (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
    {cat2Name(t.category2 as any)}
  </span>
) : null}
  </div>
</td>
                  <td className="px-3 py-2 text-sm">{t.content || <span className="text-gray-400">—</span>}</td>
                  <td className="px-3 py-2 text-sm text-right">{formatAmount(t.amount, t.currency)}</td>
                  <td className="px-3 py-2 text-sm">{t.currency}</td>
                  <td className="px-3 py-2 text-sm text-right">¥{t.jpyAmount.toLocaleString()}</td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 border rounded text-xs hover:bg-gray-100"
                        onClick={() => handleCopyTransaction(t)}
                        title="この行を新規入力にコピー"
                      >
                        コピー
                      </button>
                      <button
                        className="px-2 py-1 border rounded text-xs hover:bg-red-50 text-red-600"
                        onClick={() => handleDelete(t.id)}
                        title="削除"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-sm text-gray-500">
                    明細はまだありません。上の入力欄から追加するか、CSVをアップロードしてください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* カテゴリ別集計（非表示） */}
        {/*
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          ...
        </div>
        */}
      </main>
    </div>
  );
};

export default ManualInputPage;