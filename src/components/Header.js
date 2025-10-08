import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
const tabs = [
    { to: "/", label: "ダッシュボード" },
    { to: "/assets", label: "資産管理" },
    { to: "/files", label: "ファイル管理" },
    { to: "/manual-entry", label: "手入力" },
    { to: "/reports", label: "レポート出力" },
    { to: "/admin", label: "管理者設定" },
];
export default function Header() {
    return (_jsx("header", { className: "bg-gray-100", style: { borderBottom: "1px solid #ccc" }, children: _jsxs("div", { className: "flex items-center justify-between", style: { height: "50px" }, children: [_jsx("div", { style: { paddingLeft: "20px" }, children: _jsx("h1", { className: "text-gray-900", style: { fontSize: "16px", fontWeight: "bold" }, children: "\u8CC7\u7523\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }) }), _jsx("nav", { className: "flex items-center", style: { paddingRight: "20px" }, children: tabs.map((t) => (_jsx(NavLink, { to: t.to, end: t.to === "/", className: ({ isActive }) => [
                            "hover:bg-gray-200",
                            "inline-block",
                            "relative",
                            "no-underline",
                            "text-[14px]",
                            "px-[18px]",
                            "py-[15px]",
                            isActive
                                ? "text-white font-semibold rounded-t-[4px]"
                                : "text-[#333] font-normal",
                        ].join(" "), style: ({ isActive }) => isActive
                            ? { backgroundColor: "#4a90e2" } // Assetsと同じ青
                            : undefined, children: t.label }, t.to))) })] }) }));
}
