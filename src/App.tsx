import Header from "/src/components/Header";
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import Files from './pages/Files'
import ManualEntry from './pages/ManualEntry'
import Reports from './pages/Reports'
import Admin from './pages/Admin'

export default function App() {
  return (
    // ページ側で背景と幅を管理するので App では何も足さない
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/files" element={<Files />} />
        <Route path="/manual-entry" element={<ManualEntry />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  )
}