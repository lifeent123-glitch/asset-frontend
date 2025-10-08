import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Calendar, Download, FileText, Search, ArrowUpRight, ArrowDownRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
/* =========================
 * ユーティリティ
 * ========================= */
const toCSV = (headers, rows) => {
    const esc = (v) => typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))
        ? `"${v.replace(/"/g, '""')}"`
        : v;
    const body = [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    return new Blob([body], { type: 'text/csv;charset=utf-8' });
};
const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};
const fmt = (n, locale = 'ja-JP', frac = 0) => n.toLocaleString(locale, { minimumFractionDigits: frac, maximumFractionDigits: frac });
/* =========================
 * メイン
 * ========================= */
const Reports = () => {
    const [rows, setRows] = useState([]);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [segment, setSegment] = useState('total');
    const [query, setQuery] = useState('');
    const [showAmounts, setShowAmounts] = useState(true);
    const [currencyView, setCurrencyView] = useState('both');
    // 取得（APIがなければ空で安全動作）
    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                // 想定API：/api/reports?month=YYYY-MM&segment=total|corporate|personal
                const qs = new URLSearchParams({ month, segment });
                const res = await fetch(`/api/reports?${qs.toString()}`, { signal: ac.signal });
                if (!res.ok) {
                    setRows([]);
                    return;
                }
                const json = (await res.json());
                const list = Array.isArray(json?.data?.rows) ? json.data.rows : [];
                setRows(list);
            }
            catch {
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
            .filter(r => key === '' ||
            r.account.toLowerCase().includes(key) ||
            r.category.toLowerCase().includes(key) ||
            (r.description ?? '').toLowerCase().includes(key))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [rows, query, segment]);
    // 集計
    const totals = useMemo(() => {
        const inJPY = filtered.filter(r => r.type === 'IN').reduce((s, r) => s + r.jpyAmount, 0);
        const outJPY = filtered.filter(r => r.type === 'OUT').reduce((s, r) => s + r.jpyAmount, 0);
        const cfJPY = filtered.filter(r => r.type === 'キャッシュフロー').reduce((s, r) => s + r.jpyAmount, 0);
        const netJPY = inJPY - outJPY;
        const inUSD = filtered.filter(r => r.type === 'IN').reduce((s, r) => s + (r.usdAmount ?? 0), 0);
        const outUSD = filtered.filter(r => r.type === 'OUT').reduce((s, r) => s + (r.usdAmount ?? 0), 0);
        const cfUSD = filtered.filter(r => r.type === 'キャッシュフロー').reduce((s, r) => s + (r.usdAmount ?? 0), 0);
        const netUSD = inUSD - outUSD;
        return { inJPY, outJPY, cfJPY, netJPY, inUSD, outUSD, cfUSD, netUSD };
    }, [filtered]);
    // エクスポート（CSV / Excel相当）
    const onExport = (kind) => {
        const headers = [
            'date', 'segment', 'account', 'category', 'type', 'currency', 'amount', 'jpyAmount', 'usdAmount', 'description'
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-gray-100 border-b", children: _jsxs("div", { className: "flex items-center justify-between h-12 px-6", children: [_jsx("h1", { className: "font-semibold text-gray-800", children: "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B" }), _jsxs("nav", { className: "flex items-center gap-1 text-sm", children: [_jsx("a", { href: "/", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx("a", { href: "/assets", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u8CC7\u7523\u7BA1\u7406" }), _jsx("a", { href: "/files", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u30D5\u30A1\u30A4\u30EB\u7BA1\u7406" }), _jsx("a", { href: "/manual-entry", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u624B\u5165\u529B" }), _jsx("a", { href: "/reports", className: "px-3 py-2 bg-blue-600 text-white rounded", children: "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B" }), _jsx("a", { href: "/admin", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u7BA1\u7406\u8005\u8A2D\u5B9A" })] })] }) }), _jsx("div", { className: "bg-white border-b px-6 py-4 sticky top-[48px] z-30", children: _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { size: 18, className: "text-gray-500" }), _jsx("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value), className: "px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" })] }), _jsxs("select", { value: segment, onChange: (e) => setSegment(e.target.value), className: "px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm", children: [_jsx("option", { value: "total", children: "\u7DCF\u5408" }), _jsx("option", { value: "corporate", children: "\u6CD5\u4EBA" }), _jsx("option", { value: "personal", children: "\u500B\u4EBA" })] }), _jsxs("div", { className: "flex items-center gap-1 bg-gray-100 rounded-lg p-1", children: [_jsx("button", { onClick: () => setCurrencyView('jpy'), className: `px-3 py-1 rounded text-sm ${currencyView === 'jpy' ? 'bg-white shadow-sm' : ''}`, children: "\u5186" }), _jsx("button", { onClick: () => setCurrencyView('usd'), className: `px-3 py-1 rounded text-sm ${currencyView === 'usd' ? 'bg-white shadow-sm' : ''}`, children: "$" }), _jsx("button", { onClick: () => setCurrencyView('both'), className: `px-3 py-1 rounded text-sm ${currencyView === 'both' ? 'bg-white shadow-sm' : ''}`, children: "\u4E21\u65B9" })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400", size: 18 }), _jsx("input", { type: "text", placeholder: "\u30A2\u30AB\u30A6\u30F3\u30C8\u30FB\u30AB\u30C6\u30B4\u30EA\u30FB\u30E1\u30E2\u3067\u691C\u7D22\u2026", value: query, onChange: (e) => setQuery(e.target.value), className: "w-72 pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" })] }), _jsx("button", { onClick: () => setShowAmounts(!showAmounts), className: "p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors", title: showAmounts ? '金額を隠す' : '金額を表示', children: showAmounts ? _jsx(Eye, { size: 18 }) : _jsx(EyeOff, { size: 18 }) }), _jsxs("div", { className: "ml-auto flex items-center gap-2", children: [_jsxs("button", { onClick: () => onExport('CSV'), className: "flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700", children: [_jsx(FileText, { size: 14 }), "CSV"] }), _jsxs("button", { onClick: () => onExport('Excel'), className: "flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700", children: [_jsx(Download, { size: 14 }), "Excel"] })] })] }) }), _jsx("div", { className: "px-6 py-5", children: _jsxs("div", { className: "grid grid-cols-4 gap-3", children: [_jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("div", { className: "text-xs text-gray-500", children: "\u53CE\u5165\uFF08JPY\uFF09" }), _jsx("div", { className: "text-xl font-bold", children: showAmounts ? `¥${fmt(totals.inJPY)}` : '***,***' })] }), _jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("div", { className: "text-xs text-gray-500", children: "\u652F\u51FA\uFF08JPY\uFF09" }), _jsx("div", { className: "text-xl font-bold", children: showAmounts ? `¥${fmt(totals.outJPY)}` : '***,***' })] }), _jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("div", { className: "text-xs text-gray-500", children: "\u30AD\u30E3\u30C3\u30B7\u30E5\u30D5\u30ED\u30FC\uFF08JPY\uFF09" }), _jsx("div", { className: "text-xl font-bold", children: showAmounts ? `¥${fmt(totals.cfJPY)}` : '***,***' })] }), _jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4", children: [_jsx("div", { className: "text-xs opacity-90", children: "\u7D14\u984D\uFF08JPY\uFF09" }), _jsx("div", { className: "text-xl font-bold", children: showAmounts ? `¥${fmt(totals.netJPY)}` : '***,***' })] }), (currencyView === 'usd' || currencyView === 'both') && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("div", { className: "text-xs text-gray-500", children: "\u53CE\u5165\uFF08USD\uFF09" }), _jsx("div", { className: "text-xl font-bold", children: showAmounts ? `$${fmt(totals.inUSD, 'en-US', 2)}` : '***,***' })] }), _jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("div", { className: "text-xs text-gray-500", children: "\u652F\u51FA\uFF08USD\uFF09" }), _jsx("div", { className: "text-xl font-bold", children: showAmounts ? `$${fmt(totals.outUSD, 'en-US', 2)}` : '***,***' })] }), _jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("div", { className: "text-xs text-gray-500", children: "\u30AD\u30E3\u30C3\u30B7\u30E5\u30D5\u30ED\u30FC\uFF08USD\uFF09" }), _jsx("div", { className: "text-xl font-bold", children: showAmounts ? `$${fmt(totals.cfUSD, 'en-US', 2)}` : '***,***' })] }), _jsxs("div", { className: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg p-4", children: [_jsx("div", { className: "text-xs opacity-90", children: "\u7D14\u984D\uFF08USD\uFF09" }), _jsx("div", { className: "text-xl font-bold", children: showAmounts ? `$${fmt(totals.netUSD, 'en-US', 2)}` : '***,***' })] })] }))] }) }), _jsxs("div", { className: "px-6 pb-8", children: [_jsx("div", { className: "bg-white rounded-lg border overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u65E5\u4ED8" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u533A\u5206" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u30A2\u30AB\u30A6\u30F3\u30C8" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u30AB\u30C6\u30B4\u30EA" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u7A2E\u5225" }), _jsx("th", { className: "px-4 py-2 text-right text-xs text-gray-600", children: "\u91D1\u984D\uFF08\u5143\u901A\u8CA8\uFF09" }), (currencyView === 'jpy' || currencyView === 'both') && (_jsx("th", { className: "px-4 py-2 text-right text-xs text-gray-600", children: "\u5186\u63DB\u7B97" })), (currencyView === 'usd' || currencyView === 'both') && (_jsx("th", { className: "px-4 py-2 text-right text-xs text-gray-600", children: "$\u63DB\u7B97" })), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u30E1\u30E2" })] }) }), _jsxs("tbody", { className: "divide-y", children: [filtered.map(r => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2 text-sm", children: r.date }), _jsx("td", { className: "px-4 py-2 text-sm", children: r.segment === 'corporate' ? '法人' : r.segment === 'personal' ? '個人' : '総合' }), _jsx("td", { className: "px-4 py-2 text-sm", children: r.account }), _jsx("td", { className: "px-4 py-2 text-sm", children: r.category }), _jsx("td", { className: "px-4 py-2 text-sm", children: _jsxs("span", { className: `inline-flex items-center gap-1 ${r.type === 'IN' ? 'text-green-600' : r.type === 'OUT' ? 'text-red-600' : 'text-blue-600'}`, children: [r.type === 'IN' ? _jsx(ArrowUpRight, { size: 14 }) : r.type === 'OUT' ? _jsx(ArrowDownRight, { size: 14 }) : _jsx(AlertCircle, { size: 14 }), r.type] }) }), _jsx("td", { className: "px-4 py-2 text-sm text-right", children: showAmounts ? `${r.currency} ${fmt(r.amount, r.currency === 'USD' ? 'en-US' : 'ja-JP', r.currency === 'USD' ? 2 : 0)}` : '***,***' }), (currencyView === 'jpy' || currencyView === 'both') && (_jsx("td", { className: "px-4 py-2 text-sm text-right", children: showAmounts ? `¥${fmt(r.jpyAmount)}` : '***,***' })), (currencyView === 'usd' || currencyView === 'both') && (_jsx("td", { className: "px-4 py-2 text-sm text-right", children: showAmounts ? `$${fmt(r.usdAmount ?? 0, 'en-US', 2)}` : '***,***' })), _jsx("td", { className: "px-4 py-2 text-sm text-gray-600", children: r.description ?? '' })] }, r.id))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 9, className: "px-6 py-10 text-center text-sm text-gray-500", children: "\u5BFE\u8C61\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u6708\u30FB\u533A\u5206\u30FB\u691C\u7D22\u6761\u4EF6\u3092\u5909\u66F4\u3057\u3066\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" }) }))] }), _jsx("tfoot", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-xs text-gray-600", colSpan: 5, children: "\u5C0F\u8A08" }), _jsx("td", { className: "px-4 py-3 text-xs text-right text-gray-800 font-medium", children: showAmounts ? `IN/OUT = ¥${fmt(totals.inJPY)} / ¥${fmt(totals.outJPY)}` : '***,***' }), (currencyView === 'jpy' || currencyView === 'both') && (_jsx("td", { className: "px-4 py-3 text-xs text-right text-gray-800 font-medium", children: showAmounts ? `Net ¥${fmt(totals.netJPY)}` : '***,***' })), (currencyView === 'usd' || currencyView === 'both') && (_jsx("td", { className: "px-4 py-3 text-xs text-right text-gray-800 font-medium", children: showAmounts ? `Net $${fmt(totals.netUSD, 'en-US', 2)}` : '***,***' })), _jsx("td", {})] }) })] }) }), _jsxs("div", { className: "mt-4 text-xs text-gray-500 flex items-start gap-2", children: [_jsx(AlertCircle, { size: 14, className: "mt-0.5" }), _jsxs("div", { children: [_jsx("p", { children: "\u203B \u91D1\u984D\u8868\u793A\u306F\u753B\u9762\u306E\u300C\u5186\uFF0F$/\u4E21\u65B9\u300D\u5207\u66FF\u306B\u9023\u52D5\u3057\u307E\u3059\u3002PDF/Excel\u51FA\u529B\u6642\u3082\u540C\u69D8\u306E\u8868\u8A18\u3092\u60F3\u5B9A\u3057\u3066\u3044\u307E\u3059\u3002" }), _jsx("p", { children: "\u203B API\u672A\u63A5\u7D9A\u6642\u306F\u7A7A\u3067\u8868\u793A\uFF08\u30A8\u30E9\u30FC\u3092\u51FA\u3055\u306A\u3044\uFF09\u3057\u307E\u3059\u3002\u63A5\u7D9A\u5F8C\u306F `/api/reports?month=&segment=` \u3092\u8FD4\u3059\u5B9F\u88C5\u306B\u7F6E\u63DB\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })] })] })] })] }));
};
export default Reports;
