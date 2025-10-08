import React, { useState, useMemo } from 'react';
import {
  Settings, RefreshCw, Users, Globe, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff
} from 'lucide-react';
import Header from "../components/Header";

/* =========================
 * 型定義
 * ========================= */
type RateMode = 'avg' | 'trade' | 'ttm';

interface UserRow {
  id: number;
  name: string;
  role: 'admin' | 'viewer';
  email: string;
  lastLogin: string;
}

/* =========================
 * メイン
 * ========================= */
const Admin: React.FC = () => {
  // レートモード切替
  const [rateMode, setRateMode] = useState<RateMode>('avg');
  const [autoAggregation, setAutoAggregation] = useState<boolean>(true);
  const [pingStatus, setPingStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // アカウント一覧（モック）
  const users: UserRow[] = useMemo(() => [
    { id: 1, name: '山田 太志', role: 'admin', email: 'admin@keieikanribu.com', lastLogin: '2025-10-03 18:30' },
    { id: 2, name: '佐藤 花子', role: 'viewer', email: 'viewer@keieikanribu.com', lastLogin: '2025-10-02 10:15' },
    { id: 3, name: 'テスト アカウント', role: 'viewer', email: 'test@keieikanribu.com', lastLogin: '2025-09-29 09:00' },
  ], []);

  /* =========================
   * モック関数
   * ========================= */

  // Pingテスト（擬似的に成功/失敗をランダム返却）
  const handlePing = async () => {
    setPingStatus('idle');
    await new Promise(r => setTimeout(r, 600));
    const ok = Math.random() > 0.2;
    setPingStatus(ok ? 'ok' : 'error');
  };

  // CSVエクスポート
  const handleExport = () => {
    setIsExporting(true);
    const header = ['name', 'email', 'role', 'lastLogin'];
    const csvRows = users.map(u => [u.name, u.email, u.role, u.lastLogin]);
    const body = [header.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `userlist_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
  <div className="min-h-screen bg-gray-50">
    <Header />

      {/* レート設定 */}
      <section className="bg-white border-b px-6 py-5">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Globe size={16} /> 為替レートモード設定
        </h2>
        <div className="flex items-center gap-2">
          {(['avg', 'trade', 'ttm'] as RateMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setRateMode(mode)}
              className={`px-3 py-2 rounded text-sm border ${
                rateMode === mode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          現在選択中：<span className="font-semibold text-blue-600">{rateMode.toUpperCase()}</span> モード
        </p>
      </section>

      {/* 自動集計 */}
      <section className="bg-white border-b px-6 py-5">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <RefreshCw size={16} /> 日次自動集計設定
        </h2>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={autoAggregation}
              onChange={() => setAutoAggregation((v) => !v)}
            />
            <span className="ml-2 text-sm text-gray-700">
              {autoAggregation ? '有効（毎日 04:00 集計実行）' : '無効'}
            </span>
          </label>
        </div>
      </section>

      {/* API接続テスト */}
      <section className="bg-white border-b px-6 py-5">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Wifi size={16} /> API連携テスト
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Pingテスト
          </button>
          {pingStatus === 'ok' && (
            <span className="text-green-600 flex items-center gap-1 text-sm">
              <CheckCircle size={16} /> 200 OK（応答良好）
            </span>
          )}
          {pingStatus === 'error' && (
            <span className="text-red-600 flex items-center gap-1 text-sm">
              <XCircle size={16} /> 接続エラー
            </span>
          )}
          {pingStatus === 'idle' && (
            <span className="text-gray-500 text-sm">待機中</span>
          )}
        </div>
      </section>

      {/* アカウント一覧 */}
      <section className="bg-white border-b px-6 py-5">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Users size={16} /> アカウント一覧
        </h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-500">名前</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500">メールアドレス</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500">権限</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500">最終ログイン</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2 text-gray-700">{u.email}</td>
                  <td className="px-4 py-2">
                    {u.role === 'admin' ? (
                      <span className="text-blue-600 font-medium">管理者</span>
                    ) : (
                      <span className="text-gray-700">閲覧者</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CSVエクスポート */}
      <section className="bg-white border-b px-6 py-5">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <FileSpreadsheet size={16} /> CSVエクスポート
        </h2>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm ${
            isExporting ? 'bg-gray-400 text-white' : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isExporting ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> 出力中…
            </>
          ) : (
            <>
              <FileSpreadsheet size={16} /> ユーザーリスト出力
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2">※ 出力は管理者一覧の現在データをCSV形式でダウンロードします。</p>
      </section>

      {/* 注意書き */}
      <div className="px-6 py-4 text-xs text-gray-500 flex items-start gap-2">
        <AlertCircle size={14} className="mt-0.5" />
        <div>
          <p>※ すべての操作はローカルモックで動作しています。本番API接続時は `/api/admin/settings` などに差し替えてください。</p>
          <p>※ Pingテストは通信確認のデモ用です（実API未接続）。</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;