import React, { useState, useCallback } from 'react';
import { Upload, File, FileText, Image, Check, AlertCircle, Search, Filter, Download, Calendar, Eye, Edit3, CheckCircle, Clock, X, Trash2 } from 'lucide-react';

// ヘッダーコンポーネント
const Header = () => {
  const currentPage = 'files'; // 現在のページ
  
  return (
    <header className="bg-gray-100" style={{ borderBottom: '1px solid #ccc' }}>
      <div className="flex items-center justify-between" style={{ height: '50px' }}>
        {/* ロゴ（左側） */}
        <div style={{ paddingLeft: '20px' }}>
          <h1 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 'bold' }}>資産管理システム</h1>
        </div>
        
        {/* ナビゲーション（右側） */}
        <nav className="flex items-center" style={{ paddingRight: '20px' }}>
          <a
            href="/"
            className="hover:bg-gray-200"
            style={{
              padding: '15px 18px',
              fontSize: '14px',
              fontWeight: '400',
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative',
              color: '#333',
            }}
          >
            ダッシュボード
          </a>
          <a
            href="/assets"
            className="hover:bg-gray-200"
            style={{
              padding: '15px 18px',
              fontSize: '14px',
              fontWeight: '400',
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative',
              color: '#333',
            }}
          >
            資産管理
          </a>
          <a
            href="/files"
            style={{
              padding: '15px 18px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative',
              color: 'white',
              backgroundColor: '#4a90e2',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
            }}
          >
            ファイル管理
          </a>
          <a
            href="/manual-entry"
            className="hover:bg-gray-200"
            style={{
              padding: '15px 18px',
              fontSize: '14px',
              fontWeight: '400',
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative',
              color: '#333',
            }}
          >
            手入力
          </a>
          <a
            href="/reports"
            className="hover:bg-gray-200"
            style={{
              padding: '15px 18px',
              fontSize: '14px',
              fontWeight: '400',
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative',
              color: '#333',
            }}
          >
            レポート出力
          </a>
          <a
            href="/admin"
            className="hover:bg-gray-200"
            style={{
              padding: '15px 18px',
              fontSize: '14px',
              fontWeight: '400',
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative',
              color: '#333',
            }}
          >
            管理者設定
          </a>
        </nav>
      </div>
    </header>
  );
};

// ダミーデータ
const dummyFiles = [
  {
    id: 1,
    filename: '三菱UFJ銀行_通帳_2025年6月.pdf',
    type: 'PDF',
    uploadDate: '2025/06/10',
    status: '補正済',
    extractedData: {
      accountInfo: {
        bankName: '三菱UFJ銀行',
        branchName: '新宿支店',
        accountType: '普通預金',
        accountNumber: '1234567',
        accountHolder: '資産管理 太郎',
        period: '2025年6月1日～2025年6月30日',
        openingBalance: 2500000,
        closingBalance: 2850000,
        currency: '円'
      },
      transactions: [
        { date: '2025/06/01', valueDate: '2025/06/01', description: '前月繰越', flowType: '', category: '', deposit: 2500000, withdrawal: 0, balance: 2500000, memo: '' },
        { date: '2025/06/03', valueDate: '2025/06/03', description: 'ATM引出', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 30000, balance: 2470000, memo: 'セブン銀行ATM' },
        { date: '2025/06/05', valueDate: '2025/06/05', description: '給与振込', flowType: 'IN', category: 'その他収益', deposit: 450000, withdrawal: 0, balance: 2920000, memo: '○○株式会社' },
        { date: '2025/06/07', valueDate: '2025/06/07', description: '振込', flowType: 'OUT', category: '資金移動', deposit: 0, withdrawal: 50000, balance: 2870000, memo: '山田太郎' },
        { date: '2025/06/10', valueDate: '2025/06/10', description: '家賃引落', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 100000, balance: 2770000, memo: '△△不動産' },
        { date: '2025/06/12', valueDate: '2025/06/12', description: '電気料金', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 8500, balance: 2761500, memo: '東京電力' },
        { date: '2025/06/15', valueDate: '2025/06/15', description: '配当金', flowType: 'IN', category: '投資収益', deposit: 25000, withdrawal: 0, balance: 2786500, memo: '××証券' },
        { date: '2025/06/18', valueDate: '2025/06/18', description: '水道料金', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 3500, balance: 2783000, memo: '東京都水道局' },
        { date: '2025/06/20', valueDate: '2025/06/20', description: 'カード引落', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 45000, balance: 2738000, memo: '○○カード' },
        { date: '2025/06/22', valueDate: '2025/06/22', description: '振込入金', flowType: 'IN', category: '資金移動', deposit: 15000, withdrawal: 0, balance: 2753000, memo: '鈴木一郎' },
        { date: '2025/06/25', valueDate: '2025/06/25', description: '携帯料金', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 8000, balance: 2745000, memo: 'NTTドコモ' },
        { date: '2025/06/28', valueDate: '2025/06/28', description: 'ガス料金', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 5000, balance: 2740000, memo: '東京ガス' },
        { date: '2025/06/30', valueDate: '2025/06/30', description: '定期預金利息', flowType: 'IN', category: '投資収益', deposit: 110000, withdrawal: 0, balance: 2850000, memo: '満期解約' }
      ]
    }
  },
  {
    id: 2,
    filename: 'ゆうちょ銀行_通帳記入_202506.jpg',
    type: '画像',
    uploadDate: '2025/06/12',
    status: '要補正',
    extractedData: {
      accountInfo: {
        bankName: 'ゆうちょ銀行',
        branchName: '○○支店',
        accountType: '通常貯金',
        accountNumber: '12345-6789012',
        accountHolder: '資産管理 花子',
        period: '2025年6月1日～2025年6月30日',
        openingBalance: 1200000,
        closingBalance: 1580000,
        currency: '円'
      },
      transactions: [
        { date: '2025/06/01', valueDate: '2025/06/01', description: '前月繰越', flowType: '', category: '', deposit: 1200000, withdrawal: 0, balance: 1200000, memo: '' },
        { date: '2025/06/02', valueDate: '2025/06/02', description: '振込入金', flowType: 'IN', category: '資金移動', deposit: 50000, withdrawal: 0, balance: 1250000, memo: 'タナカ　タロウ' },
        { date: '2025/06/08', valueDate: '2025/06/08', description: '年金', flowType: 'IN', category: 'その他収益', deposit: 180000, withdrawal: 0, balance: 1430000, memo: '厚生年金' },
        { date: '2025/06/10', valueDate: '2025/06/10', description: 'ATM', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 20000, balance: 1410000, memo: 'ファミリーマート' },
        { date: '2025/06/15', valueDate: '2025/06/15', description: '医療保険', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 12000, balance: 1398000, memo: '○○生命' },
        { date: '2025/06/20', valueDate: '2025/06/20', description: '定額貯金利息', flowType: 'IN', category: '投資収益', deposit: 2000, withdrawal: 0, balance: 1400000, memo: '' },
        { date: '2025/06/25', valueDate: '2025/06/25', description: '配当金', flowType: 'IN', category: '投資収益', deposit: 180000, withdrawal: 0, balance: 1580000, memo: '△△電力' }
      ]
    }
  },
  {
    id: 3,
    filename: 'みずほ銀行_Web通帳_2025Q2.pdf',
    type: 'PDF',
    uploadDate: '2025/06/08',
    status: '反映済',
    extractedData: {
      accountInfo: {
        bankName: 'みずほ銀行',
        branchName: '渋谷支店',
        accountType: '普通預金',
        accountNumber: '9876543',
        accountHolder: '株式会社資産管理',
        period: '2025年4月1日～2025年6月30日',
        openingBalance: 15000000,
        closingBalance: 18500000,
        currency: '円'
      },
      transactions: [
        { date: '2025/04/01', valueDate: '2025/04/01', description: '前期繰越', flowType: '', category: '', deposit: 15000000, withdrawal: 0, balance: 15000000, memo: '' },
        { date: '2025/04/05', valueDate: '2025/04/05', description: '売上入金', flowType: 'IN', category: 'サイト収益', deposit: 2500000, withdrawal: 0, balance: 17500000, memo: '○○商事' },
        { date: '2025/04/10', valueDate: '2025/04/10', description: '給与支払', flowType: 'OUT', category: '法人支出', deposit: 0, withdrawal: 1800000, balance: 15700000, memo: '4月分給与' },
        { date: '2025/04/25', valueDate: '2025/04/25', description: '事務所家賃', flowType: 'OUT', category: '法人支出', deposit: 0, withdrawal: 500000, balance: 15200000, memo: '△△不動産' },
        { date: '2025/05/05', valueDate: '2025/05/05', description: '売上入金', flowType: 'IN', category: 'サイト収益', deposit: 3200000, withdrawal: 0, balance: 18400000, memo: '××工業' },
        { date: '2025/05/10', valueDate: '2025/05/10', description: '給与支払', flowType: 'OUT', category: '法人支出', deposit: 0, withdrawal: 1800000, balance: 16600000, memo: '5月分給与' },
        { date: '2025/05/15', valueDate: '2025/05/15', description: '設備投資', flowType: 'OUT', category: '投資支出', deposit: 0, withdrawal: 800000, balance: 15800000, memo: 'PC購入' },
        { date: '2025/06/05', valueDate: '2025/06/05', description: '売上入金', flowType: 'IN', category: 'サイト収益', deposit: 4500000, withdrawal: 0, balance: 20300000, memo: '□□製作所' },
        { date: '2025/06/10', valueDate: '2025/06/10', description: '給与支払', flowType: 'OUT', category: '法人支出', deposit: 0, withdrawal: 1800000, balance: 18500000, memo: '6月分給与' }
      ]
    }
  }
];

