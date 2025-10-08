import { NavLink, useNavigate } from "react-router-dom";

/**
 * 資産管理ページのヘッダー仕様に合わせた共通ヘッダー
 * ・高さ 50px
 * ・左：タイトル、右：タブナビ（アクティブは #4a90e2、rounded-t）
 * ・全幅（左右は px-8 に統一：Dashboard と同じ余白感）
 * ・折返し防止＆横スクロール許可（狭い画面で崩れない）
 */
const tabs = [
  { to: "/", label: "ダッシュボード", end: true },
  { to: "/assets", label: "資産管理" },
  { to: "/files", label: "ファイル管理" },
  { to: "/manual-entry", label: "手入力" },
  { to: "/reports", label: "レポート出力" },
  { to: "/admin", label: "管理者設定" },
];

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-gray-100 border-b border-gray-300">
      <div
        className="w-full h-[50px] flex items-center justify-between px-8"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* 左：ロゴ/タイトル（クリックでホーム） */}
        <button
          onClick={() => navigate("/")}
          className="text-gray-900 text-[16px] font-bold tracking-wide hover:opacity-80 shrink-0"
          aria-label="ホームへ戻る"
        >
          資産管理システム
        </button>

        {/* 右：タブナビ（資産管理ページと同一の見た目） */}
        <nav className="ml-4 flex-1 overflow-x-auto whitespace-nowrap">
          <div className="flex items-end gap-[2px] justify-end pr-[4px]">
            {tabs.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    "inline-block relative no-underline select-none",
                    "text-[14px] px-[18px] py-[15px] rounded-t-[4px]",
                    isActive
                      ? "text-white font-semibold"
                      : "text-[#333] font-normal hover:bg-gray-200",
                  ].join(" ")
                }
                style={({ isActive }) =>
                  isActive ? { backgroundColor: "#4a90e2" } : undefined
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}