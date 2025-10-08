import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
const NavBar = () => {
    const link = "px-3 py-2 rounded hover:bg-gray-100 transition";
    return (_jsx("header", { className: "border-b bg-white", children: _jsxs("div", { className: "container flex items-center h-14 gap-2", children: [_jsx("div", { className: "font-bold", children: "\u8CC7\u7523\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }), _jsxs("nav", { className: "flex items-center gap-1 ml-4 text-sm", children: [_jsx(NavLink, { to: "/", end: true, className: link, children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx(NavLink, { to: "/assets", className: link, children: "\u8CC7\u7523\u7BA1\u7406" }), _jsx(NavLink, { to: "/files", className: link, children: "\u30D5\u30A1\u30A4\u30EB\u7BA1\u7406" }), _jsx(NavLink, { to: "/manual-entry", className: link, children: "\u624B\u5165\u529B" }), _jsx(NavLink, { to: "/reports", className: link, children: "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B" }), _jsx(NavLink, { to: "/admin", className: link, children: "\u7BA1\u7406\u8005\u8A2D\u5B9A" })] })] }) }));
};
export default NavBar;
