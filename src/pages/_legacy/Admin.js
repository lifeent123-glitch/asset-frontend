import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Settings, RefreshCw, Users, Globe, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Wifi } from 'lucide-react';
/* =========================
 * メイン
 * ========================= */
const Admin = () => {
    // レートモード切替
    const [rateMode, setRateMode] = useState('avg');
    const [autoAggregation, setAutoAggregation] = useState(true);
    const [pingStatus, setPingStatus] = useState('idle');
    const [isExporting, setIsExporting] = useState(false);
    // アカウント一覧（モック）
    const users = useMemo(() => [
        { id: 1, name: '山田 太志', role: 'admin', email: 'admin@keieikanribu.com', lastLogin: '2025-10-03 18:30' },
        { id: 2, name: '佐藤 花子', role: 'viewer', email: 'viewer@keieikanribu.com', lastLogin: '2025-10-02 10:15' },
        { id: 3, name: 'テスト アカウント', role: 'viewer', email: 'test@keieikanribu.com', lastLogin: '2025-09-29 09:00' },
    ], []);
    /* =========================
     * モック関数
     * ========================= */
    // Pingテスト（擬似的に成功/失敗をランダム返却）
    const handlePing = async () => {
        setPingStatus('idle');
        await new Promise(r => setTimeout(r, 600));
        const ok = Math.random() > 0.2;
        setPingStatus(ok ? 'ok' : 'error');
    };
    // CSVエクスポート
    const handleExport = () => {
        setIsExporting(true);
        const header = ['name', 'email', 'role', 'lastLogin'];
        const csvRows = users.map(u => [u.name, u.email, u.role, u.lastLogin]);
        const body = [header.join(','), ...csvRows.map(r => r.join(','))].join('\n');
        const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `userlist_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setTimeout(() => setIsExporting(false), 800);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-gray-100 border-b", children: _jsxs("div", { className: "flex items-center justify-between h-12 px-6", children: [_jsxs("h1", { className: "font-semibold text-gray-800 flex items-center gap-2", children: [_jsx(Settings, { size: 18 }), " \u7BA1\u7406\u8005\u8A2D\u5B9A"] }), _jsxs("nav", { className: "flex items-center gap-1 text-sm", children: [_jsx("a", { href: "/", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx("a", { href: "/assets", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u8CC7\u7523\u7BA1\u7406" }), _jsx("a", { href: "/files", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u30D5\u30A1\u30A4\u30EB\u7BA1\u7406" }), _jsx("a", { href: "/manual-entry", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u624B\u5165\u529B" }), _jsx("a", { href: "/reports", className: "px-3 py-2 hover:bg-gray-200 rounded", children: "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B" }), _jsx("a", { href: "/admin", className: "px-3 py-2 bg-blue-600 text-white rounded", children: "\u7BA1\u7406\u8005\u8A2D\u5B9A" })] })] }) }), _jsxs("section", { className: "bg-white border-b px-6 py-5", children: [_jsxs("h2", { className: "text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3", children: [_jsx(Globe, { size: 16 }), " \u70BA\u66FF\u30EC\u30FC\u30C8\u30E2\u30FC\u30C9\u8A2D\u5B9A"] }), _jsx("div", { className: "flex items-center gap-2", children: ['avg', 'trade', 'ttm'].map((mode) => (_jsx("button", { onClick: () => setRateMode(mode), className: `px-3 py-2 rounded text-sm border ${rateMode === mode
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`, children: mode.toUpperCase() }, mode))) }), _jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["\u73FE\u5728\u9078\u629E\u4E2D\uFF1A", _jsx("span", { className: "font-semibold text-blue-600", children: rateMode.toUpperCase() }), " \u30E2\u30FC\u30C9"] })] }), _jsxs("section", { className: "bg-white border-b px-6 py-5", children: [_jsxs("h2", { className: "text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3", children: [_jsx(RefreshCw, { size: 16 }), " \u65E5\u6B21\u81EA\u52D5\u96C6\u8A08\u8A2D\u5B9A"] }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs("label", { className: "inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "form-checkbox h-5 w-5 text-blue-600", checked: autoAggregation, onChange: () => setAutoAggregation((v) => !v) }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: autoAggregation ? '有効（毎日 04:00 集計実行）' : '無効' })] }) })] }), _jsxs("section", { className: "bg-white border-b px-6 py-5", children: [_jsxs("h2", { className: "text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3", children: [_jsx(Wifi, { size: 16 }), " API\u9023\u643A\u30C6\u30B9\u30C8"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: handlePing, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700", children: "Ping\u30C6\u30B9\u30C8" }), pingStatus === 'ok' && (_jsxs("span", { className: "text-green-600 flex items-center gap-1 text-sm", children: [_jsx(CheckCircle, { size: 16 }), " 200 OK\uFF08\u5FDC\u7B54\u826F\u597D\uFF09"] })), pingStatus === 'error' && (_jsxs("span", { className: "text-red-600 flex items-center gap-1 text-sm", children: [_jsx(XCircle, { size: 16 }), " \u63A5\u7D9A\u30A8\u30E9\u30FC"] })), pingStatus === 'idle' && (_jsx("span", { className: "text-gray-500 text-sm", children: "\u5F85\u6A5F\u4E2D" }))] })] }), _jsxs("section", { className: "bg-white border-b px-6 py-5", children: [_jsxs("h2", { className: "text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3", children: [_jsx(Users, { size: 16 }), " \u30A2\u30AB\u30A6\u30F3\u30C8\u4E00\u89A7"] }), _jsx("div", { className: "overflow-x-auto border rounded-lg", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-500", children: "\u540D\u524D" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-500", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-500", children: "\u6A29\u9650" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-500", children: "\u6700\u7D42\u30ED\u30B0\u30A4\u30F3" })] }) }), _jsx("tbody", { className: "divide-y", children: users.map((u) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2", children: u.name }), _jsx("td", { className: "px-4 py-2 text-gray-700", children: u.email }), _jsx("td", { className: "px-4 py-2", children: u.role === 'admin' ? (_jsx("span", { className: "text-blue-600 font-medium", children: "\u7BA1\u7406\u8005" })) : (_jsx("span", { className: "text-gray-700", children: "\u95B2\u89A7\u8005" })) }), _jsx("td", { className: "px-4 py-2 text-gray-600", children: u.lastLogin })] }, u.id))) })] }) })] }), _jsxs("section", { className: "bg-white border-b px-6 py-5", children: [_jsxs("h2", { className: "text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3", children: [_jsx(FileSpreadsheet, { size: 16 }), " CSV\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8"] }), _jsx("button", { onClick: handleExport, disabled: isExporting, className: `flex items-center gap-2 px-4 py-2 rounded text-sm ${isExporting ? 'bg-gray-400 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`, children: isExporting ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { size: 16, className: "animate-spin" }), " \u51FA\u529B\u4E2D\u2026"] })) : (_jsxs(_Fragment, { children: [_jsx(FileSpreadsheet, { size: 16 }), " \u30E6\u30FC\u30B6\u30FC\u30EA\u30B9\u30C8\u51FA\u529B"] })) }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "\u203B \u51FA\u529B\u306F\u7BA1\u7406\u8005\u4E00\u89A7\u306E\u73FE\u5728\u30C7\u30FC\u30BF\u3092CSV\u5F62\u5F0F\u3067\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002" })] }), _jsxs("div", { className: "px-6 py-4 text-xs text-gray-500 flex items-start gap-2", children: [_jsx(AlertCircle, { size: 14, className: "mt-0.5" }), _jsxs("div", { children: [_jsx("p", { children: "\u203B \u3059\u3079\u3066\u306E\u64CD\u4F5C\u306F\u30ED\u30FC\u30AB\u30EB\u30E2\u30C3\u30AF\u3067\u52D5\u4F5C\u3057\u3066\u3044\u307E\u3059\u3002\u672C\u756AAPI\u63A5\u7D9A\u6642\u306F `/api/admin/settings` \u306A\u3069\u306B\u5DEE\u3057\u66FF\u3048\u3066\u304F\u3060\u3055\u3044\u3002" }), _jsx("p", { children: "\u203B Ping\u30C6\u30B9\u30C8\u306F\u901A\u4FE1\u78BA\u8A8D\u306E\u30C7\u30E2\u7528\u3067\u3059\uFF08\u5B9FAPI\u672A\u63A5\u7D9A\uFF09\u3002" })] })] })] }));
};
export default Admin;
