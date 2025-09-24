import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, JapaneseYen } from "lucide-react";
import Header from "../components/Header";   // 共通ヘッダーをインポート

// API 型
type RatesResponse = {
  base: "JPY";
  year: number;
  mode: string;
  table: Record<string, Record<string, number>>;
};

const categories = ["現金", "銀行口座", "仮想通貨", "投資"] as const;

const Dashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<"corporate" | "personal" | "total">("total");
  const [selectedChart, setSelectedChart] = useState<"line" | "bar">("line");
  const [selectedCurrency, setSelectedCurrency] = useState<"JPY" | "USD">("JPY");
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  const months = useMemo(() => {
    const arr: string[] = [];
    for (let i = 1; i <= 12; i++) arr.push(`${selectedYear}-${String(i).padStart(2, "0")}`);
    return arr;
  }, [selectedYear]);

  // ------- ダミー資産データ（内部はJPY） -------
  const baseValues = {
    corporate: { 現金: 5_000_000, 銀行口座: 8_000_000, 仮想通貨: 3_000_000, 投資: 6_000_000 },
    personal:  { 現金: 2_000_000, 銀行口座: 3_000_000, 仮想通貨: 1_500_000, 投資: 2_500_000 },
  } as const;

  const generateSeriesJPY = (base: Record<typeof categories[number], number>) => {
    const dataset: Record<string, Record<string, number>> = {};
    categories.forEach((cat) => {
      dataset[cat] = {};
      months.forEach((m, idx) => {
        const growth = 0.015 * idx; // 月ごと +1.5% 成長（決定的）
        dataset[cat][m] = Math.floor(base[cat] * (1 + growth));
      });
    });
    return dataset;
  };

  const corporateJPY = useMemo(() => generateSeriesJPY(baseValues.corporate), [months]);
  const personalJPY  = useMemo(() => generateSeriesJPY(baseValues.personal),  [months]);

  const totalJPY = useMemo(() => {
    const merged: Record<string, Record<string, number>> = {};
    categories.forEach((cat) => {
      merged[cat] = {};
      months.forEach((m) => (merged[cat][m] = corporateJPY[cat][m] + personalJPY[cat][m]));
    });
    return merged;
  }, [months, corporateJPY, personalJPY]);

  const currentJPY = useMemo(() => {
    if (selectedView === "corporate") return corporateJPY;
    if (selectedView === "personal")  return personalJPY;
    return totalJPY;
  }, [selectedView, corporateJPY, personalJPY, totalJPY]);

  // ------- レート取得 -------
  const [rateTable, setRateTable] = useState<RatesResponse["table"] | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    const loadRates = async () => {
      setRatesLoading(true);
      setRatesError(null);
      try {
        const symbols = ["USD"];
        const q = new URLSearchParams({ year: selectedYear, mode: "avg", symbols: symbols.join(",") });
        const res = await fetch(`/api/rates?${q.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RatesResponse = await res.json();
        setRateTable(data.table);
      } catch (e: any) {
        setRatesError(e?.message || "レート取得に失敗しました");
        setRateTable(null);
      } finally {
        setRatesLoading(false);
      }
    };
    loadRates();
  }, [selectedYear]);

  const fallbackRate = 150.0;
  const toDisplayCurrency = (amountJPY: number, ym: string) => {
    if (selectedCurrency === "JPY") return amountJPY;
    const usdJpy = rateTable?.[ym]?.USD ?? fallbackRate;
    return usdJpy > 0 ? amountJPY / usdJpy : 0;
  };

  const fmt = (n: number) => {
    if (selectedCurrency === "JPY") return `¥${Math.round(n).toLocaleString()}`;
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calcMonthlyTotalDisplay = (ym: string) =>
    categories.reduce((s, cat) => s + toDisplayCurrency(currentJPY[cat][ym] ?? 0, ym), 0);

  const calcYearTotalDisplayByCategory = (cat: typeof categories[number]) =>
    months.reduce((s, ym) => s + toDisplayCurrency(currentJPY[cat][ym] ?? 0, ym), 0);

  const chartData = useMemo(() => {
    return months.map((ym) => {
      const label = `${parseInt(ym.slice(5), 10)}月`;
      const row: Record<string, number | string> = { month: label };
      categories.forEach((cat) => (row[cat] = toDisplayCurrency(currentJPY[cat][ym] ?? 0, ym)));
      row["合計"] = calcMonthlyTotalDisplay(ym);
      return row;
    });
  }, [months, currentJPY, rateTable, selectedCurrency]);

  const latestMonthKey = months[months.length - 1];
  const currentTotalDisplay = calcMonthlyTotalDisplay(latestMonthKey);

  const prevDiffPct = useMemo(() => {
    const prevKey = months[months.length - 2];
    if (!prevKey) return 0;
    const prev = calcMonthlyTotalDisplay(prevKey);
    if (prev === 0) return 0;
    return ((currentTotalDisplay - prev) / prev) * 100;
  }, [months, currentTotalDisplay]);

  const axisTick = (v: number) => {
    const unit = selectedCurrency === "JPY" ? 1_000_000 : 10_000;
    const suffix = selectedCurrency === "JPY" ? "M" : "万";
    return `${(v / unit).toFixed(1)}${suffix}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 共通ヘッダー */}
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{selectedYear}年度 総資産（現状）</p>
                <p className="text-3xl font-bold text-gray-900">{fmt(currentTotalDisplay)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  表示基準: {latestMonthKey} 時点（
                  {selectedView === "corporate" ? "法人" : selectedView === "personal" ? "個人" : "総合"}）
                </p>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">前月比（参考）</p>
                <div className="flex items-center space-x-2">
                  <p className="text-3xl font-bold text-green-600">
                    {`${prevDiffPct >= 0 ? "+" : ""}${prevDiffPct.toFixed(1)}%`}
                  </p>
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{latestMonthKey}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 操作パネル */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="2024">2024年度</option>
              <option value="2025">2025年度</option>
              <option value="2026">2026年度</option>
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: "corporate", label: "法人" },
                { id: "personal",  label: "個人" },
                { id: "total",     label: "総合" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as typeof selectedView)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedView === tab.id ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value as typeof selectedChart)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="line">折れ線グラフ</option>
              <option value="bar">棒グラフ</option>
            </select>

            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as typeof selectedCurrency)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="JPY">円 (JPY)</option>
              <option value="USD">米ドル (USD)</option>
            </select>
          </div>
        </div>

        {/* 月次推移表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-3 lg:p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedYear}年度 月次推移表 - {selectedView === "corporate" ? "法人" : selectedView === "personal" ? "個人" : "総合"}（{selectedCurrency}）
            </h3>
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
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase bg-blue-50">年間合計</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((cat, idx) => {
                  const yearSum = months.reduce((s, ym) => s + toDisplayCurrency(currentJPY[cat][ym] ?? 0, ym), 0);
                  return (
                    <tr key={cat} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{cat}</td>
                      {months.map((m) => (
                        <td key={m} className="px-2 py-2 text-right text-sm text-gray-800">
                          {fmt(toDisplayCurrency(currentJPY[cat][m] ?? 0, m))}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900 bg-blue-50">{fmt(yearSum)}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-100">合計</td>
                  {months.map((m) => (
                    <td key={m} className="px-2 py-2 text-right text-sm font-semibold text-gray-900 bg-gray-100">
                      {fmt(calcMonthlyTotalDisplay(m))}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900 bg-blue-100">
                    {fmt(months.reduce((s, m) => s + calcMonthlyTotalDisplay(m), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* グラフ */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChart === "line" ? (
                <LineChart data={chartData as any}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={axisTick} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  {categories.map((cat) => (
                    <Line
                      key={cat}
                      type="monotone"
                      dataKey={cat}
                      stroke={{ 現金: "#3B82F6", 銀行口座: "#10B981", 仮想通貨: "#F59E0B", 投資: "#EF4444" }[cat]}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={chartData as any}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={axisTick} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  {categories.map((cat) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      fill={{ 現金: "#3B82F6", 銀行口座: "#10B981", 仮想通貨: "#F59E0B", 投資: "#EF4444" }[cat]}
                      isAnimationActive={false}
                      stackId="stack"
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* レート状態（任意表示） */}
        {ratesLoading && <div className="mt-4 text-sm text-gray-500">為替レートを取得中...</div>}
        {ratesError &&   <div className="mt-2 text-sm text-red-600">レート取得エラー：{ratesError}</div>}
      </main>
    </div>
  );
};

export default Dashboard;