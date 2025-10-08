import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { TrendingUp, DollarSign, JapaneseYen } from "lucide-react";
import Header from "../components/Header";
// ===== ユーティリティ =====
const pct = (now, prev) => (prev === 0 ? 0 : ((now - prev) / prev) * 100);
const Dashboard = () => {
    // 表示状態
    const [selectedView, setSelectedView] = useState("total"); // ※現段階のAPIは実質TOTALのみ
    const [selectedChart, setSelectedChart] = useState("line");
    const [selectedCurrency, setSelectedCurrency] = useState("JPY");
    const [selectedYear, setSelectedYear] = useState("2025");
    const [rateMode, setRateMode] = useState("avg");
    // 月キー配列
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => `${selectedYear}-${String(i + 1).padStart(2, "0")}`), [selectedYear]);
    const latestMonthKey = months[months.length - 1] ?? "";
    // ===== レート取得（USD換算） =====
    const [rateTable, setRateTable] = useState(null);
    const [ratesLoading, setRatesLoading] = useState(false);
    const [ratesError, setRatesError] = useState(null);
    useEffect(() => {
        const abort = new AbortController();
        (async () => {
            setRatesLoading(true);
            setRatesError(null);
            try {
                const q = new URLSearchParams({ year: selectedYear, mode: rateMode, symbols: "USD" });
                const res = await fetch(`/api/rates?${q.toString()}`, { signal: abort.signal });
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setRateTable(data.table);
            }
            catch (e) {
                if (e.name !== "AbortError")
                    setRatesError(`レート取得エラー：HTTP ${e?.message?.match(/\d{3}/)?.[0] ?? "不明"}`);
                setRateTable(null);
            }
            finally {
                setRatesLoading(false);
            }
        })();
        return () => abort.abort();
    }, [selectedYear, rateMode]);
    const fallbackRate = 150.0;
    const toDisplay = (amountJPY, ym) => {
        if (selectedCurrency === "JPY")
            return amountJPY;
        const usdJpy = rateTable?.[ym]?.USD ?? fallbackRate;
        return usdJpy > 0 ? amountJPY / usdJpy : 0;
    };
    const fmt = (n) => selectedCurrency === "JPY"
        ? `¥${Math.round(n).toLocaleString()}`
        : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtWan = (v) => selectedCurrency === "JPY" ? `${Math.round(v / 10000)}万` : fmt(v);
    // ===== 月次データ（DB起点＝JPY受け取り→必要時USD換算） =====
    const [monthlyDataJPY, setMonthlyDataJPY] = useState(null);
    const [monthlyLoading, setMonthlyLoading] = useState(false);
    const [monthlyError, setMonthlyError] = useState(null);
    useEffect(() => {
        const abort = new AbortController();
        (async () => {
            setMonthlyLoading(true);
            setMonthlyError(null);
            try {
                const q = new URLSearchParams({ year: selectedYear, view: selectedView, mode: rateMode });
                const res = await fetch(`/api/dashboard/monthly?${q.toString()}`, { signal: abort.signal });
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const data = await res.json(); // JPY 前提
                setMonthlyDataJPY(data);
            }
            catch (e) {
                if (e.name !== "AbortError")
                    setMonthlyError(`月次データ取得エラー：HTTP ${e?.message?.match(/\d{3}/)?.[0] ?? "不明"}`);
                setMonthlyDataJPY(null);
            }
            finally {
                setMonthlyLoading(false);
            }
        })();
        return () => abort.abort();
    }, [selectedYear, selectedView, rateMode]);
    // USD表示時は受けたJPYを画面側で換算（合計は都度再集計）
    const chartData = useMemo(() => {
        if (!monthlyDataJPY)
            return [];
        if (selectedCurrency === "JPY")
            return monthlyDataJPY;
        return monthlyDataJPY.map((row, idx) => {
            const ym = `${selectedYear}-${String(idx + 1).padStart(2, "0")}`;
            const out = { month: row.month, 合計: 0 };
            let sum = 0;
            for (const [key, val] of Object.entries(row)) {
                if (key === "month" || key === "合計")
                    continue;
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
    const [summary, setSummary] = useState(null);
    const [sumLoading, setSumLoading] = useState(false);
    const [sumError, setSumError] = useState(null);
    const effectiveMonth = useMemo(() => {
        if (!monthlyDataJPY || monthlyDataJPY.length === 0)
            return latestMonthKey;
        let last = -1;
        for (let i = monthlyDataJPY.length - 1; i >= 0; i--) {
            const sum = Number(monthlyDataJPY[i]?.["合計"] ?? 0);
            if (sum > 0) {
                last = i;
                break;
            }
        }
        return last >= 0 ? `${selectedYear}-${String(last + 1).padStart(2, "0")}` : latestMonthKey;
    }, [monthlyDataJPY, latestMonthKey, selectedYear]);
    useEffect(() => {
        if (!effectiveMonth)
            return;
        const abort = new AbortController();
        (async () => {
            setSumLoading(true);
            setSumError(null);
            try {
                const q = new URLSearchParams({
                    year: String(selectedYear),
                    month: effectiveMonth, // 例: '2025-07'
                    segment: selectedView, // 'total' | 'corporate' | 'personal'
                    rate_mode: rateMode // 'avg' | 'trade' | 'ttm'
                });
                const res = await fetch(`/api/dashboard/summary?${q.toString()}`, { signal: abort.signal });
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setSummary(data);
            }
            catch (e) {
                if (e.name !== "AbortError")
                    setSumError(`サマリー取得エラー：HTTP ${e?.message?.match(/\d{3}/)?.[0] ?? "不明"}`);
                setSummary(null);
            }
            finally {
                setSumLoading(false);
            }
        })();
        return () => abort.abort();
    }, [effectiveMonth, selectedView, rateMode]);
    const currentTotalDisplay = useMemo(() => {
        if (!summary)
            return 0;
        return toDisplay(summary.by_view[selectedView].now, summary.month);
    }, [summary, selectedView, selectedCurrency, rateTable]);
    const prevDiffPct = useMemo(() => {
        if (!summary)
            return 0;
        const { now, prev } = summary.by_view[selectedView];
        return pct(now, prev);
    }, [summary, selectedView]);
    // 目盛り表記を通貨別に最適化
    const axisTick = (v) => {
        if (selectedCurrency === "JPY") {
            // 円は「万」単位で読みやすく（10000円 = 1万）
            return `${(v / 10000).toFixed(1)}万`;
        }
        // USD は千単位（K）で統一
        return `${(v / 1000).toFixed(1)}K`;
    };
    // ===== 表示 =====
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(Header, {}), _jsxs("main", { className: "container mx-auto px-4 lg:px-8 py-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-gray-600", children: [selectedYear, "\u5E74\u5EA6 \u7DCF\u8CC7\u7523"] }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: fmt(currentTotalDisplay) }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["\u8868\u793A\u57FA\u6E96: ", summary?.month ?? effectiveMonth ?? latestMonthKey, " \u6642\u70B9\uFF08", selectedView === "corporate" ? "法人" : selectedView === "personal" ? "個人" : "総合", "\uFF09"] }), (sumLoading || ratesLoading) && (_jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u96C6\u8A08/\u30EC\u30FC\u30C8\u53D6\u5F97\u4E2D..." })), (sumError || ratesError) && (_jsx("p", { className: "text-xs text-red-600 mt-1", children: sumError ?? ratesError }))] }), _jsx("div", { className: "h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center", children: selectedCurrency === "JPY" ? (_jsx(JapaneseYen, { className: "h-6 w-6 text-blue-600" })) : (_jsx(DollarSign, { className: "h-6 w-6 text-blue-600" })) })] }) }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u524D\u6708\u6BD4" }), _jsxs("div", { className: "flex items-center space-x-2", children: [(() => {
                                                const now = summary?.by_view[selectedView].now ?? 0;
                                                const prev = summary?.by_view[selectedView].prev ?? 0;
                                                // 0割り・NaN/Infinity を防止
                                                const v = prev === 0 ? 0 : ((now - prev) / prev) * 100;
                                                const safe = Number.isFinite(v) ? v : 0;
                                                const color = safe >= 0 ? "text-green-600" : "text-red-600";
                                                const sign = safe >= 0 ? "+" : "";
                                                const text = `${sign}${safe.toFixed(1)}`;
                                                return _jsxs("p", { className: `text-3xl font-bold ${color}`, children: [text, "%"] });
                                            })(), _jsx(TrendingUp, { className: "h-6 w-6 text-green-600" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: summary?.month ?? effectiveMonth ?? latestMonthKey })] })] }), _jsx("div", { className: "bg-white rounded-lg shadow p-4 mb-6", children: _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("select", { value: selectedYear, onChange: (e) => setSelectedYear(e.target.value), className: "border border-gray-300 rounded-md px-3 py-2 text-sm", children: [_jsx("option", { value: "2024", children: "2024\u5E74\u5EA6" }), _jsx("option", { value: "2025", children: "2025\u5E74\u5EA6" }), _jsx("option", { value: "2026", children: "2026\u5E74\u5EA6" })] }), _jsx("div", { className: "flex bg-gray-100 rounded-lg p-1", children: [
                                        { id: "corporate", label: "法人" },
                                        { id: "personal", label: "個人" },
                                        { id: "total", label: "総合" },
                                    ].map((tab) => (_jsx("button", { onClick: () => setSelectedView(tab.id), className: `px-4 py-2 rounded-md text-sm font-medium ${selectedView === tab.id ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-900"}`, children: tab.label }, tab.id))) }), _jsxs("select", { value: selectedChart, onChange: (e) => setSelectedChart(e.target.value), className: "border border-gray-300 rounded-md px-3 py-2 text-sm", children: [_jsx("option", { value: "line", children: "\u6298\u308C\u7DDA\u30B0\u30E9\u30D5" }), _jsx("option", { value: "bar", children: "\u68D2\u30B0\u30E9\u30D5" })] }), _jsxs("select", { value: rateMode, onChange: (e) => setRateMode(e.target.value), className: "border border-gray-300 rounded-md px-3 py-2 text-sm", children: [_jsx("option", { value: "avg", children: "\u5E73\u5747\u30EC\u30FC\u30C8\uFF08avg\uFF09" }), _jsx("option", { value: "ttm", children: "TTM\uFF08\u4EF2\u5024\uFF09" })] }), _jsxs("select", { value: selectedCurrency, onChange: (e) => setSelectedCurrency(e.target.value), className: "border border-gray-300 rounded-md px-3 py-2 text-sm", children: [_jsx("option", { value: "JPY", children: "\u5186 (JPY)" }), _jsx("option", { value: "USD", children: "\u7C73\u30C9\u30EB (USD)" })] })] }) }), _jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden mb-6", children: [_jsxs("div", { className: "p-3 lg:px-4 lg:py-3 border-b bg-gray-50", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: [selectedYear, "\u5E74\u5EA6 \u6708\u6B21\u63A8\u79FB\u8868 - ", selectedView === "corporate" ? "法人" : selectedView === "personal" ? "個人" : "総合", "\uFF08", selectedCurrency, "\uFF09"] }), monthlyLoading && _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u6708\u6B21\u30C7\u30FC\u30BF\u53D6\u5F97\u4E2D..." }), monthlyError && _jsx("p", { className: "text-xs text-red-600 mt-1", children: monthlyError })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase", children: "\u8CC7\u7523\u533A\u5206" }), months.map((m) => (_jsxs("th", { className: "px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap", children: [parseInt(m.slice(5), 10), "\u6708"] }, m))), _jsx("th", { className: "px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase bg-blue-50", children: "\u5E74\u9593\u5897\u6E1B" })] }) }), _jsx("tbody", { children: _jsxs("tr", { className: "bg-gray-100", children: [_jsx("td", { className: "px-3 py-2 text-sm font-semibold text-gray-900", children: "\u5408\u8A08" }), months.map((m) => {
                                                        const row = chartData[parseInt(m.slice(5), 10) - 1];
                                                        const v = Number(row?.["合計"] ?? 0);
                                                        return (_jsx("td", { className: "px-2 py-2 text-right text-sm font-semibold text-gray-900", children: fmtWan(v) }, m));
                                                    }), _jsx("td", { className: "px-3 py-2 text-right text-sm font-semibold text-gray-900 bg-blue-100", children: (() => {
                                                            const first = Number(chartData[0]?.["合計"] ?? 0);
                                                            const last = Number(chartData[chartData.length - 1]?.["合計"] ?? 0);
                                                            const d = last - first;
                                                            return (_jsx("span", { className: d >= 0 ? "text-emerald-600" : "text-red-600", children: (d >= 0 ? "+" : "") + fmtWan(Math.abs(d)) }));
                                                        })() })] }) })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-4", children: [_jsx("div", { className: "h-80 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: selectedChart === "line" ? (_jsxs(LineChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, { tickFormatter: axisTick }), _jsx(Tooltip, { formatter: (v) => fmt(v) }), _jsx(Line, { type: "monotone", dataKey: "\u5408\u8A08", stroke: "#3B82F6", strokeWidth: 2, dot: false, isAnimationActive: false })] })) : (_jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, { tickFormatter: axisTick }), _jsx(Tooltip, { formatter: (v) => fmt(v) }), _jsx(Bar, { dataKey: "\u5408\u8A08", isAnimationActive: false })] })) }) }), (ratesLoading || ratesError) && (_jsxs("div", { className: "mt-3 text-xs", children: [ratesLoading && _jsx("span", { className: "text-gray-500 mr-2", children: "\u30EC\u30FC\u30C8\u53D6\u5F97\u4E2D..." }), ratesError && _jsx("span", { className: "text-red-600", children: ratesError })] }))] })] })] }));
};
export default Dashboard;
