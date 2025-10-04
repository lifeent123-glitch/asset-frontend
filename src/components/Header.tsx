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
  return (
    <header className="bg-gray-100" style={{ borderBottom: "1px solid #ccc" }}>
      <div className="flex items-center justify-between" style={{ height: "50px" }}>
        {/* 左：ロゴ */}
        <div style={{ paddingLeft: "20px" }}>
          <h1 className="text-gray-900" style={{ fontSize: "16px", fontWeight: "bold" }}>
            資産管理システム
          </h1>
        </div>

        {/* 右：タブナビ（Assetsと同配置/配色） */}
        <nav className="flex items-center" style={{ paddingRight: "20px" }}>
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === "/"}
              className={({ isActive }) =>
                [
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
                ].join(" ")
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: "#4a90e2" } // Assetsと同じ青
                  : undefined
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
