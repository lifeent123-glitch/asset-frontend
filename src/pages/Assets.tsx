import React, { useState, useEffect, useMemo } from "react";
import {
  Download, Search, TrendingUp, TrendingDown,
  DollarSign, Info, Eye, EyeOff,
  Calendar, RefreshCw, Plus
} from "lucide-react";
import Header from "../components/Header";
import { Category2Key, toName as cat2Name, CATEGORY2_BADGE } from '../../shared/category2';
import { normalizeCategory2 } from '../../shared/category2';

// カテゴリ1/2のピルを横並びで表示
function renderCategoryPills(c1Label?: string, c2KeyOrName?: string) {
  // 既存のカテゴリ1（表示名そのまま）
  const Cat1 = c1Label ? (
    <span className="inline-flex items-center px-2 py-0.5 mr-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {c1Label}
    </span>
  ) : null;

  // カテゴリ2（key でも name でも受け取れるように調整）
  const key = (c2KeyOrName ?? '').toString().trim();
  const cat2Badge = (key && CATEGORY2_BADGE as any)[key];
  const cat2Text = cat2Badge ? cat2Badge.text : (key ? cat2Name(key as Category2Key) : '');

  const Cat2 = key ? (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat2Badge ? cat2Badge.bg : 'bg-gray-100 text-gray-700'}`}
      title="カテゴリ2"
    >
      {cat2Text}
    </span>
  ) : null;

  return (
    <div className="flex items-center flex-wrap gap-1">
      {Cat1}
      {Cat2}
    </div>
  );
}

/* =========================
 * 型定義（UIフィルタに必要なもの）
 * ========================= */
type SectionJP = "法人資産" | "個人資産" | "法人投資" | "個人投資";
type CategoryJP =
  | "現金" | "銀行口座" | "仮想通貨" | "社債"
  | "不動産" | "定期預金" | "株式" | "事業投資";
type Currency = "JPY" | "USD" | "AED" | "NTD" | "USDT" | "USDC" | "EUR";

type SortKey = "balance" | "change" | "changeRate" | null;
type SortDirection = "asc" | "desc";

type FormatOptions = { currency?: "JPY" | "USD"; hideAmount?: boolean };

/* =========================
 * コンポーネント
 * ========================= */
const AssetManagementPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>("2025-07");

  // ✅ リフレッシュ用トリガー（クリックで+1 → 各API useEffect を再実行）
  const [refreshTick, setRefreshTick] = useState(0);

  // 表示/フィルタUI
  const [showAmounts, setShowAmounts] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterSection, setFilterSection] = useState<"all" | SectionJP>("all");
  const [filterCategory, setFilterCategory] = useState<"all" | CategoryJP>("all");
  const [filterCurrency, setFilterCurrency] = useState<"all" | Currency>("all");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: null, direction: "asc" });

  // ダミーUIの一部（引き続き残すボタン用）
  const [showManualAdjustment, setShowManualAdjustment] = useState<boolean>(false);

  // --- 区分（英語→日本語）変換 ---
  const segLabel = (s?: string): SectionJP | "—" => {
    switch (s) {
      case "corporate":         return "法人資産";
      case "personal":          return "個人資産";
      case "corporate_invest":  return "法人投資";
      case "personal_invest":   return "個人投資";
      default:                  return "—";
    }
  };

  // --- サマリーカード用の色（区分別） ---
  const sectionGradient: Record<SectionJP, string> = {
    法人資産: "from-blue-500 to-blue-600",
    個人資産: "from-emerald-500 to-emerald-600",
    法人投資: "from-violet-500 to-violet-600",
    個人投資: "from-orange-500 to-orange-600",
  };

  // --- 実API接続（今月・total の集計 & rows 取得） ---
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSum, setApiSum] = useState<{ in_jpy: number; out_jpy: number; total_jpy: number } | null>(null);
  const [apiRows, setApiRows] = useState<any[]>([]);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setApiLoading(true);
        setApiError(null);
        const q = new URLSearchParams({
          month: selectedMonth,
          segment: "total",
          currency: "ALL",
          exclude_transfer: "true",
        });
        const res = await fetch(`/api/manual-entry?${q.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!aborted) {
          const s = data?.summary || {};
          setApiSum({
            in_jpy: Number(s.in_jpy || 0),
            out_jpy: Number(s.out_jpy || 0),
            total_jpy: Number(s.total_jpy || 0),
          });
          setApiRows(Array.isArray(data?.rows) ? data.rows : []);
        }
      } catch (e: any) {
        if (!aborted) setApiError(e?.message || String(e));
      } finally {
        if (!aborted) setApiLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, [selectedMonth, refreshTick]);

  // --- 区分別サマリー（API） ---
  const [corpSum, setCorpSum] = useState<{ total_jpy: number; in_jpy: number; out_jpy: number } | null>(null);
  const [persSum, setPersSum] = useState<{ total_jpy: number; in_jpy: number; out_jpy: number } | null>(null);
  const [corpInvSum, setCorpInvSum] = useState<{ total_jpy: number; in_jpy: number; out_jpy: number } | null>(null);
  const [persInvSum, setPersInvSum] = useState<{ total_jpy: number; in_jpy: number; out_jpy: number } | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/manual-entry?${new URLSearchParams({
          month: selectedMonth, segment: "corporate", currency: "ALL", exclude_transfer: "true",
        }).toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (!aborted) {
          const s = d?.summary || {};
          setCorpSum({ total_jpy: Number(s.total_jpy || 0), in_jpy: Number(s.in_jpy || 0), out_jpy: Number(s.out_jpy || 0) });
        }
      } catch { /* noop */ }
    })();
    return () => { aborted = true; };
  }, [selectedMonth, refreshTick]);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/manual-entry?${new URLSearchParams({
          month: selectedMonth, segment: "personal", currency: "ALL", exclude_transfer: "true",
        }).toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (!aborted) {
          const s = d?.summary || {};
          setPersSum({ total_jpy: Number(s.total_jpy || 0), in_jpy: Number(s.in_jpy || 0), out_jpy: Number(s.out_jpy || 0) });
        }
      } catch { /* noop */ }
    })();
    return () => { aborted = true; };
  }, [selectedMonth, refreshTick]);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/manual-entry?${new URLSearchParams({
          month: selectedMonth, segment: "corporate_invest", currency: "ALL", exclude_transfer: "true",
        }).toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (!aborted) {
          const s = d?.summary || {};
          setCorpInvSum({ total_jpy: Number(s.total_jpy || 0), in_jpy: Number(s.in_jpy || 0), out_jpy: Number(s.out_jpy || 0) });
        }
      } catch { /* noop */ }
    })();
    return () => { aborted = true; };
  }, [selectedMonth, refreshTick]);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/manual-entry?${new URLSearchParams({
          month: selectedMonth, segment: "personal_invest", currency: "ALL", exclude_transfer: "true",
        }).toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (!aborted) {
          const s = d?.summary || {};
          setPersInvSum({ total_jpy: Number(s.total_jpy || 0), in_jpy: Number(s.in_jpy || 0), out_jpy: Number(s.out_jpy || 0) });
        }
      } catch { /* noop */ }
    })();
    return () => { aborted = true; };
  }, [selectedMonth, refreshTick]);

  // === API行をフィルタ＆区分ごとにグループ化（区分/カテゴリ/通貨/検索 すべて連動）===
  const filteredGroups = useMemo(() => {
    if (!apiRows || apiRows.length === 0) return {};

    const norm = (v: any) => (v ?? "").toString().trim().toLowerCase();
    const key = norm(searchTerm);

    const groups: Record<string, any[]> = {};
    for (const r of apiRows) {
      const sectionLabel = segLabel(r.segment);
      if (sectionLabel === "—") continue;

      const okSection  = filterSection === "all" || sectionLabel === filterSection;
      const okCategory = filterCategory === "all"
  || norm(r.category_name ?? "").includes(norm(filterCategory))
  || norm((r as any).category2_name ?? (r as any).category2 ?? "").includes(norm(filterCategory));
      const okCurrency = filterCurrency === "all" || norm(r.currency).toUpperCase() === filterCurrency;
      const okSearch   = key === "" ||
                         norm(r.account).includes(key) ||
                         norm(r.category_name).includes(key) ||
                         norm(r.memo).includes(key);

      if (okSection && okCategory && okCurrency && okSearch) {
        if (!groups[sectionLabel]) groups[sectionLabel] = [];
        groups[sectionLabel].push(r);
      }
    }

    // 区分の表示順を固定
    const order: SectionJP[] = ["法人資産", "個人資産", "法人投資", "個人投資"];
    const ordered: Record<string, any[]> = {};
    for (const sec of order) if (groups[sec]?.length) ordered[sec] = groups[sec];

    return ordered;
  }, [apiRows, filterSection, filterCategory, filterCurrency, searchTerm]);

  // 金額フォーマット
  const formatAmount = (amount: number, options: FormatOptions = {}): string => {
    const { currency = "JPY", hideAmount = false } = options;
    if (hideAmount) return "***,***";
    if (currency === "JPY") return Math.round(amount).toLocaleString("ja-JP");
    return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // 変化表示（従来ロジックのまま・必要なら後段でAPI比較に刷新）
  const calculateChangeRate = (current: number, previous: number): number => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };
  const ChangeDisplay: React.FC<{ current: number; previous: number; currency?: "JPY" | "USD"; whiteText?: boolean }> = ({
    current, previous, currency = "JPY", whiteText = false,
  }) => {
    const change = current - previous;
    const changeRate = calculateChangeRate(current, previous);
    const isPositive = change >= 0;
    const colorClass = whiteText
      ? isPositive ? "text-green-300" : "text-red-300"
      : isPositive ? "text-green-600" : "text-red-600";

    return (
      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 ${colorClass}`}>
          {isPositive ? <>+<TrendingUp size={14} /></> : <>−<TrendingDown size={14} /></>}
          {formatAmount(Math.abs(change), { currency, hideAmount: !showAmounts })}
        </span>
        <span className={`text-sm ${colorClass}`}>
          ({isPositive ? "+" : ""}{changeRate.toFixed(1)}%)
        </span>
      </div>
    );
  };

  // ソート（区分内の並び替えは任意：未実装のまま保持）
  const handleSort = (key: Exclude<SortKey, null>) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 共通ヘッダー */}
      <Header />

      {/* API状態（簡易） */}
      {(apiLoading || apiError) && (
        <div className="px-6 pt-4 text-sm">
          {apiLoading && <p className="text-gray-500">読み込み中...</p>}
          {apiError   && <p className="text-red-600">APIエラー: {apiError}</p>}
        </div>
      )}

      {/* 総資産サマリー */}
      <div className="bg-white border-b px-6 py-5">
        <div className="max-w-full">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900">総資産サマリー（{selectedMonth}）</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAmounts(!showAmounts)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={showAmounts ? "金額を隠す" : "金額を表示"}
              >
                {showAmounts ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>

              {/* リフレッシュ */}
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setRefreshTick((t) => t + 1)}
                title="最新データを再取得"
              >
                <RefreshCw size={18} />
              </button>

              {/* CSV（後段でAPI明細と統合） */}
              <button
                onClick={() => alert("CSVエクスポートは後段でAPI明細と統合します")}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                <Download size={14} />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* 5枚のカード（総資産 + 4区分） */}
          <div className="grid grid-cols-5 gap-3 mt-4">
            {/* 総資産カード（青固定） */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">総資産</span>
                <DollarSign size={18} className="opacity-70" />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold">
                  ¥{formatAmount(apiSum?.total_jpy ?? 0, { hideAmount: !showAmounts })}
                </div>
                <div className="pt-2 border-t border-white/20">
                  <ChangeDisplay current={apiSum?.total_jpy ?? 0} previous={0} whiteText />
                </div>
              </div>
            </div>

            {/* 4区分カード（色付き） */}
            {([
              ["法人資産", corpSum],
              ["個人資産", persSum],
              ["法人投資", corpInvSum],
              ["個人投資", persInvSum],
            ] as [SectionJP, { total_jpy: number } | null][]).map(([label, sum]) => (
              <div key={label} className={`bg-gradient-to-r ${sectionGradient[label]} text-white rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">{label}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    ¥{formatAmount(sum?.total_jpy ?? 0, { hideAmount: !showAmounts })}
                  </div>
                  <div className="pt-2 border-t border-white/20">
                    <ChangeDisplay current={sum?.total_jpy ?? 0} previous={0} whiteText />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* フィルター・操作バー */}
      <div className="bg-white border-b px-6 py-4 sticky top-[50px] z-30">
        <div className="flex flex-wrap gap-3 items-center">
          {/* 月選択 */}
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* フィルター */}
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value as "all" | SectionJP)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">全区分</option>
            <option value="法人資産">法人資産</option>
            <option value="個人資産">個人資産</option>
            <option value="法人投資">法人投資</option>
            <option value="個人投資">個人投資</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as "all" | CategoryJP)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">全カテゴリ</option>
            <option value="現金">現金</option>
            <option value="銀行口座">銀行口座</option>
            <option value="仮想通貨">仮想通貨</option>
            <option value="社債">社債</option>
            <option value="不動産">不動産</option>
            <option value="株式">株式</option>
            <option value="定期預金">定期預金</option>
            <option value="事業投資">事業投資</option>
          </select>

          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value as "all" | Currency)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">全通貨</option>
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
            <option value="AED">AED</option>
            <option value="NTD">NTD</option>
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
            <option value="EUR">EUR</option>
          </select>

          {/* 検索 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="アカウント名・カテゴリ・メモで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* 手動補正（ダミーUI） */}
          <button
            onClick={() => setShowManualAdjustment(!showManualAdjustment)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showManualAdjustment ? "bg-blue-100 text-blue-700" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Plus size={16} />
            手動補正
          </button>

          {/* リフレッシュ */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setRefreshTick((t) => t + 1)}
            title="最新データを再取得"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* メインテーブルエリア（区分別表示＋小計＋総合計） */}
      <div className="p-6">
        {Object.keys(filteredGroups).length === 0 ? (
          <div className="text-center text-gray-500 py-24">該当する明細はありません。</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-20">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">種類/カテゴリ</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">アカウント名</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">通貨</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 cursor-pointer" onClick={() => handleSort("balance")}>
                      残高 {sortConfig.key === "balance" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">前月比</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 bg-blue-50">円建て金額</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 bg-blue-50">前月比(円)</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 bg-green-50">ドル建て金額</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 bg-green-50">前月比($)</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">備考</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {Object.entries(filteredGroups).map(([section, rows]) => {
                    const subtotalJPY = rows.reduce((sum: number, r: any) => sum + Number(r.jpy_amount || 0), 0);

                    return (
                      <React.Fragment key={section}>
                        {/* 区分見出し */}
                        <tr className="bg-gray-100">
                          <td colSpan={10} className="px-4 py-2 font-semibold text-gray-700">
                            {section}（{rows.length}件）
                          </td>
                        </tr>

                        {/* 明細行 */}
                        {rows.map((r: any) => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            {/* 1列目：カテゴリ（ピル） sticky */}
<td className="sticky left-0 bg-white px-3 py-2 text-sm">
  {(() => {
    const rawCat2 = (r as any).category2_name ?? (r as any).category2 ?? "";
    const cat2Key = normalizeCategory2(rawCat2) ?? rawCat2; // ← まず正規化
    return renderCategoryPills(r.category_name ?? "", cat2Key);
  })()}
</td>

                            {/* 2列目：アカウント名 sticky（1列目の幅に合わせて left を調整） */}
                            <td className="sticky left-[140px] bg-white px-3 py-2 text-sm">
                              {r.account}
                            </td>

                            {/* 通貨 */}
                            <td className="px-3 py-2 text-sm">{r.currency}</td>

                            {/* 残高（ここは参考のダミー表示。将来必要ならAPI項目に合わせる） */}
                            <td className="px-3 py-2 text-sm text-right">—</td>

                            {/* 前月比（ダミー） */}
                            <td className="px-3 py-2 text-sm text-right">—</td>

                            {/* 円建て金額 */}
                            <td className="px-3 py-2 text-sm text-right">
                              ¥{Number(r.jpy_amount || 0).toLocaleString()}
                            </td>

                            {/* 前月比(円) ダミー */}
                            <td className="px-3 py-2 text-sm text-right">—</td>

                            {/* ドル建て金額 ダミー */}
                            <td className="px-3 py-2 text-sm text-right">—</td>

                            {/* 備考 */}
                            <td className="px-3 py-2 text-sm">{r.memo ?? ""}</td>
                          </tr>
                        ))}

                        {/* 小計行（薄黄色帯） */}
                        <tr className="bg-yellow-50 font-semibold">
                          <td colSpan={6} className="px-4 py-2 text-sm">
                            {section} 小計
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-blue-700">
                            ¥{subtotalJPY.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-green-700">—</td>
                          <td className="px-4 py-2 text-right text-sm text-green-700">—</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}

                  {/* 総合計（濃紺帯） */}
                  {(() => {
                    const grandTotalJPY = Object.values(filteredGroups)
                      .flat()
                      .reduce((sum: number, r: any) => sum + Number(r.jpy_amount || 0), 0);
                    return (
                      <tr className="bg-gray-800 text-white font-bold">
                        <td className="px-4 py-4 text-sm" colSpan={6}>総合計</td>
                        <td className="px-4 py-4 text-sm text-right">¥{grandTotalJPY.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-right">—</td>
                        <td className="px-4 py-4 text-sm text-right">—</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 注意事項・免責事項 */}
      <div className="mt-6 bg-gray-100 rounded-lg p-4 text-xs text-gray-600">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-gray-400 mt-0.5" />
          <div className="space-y-1">
            <p>※ 前月比は月末残高を基準に算出しています。為替レートは各月の平均レートを使用。</p>
            <p>※ 株価・仮想通貨価格は参考値であり、実際の取引価格とは異なる場合があります。</p>
            <p>※ データは手入力ページおよびファイル管理ページから自動連携されています。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManagementPage;