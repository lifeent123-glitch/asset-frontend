// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, JapaneseYen } from "lucide-react";
import Header from "../components/Header";

/* =========================
 * 型定義
 * ========================= */
type View = "corporate" | "personal" | "total";
type Currency = "JPY" | "USD";
type RateMode = "avg" | "ttm" | "trade";

type RatesResponse = {
  base: "JPY";
  year: string;
  mode: string; // "avg" | "ttm" | "trade"
  table: Record<string, Record<string, number>>; // {"YYYY-MM": { USD: number, ... }}
};

type DashSummary = {
  month: string; // "YYYY-MM"
  rate_mode: string;
  by_view: {
    total: { now: number; prev: number };
    corporate: { now: number; prev: number };
    personal: { now: number; prev: number };
  };
};

type MonthlyRow = { month: string; 合計: number; [category: string]: number | string };

/* =========================
 * ユーティリティ
 * ========================= */
const pct = (now: number, prev: number) => (prev === 0 ? 0 : ((now - prev) / prev) * 100);

const axisTick = (v: number, selectedCurrency: Currency) => {
  if (selectedCurrency === "JPY") return `${(v / 10_000).toFixed(1)}万`;
  return `${(v / 1_000).toFixed(1)}K`;
};

const fmtMoney = (n: number, currency: Currency) =>
  currency === "JPY"
    ? `¥${Math.round(n).toLocaleString("ja-JP")}`
    : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* =========================
 * ページ本体
 * ========================= */
