import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Upload, File as FileIcon, FileText, Image, Check, AlertCircle, Search, Download,
  Calendar, Eye, Edit3, CheckCircle, Clock, Trash2
} from 'lucide-react';
import Header from "../components/Header";

/* =========================
 * 型定義
 * ========================= */
type FlowType = 'IN' | 'OUT' | 'キャッシュフロー';
type Currency = 'JPY' | 'USD' | 'AED' | 'NTD' | 'USDT' | 'USDC';
type Status = '処理中' | '要補正' | '補正済' | '反映済';

interface ExtractedAccountInfo {
  bankName: string;
  branchName?: string;
  accountType?: string;
  accountNumber: string;
  accountHolder?: string;
  period: string;                // 例: 2025/07
  openingBalance: number;
  closingBalance: number;
  currency?: Currency;           // 任意（CSV/PDFにより欠損あり得る）
}

interface ExtractedTx {
  date: string;                  // YYYY-MM-DD
  description: string;
  deposit?: number;              // 入金
  withdrawal?: number;           // 出金
  balance?: number;              // 残高（任意）
  flowType?: FlowType;           // IN/OUT/キャッシュフロー（任意）
  category?: string;             // 任意
}

interface FileRow {
  id: number;
  filename: string;
  type: 'PDF' | '画像' | 'CSV' | 'その他';
  uploadDate: string;            // YYYY-MM-DD
  status: Status;
  extractedData: {
    accountInfo: ExtractedAccountInfo;
    transactions: ExtractedTx[];
  };
}

/* =========================
 * 一覧のステータス表示
 * ========================= */
const statusConfig: Record<Status, { color: string; icon: React.ComponentType<{ size?: number }> }> = {
  処理中: { color: 'text-gray-600', icon: Clock },
  要補正: { color: 'text-yellow-600', icon: AlertCircle },
  補正済: { color: 'text-blue-600', icon: CheckCircle },
  反映済: { color: 'text-green-600', icon: Check },
};

/* =========================
 * メイン
 * ========================= */
const Files: React.FC = () => {
  // 空で開始（ダミーデータは使わない）
  const [files, setFiles] = useState<FileRow[]>([]);
  const [search, setSearch] = useState('');
  const [expandedFile, setExpandedFile] = useState<number | null>(null);

  // DnD用
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  /* ========== ユーティリティ ========== */
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const key = search.toLowerCase();
    return files.filter((f) =>
      f.filename.toLowerCase().includes(key) ||
      f.extractedData.accountInfo.bankName.toLowerCase().includes(key) ||
      f.extractedData.accountInfo.accountNumber.toLowerCase().includes(key)
    );
  }, [files, search]);

  const getStatusBadge = (status: Status) => {
    const cfg = statusConfig[status] ?? statusConfig['処理中'];
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 ${cfg.color}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  /* ========== 追加／編集系 ========== */
  // input[type=file] からの追加
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    if (!fl || fl.length === 0) return;

    const newRows: FileRow[] = Array.from(fl).map((file, idx) => {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const kind: FileRow['type'] =
        ext === 'pdf' ? 'PDF' :
        ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? '画像' :
        ext === 'csv' ? 'CSV' : 'その他';

      return {
        id: Date.now() + idx,
        filename: file.name,
        type: kind,
        uploadDate: today,
        status: '処理中',
        extractedData: {
          // 追加直後は最低限の空枠
          accountInfo: {
            bankName: '',
            accountNumber: '',
            period: '',
            openingBalance: 0,
            closingBalance: 0,
          },
          transactions: [],
        },
      };
    });

    setFiles((prev) => [...newRows, ...prev]);
    e.target.value = ''; // 再選択可能に
  };

  // DnD追加
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const fl = e.dataTransfer.files;
    if (!fl || fl.length === 0) return;

    const newRows: FileRow[] = Array.from(fl).map((file, idx) => {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const kind: FileRow['type'] =
        ext === 'pdf' ? 'PDF' :
        ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? '画像' :
        ext === 'csv' ? 'CSV' : 'その他';

      return {
        id: Date.now() + idx,
        filename: file.name,
        type: kind,
        uploadDate: today,
        status: '処理中',
        extractedData: {
          accountInfo: {
            bankName: '',
            accountNumber: '',
            period: '',
            openingBalance: 0,
            closingBalance: 0,
          },
          transactions: [],
        },
      };
    });

    setFiles((prev) => [...newRows, ...prev]);
  }, [today]);

  // ファイル行の編集（accountInfo/transactions 等）
  const handleEdit = (fileId: number, newData: Partial<FileRow['extractedData']>) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, extractedData: { ...f.extractedData, ...newData } }
          : f
      )
    );
  };

  // 「反映」ボタン想定：状態を遷移
  const handleApply = (fileId: number) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: '反映済' } : f))
    );
  };

  // 削除
  const handleDelete = (fileId: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (expandedFile === fileId) setExpandedFile(null);
  };

  /* ========== 補助UI ========== */
  const SumCell: React.FC<{ txs: ExtractedTx[]; field: 'deposit' | 'withdrawal' }> = ({ txs, field }) => {
    const val = useMemo(
      () => txs.reduce((sum, t) => sum + (t[field] || 0), 0),
      [txs, field]
    );
    return <>{val.toLocaleString()}</>;
  };

  const ExtractedDataPreview: React.FC<{
    data: FileRow['extractedData'];
    onEdit: (newData: Partial<FileRow['extractedData']>) => void;
    onApply: () => void;
  }> = ({ data, onEdit, onApply }) => {
    const { accountInfo, transactions } = data;
    return (
      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 font-medium text-sm">抽出データ（編集可）</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">口座情報</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-gray-600">銀行名</label>
              <input
                className="border px-2 py-1 text-sm rounded"
                value={accountInfo.bankName}
                onChange={(e) =>
                  onEdit({ accountInfo: { ...accountInfo, bankName: e.target.value } })
                }
              />
              <label className="text-xs text-gray-600">口座番号</label>
              <input
                className="border px-2 py-1 text-sm rounded"
                value={accountInfo.accountNumber}
                onChange={(e) =>
                  onEdit({ accountInfo: { ...accountInfo, accountNumber: e.target.value } })
                }
              />
              <label className="text-xs text-gray-600">対象期間</label>
              <input
                className="border px-2 py-1 text-sm rounded"
                placeholder="2025/07"
                value={accountInfo.period}
                onChange={(e) =>
                  onEdit({ accountInfo: { ...accountInfo, period: e.target.value } })
                }
              />
              <label className="text-xs text-gray-600">期首残高</label>
              <input
                type="number"
                className="border px-2 py-1 text-sm rounded"
                value={accountInfo.openingBalance}
                onChange={(e) =>
                  onEdit({
                    accountInfo: { ...accountInfo, openingBalance: parseFloat(e.target.value) || 0 },
                  })
                }
              />
              <label className="text-xs text-gray-600">期末残高</label>
              <input
                type="number"
                className="border px-2 py-1 text-sm rounded"
                value={accountInfo.closingBalance}
                onChange={(e) =>
                  onEdit({
                    accountInfo: { ...accountInfo, closingBalance: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">トランザクション</div>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-gray-600">日付</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-600">摘要</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-600">入金</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-600">出金</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((t, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1 text-sm">
                        <input
                          className="border px-2 py-1 text-sm rounded w-32"
                          value={t.date}
                          onChange={(e) => {
                            const next = [...transactions];
                            next[i] = { ...next[i], date: e.target.value };
                            onEdit({ transactions: next });
                          }}
                        />
                      </td>
                      <td className="px-3 py-1 text-sm">
                        <input
                          className="border px-2 py-1 text-sm rounded w-full"
                          value={t.description}
                          onChange={(e) => {
                            const next = [...transactions];
                            next[i] = { ...next[i], description: e.target.value };
                            onEdit({ transactions: next });
                          }}
                        />
                      </td>
                      <td className="px-3 py-1 text-sm text-right">
                        <input
                          type="number"
                          className="border px-2 py-1 text-sm rounded w-32 text-right"
                          value={t.deposit ?? 0}
                          onChange={(e) => {
                            const next = [...transactions];
                            next[i] = { ...next[i], deposit: parseFloat(e.target.value) || 0 };
                            onEdit({ transactions: next });
                          }}
                        />
                      </td>
                      <td className="px-3 py-1 text-sm text-right">
                        <input
                          type="number"
                          className="border px-2 py-1 text-sm rounded w-32 text-right"
                          value={t.withdrawal ?? 0}
                          onChange={(e) => {
                            const next = [...transactions];
                            next[i] = { ...next[i], withdrawal: parseFloat(e.target.value) || 0 };
                            onEdit({ transactions: next });
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-3 text-sm text-gray-500 text-center">
                        取引明細はまだありません。右上の＋から行を追加してください。
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-3 py-2 text-xs text-gray-600" colSpan={2}>小計</td>
                    <td className="px-3 py-2 text-right text-sm"><SumCell txs={transactions} field="deposit" /></td>
                    <td className="px-3 py-2 text-right text-sm"><SumCell txs={transactions} field="withdrawal" /></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-2 text-right">
              <button
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                onClick={onApply}
              >
                <Check size={16} />
                反映
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ========== 画面 ========== */
  return (
    <>
      {/* 共通ヘッダー（ナビ） */}
      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* ページヘッダー */}
        <header className="bg-gray-100 border-b">
          <div className="max-w-full px-6 h-12 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">ファイル管理</h2>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                <Upload size={16} />
                アップロード
                <input type="file" className="hidden" multiple onChange={handleFileInput} />
              </label>
              <button className="p-2 hover:bg-gray-200 rounded" title="ダウンロード">
                <Download size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* 検索＆ドロップ */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="max-w-full flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                className="pl-9 pr-3 py-2 border rounded w-72 text-sm"
                placeholder="ファイル名・銀行名・口座番号で検索"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div
              ref={dropZoneRef}
              onDragOver={handleDrag}
              onDragEnter={handleDrag}
              onDrop={handleDrop}
              className="flex-1 min-w-[280px] border-2 border-dashed border-gray-300 rounded py-3 px-4 text-sm text-gray-500"
            >
              ここにファイルをドラッグ＆ドロップ
            </div>
          </div>
        </div>

        {/* 一覧 */}
        <div className="px-6 py-6">
          <div className="bg-white rounded border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-600">ファイル名</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-600">種別</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-600">アップロード日</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-600">ステータス</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-600">口座情報</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-600">入金合計</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-600">出金合計</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((file) => (
                  <React.Fragment key={file.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        <span className="inline-flex items-center gap-2">
                          {file.type === 'PDF' ? <FileText size={16} /> :
                           file.type === '画像' ? <Image size={16} /> :
                           file.type === 'CSV' ? <FileIcon size={16} /> : <FileIcon size={16} />}
                          {file.filename}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{file.type}</td>
                      <td className="px-4 py-2 text-sm">{file.uploadDate}</td>
                      <td className="px-4 py-2 text-sm">{getStatusBadge(file.status)}</td>
                      <td className="px-4 py-2 text-sm">
                        {file.extractedData.accountInfo.bankName
                          ? `${file.extractedData.accountInfo.bankName}（${file.extractedData.accountInfo.accountNumber}）`
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        <SumCell txs={file.extractedData.transactions} field="deposit" />
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        <SumCell txs={file.extractedData.transactions} field="withdrawal" />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2 py-1 border rounded text-xs hover:bg-gray-100"
                            onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
                            title="詳細を展開"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="px-2 py-1 border rounded text-xs hover:bg-gray-100"
                            onClick={() =>
                              handleEdit(file.id, {
                                transactions: [
                                  ...file.extractedData.transactions,
                                  { date: today, description: '追加入力', deposit: 0, withdrawal: 0 },
                                ],
                              })
                            }
                            title="明細行を追加"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="px-2 py-1 border rounded text-xs hover:bg-gray-100"
                            onClick={() => handleApply(file.id)}
                            title="反映"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            className="px-2 py-1 border rounded text-xs hover:bg-red-50 text-red-600"
                            onClick={() => handleDelete(file.id)}
                            title="削除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* 展開枠 */}
                    {expandedFile === file.id && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                          <ExtractedDataPreview
                            data={file.extractedData}
                            onEdit={(newData) => handleEdit(file.id, newData)}
                            onApply={() => handleApply(file.id)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                      ファイルはまだありません。右上の「アップロード」または上部のドロップ領域にファイルを追加してください。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 注意書き */}
          <div className="mt-4 text-xs text-gray-500 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5" />
            <div>
              <p>※ ここでの編集は一時的なもので、保存操作（反映）時にバックエンドへ送信する想定です。</p>
              <p>※ PDF/CSV の自動抽出は将来のAPI `/api/files/extract` で置換します（現在は手入力ベース）。</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Files;