// 抽出データプレビューコンポーネント
const ExtractedDataPreview = ({ data, onEdit, onApply }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(data);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'transactions'

  // カテゴリマッピング
  const categoryMapping = {
    'IN': [
      '資金移動',
      'サイト収益',
      'その他収益',
      '投資収益',
      '社債金利収益',
      'その他投資収益'
    ],
    'OUT': [
      '資金移動',
      '法人支出',
      '個人支出',
      '立替分',
      '投資支出',
      'その他支出'
    ],
    'キャッシュフロー': [
      'IN',
      'OUT',
      'その他'
    ]
  };

  const handleInfoEdit = (field, value) => {
    setEditedData({
      ...editedData,
      accountInfo: {
        ...editedData.accountInfo,
        [field]: value
      }
    });
  };

  const handleTransactionEdit = (index, field, value) => {
    const newTransactions = [...editedData.transactions];
    
    // フロー種別が変更された場合、カテゴリをリセット
    if (field === 'flowType' && newTransactions[index].flowType !== value) {
      newTransactions[index] = {
        ...newTransactions[index],
        flowType: value,
        category: '' // カテゴリをリセット
      };
    } else {
      newTransactions[index] = {
        ...newTransactions[index],
        [field]: field === 'deposit' || field === 'withdrawal' || field === 'balance' 
          ? parseFloat(value) || 0 
          : value
      };
    }
    
    setEditedData({
      ...editedData,
      transactions: newTransactions
    });
  };

  const addTransaction = () => {
    const newTransaction = {
      date: new Date().toLocaleDateString('ja-JP').replace(/\//g, '/'),
      valueDate: new Date().toLocaleDateString('ja-JP').replace(/\//g, '/'),
      description: '',
      flowType: '',
      category: '',
      deposit: 0,
      withdrawal: 0,
      balance: editedData.transactions[editedData.transactions.length - 1]?.balance || 0,
      memo: ''
    };
    setEditedData({
      ...editedData,
      transactions: [...editedData.transactions, newTransaction]
    });
  };

  const deleteTransaction = (index) => {
    setEditedData({
      ...editedData,
      transactions: editedData.transactions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="mt-2 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">抽出データプレビュー</h4>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              補正
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  onEdit(editedData);
                  setIsEditing(false);
                }}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                保存
              </button>
              <button
                onClick={() => {
                  setEditedData(data);
                  setIsEditing(false);
                }}
                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                キャンセル
              </button>
            </>
          )}
          <button
            onClick={onApply}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            反映
          </button>
        </div>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'info' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          口座情報
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transactions' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          取引明細 ({editedData.transactions.length}件)
        </button>
      </div>

      {/* 口座情報タブ */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {editedData.accountInfo.bankName ? '銀行名' : 'ウォレット名'}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.accountInfo.bankName || editedData.accountInfo.walletName}
                onChange={(e) => handleInfoEdit(editedData.accountInfo.bankName ? 'bankName' : 'walletName', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm">{editedData.accountInfo.bankName || editedData.accountInfo.walletName}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">支店名</label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.accountInfo.branchName || ''}
                onChange={(e) => handleInfoEdit('branchName', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm">{editedData.accountInfo.branchName || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">口座種別</label>
            {isEditing ? (
              <select
                value={editedData.accountInfo.accountType || '普通預金'}
                onChange={(e) => handleInfoEdit('accountType', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="普通預金">普通預金</option>
                <option value="当座預金">当座預金</option>
                <option value="定期預金">定期預金</option>
                <option value="貯蓄預金">貯蓄預金</option>
                <option value="その他">その他</option>
              </select>
            ) : (
              <p className="text-sm">{editedData.accountInfo.accountType || '普通預金'}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">口座番号</label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.accountInfo.accountNumber || editedData.accountInfo.walletAddress}
                onChange={(e) => handleInfoEdit(editedData.accountInfo.accountNumber ? 'accountNumber' : 'walletAddress', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm">{editedData.accountInfo.accountNumber || editedData.accountInfo.walletAddress}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">名義人</label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.accountInfo.accountHolder || ''}
                onChange={(e) => handleInfoEdit('accountHolder', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm">{editedData.accountInfo.accountHolder || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">期間</label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.accountInfo.period}
                onChange={(e) => handleInfoEdit('period', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm">{editedData.accountInfo.period}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">通貨</label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.accountInfo.currency || '円'}
                onChange={(e) => handleInfoEdit('currency', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm">{editedData.accountInfo.currency || '円'}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">期首残高</label>
            {isEditing ? (
              <input
                type="number"
                value={editedData.accountInfo.openingBalance}
                onChange={(e) => handleInfoEdit('openingBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm">{editedData.accountInfo.openingBalance.toLocaleString()}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">期末残高</label>
            {isEditing ? (
              <input
                type="number"
                value={editedData.accountInfo.closingBalance}
                onChange={(e) => handleInfoEdit('closingBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm">{editedData.accountInfo.closingBalance.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      {/* 取引明細タブ */}
      {activeTab === 'transactions' && (
        <div>
          {/* サマリー情報 */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">取引件数：</span>
                <span className="font-medium">{editedData.transactions.length}件</span>
              </div>
              <div>
                <span className="text-gray-600">総入金額：</span>
                <span className="font-medium text-blue-600">
                  {editedData.transactions.reduce((sum, t) => sum + (t.deposit || 0), 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">総出金額：</span>
                <span className="font-medium text-red-600">
                  {editedData.transactions.reduce((sum, t) => sum + (t.withdrawal || 0), 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">増減額：</span>
                <span className={`font-medium ${editedData.accountInfo.closingBalance - editedData.accountInfo.openingBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {(editedData.accountInfo.closingBalance - editedData.accountInfo.openingBalance >= 0 ? '+' : '') + 
                   (editedData.accountInfo.closingBalance - editedData.accountInfo.openingBalance).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mb-2 flex justify-end">
              <button
                onClick={addTransaction}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + 明細追加
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">日付</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">起算日</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">摘要</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">フロー種別</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">カテゴリ</th>
                  <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700 whitespace-nowrap">お引出し</th>
                  <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700 whitespace-nowrap">お預入れ</th>
                  <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700 whitespace-nowrap">残高</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">備考</th>
                  {isEditing && (
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-medium text-gray-700">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {editedData.transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={transaction.date}
                          onChange={(e) => handleTransactionEdit(index, 'date', e.target.value)}
                          className="w-full px-1 py-1 text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded"
                        />
                      ) : (
                        <span className="text-sm">{transaction.date}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={transaction.valueDate || transaction.date}
                          onChange={(e) => handleTransactionEdit(index, 'valueDate', e.target.value)}
                          className="w-full px-1 py-1 text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded"
                        />
                      ) : (
                        <span className="text-sm">{transaction.valueDate || transaction.date}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={transaction.description}
                          onChange={(e) => handleTransactionEdit(index, 'description', e.target.value)}
                          className="w-full px-1 py-1 text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded"
                        />
                      ) : (
                        <span className="text-sm">{transaction.description}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={transaction.flowType || ''}
                          onChange={(e) => handleTransactionEdit(index, 'flowType', e.target.value)}
                          className="w-full px-1 py-1 text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded bg-white cursor-pointer"
                        >
                          <option value="">選択してください</option>
                          <option value="IN">IN（収入）</option>
                          <option value="OUT">OUT（支出）</option>
                          <option value="キャッシュフロー">キャッシュフロー</option>
                        </select>
                      ) : (
                        <span className={`text-sm ${
                          transaction.flowType === 'IN' ? 'text-blue-600 font-medium' : 
                          transaction.flowType === 'OUT' ? 'text-red-600 font-medium' : 
                          transaction.flowType === 'キャッシュフロー' ? 'text-green-600 font-medium' : ''
                        }`}>{transaction.flowType || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={transaction.category || ''}
                          onChange={(e) => handleTransactionEdit(index, 'category', e.target.value)}
                          className={`w-full px-1 py-1 text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded bg-white ${
                            !transaction.flowType ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          disabled={!transaction.flowType}
                        >
                          <option value="">選択してください</option>
                          {transaction.flowType && categoryMapping[transaction.flowType]?.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm">{transaction.category || '-'}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={transaction.withdrawal}
                          onChange={(e) => handleTransactionEdit(index, 'withdrawal', e.target.value)}
                          className="w-full px-1 py-1 text-sm text-right border-0 focus:ring-2 focus:ring-blue-500 rounded"
                        />
                      ) : (
                        <span className="text-sm text-red-600">{transaction.withdrawal > 0 ? transaction.withdrawal.toLocaleString() : ''}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={transaction.deposit}
                          onChange={(e) => handleTransactionEdit(index, 'deposit', e.target.value)}
                          className="w-full px-1 py-1 text-sm text-right border-0 focus:ring-2 focus:ring-blue-500 rounded"
                        />
                      ) : (
                        <span className="text-sm text-blue-600">{transaction.deposit > 0 ? transaction.deposit.toLocaleString() : ''}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={transaction.balance}
                          onChange={(e) => handleTransactionEdit(index, 'balance', e.target.value)}
                          className="w-full px-1 py-1 text-sm text-right border-0 focus:ring-2 focus:ring-blue-500 rounded"
                        />
                      ) : (
                        <span className="text-sm font-medium">{transaction.balance.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={transaction.memo || ''}
                          onChange={(e) => handleTransactionEdit(index, 'memo', e.target.value)}
                          className="w-full px-1 py-1 text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded"
                        />
                      ) : (
                        <span className="text-xs text-gray-600">{transaction.memo || ''}</span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <button
                          onClick={() => deleteTransaction(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// メインコンポーネント
const FileManagementPage = () => {
  const [files, setFiles] = useState(dummyFiles);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedFile, setExpandedFile] = useState(null);

  // ドラッグ&ドロップハンドラー
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files) => {
    // ファイルアップロード処理（ダミー）
    const newFiles = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      filename: file.name,
      type: file.type.includes('pdf') ? 'PDF' : '画像',
      uploadDate: new Date().toLocaleDateString('ja-JP').replace(/\//g, '/'),
      status: '処理中',
      extractedData: {
        accountInfo: {
          bankName: '',
          accountNumber: '',
          period: '',
          openingBalance: 0,
          closingBalance: 0
        },
        transactions: []
      }
    }));
    
    setFiles(prev => [...newFiles, ...prev]);
    
    // OCR処理のシミュレーション
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        newFiles.find(nf => nf.id === f.id) 
          ? { 
              ...f, 
              status: '要補正', 
              extractedData: {
                accountInfo: {
                  bankName: 'サンプル銀行',
                  branchName: '本店',
                  accountType: '普通預金',
                  accountNumber: '1234567',
                  accountHolder: 'サンプル 太郎',
                  period: '2025年6月1日～2025年6月30日',
                  openingBalance: 1000000,
                  closingBalance: 1100000,
                  currency: '円'
                },
                transactions: [
                  { date: '2025/06/01', valueDate: '2025/06/01', description: '前月繰越', flowType: '', category: '', deposit: 1000000, withdrawal: 0, balance: 1000000, memo: '' },
                  { date: '2025/06/05', valueDate: '2025/06/05', description: '給与振込', flowType: 'IN', category: 'その他収益', deposit: 300000, withdrawal: 0, balance: 1300000, memo: '○○株式会社' },
                  { date: '2025/06/10', valueDate: '2025/06/10', description: '電気料金', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 12000, balance: 1288000, memo: '東京電力' },
                  { date: '2025/06/15', valueDate: '2025/06/15', description: 'ATM引出', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 30000, balance: 1258000, memo: 'セブンイレブン' },
                  { date: '2025/06/20', valueDate: '2025/06/20', description: '家賃引落', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 150000, balance: 1108000, memo: '△△不動産' },
                  { date: '2025/06/25', valueDate: '2025/06/25', description: '水道料金', flowType: 'OUT', category: '個人支出', deposit: 0, withdrawal: 8000, balance: 1100000, memo: '東京都水道局' }
                ]
              }
            } 
          : f
      ));
    }, 2000);
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleEdit = (fileId, newData) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, extractedData: newData } : f
    ));
  };

  const handleApply = (fileId) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: '反映済' } : f
    ));
    alert('資産管理ページへデータを反映しました');
  };

  const handleDelete = (fileId) => {
    if (window.confirm('このファイルを削除してよろしいですか？')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || file.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      '処理中': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      '要補正': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      '補正済': { color: 'bg-blue-100 text-blue-800', icon: Edit3 },
      '反映済': { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig['処理中'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ページタイトルとアクション */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ファイル管理</h2>
              <p className="mt-1 text-sm text-gray-600">
                銀行通帳やWeb明細のPDF・画像から取引明細を自動抽出します
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                履歴エクスポート
              </button>
            </div>
          </div>
        </div>

        {/* ファイルアップロードエリア */}
        <div className="mb-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              通帳・明細書のPDFまたは画像ファイルをドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-500 mt-1">
              銀行通帳、Web明細、取引履歴等に対応
            </p>
            <label
              htmlFor="file-input"
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              ファイルを選択
            </label>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ファイル名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての状態</option>
            <option value="処理中">処理中</option>
            <option value="要補正">要補正</option>
            <option value="補正済">補正済</option>
            <option value="反映済">反映済</option>
          </select>
        </div>

        {/* ファイル一覧 */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ファイル名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    種別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アップロード日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    抽出プレビュー
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <React.Fragment key={file.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {file.type === 'PDF' ? (
                            <FileText className="h-5 w-5 text-red-500 mr-2" />
                          ) : (
                            <Image className="h-5 w-5 text-blue-500 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{file.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{file.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {file.uploadDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(file.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          表示
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-900"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedFile === file.id && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 bg-gray-50">
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
              </tbody>
            </table>
          </div>
          
          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <File className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">ファイルが見つかりません</p>
            </div>
          )}
        </div>

        {/* ページネーション（必要に応じて） */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            全 {filteredFiles.length} 件
          </p>
        </div>
      </main>
    </div>
  );
};

export default FileManagementPage;