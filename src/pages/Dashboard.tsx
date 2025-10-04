// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, JapaneseYen } from "lucide-react";
import Header from "../components/Header";

// ===== 型定義 =====
type View = "corporate" | "personal" | "total";

type RatesResponse = {
  base: "JPY";
  year: string;
  mode: string; // "avg" | "ttm" | "trade"(将来)
  table: Record<string, Record<string, number>>; // {"YYYY-MM": { USD: number, ... }}
};

type DashSummary = {
  month: string;            // "YYYY-MM"
  rate_mode: string;        // "avg" 等
  by_view: {
    total:     { now: number; prev: number };
    corporate: { now: number; prev: number }; // フェーズ2でDBセグメント導入時に有効化
    personal:  { now: number; prev: number };
  };
};

type MonthlyRow = { month: string; 合計: number; [category: string]: number | string };

// ===== ユーティリティ =====
const pct = (now: number, prev: number) => (prev === 0 ? 0 : ((now - prev) / prev) * 100);

const Dashboard: React.FC = () => {
  // 表示状態
  const [selectedView, setSelectedView] = useState<View>("total"); // ※現段階のAPIは実質TOTALのみ
  const [selectedChart, setSelectedChart] = useState<"line" | "bar">("line");
  const [selectedCurrency, setSelectedCurrency] = useState<"JPY" | "USD">("JPY");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [rateMode, setRateMode] = useState<"avg" | "ttm" | "trade">("avg");

  // 月キー配列
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => `${selectedYear}-${String(i + 1).padStart(2, "0")}`),
    [selectedYear]
  );
  const latestMonthKey = months[months.length - 1] ?? "";

  // ===== レート取得（USD換算） =====
  const [rateTable, setRateTable] = useState<RatesResponse["table"] | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      setRatesLoading(true); setRatesError(null);
      try {
        const q = new URLSearchParams({ year: selectedYear, mode: rateMode, symbols: "USD" });
        const res = await fetch(`/api/rates?${q.toString()}`, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RatesResponse = await res.json();
        setRateTable(data.table);
      } catch (e: any) {
        if (e.name !== "AbortError") setRatesError(`レート取得エラー：HTTP ${e?.message?.match(/\d{3}/)?.[0] ?? "不明"}`);
        setRateTable(null);
      } finally {
        setRatesLoading(false);
      }
    })();
    return () => abort.abort();
  }, [selectedYear, rateMode]);

  const fallbackRate = 150.0;
  const toDisplay = (amountJPY: number, ym: string) => {
    if (selectedCurrency === "JPY") return amountJPY;
    const usdJpy = rateTable?.[ym]?.USD ?? fallbackRate;
    return usdJpy > 0 ? amountJPY / usdJpy : 0;
  };
  const fmt = (n: number) =>
    selectedCurrency === "JPY"
      ? `¥${Math.round(n).toLocaleString()}`
      : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtWan = (v: number) =>
    selectedCurrency === "JPY" ? `${Math.round(v / 10000)}万` : fmt(v);

  // ===== 月次データ（DB起点＝JPY受け取り→必要時USD換算） =====
  const [monthlyDataJPY, setMonthlyDataJPY] = useState<MonthlyRow[] | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      setMonthlyLoading(true); setMonthlyError(null);
      try {
        const q = new URLSearchParams({ year: selectedYear, view: selectedView, mode: rateMode });
        const res = await fetch(`/api/dashboard/monthly?${q.toString()}`, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MonthlyRow[] = await res.json(); // JPY 前提
        setMonthlyDataJPY(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setMonthlyError(`月次データ取得エラー：HTTP ${e?.message?.match(/\d{3}/)?.[0] ?? "不明"}`);
        setMonthlyDataJPY(null);
      } finally {
        setMonthlyLoading(false);
      }
    })();
    return () => abort.abort();
  }, [selectedYear, selectedView, rateMode]);

  // USD表示時は受けたJPYを画面側で換算（合計は都度再集計）
  const chartData = useMemo<MonthlyRow[]>(() => {
    if (!monthlyDataJPY) return [];
    if (selectedCurrency === "JPY") return monthlyDataJPY;
    return monthlyDataJPY.map((row, idx) => {
      const ym = `${selectedYear}-${String(idx + 1).padStart(2, "0")}`;
      const out: MonthlyRow = { month: row.month, 合計: 0 };
      let sum = 0;
      for (const [key, val] of Object.entries(row)) {
        if (key === "month" || key === "合計") continue;
        const vJPY = Number(val ?? 0);
        const v = toDisplay(vJPY, ym);
        out[key] = v;
        sum += v;
      }
      out["合計"] = sum;
      return out;
    });
  }, [monthlyDataJPY, selectedCurrency, rateTable, selectedYear]);

  // ===== サマリー（DB起点：有効月＝最後に値がある月を採用） =====
  const [summary, setSummary] = useState<DashSummary | null>(null);
  const [sumLoading, setSumLoading] = useState(false);
  const [sumError, setSumError] = useState<string | null>(null);

  const effectiveMonth = useMemo(() => {
    if (!monthlyDataJPY || monthlyDataJPY.length === 0) return latestMonthKey;
    let last = -1;
    for (let i = monthlyDataJPY.length - 1; i >= 0; i--) {
      const sum = Number((monthlyDataJPY[i] as any)?.["合計"] ?? 0);
      if (sum > 0) { last = i; break; }
    }
    return last >= 0 ? `${selectedYear}-${String(last + 1).padStart(2, "0")}` : latestMonthKey;
  }, [monthlyDataJPY, latestMonthKey, selectedYear]);

  useEffect(() => {
    if (!effectiveMonth) return;
    const abort = new AbortController();
    (async () => {
      setSumLoading(true); setSumError(null);
      try {
        const q = new URLSearchParams({
  year: String(selectedYear),
  month: effectiveMonth,                       // 例: '2025-07'
  segment: selectedView,                       // 'total' | 'corporate' | 'personal'
  rate_mode: rateMode                          // 'avg' | 'trade' | 'ttm'
});
        const res = await fetch(`/api/dashboard/summary?${q.toString()}`, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DashSummary = await res.json();
        setSummary(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setSumError(`サマリー取得エラー：HTTP ${e?.message?.match(/\d{3}/)?.[0] ?? "不明"}`);
        setSummary(null);
      } finally { setSumLoading(false); }
    })();
    return () => abort.abort();
  }, [effectiveMonth, selectedView, rateMode]);

  const currentTotalDisplay = useMemo(() => {
    if (!summary) return 0;
    return toDisplay(summary.by_view[selectedView].now, summary.month);
  }, [summary, selectedView, selectedCurrency, rateTable]);

  const prevDiffPct = useMemo(() => {
    if (!summary) return 0;
    const { now, prev } = summary.by_view[selectedView];
    return pct(now, prev);
  }, [summary, selectedView]);

  // 目盛り表記を通貨別に最適化
const axisTick = (v: number) => {
  if (selectedCurrency === "JPY") {
    // 円は「万」単位で読みやすく（10000円 = 1万）
    return `${(v / 10_000).toFixed(1)}万`;
  }
  // USD は千単位（K）で統一
  return `${(v / 1_000).toFixed(1)}K`;
};

  // ===== 表示 =====
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* サマリーカード（DB連動） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{selectedYear}年度 総資産</p>
                <p className="text-3xl font-bold text-gray-900">{fmt(currentTotalDisplay)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  表示基準: {summary?.month ?? effectiveMonth ?? latestMonthKey} 時点（
                  {selectedView === "corporate" ? "法人" : selectedView === "personal" ? "個人" : "総合"}）
                </p>
                {(sumLoading || ratesLoading) && (
                  <p className="text-xs text-gray-500 mt-1">集計/レート取得中...</p>
                )}
                {(sumError || ratesError) && (
                  <p className="text-xs text-red-600 mt-1">{sumError ?? ratesError}</p>
                )}
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                {selectedCurrency === "JPY" ? (
                  <JapaneseYen className="h-6 w-6 text-blue-600" />
                ) : (
                  <DollarSign className="h-6 w-6 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">前月比</p>
            <div className="flex items-center space-x-2">
              {(() => {
  const now  = summary?.by_view[selectedView].now  ?? 0;
  const prev = summary?.by_view[selectedView].prev ?? 0;

  // 0割り・NaN/Infinity を防止
  const v = prev === 0 ? 0 : ((now - prev) / prev) * 100;
  const safe = Number.isFinite(v) ? v : 0;

  const color = safe >= 0 ? "text-green-600" : "text-red-600";
  const sign  = safe >= 0 ? "+" : "";
  const text  = `${sign}${safe.toFixed(1)}`;

  return <p className={`text-3xl font-bold ${color}`}>{text}%</p>;
})()}
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{summary?.month ?? effectiveMonth ?? latestMonthKey}</p>
          </div>
        </div>

        {/* ▼ 復元：フィルターセクション（年度/ビュー/グラフ種/通貨 + 右端エクスポート） */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
  <div className="flex flex-wrap items-center gap-3">
    {/* 年度 */}
    <select
      value={selectedYear}
      onChange={(e)=>setSelectedYear(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
    >
      <option value="2024">2024年度</option>
      <option value="2025">2025年度</option>
      <option value="2026">2026年度</option>
    </select>

    {/* ビュー（法人/個人/総合）— 現状はTOTALのみ同値表示 */}
    <div className="flex bg-gray-100 rounded-lg p-1">
      {[
        { id: "corporate", label: "法人" },
        { id: "personal",  label: "個人" },
        { id: "total",     label: "総合" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={()=>setSelectedView(tab.id as View)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedView===tab.id ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* グラフ種別 */}
<select
  value={selectedChart}
  onChange={(e)=>setSelectedChart(e.target.value as "line"|"bar")}
  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
>
  <option value="line">折れ線グラフ</option>
  <option value="bar">棒グラフ</option>
</select>

{/* レートモード */}
<select
  value={rateMode}
  onChange={(e)=>setRateMode(e.target.value as "avg" | "ttm" | "trade")}
  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
>
  <option value="avg">平均レート（avg）</option>
  <option value="ttm">TTM（仲値）</option>
  {/* <option value="trade">取引レート（trade）</option> */}
</select>

{/* 通貨 */}
<select
  value={selectedCurrency}
  onChange={(e)=>setSelectedCurrency(e.target.value as "JPY"|"USD")}
  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
>
  <option value="JPY">円 (JPY)</option>
  <option value="USD">米ドル (USD)</option>
</select>
  </div>
</div>

        {/* 月次推移表（固定4カテゴリ＋右端“年間増減”） */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-3 lg:px-4 lg:py-3 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedYear}年度 月次推移表 - {selectedView === "corporate" ? "法人" : selectedView === "personal" ? "個人" : "総合"}（{selectedCurrency}）
            </h3>
            {monthlyLoading && <p className="text-xs text-gray-500 mt-1">月次データ取得中...</p>}
            {monthlyError   && <p className="text-xs text-red-600 mt-1">{monthlyError}</p>}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">資産区分</th>
                  {months.map((m) => (
                    <th key={m} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      {parseInt(m.slice(5), 10)}月
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase bg-blue-50">年間増減</th>
                </tr>
              </thead>

              <tbody>
                {/* 合計行（右端は年間増減） */}
                <tr className="bg-gray-100">
                  <td className="px-3 py-2 text-sm font-semibold text-gray-900">合計</td>
                  {months.map((m) => {
                    const row = chartData[parseInt(m.slice(5), 10) - 1] as any;
                    const v = Number(row?.["合計"] ?? 0);
                    return (
                      <td key={m} className="px-2 py-2 text-right text-sm font-semibold text-gray-900">
                        {fmtWan(v)}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900 bg-blue-100">
                    {(() => {
                      const first = Number((chartData[0] as any)?.["合計"] ?? 0);
                      const last  = Number((chartData[chartData.length - 1] as any)?.["合計"] ?? 0);
                      const d = last - first;
                      return (
                        <span className={d >= 0 ? "text-emerald-600" : "text-red-600"}>
                          {(d >= 0 ? "+" : "") + fmtWan(Math.abs(d))}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* グラフ（固定4カテゴリ＋合計の灰点線） */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
  {selectedChart === "line" ? (
    <LineChart data={chartData as any}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis tickFormatter={axisTick} />
      <Tooltip formatter={(v: number) => fmt(v)} />
      <Line
        type="monotone"
        dataKey="合計"
        stroke="#3B82F6"
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  ) : (
    <BarChart data={chartData as any}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis tickFormatter={axisTick} />
      <Tooltip formatter={(v: number) => fmt(v)} />
      <Bar dataKey="合計" isAnimationActive={false} />
    </BarChart>
  )}
</ResponsiveContainer>
          </div>
          {/* レート/API状態（画面下にまとめて表示） */}
          {(ratesLoading || ratesError) && (
            <div className="mt-3 text-xs">
              {ratesLoading && <span className="text-gray-500 mr-2">レート取得中...</span>}
              {ratesError &&   <span className="text-red-600">{ratesError}</span>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;