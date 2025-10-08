import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Button, Table, Input, Select, message } from 'antd';
import dayjs from 'dayjs';
// ====== コンポーネント開始 ======
const ManualEntry = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('');
    // ====== データ取得 ======
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/transactions');
            const list = Array.isArray(data?.data?.transactions) ? data.data.transactions : [];
            setTransactions(list);
            setFilteredTransactions(list);
        }
        catch (err) {
            console.error('データ取得エラー:', err);
            message.error('データ取得に失敗しました');
            setTransactions([]);
            setFilteredTransactions([]);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTransactions();
    }, []);
    // ====== フィルタリング処理 ======
    useEffect(() => {
        const f = transactions
            .filter((t) => t && t.id)
            .filter((t) => searchKeyword
            ? t.account?.includes(searchKeyword) ||
                t.category?.includes(searchKeyword) ||
                t.content?.includes(searchKeyword)
            : true)
            .filter((t) => (selectedCurrency ? t.currency === selectedCurrency : true))
            .filter((t) => t.category !== '資金移動');
        setFilteredTransactions(f);
    }, [transactions, searchKeyword, selectedCurrency]);
    // ====== 合計算出 ======
    const totals = useMemo(() => {
        const inJPY = filteredTransactions
            .filter((t) => t.type === 'IN' && t.category !== '資金移動')
            .reduce((sum, t) => sum + t.jpyAmount, 0);
        const outJPY = filteredTransactions
            .filter((t) => t.type === 'OUT' && t.category !== '資金移動')
            .reduce((sum, t) => sum + t.jpyAmount, 0);
        const cfJPY = filteredTransactions
            .filter((t) => t.type === 'キャッシュフロー')
            .reduce((sum, t) => sum + t.jpyAmount, 0);
        return { inJPY, outJPY, cfJPY, netJPY: inJPY - outJPY };
    }, [filteredTransactions]);
    // ====== カラム定義 ======
    const columns = [
        {
            title: '日付',
            dataIndex: 'date',
            key: 'date',
            render: (text) => dayjs(text).format('YYYY-MM-DD'),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
        },
        { title: '区分', dataIndex: 'type', key: 'type' },
        { title: 'カテゴリ', dataIndex: 'category', key: 'category' },
        { title: '内容', dataIndex: 'content', key: 'content' },
        { title: '金額', dataIndex: 'amount', key: 'amount', align: 'right' },
        { title: '通貨', dataIndex: 'currency', key: 'currency', align: 'center' },
        {
            title: '円換算額',
            dataIndex: 'jpyAmount',
            key: 'jpyAmount',
            align: 'right',
            render: (val) => val.toLocaleString(),
        },
        { title: '備考', dataIndex: 'remarks', key: 'remarks' },
    ];
    // ====== JSX ======
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h2", { children: "\u624B\u5165\u529B\u30C7\u30FC\u30BF\u4E00\u89A7" }), _jsxs("div", { style: { marginBottom: 16, display: 'flex', gap: 12 }, children: [_jsx(Input, { placeholder: "\u691C\u7D22\uFF08\u53E3\u5EA7\u30FB\u30AB\u30C6\u30B4\u30EA\u30FB\u5185\u5BB9\uFF09", value: searchKeyword, onChange: (e) => setSearchKeyword(e.target.value), style: { width: 300 } }), _jsxs(Select, { placeholder: "\u901A\u8CA8\u9078\u629E", value: selectedCurrency || undefined, onChange: (v) => setSelectedCurrency(v), style: { width: 150 }, allowClear: true, children: [_jsx(Select.Option, { value: "JPY", children: "JPY" }), _jsx(Select.Option, { value: "USD", children: "USD" }), _jsx(Select.Option, { value: "BTC", children: "BTC" }), _jsx(Select.Option, { value: "ETH", children: "ETH" }), _jsx(Select.Option, { value: "USDT", children: "USDT" }), _jsx(Select.Option, { value: "USDC", children: "USDC" }), _jsx(Select.Option, { value: "AED", children: "AED" }), _jsx(Select.Option, { value: "NTD", children: "NTD" }), _jsx(Select.Option, { value: "IDR", children: "IDR" })] }), _jsx(Button, { type: "primary", onClick: fetchTransactions, loading: loading, children: "\u518D\u8AAD\u307F\u8FBC\u307F" })] }), _jsx(Table, { dataSource: filteredTransactions, columns: columns, rowKey: "id", loading: loading, pagination: { pageSize: 20 } }), _jsxs("div", { style: { marginTop: 24, textAlign: 'right' }, children: [_jsxs("p", { children: ["\uD83D\uDCB0 \u53CE\u5165\u5408\u8A08\uFF1A", totals.inJPY.toLocaleString(), " \u5186"] }), _jsxs("p", { children: ["\uD83D\uDCB8 \u652F\u51FA\u5408\u8A08\uFF1A", totals.outJPY.toLocaleString(), " \u5186"] }), _jsxs("p", { children: ["\uD83D\uDCB1 \u30AD\u30E3\u30C3\u30B7\u30E5\u30D5\u30ED\u30FC\uFF1A", totals.cfJPY.toLocaleString(), " \u5186"] }), _jsx("p", { children: _jsxs("strong", { children: ["\uD83D\uDCCA \u7D14\u5229\u76CA\uFF1A", totals.netJPY.toLocaleString(), " \u5186"] }) })] })] }));
};
export default ManualEntry;
