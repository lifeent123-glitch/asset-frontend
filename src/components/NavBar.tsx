import { NavLink } from 'react-router-dom'
const NavBar = () => {
  const link = "px-3 py-2 rounded hover:bg-gray-100 transition"
  return (
    <header className="border-b bg-white">
      <div className="container flex items-center h-14 gap-2">
        <div className="font-bold">資産管理システム</div>
        <nav className="flex items-center gap-1 ml-4 text-sm">
          <NavLink to="/" end className={link}>ダッシュボード</NavLink>
          <NavLink to="/assets" className={link}>資産管理</NavLink>
          <NavLink to="/files" className={link}>ファイル管理</NavLink>
          <NavLink to="/manual-entry" className={link}>手入力</NavLink>
          <NavLink to="/reports" className={link}>レポート出力</NavLink>
          <NavLink to="/admin" className={link}>管理者設定</NavLink>
        </nav>
      </div>
    </header>
  )
}
export default NavBar
