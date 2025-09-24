import React, { useState } from 'react';
import {
  Edit2, Trash2, Plus, Save, X, Check,
  AlertCircle, Shield, Key, Clock, Database, Users
} from 'lucide-react';
import Header from "../components/Header";

// 型ゆるめ（既存構造に合わせて any で運用）
type AnyObj = any;

export default function Assets() {
  const [activeTab, setActiveTab] = useState<string>('users');
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState<AnyObj | null>(null);

  // ダミーデータ
  const users = [
    { id: 1, name: '山田太郎', email: 'yamada@example.com', role: '管理者', mfaStatus: '登録済', active: true },
    { id: 2, name: '鈴木花子', email: 'suzuki@example.com', role: '一般', mfaStatus: '未登録', active: true },
    { id: 3, name: '佐藤健一', email: 'sato@example.com', role: '閲覧のみ', mfaStatus: '登録済', active: false },
    { id: 4, name: '田中美咲', email: 'tanaka@example.com', role: '管理者', mfaStatus: '登録済', active: true },
    { id: 5, name: '高橋誠', email: 'takahashi@example.com', role: '一般', mfaStatus: '未登録', active: true },
    { id: 6, name: '伊藤由美', email: 'ito@example.com', role: '一般', mfaStatus: '登録済', active: true },
    { id: 7, name: '渡辺直樹', email: 'watanabe@example.com', role: '閲覧のみ', mfaStatus: '未登録', active: false },
    { id: 8, name: '中村恵子', email: 'nakamura@example.com', role: '管理者', mfaStatus: '登録済', active: true },
    { id: 9, name: '小林大輔', email: 'kobayashi@example.com', role: '一般', mfaStatus: '登録済', active: true },
    { id: 10, name: '加藤理沙', email: 'kato@example.com', role: '閲覧のみ', mfaStatus: '未登録', active: true }
  ];

  const categories = [
    { id: 1, name: '現金', remarks: '物理的な現金資産' },
    { id: 2, name: '銀行口座', remarks: '国内外の銀行預金' },
    { id: 3, name: '仮想通貨', remarks: 'BTC, ETH, USDT等' },
    { id: 4, name: '社債', remarks: '企業発行の債券' },
    { id: 5, name: '株式', remarks: '上場株式・ETF' },
    { id: 6, name: '不動産', remarks: '投資用不動産' },
    { id: 7, name: '定期預金', remarks: '定期性預金' },
    { id: 8, name: '事業投資', remarks: '事業への出資・貸付' }
  ];

  const currencies = [
    { id: 1, code: 'JPY', name: '日本円', symbol: '¥' },
    { id: 2, code: 'USD', name: '米ドル', symbol: '$' },
    { id: 3, code: 'EUR', name: 'ユーロ', symbol: '€' },
    { id: 4, code: 'AED', name: 'UAEディルハム', symbol: 'د.إ' },
    { id: 5, code: 'NT$', name: '台湾ドル', symbol: 'NT$' },
    { id: 6, code: 'ETH', name: 'イーサリアム', symbol: 'Ξ' },
    { id: 7, code: 'USDT', name: 'テザー', symbol: '₮' },
    { id: 8, code: 'BTC', name: 'ビットコイン', symbol: '₿' }
  ];

  // 手入力カテゴリマスタ初期データ
  const [manualCategories, setManualCategories] = useState<AnyObj[]>([
    { id: 1, type: 'IN',  name: '資金移動',     remarks: '口座間の資金移動' },
    { id: 2, type: 'IN',  name: 'サイト収益',   remarks: 'Webサイトからの収益' },
    { id: 3, type: 'IN',  name: 'その他収益',   remarks: 'その他の収入' },
    { id: 4, type: 'IN',  name: '投資収益',     remarks: '投資からの収益' },
    { id: 5, type: 'IN',  name: '社債金利収益', remarks: '社債の利息収入' },
    { id: 6, type: 'IN',  name: 'その他投資収益', remarks: 'その他の投資収益' },
    { id: 7, type: 'IN',  name: '立替費用',     remarks: '立替金の回収' },
    { id: 8, type: 'OUT', name: '資金移動',     remarks: '口座間の資金移動' },
    { id: 9, type: 'OUT', name: '法人支出',     remarks: '法人関連の支出' },
    { id:10, type: 'OUT', name: '個人支出',     remarks: '個人的な支出' },
    { id:11, type: 'OUT', name: '立替費用',     remarks: '立替金の支払い' },
    { id:12, type: 'OUT', name: '投資支出',     remarks: '投資関連の支出' },
    { id:13, type: 'OUT', name: 'その他支出',   remarks: 'その他の支出' }
  ]);

  const apiKeys = [
    { id: 1, name: '為替レートAPI',      key: 'sk_live_4eC39HqLyjWDarj...',      url: 'https://api.exchangerate.com', status: 'active',   lastUsed: '2025-01-15 10:30' },
    { id: 2, name: 'Bloomberg API',      key: 'bb_test_1a2b3c4d5e6f7g8h...',     url: 'https://api.bloomberg.com',    status: 'active',   lastUsed: '2025-01-14 15:45' },
    { id: 3, name: '暗号資産価格API',     key: 'crypto_key_9z8y7x6w5v...',      url: 'https://api.coingecko.com',    status: 'inactive', lastUsed: '2025-01-10 08:20' },
    { id: 4, name: 'バックアップAPI',     key: 'backup_test_123456789...',      url: 'https://backup.api.com',       status: 'active',   lastUsed: '2025-01-13 22:15' }
  ];

  const histories = [
    { id: 1, user: '山田太郎', action: 'ユーザー追加',     target: '加藤理沙',     date: '2025-01-15 14:30:25', ip: '192.168.1.100' },
    { id: 2, user: '鈴木花子', action: '資産編集',       target: 'Ledger USDT',  date: '2025-01-15 13:15:40', ip: '192.168.1.101' },
    { id: 3, user: '中村恵子', action: 'API設定変更',    target: '為替レートAPI', date: '2025-01-15 10:45:12', ip: '192.168.1.102' },
    { id: 4, user: '山田太郎', action: 'ユーザー権限変更', target: '鈴木花子',     date: '2025-01-14 16:20:30', ip: '192.168.1.100' },
    { id: 5, user: '田中美咲', action: 'カテゴリ追加',    target: '投資信託',      date: '2025-01-14 11:30:45', ip: '192.168.1.103' },
    { id: 6, user: '高橋誠',   action: 'データエクスポート', target: '月次レポート',  date: '2025-01-13 09:15:20', ip: '192.168.1.104' },
    { id: 7, user: '中村恵子', action: 'MFA設定変更',    target: '自身のアカウント', date: '2025-01-12 18:40:55', ip: '192.168.1.102' }
  ];

  // タブのアイコンとラベル
  const tabs = [
    { id: 'users',            label: 'ユーザー管理',         icon: Users },
    { id: 'categories',       label: '分類マスタ',           icon: Database },
    { id: 'manualCategories', label: '手入力カテゴリマスタ', icon: Database },
    { id: 'currencies',       label: '通貨マスタ',           icon: Database },
    { id: 'api',              label: 'API設定',              icon: Key },
    { id: 'history',          label: '履歴',                 icon: Clock },
    { id: 'mfa',              label: 'MFA',                  icon: Shield }
  ];

  // 手入力カテゴリの追加
  const handleAddCategory = () => {
    if (newCategory && newCategory.name) {
      const newId = Math.max(...manualCategories.map(c => c.id)) + 1;
      setManualCategories([...manualCategories, { ...newCategory, id: newId }]);
      setNewCategory(null);
    }
  };

  // 手入力カテゴリの更新
  const handleUpdateCategory = (id: number, updatedCategory: AnyObj) => {
    setManualCategories(manualCategories.map(cat =>
      cat.id === id ? { ...cat, ...updatedCategory } : cat
    ));
    setEditingCategory(null);
  };

  // 手入力カテゴリの削除
  const handleDeleteCategory = (id: number) => {
    if (confirm('このカテゴリを削除してもよろしいですか？')) {
      setManualCategories(manualCategories.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 共通ヘッダー（資産管理ページの“正解”デザイン） */}
      <Header />

      {/* メインコンテンツ（横幅は Dashboard と同じ container に統一） */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* タブヘッダー */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={
                      "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap " +
                      (isActive ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="p-6">
            {/* ユーザー管理 */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">ユーザー管理</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    新規追加
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メールアドレス</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">権限</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${user.role === '管理者' ? 'bg-purple-100 text-purple-800'
                                : user.role === '一般' ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${user.mfaStatus === '登録済' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {user.mfaStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {user.active ? '有効' : '無効'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                              <button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 分類マスタ */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">資産分類マスタ</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    新規追加
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分類名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備考</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{category.remarks}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                              <button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 手入力カテゴリマスタ */}
            {activeTab === 'manualCategories' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">手入力カテゴリマスタ</h2>
                  <button
                    onClick={() => setNewCategory({ type: 'IN', name: '', remarks: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    新規追加
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">種別</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備考／説明</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* 新規追加行 */}
                      {newCategory && (
                        <tr className="bg-blue-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  name="newType"
                                  value="IN"
                                  checked={newCategory.type === 'IN'}
                                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                                  className="form-radio text-green-600"
                                />
                                <span className="ml-2 text-sm font-medium text-green-600">IN</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  name="newType"
                                  value="OUT"
                                  checked={newCategory.type === 'OUT'}
                                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                                  className="form-radio text-red-600"
                                />
                                <span className="ml-2 text-sm font-medium text-red-600">OUT</span>
                              </label>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="カテゴリ名を入力"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={newCategory.remarks}
                              onChange={(e) => setNewCategory({ ...newCategory, remarks: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="備考を入力"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <button onClick={handleAddCategory} className="text-green-600 hover:text-green-900"><Save className="w-4 h-4" /></button>
                              <button onClick={() => setNewCategory(null)} className="text-gray-600 hover:text-gray-900"><X className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* 既存データ */}
                      {manualCategories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingCategory === category.id ? (
                              <div className="flex gap-2">
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`type_${category.id}`}
                                    value="IN"
                                    checked={category.type === 'IN'}
                                    onChange={(e) => handleUpdateCategory(category.id, { type: e.target.value })}
                                    className="form-radio text-green-600"
                                  />
                                  <span className="ml-2 text-sm font-medium text-green-600">IN</span>
                                </label>
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`type_${category.id}`}
                                    value="OUT"
                                    checked={category.type === 'OUT'}
                                    onChange={(e) => handleUpdateCategory(category.id, { type: e.target.value })}
                                    className="form-radio text-red-600"
                                  />
                                  <span className="ml-2 text-sm font-medium text-red-600">OUT</span>
                                </label>
                              </div>
                            ) : (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${category.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {category.type}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingCategory === category.id ? (
                              <input
                                type="text"
                                value={category.name}
                                onChange={(e) => handleUpdateCategory(category.id, { name: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingCategory === category.id ? (
                              <input
                                type="text"
                                value={category.remarks}
                                onChange={(e) => handleUpdateCategory(category.id, { remarks: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="text-sm text-gray-500">{category.remarks}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              {editingCategory === category.id ? (
                                <>
                                  <button onClick={() => setEditingCategory(null)} className="text-green-600 hover:text-green-900"><Check className="w-4 h-4" /></button>
                                  <button onClick={() => setEditingCategory(null)} className="text-gray-600 hover:text-gray-900"><X className="w-4 h-4" /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => setEditingCategory(category.id)} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 説明文 */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-800 mb-1">カテゴリマスタについて</p>
                      <p className="text-blue-700">
                        ここで設定したカテゴリは、手入力画面、CSV取込、ファイル管理、レポート画面のカテゴリ選択で使用されます。
                        削除されたカテゴリは非表示になりますが、過去のデータには影響しません。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 通貨マスタ */}
            {activeTab === 'currencies' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">通貨マスタ</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    新規追加
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">通貨コード</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">通貨名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">記号</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currencies.map((currency) => (
                        <tr key={currency.id}>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{currency.code}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{currency.name}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{currency.symbol}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                              <button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* API設定 */}
            {activeTab === 'api' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">API設定</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    新規追加
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APIキー</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終使用</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {apiKeys.map((api) => (
                        <tr key={api.id}>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{api.name}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500 font-mono">{api.key}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{api.url}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${api.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {api.status === 'active' ? '有効' : '無効'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{api.lastUsed}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                              <button className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                検証
                              </button>
                              <button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 履歴 */}
            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">操作履歴</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    CSVエクスポート
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">対象</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IPアドレス</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {histories.map((history) => (
                        <tr key={history.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{history.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{history.user}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {history.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{history.target}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{history.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MFA設定 */}
            {activeTab === 'mfa' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">多要素認証（MFA）設定</h2>

                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">セキュリティ強化のお知らせ</p>
                      <p className="text-yellow-700">管理者権限を持つユーザーは、必ず多要素認証を有効にしてください。</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        MFA有効化状況
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-sm text-gray-600">総ユーザー数</span><span className="text-sm font-semibold">{users.length}名</span></div>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">MFA有効</span><span className="text-sm font-semibold text-green-600">{users.filter(u => u.mfaStatus === '登録済').length}名</span></div>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">MFA未設定</span><span className="text-sm font-semibold text-red-600">{users.filter(u => u.mfaStatus === '未登録').length}名</span></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">MFA設定方法</h3>
                      <ol className="text-sm text-gray-600 space-y-2">
                        <li>1. Google AuthenticatorまたはMicrosoft Authenticatorをインストール</li>
                        <li>2. ユーザー設定からQRコードを表示</li>
                        <li>3. アプリでQRコードをスキャン</li>
                        <li>4. 表示された6桁のコードを入力して完了</li>
                      </ol>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">全ユーザーにMFA設定通知を送信</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
