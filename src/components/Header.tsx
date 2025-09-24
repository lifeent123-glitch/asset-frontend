import React from "react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { to: "/",            label: "ダッシュボード" },
  { to: "/assets",      label: "資産管理" },
  { to: "/files",       label: "ファイル管理" },
  { to: "/manual-entry",label: "手入力" },
  { to: "/reports",     label: "レポート出力" },
  { to: "/admin",       label: "管理者設定" },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="bg-gray-100 border-b">
      <div className="container mx-auto h-14 px-4 flex items-center justify-between">
        <h1 className="text-sm font-bold text-gray-900">資産管理システム</h1>
        <nav className="flex items-center gap-2 text-sm">
          {tabs.map(({ to, label }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "px-3 py-2 rounded transition-colors",
                  active ? "bg-blue-600 text-white" : "hover:bg-gray-200"
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}