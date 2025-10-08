import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Files from './pages/Files';
import ManualEntry from './pages/ManualEntry';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
export default function App() {
    return (_jsx("div", { className: "min-h-screen", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/assets", element: _jsx(Assets, {}) }), _jsx(Route, { path: "/files", element: _jsx(Files, {}) }), _jsx(Route, { path: "/manual-entry", element: _jsx(ManualEntry, {}) }), _jsx(Route, { path: "/reports", element: _jsx(Reports, {}) }), _jsx(Route, { path: "/admin", element: _jsx(Admin, {}) }), _jsx(Route, { path: "*", element: _jsx(Dashboard, {}) })] }) }));
}
