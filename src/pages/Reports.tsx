import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar, Download, FileText, Search, ArrowUpRight, ArrowDownRight, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import Header from "../components/Header";

/* =========================
 * 型定義
 * ========================= */
type Flow = 'IN' | 'OUT' | 'キャッシュフロー';
type Segment = 'corporate' | 'personal' | 'total';
type Currency = 'JPY' | 'USD' | 'AED' | 'NTD' | 'USDT' | 'USDC';

interface ReportRow {
  id: string;
  date: string;            // YYYY-MM-DD
  segment: Segment;        // 'corporate' | 'personal' | 'total'
  account: string;
  category: string;
  type: Flow;
  description?: string;
  currency: Currency;
  amount: number;          // 元通貨の金額
  jpyAmount: number;       // 円換算
  usdAmount?: number;      // ドル換算（任意）
}

interface ApiListResponse<T> {
  status: 'ok' | 'error';
  data: T;
  message?: string;
}

interface ReportPayload {
  rows: ReportRow[];
}

/* =========================
 * ユーティリティ
 * ========================= */
const toCSV = (headers: string[], rows: (string | number)[][]) => {
  const esc = (v: string | number) =>
    typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))
      ? `"${v.replace(/"/g, '""')}"`
      : v;
  const body = [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
  return new Blob([body], { type: 'text/csv;charset=utf-8' });
};

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const fmt = (n: number, locale: 'ja-JP' | 'en-US' = 'ja-JP', frac = 0) =>
  n.toLocaleString(locale, { minimumFractionDigits: frac, maximumFractionDigits: frac });

/* =========================
 * メイン
 * ========================= */
