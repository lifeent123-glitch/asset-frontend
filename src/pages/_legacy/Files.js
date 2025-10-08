import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Upload, File as FileIcon, FileText, Image, Check, AlertCircle, Search, Download, Eye, Edit3, CheckCircle, Clock, Trash2 } from 'lucide-react';
/* =========================
 * 一覧のステータス表示
 * ========================= */
const statusConfig = {
    処理中: { color: 'text-gray-600', icon: Clock },
    要補正: { color: 'text-yellow-600', icon: AlertCircle },
    補正済: { color: 'text-blue-600', icon: CheckCircle },
    反映済: { color: 'text-green-600', icon: Check },
};
/* =========================
 * メイン
 * ========================= */
const Files = () => {
    // 空で開始（ダミーデータは使わない）
    const [files, setFiles] = useState([]);
    const [search, setSearch] = useState('');
    const [expandedFile, setExpandedFile] = useState(null);
    // DnD用
    const dropZoneRef = useRef(null);
    /* ========== ユーティリティ ========== */
    const today = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);
    const filtered = useMemo(() => {
        if (!search.trim())
            return files;
        const key = search.toLowerCase();
        return files.filter((f) => f.filename.toLowerCase().includes(key) ||
            f.extractedData.accountInfo.bankName.toLowerCase().includes(key) ||
            f.extractedData.accountInfo.accountNumber.toLowerCase().includes(key));
    }, [files, search]);
    const getStatusBadge = (status) => {
        const cfg = statusConfig[status] ?? statusConfig['処理中'];
        const Icon = cfg.icon;
        return (_jsxs("span", { className: `inline-flex items-center gap-1 ${cfg.color}`, children: [_jsx(Icon, { size: 14 }), status] }));
    };
    /* ========== 追加／編集系 ========== */
    // input[type=file] からの追加
    const handleFileInput = (e) => {
        const fl = e.target.files;
        if (!fl || fl.length === 0)
            return;
        const newRows = Array.from(fl).map((file, idx) => {
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            const kind = ext === 'pdf' ? 'PDF' :
                ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? '画像' :
                    ext === 'csv' ? 'CSV' : 'その他';
            return {
                id: Date.now() + idx,
                filename: file.name,
                type: kind,
                uploadDate: today,
                status: '処理中',
                extractedData: {
                    // 追加直後は最低限の空枠
                    accountInfo: {
                        bankName: '',
                        accountNumber: '',
                        period: '',
                        openingBalance: 0,
                        closingBalance: 0,
                    },
                    transactions: [],
                },
            };
        });
        setFiles((prev) => [...newRows, ...prev]);
        e.target.value = ''; // 違うファイルで再度選択できるように
    };
    // DnD追加
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const fl = e.dataTransfer.files;
        if (!fl || fl.length === 0)
            return;
        const newRows = Array.from(fl).map((file, idx) => {
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            const kind = ext === 'pdf' ? 'PDF' :
                ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? '画像' :
                    ext === 'csv' ? 'CSV' : 'その他';
            return {
                id: Date.now() + idx,
                filename: file.name,
                type: kind,
                uploadDate: today,
                status: '処理中',
                extractedData: {
                    accountInfo: {
                        bankName: '',
                        accountNumber: '',
                        period: '',
                        openingBalance: 0,
                        closingBalance: 0,
                    },
                    transactions: [],
                },
            };
        });
        setFiles((prev) => [...newRows, ...prev]);
    }, [today]);
    // ファイル行の編集（accountInfo/transactions 等）
    const handleEdit = (fileId, newData) => {
        setFiles((prev) => prev.map((f) => f.id === fileId
            ? { ...f, extractedData: { ...f.extractedData, ...newData } }
            : f));
    };
    // 「反映」ボタン想定：状態を遷移
    const handleApply = (fileId) => {
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: '反映済' } : f)));
    };
    // 削除
    const handleDelete = (fileId) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (expandedFile === fileId)
            setExpandedFile(null);
    };
    /* ========== 補助UI ========== */
    const SumCell = ({ txs, field }) => {
        const val = useMemo(() => txs.reduce((sum, t) => sum + (t[field] || 0), 0), [txs, field]);
        return _jsx(_Fragment, { children: val.toLocaleString() });
    };
    const ExtractedDataPreview = ({ data, onEdit, onApply }) => {
        const { accountInfo, transactions } = data;
        return (_jsxs("div", { className: "border rounded-md overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-4 py-2 font-medium text-sm", children: "\u62BD\u51FA\u30C7\u30FC\u30BF\uFF08\u7DE8\u96C6\u53EF\uFF09" }), _jsxs("div", { className: "p-4 grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "\u53E3\u5EA7\u60C5\u5831" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("label", { className: "text-xs text-gray-600", children: "\u9280\u884C\u540D" }), _jsx("input", { className: "border px-2 py-1 text-sm rounded", value: accountInfo.bankName, onChange: (e) => onEdit({ accountInfo: { ...accountInfo, bankName: e.target.value } }) }), _jsx("label", { className: "text-xs text-gray-600", children: "\u53E3\u5EA7\u756A\u53F7" }), _jsx("input", { className: "border px-2 py-1 text-sm rounded", value: accountInfo.accountNumber, onChange: (e) => onEdit({ accountInfo: { ...accountInfo, accountNumber: e.target.value } }) }), _jsx("label", { className: "text-xs text-gray-600", children: "\u5BFE\u8C61\u671F\u9593" }), _jsx("input", { className: "border px-2 py-1 text-sm rounded", placeholder: "2025/07", value: accountInfo.period, onChange: (e) => onEdit({ accountInfo: { ...accountInfo, period: e.target.value } }) }), _jsx("label", { className: "text-xs text-gray-600", children: "\u671F\u9996\u6B8B\u9AD8" }), _jsx("input", { type: "number", className: "border px-2 py-1 text-sm rounded", value: accountInfo.openingBalance, onChange: (e) => onEdit({
                                                accountInfo: { ...accountInfo, openingBalance: parseFloat(e.target.value) || 0 },
                                            }) }), _jsx("label", { className: "text-xs text-gray-600", children: "\u671F\u672B\u6B8B\u9AD8" }), _jsx("input", { type: "number", className: "border px-2 py-1 text-sm rounded", value: accountInfo.closingBalance, onChange: (e) => onEdit({
                                                accountInfo: { ...accountInfo, closingBalance: parseFloat(e.target.value) || 0 },
                                            }) })] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "\u30C8\u30E9\u30F3\u30B6\u30AF\u30B7\u30E7\u30F3" }), _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-left text-xs text-gray-600", children: "\u65E5\u4ED8" }), _jsx("th", { className: "px-3 py-2 text-left text-xs text-gray-600", children: "\u6458\u8981" }), _jsx("th", { className: "px-3 py-2 text-right text-xs text-gray-600", children: "\u5165\u91D1" }), _jsx("th", { className: "px-3 py-2 text-right text-xs text-gray-600", children: "\u51FA\u91D1" })] }) }), _jsxs("tbody", { className: "divide-y", children: [transactions.map((t, i) => (_jsxs("tr", { children: [_jsx("td", { className: "px-3 py-1 text-sm", children: _jsx("input", { className: "border px-2 py-1 text-sm rounded w-32", value: t.date, onChange: (e) => {
                                                                        const next = [...transactions];
                                                                        next[i] = { ...next[i], date: e.target.value };
                                                                        onEdit({ transactions: next });
                                                                    } }) }), _jsx("td", { className: "px-3 py-1 text-sm", children: _jsx("input", { className: "border px-2 py-1 text-sm rounded w-full", value: t.description, onChange: (e) => {
                                                                        const next = [...transactions];
                                                                        next[i] = { ...next[i], description: e.target.value };
                                                                        onEdit({ transactions: next });
                                                                    } }) }), _jsx("td", { className: "px-3 py-1 text-sm text-right", children: _jsx("input", { type: "number", className: "border px-2 py-1 text-sm rounded w-32 text-right", value: t.deposit ?? 0, onChange: (e) => {
                                                                        const next = [...transactions];
                                                                        next[i] = { ...next[i], deposit: parseFloat(e.target.value) || 0 };
                                                                        onEdit({ transactions: next });
                                                                    } }) }), _jsx("td", { className: "px-3 py-1 text-sm text-right", children: _jsx("input", { type: "number", className: "border px-2 py-1 text-sm rounded w-32 text-right", value: t.withdrawal ?? 0, onChange: (e) => {
                                                                        const next = [...transactions];
                                                                        next[i] = { ...next[i], withdrawal: parseFloat(e.target.value) || 0 };
                                                                        onEdit({ transactions: next });
                                                                    } }) })] }, i))), transactions.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-3 py-3 text-sm text-gray-500 text-center", children: "\u53D6\u5F15\u660E\u7D30\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002\u53F3\u4E0A\u306E\uFF0B\u304B\u3089\u884C\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }) }))] }), _jsx("tfoot", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("td", { className: "px-3 py-2 text-xs text-gray-600", colSpan: 2, children: "\u5C0F\u8A08" }), _jsx("td", { className: "px-3 py-2 text-right text-sm", children: _jsx(SumCell, { txs: transactions, field: "deposit" }) }), _jsx("td", { className: "px-3 py-2 text-right text-sm", children: _jsx(SumCell, { txs: transactions, field: "withdrawal" }) })] }) })] }) }), _jsx("div", { className: "mt-2 text-right", children: _jsxs("button", { className: "inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700", onClick: onApply, children: [_jsx(Check, { size: 16 }), "\u53CD\u6620"] }) })] })] })] }));
    };
    /* ========== 画面 ========== */
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-gray-100 border-b", children: _jsxs("div", { className: "max-w-full px-6 h-12 flex items-center justify-between", children: [_jsx("h2", { className: "font-semibold text-gray-800", children: "\u30D5\u30A1\u30A4\u30EB\u7BA1\u7406" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("label", { className: "inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700", children: [_jsx(Upload, { size: 16 }), "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9", _jsx("input", { type: "file", className: "hidden", multiple: true, onChange: handleFileInput })] }), _jsx("button", { className: "p-2 hover:bg-gray-200 rounded", children: _jsx(Download, { size: 18 }) })] })] }) }), _jsx("div", { className: "px-6 py-4 bg-white border-b", children: _jsxs("div", { className: "max-w-full flex flex-wrap items-center gap-3", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400", size: 16 }), _jsx("input", { className: "pl-9 pr-3 py-2 border rounded w-72 text-sm", placeholder: "\u30D5\u30A1\u30A4\u30EB\u540D\u30FB\u9280\u884C\u540D\u30FB\u53E3\u5EA7\u756A\u53F7\u3067\u691C\u7D22", value: search, onChange: (e) => setSearch(e.target.value) })] }), _jsx("div", { ref: dropZoneRef, onDragOver: handleDrag, onDragEnter: handleDrag, onDrop: handleDrop, className: "flex-1 min-w-[280px] border-2 border-dashed border-gray-300 rounded py-3 px-4 text-sm text-gray-500", children: "\u3053\u3053\u306B\u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30E9\u30C3\u30B0\uFF06\u30C9\u30ED\u30C3\u30D7" })] }) }), _jsxs("div", { className: "px-6 py-6", children: [_jsx("div", { className: "bg-white rounded border overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u30D5\u30A1\u30A4\u30EB\u540D" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u7A2E\u5225" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u65E5" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u53E3\u5EA7\u60C5\u5831" }), _jsx("th", { className: "px-4 py-2 text-right text-xs text-gray-600", children: "\u5165\u91D1\u5408\u8A08" }), _jsx("th", { className: "px-4 py-2 text-right text-xs text-gray-600", children: "\u51FA\u91D1\u5408\u8A08" }), _jsx("th", { className: "px-4 py-2 text-left text-xs text-gray-600", children: "\u64CD\u4F5C" })] }) }), _jsxs("tbody", { className: "divide-y", children: [filtered.map((file) => (_jsxs(React.Fragment, { children: [_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2 text-sm", children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [file.type === 'PDF' ? _jsx(FileText, { size: 16 }) :
                                                                        file.type === '画像' ? _jsx(Image, { size: 16 }) :
                                                                            file.type === 'CSV' ? _jsx(FileIcon, { size: 16 }) : _jsx(FileIcon, { size: 16 }), file.filename] }) }), _jsx("td", { className: "px-4 py-2 text-sm", children: file.type }), _jsx("td", { className: "px-4 py-2 text-sm", children: file.uploadDate }), _jsx("td", { className: "px-4 py-2 text-sm", children: getStatusBadge(file.status) }), _jsx("td", { className: "px-4 py-2 text-sm", children: file.extractedData.accountInfo.bankName
                                                                ? `${file.extractedData.accountInfo.bankName}（${file.extractedData.accountInfo.accountNumber}）`
                                                                : _jsx("span", { className: "text-gray-400", children: "\u2014" }) }), _jsx("td", { className: "px-4 py-2 text-sm text-right", children: _jsx(SumCell, { txs: file.extractedData.transactions, field: "deposit" }) }), _jsx("td", { className: "px-4 py-2 text-sm text-right", children: _jsx(SumCell, { txs: file.extractedData.transactions, field: "withdrawal" }) }), _jsx("td", { className: "px-4 py-2 text-sm", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "px-2 py-1 border rounded text-xs hover:bg-gray-100", onClick: () => setExpandedFile(expandedFile === file.id ? null : file.id), title: "\u8A73\u7D30\u3092\u5C55\u958B", children: _jsx(Eye, { size: 14 }) }), _jsx("button", { className: "px-2 py-1 border rounded text-xs hover:bg-gray-100", onClick: () => handleEdit(file.id, {
                                                                            transactions: [
                                                                                ...file.extractedData.transactions,
                                                                                { date: today, description: '追加入力', deposit: 0, withdrawal: 0 },
                                                                            ],
                                                                        }), title: "\u660E\u7D30\u884C\u3092\u8FFD\u52A0", children: _jsx(Edit3, { size: 14 }) }), _jsx("button", { className: "px-2 py-1 border rounded text-xs hover:bg-gray-100", onClick: () => handleApply(file.id), title: "\u53CD\u6620", children: _jsx(CheckCircle, { size: 14 }) }), _jsx("button", { className: "px-2 py-1 border rounded text-xs hover:bg-red-50 text-red-600", onClick: () => handleDelete(file.id), title: "\u524A\u9664", children: _jsx(Trash2, { size: 14 }) })] }) })] }), expandedFile === file.id && (_jsx("tr", { children: _jsx("td", { colSpan: 8, className: "px-6 py-4 bg-gray-50", children: _jsx(ExtractedDataPreview, { data: file.extractedData, onEdit: (newData) => handleEdit(file.id, newData), onApply: () => handleApply(file.id) }) }) }))] }, file.id))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-sm text-gray-500", children: "\u30D5\u30A1\u30A4\u30EB\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002\u53F3\u4E0A\u306E\u300C\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u300D\u307E\u305F\u306F\u4E0A\u90E8\u306E\u30C9\u30ED\u30C3\u30D7\u9818\u57DF\u306B\u30D5\u30A1\u30A4\u30EB\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }) }))] })] }) }), _jsxs("div", { className: "mt-4 text-xs text-gray-500 flex items-start gap-2", children: [_jsx(AlertCircle, { size: 14, className: "mt-0.5" }), _jsxs("div", { children: [_jsx("p", { children: "\u203B \u3053\u3053\u3067\u306E\u7DE8\u96C6\u306F\u4E00\u6642\u7684\u306A\u3082\u306E\u3067\u3001\u4FDD\u5B58\u64CD\u4F5C\uFF08\u53CD\u6620\uFF09\u6642\u306B\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u3078\u9001\u4FE1\u3059\u308B\u60F3\u5B9A\u3067\u3059\u3002" }), _jsx("p", { children: "\u203B PDF/CSV \u306E\u81EA\u52D5\u62BD\u51FA\u306F\u5C06\u6765\u306EAPI `/api/files/extract` \u3067\u7F6E\u63DB\u3057\u307E\u3059\uFF08\u73FE\u5728\u306F\u624B\u5165\u529B\u30D9\u30FC\u30B9\uFF09\u3002" })] })] })] })] }));
};
export default Files;