const Dashboard: React.FC = () => {
  /* ---------- 表示状態 ---------- */
  const [selectedView, setSelectedView] = useState<View>("total");
  const [selectedChart, setSelectedChart] = useState<"line" | "bar">("line");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("JPY");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [rateMode, setRateMode] = useState<RateMode>("avg");

  /* ---------- 年月配列 ---------- */
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => `${selectedYear}-${String(i + 1).padStart(2, "0")}`),
    [selectedYear]
  );
  const latestMonthKey = months[months.length - 1] ?? "";

  /* ---------- レート取得（USD換算用） ---------- */
  const [rateTable, setRateTable] = useState<RatesResponse["table"] | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      setRatesLoading(true);
      setRatesError(null);
      try {
        const q = new URLSearchParams({ year: selectedYear, mode: rateMode, symbols: "USD" });
        const res = await fetch(`/api/rates?${q.toString()}`, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RatesResponse = await res.json();
        setRateTable(data.table);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          const code = e?.message?.match(/\d{3}/)?.[0] ?? "不明";
          setRatesError(`レート取得エラー：HTTP ${code}`);
        }
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

  /* ---------- 月次データ（DBはJPY前提） ---------- */
  const [monthlyDataJPY, setMonthlyDataJPY] = useState<MonthlyRow[] | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      setMonthlyLoading(true);
      setMonthlyError(null);
      try {
        const q = new URLSearchParams({ year: selectedYear, view: selectedView, mode: rateMode });
        const res = await fetch(`/api/dashboard/monthly?${q.toString()}`, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MonthlyRow[] = await res.json();
        setMonthlyDataJPY(data);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          const code = e?.message?.match(/\d{3}/)?.[0] ?? "不明";
          setMonthlyError(`月次データ取得エラー：HTTP ${code}`);
        }
        setMonthlyDataJPY(null);
      } finally {
        setMonthlyLoading(false);
      }
    })();
    return () => abort.abort();
  }, [selectedYear, selectedView, rateMode]);

  // Chart用データ（USD選択時のみ合計を換算）
  const chartData = useMemo<MonthlyRow[]>(() => {
    if (!monthlyDataJPY) return [];
    if (selectedCurrency === "JPY") return monthlyDataJPY;

    return monthlyDataJPY.map((row, idx) => {
      const ym = `${selectedYear}-${String(idx + 1).padStart(2, "0")}`;
      const conv = toDisplay(Number(row["合計"] ?? 0), ym);
      return { month: row.month, 合計: conv };
    });
  }, [monthlyDataJPY, selectedCurrency, rateTable, selectedYear]);

  /* ---------- サマリー（有効月） ---------- */
  const [summary, setSummary] = useState<DashSummary | null>(null);
  const [sumLoading, setSumLoading] = useState(false);
  const [sumError, setSumError] = useState<string | null>(null);

  const effectiveMonth = useMemo(() => {
    if (!monthlyDataJPY || monthlyDataJPY.length === 0) return latestMonthKey;
    let last = -1;
    for (let i = monthlyDataJPY.length - 1; i >= 0; i--) {
      const sum = Number((monthlyDataJPY[i] as any)?.["合計"] ?? 0);
      if (sum > 0) {
        last = i;
        break;
      }
    }
    return last >= 0 ? `${selectedYear}-${String(last + 1).padStart(2, "0")}` : latestMonthKey;
  }, [monthlyDataJPY, latestMonthKey, selectedYear]);

  useEffect(() => {
    if (!effectiveMonth) return;
    const abort = new AbortController();
    (async () => {
      setSumLoading(true);
      setSumError(null);
      try {
        const q = new URLSearchParams({ month: effectiveMonth, view: selectedView, mode: rateMode });
        const res = await fetch(`/api/dashboard/summary?${q.toString()}`, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DashSummary = await res.json();
        setSummary(data);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          const code = e?.message?.match(/\d{3}/)?.[0] ?? "不明";
          setSumError(`サマリー取得エラー：HTTP ${code}`);
        }
        setSummary(null);
      } finally {
        setSumLoading(false);
      }
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

  /* =========================
   * UI（1004版のレイアウトに復元）
   * ========================= */
  return (
  <div className="min-h-screen bg-gray-50">
    {/* 共通ヘッダー（ダッシュボード専用） */}
    <Header />

    {/* ページコンテナ */}
    <main className="w-full max-w-none px-8 py-6 space-y-6">
      {/* タイトル */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="text-xs text-gray-500 mt-1">
              {selectedYear}年の資産サマリー（{selectedView === "corporate" ? "法人" : selectedView === "personal" ? "個人" : "総合"}
              ／{selectedCurrency}）
            </p>
          </div>
        </div>

        {/* 上段サマリー2カード */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 総資産 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{selectedYear}年度 総資産</p>
                <p className="text-3xl font-bold text-gray-900">
                  {fmtMoney(currentTotalDisplay, selectedCurrency)}
                </p>
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

          {/* 前月比 */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">前月比</p>
            <div className="flex items-center space-x-2">
              {(() => {
                const safe = Number.isFinite(prevDiffPct) ? prevDiffPct : 0;
                const color = safe >= 0 ? "text-emerald-600" : "text-red-600";
                const sign = safe >= 0 ? "+" : "";
                return <p className={`text-3xl font-bold ${color}`}>{`${sign}${safe.toFixed(1)}%`}</p>;
              })()}
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{summary?.month ?? effectiveMonth ?? latestMonthKey}</p>
          </div>
        </section>

        {/* フィルター帯（年度/ビュー/グラフ/レート/通貨） */}
        <section className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* 年度 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">年度</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            {/* ビュー */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: "corporate", label: "法人" },
                { id: "personal", label: "個人" },
                { id: "total", label: "総合" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as View)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedView === tab.id
                      ? "bg-white text-blue-600 shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* グラフ */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">グラフ</span>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value as "line" | "bar")}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="line">折れ線</option>
                <option value="bar">棒</option>
              </select>
            </div>

            {/* レート */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">レート</span>
              <select
                value={rateMode}
                onChange={(e) => setRateMode(e.target.value as RateMode)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="avg">平均（avg）</option>
                <option value="ttm">TTM（仲値）</option>
                {/* <option value="trade">取引（trade）</option> */}
              </select>
            </div>

            {/* 通貨 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">通貨</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="JPY">円 (JPY)</option>
                <option value="USD">米ドル (USD)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 月次推移表（合計のみ＋年間増減） */}
        <section className="bg-white rounded-lg shadow overflow-hidden">
  <div className="p-3 lg:px-4 lg:py-3 border-b bg-gray-50">
    <h3 className="text-lg font-semibold text-gray-900">
      {selectedYear}年度 月次推移表 -{" "}
      {selectedView === "corporate" ? "法人" : selectedView === "personal" ? "個人" : "総合"}（
      {selectedCurrency}）
    </h3>
    {monthlyLoading && <p className="text-xs text-gray-500 mt-1">月次データ取得中...</p>}
    {monthlyError && <p className="text-xs text-red-600 mt-1">{monthlyError}</p>}
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">資産区分</th>
          {months.map((m) => (
            <th
              key={m}
              className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
            >
              {parseInt(m.slice(5), 10)}月
            </th>
          ))}
          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase bg-blue-50">年間増減</th>
        </tr>
      </thead>

      <tbody>
        <tr className="bg-white">
          <td className="px-3 py-2 text-sm font-semibold text-gray-900">合計</td>

          {/* 👇 数値セルを text-center にしてヘッダーと中心位置を一致させる */}
          {months.map((m, idx) => {
            const row = chartData[idx] as any;
            const v = Number(row?.["合計"] ?? 0);
            const disp =
              selectedCurrency === "JPY"
                ? `${Math.round(v / 10000)}万`
                : fmtMoney(v, selectedCurrency);
            return (
              <td key={m} className="px-2 py-2 text-center text-sm font-semibold text-gray-900">
                <span className="tabular-nums">{disp}</span>
              </td>
            );
          })}

          {/* 年間増減は右寄せのまま */}
          <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900 bg-blue-100">
            {(() => {
              const first = Number((chartData[0] as any)?.["合計"] ?? 0);
              const last = Number((chartData[chartData.length - 1] as any)?.["合計"] ?? 0);
              const d = last - first;
              const sign = d >= 0 ? "+" : "-";
              const abs = Math.abs(d);
              return (
                <span className={d >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {selectedCurrency === "JPY"
                    ? `${sign}${Math.round(abs / 10000)}万`
                    : `${sign}${fmtMoney(abs, selectedCurrency)}`}
                </span>
              );
            })()}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

        {/* グラフ（合計のみ） */}
        <section className="bg-white rounded-lg shadow p-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChart === "line" ? (
                <LineChart data={chartData as any}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v: number) => axisTick(v, selectedCurrency)} />
                  <Tooltip formatter={(v: number) => fmtMoney(v, selectedCurrency)} />
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
                  <YAxis tickFormatter={(v: number) => axisTick(v, selectedCurrency)} />
                  <Tooltip formatter={(v: number) => fmtMoney(v, selectedCurrency)} />
                  <Bar dataKey="合計" isAnimationActive={false} fill="#3B82F6" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {(ratesLoading || ratesError) && (
            <div className="mt-3 text-xs">
              {ratesLoading && <span className="text-gray-500 mr-2">レート取得中...</span>}
              {ratesError && <span className="text-red-600">{ratesError}</span>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;