const Reports: React.FC = () => {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [segment, setSegment] = useState<Segment>('total');
  const [query, setQuery] = useState<string>('');
  const [showAmounts, setShowAmounts] = useState<boolean>(true);
  const [currencyView, setCurrencyView] = useState<'jpy' | 'usd' | 'both'>('both');

  // 取得（APIがなければ空で安全動作）
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        // 想定API：/api/reports?month=YYYY-MM&segment=total|corporate|personal
        const qs = new URLSearchParams({ month, segment });
        const res = await fetch(`/api/reports?${qs.toString()}`, { signal: ac.signal });
        if (!res.ok) { setRows([]); return; }
        const json = (await res.json()) as ApiListResponse<ReportPayload>;
        const list = Array.isArray(json?.data?.rows) ? json.data.rows : [];
        setRows(list);
      } catch {
        setRows([]); // 取得失敗時も空で表示
      }
    })();
    return () => ac.abort();
  }, [month, segment]);

  // フィルタリング
  const filtered = useMemo(() => {
    const key = query.trim().toLowerCase();
    return rows
      .filter(r => (segment === 'total' ? true : r.segment === segment))
      .filter(r =>
        key === '' ||
        r.account.toLowerCase().includes(key) ||
        r.category.toLowerCase().includes(key) ||
        (r.description ?? '').toLowerCase().includes(key)
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rows, query, segment]);

  // 集計
  const totals = useMemo(() => {
    const inJPY  = filtered.filter(r => r.type === 'IN').reduce((s, r) => s + r.jpyAmount, 0);
    const outJPY = filtered.filter(r => r.type === 'OUT').reduce((s, r) => s + r.jpyAmount, 0);
    const cfJPY  = filtered.filter(r => r.type === 'キャッシュフロー').reduce((s, r) => s + r.jpyAmount, 0);
    const netJPY = inJPY - outJPY;

    const inUSD  = filtered.filter(r => r.type === 'IN').reduce((s, r) => s + (r.usdAmount ?? 0), 0);
    const outUSD = filtered.filter(r => r.type === 'OUT').reduce((s, r) => s + (r.usdAmount ?? 0), 0);
    const cfUSD  = filtered.filter(r => r.type === 'キャッシュフロー').reduce((s, r) => s + (r.usdAmount ?? 0), 0);
    const netUSD = inUSD - outUSD;

    return { inJPY, outJPY, cfJPY, netJPY, inUSD, outUSD, cfUSD, netUSD };
  }, [filtered]);

  // エクスポート（CSV / Excel相当）
  const onExport = (kind: 'CSV' | 'Excel') => {
    const headers = [
      'date','segment','account','category','type','currency','amount','jpyAmount','usdAmount','description'
    ];
    const data = filtered.map(r => ([
      r.date, r.segment, r.account, r.category, r.type, r.currency,
      r.amount, r.jpyAmount, r.usdAmount ?? '', r.description ?? ''
    ]));
    const blob = toCSV(headers, data);
    const name = `report_${month}_${segment}.${kind === 'CSV' ? 'csv' : 'xlsx'}`;
    // Excel相当はCSVで出力（拡張子だけ.xlsxにしてもExcelで開けます）
    saveBlob(blob, name);
  };

  return (
    <div className="min-h-screen bg-gray-50">
    {/* 共通ヘッダー */}
    <Header />

      {/* 条件バー */}
      <div className="bg-white border-b px-6 py-4 sticky top-[48px] z-30">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value as Segment)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="total">総合</option>
            <option value="corporate">法人</option>
            <option value="personal">個人</option>
          </select>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrencyView('jpy')}
              className={`px-3 py-1 rounded text-sm ${currencyView === 'jpy' ? 'bg-white shadow-sm' : ''}`}
            >
              円
            </button>
            <button
              onClick={() => setCurrencyView('usd')}
              className={`px-3 py-1 rounded text-sm ${currencyView === 'usd' ? 'bg-white shadow-sm' : ''}`}
            >
              $
            </button>
            <button
              onClick={() => setCurrencyView('both')}
              className={`px-3 py-1 rounded text-sm ${currencyView === 'both' ? 'bg-white shadow-sm' : ''}`}
            >
              両方
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="アカウント・カテゴリ・メモで検索…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-72 pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={showAmounts ? '金額を隠す' : '金額を表示'}
          >
            {showAmounts ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => onExport('CSV')}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <FileText size={14} />
              CSV
            </button>
            <button
              onClick={() => onExport('Excel')}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <Download size={14} />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-xs text-gray-500">収入（JPY）</div>
            <div className="text-xl font-bold">{showAmounts ? `¥${fmt(totals.inJPY)}` : '***,***'}</div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-xs text-gray-500">支出（JPY）</div>
            <div className="text-xl font-bold">{showAmounts ? `¥${fmt(totals.outJPY)}` : '***,***'}</div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-xs text-gray-500">キャッシュフロー（JPY）</div>
            <div className="text-xl font-bold">{showAmounts ? `¥${fmt(totals.cfJPY)}` : '***,***'}</div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4">
            <div className="text-xs opacity-90">純額（JPY）</div>
            <div className="text-xl font-bold">{showAmounts ? `¥${fmt(totals.netJPY)}` : '***,***'}</div>
          </div>

          {(currencyView === 'usd' || currencyView === 'both') && (
            <>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-xs text-gray-500">収入（USD）</div>
                <div className="text-xl font-bold">{showAmounts ? `$${fmt(totals.inUSD, 'en-US', 2)}` : '***,***'}</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-xs text-gray-500">支出（USD）</div>
                <div className="text-xl font-bold">{showAmounts ? `$${fmt(totals.outUSD, 'en-US', 2)}` : '***,***'}</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-xs text-gray-500">キャッシュフロー（USD）</div>
                <div className="text-xl font-bold">{showAmounts ? `$${fmt(totals.cfUSD, 'en-US', 2)}` : '***,***'}</div>
              </div>
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg p-4">
                <div className="text-xs opacity-90">純額（USD）</div>
                <div className="text-xl font-bold">{showAmounts ? `$${fmt(totals.netUSD, 'en-US', 2)}` : '***,***'}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 明細テーブル */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-600">日付</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">区分</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">アカウント</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">カテゴリ</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">種別</th>
                <th className="px-4 py-2 text-right text-xs text-gray-600">金額（元通貨）</th>
                {(currencyView === 'jpy' || currencyView === 'both') && (
                  <th className="px-4 py-2 text-right text-xs text-gray-600">円換算</th>
                )}
                {(currencyView === 'usd' || currencyView === 'both') && (
                  <th className="px-4 py-2 text-right text-xs text-gray-600">$換算</th>
                )}
                <th className="px-4 py-2 text-left text-xs text-gray-600">メモ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{r.date}</td>
                  <td className="px-4 py-2 text-sm">
                    {r.segment === 'corporate' ? '法人' : r.segment === 'personal' ? '個人' : '総合'}
                  </td>
                  <td className="px-4 py-2 text-sm">{r.account}</td>
                  <td className="px-4 py-2 text-sm">{r.category}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-flex items-center gap-1 ${r.type === 'IN' ? 'text-green-600' : r.type === 'OUT' ? 'text-red-600' : 'text-blue-600'}`}>
                      {r.type === 'IN' ? <ArrowUpRight size={14} /> : r.type === 'OUT' ? <ArrowDownRight size={14} /> : <AlertCircle size={14} />}
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    {showAmounts ? `${r.currency} ${fmt(r.amount, r.currency === 'USD' ? 'en-US' : 'ja-JP', r.currency === 'USD' ? 2 : 0)}` : '***,***'}
                  </td>
                  {(currencyView === 'jpy' || currencyView === 'both') && (
                    <td className="px-4 py-2 text-sm text-right">{showAmounts ? `¥${fmt(r.jpyAmount)}` : '***,***'}</td>
                  )}
                  {(currencyView === 'usd' || currencyView === 'both') && (
                    <td className="px-4 py-2 text-sm text-right">{showAmounts ? `$${fmt(r.usdAmount ?? 0, 'en-US', 2)}` : '***,***'}</td>
                  )}
                  <td className="px-4 py-2 text-sm text-gray-600">{r.description ?? ''}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500">
                    対象データがありません。月・区分・検索条件を変更して再度お試しください。
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-3 text-xs text-gray-600" colSpan={5}>小計</td>
                <td className="px-4 py-3 text-xs text-right text-gray-800 font-medium">
                  {showAmounts ? `IN/OUT = ¥${fmt(totals.inJPY)} / ¥${fmt(totals.outJPY)}` : '***,***'}
                </td>
                {(currencyView === 'jpy' || currencyView === 'both') && (
                  <td className="px-4 py-3 text-xs text-right text-gray-800 font-medium">
                    {showAmounts ? `Net ¥${fmt(totals.netJPY)}` : '***,***'}
                  </td>
                )}
                {(currencyView === 'usd' || currencyView === 'both') && (
                  <td className="px-4 py-3 text-xs text-right text-gray-800 font-medium">
                    {showAmounts ? `Net $${fmt(totals.netUSD, 'en-US', 2)}` : '***,***'}
                  </td>
                )}
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 注意事項 */}
        <div className="mt-4 text-xs text-gray-500 flex items-start gap-2">
          <AlertCircle size={14} className="mt-0.5" />
          <div>
            <p>※ 金額表示は画面の「円／$/両方」切替に連動します。PDF/Excel出力時も同様の表記を想定しています。</p>
            <p>※ API未接続時は空で表示（エラーを出さない）します。接続後は `/api/reports?month=&segment=` を返す実装に置換してください。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;