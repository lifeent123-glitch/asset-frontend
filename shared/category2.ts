// frontend/shared/category2.ts
// カテゴリ2（収益/支出の細目）共通定義

export type FlowType = 'IN' | 'OUT';

export type Category2Key =
  | 'fund_transfer'              // 資金移動（PL集計は除外対象）
  | 'site_revenue'               // サイト収益
  | 'other_income'               // その他収益
  | 'investment_income'          // 投資収益
  | 'bond_interest_income'       // 社債金利収益
  | 'other_investment_income'    // その他投資収益
  | 'corporate_expense'          // 法人支出
  | 'personal_expense'           // 個人支出
  | 'reimbursement'              // 立替費用（=立替分）
  | 'investment_expense'         // 投資支出
  | 'other_expense';             // その他支出

export interface Category2Def {
  key: Category2Key;
  name: string;     // 画面表示名（日本語）
  flow: FlowType;   // IN or OUT
  order: number;    // UI表示順
}

export const CATEGORY2: Record<FlowType, Category2Def[]> = {
  IN: [
    { key: 'fund_transfer',           name: '資金移動',       flow: 'IN',  order: 10 },
    { key: 'site_revenue',            name: 'サイト収益',     flow: 'IN',  order: 20 },
    { key: 'other_income',            name: 'その他収益',     flow: 'IN',  order: 30 },
    { key: 'investment_income',       name: '投資収益',       flow: 'IN',  order: 40 },
    { key: 'bond_interest_income',    name: '社債金利収益',   flow: 'IN',  order: 50 },
    { key: 'other_investment_income', name: 'その他投資収益', flow: 'IN',  order: 60 },
  ],
  OUT: [
    { key: 'fund_transfer',     name: '資金移動',   flow: 'OUT', order: 10 },
    { key: 'corporate_expense', name: '法人支出',   flow: 'OUT', order: 20 },
    { key: 'personal_expense',  name: '個人支出',   flow: 'OUT', order: 30 },
    { key: 'reimbursement',     name: '立替費用',   flow: 'OUT', order: 40 },
    { key: 'investment_expense',name: '投資支出',   flow: 'OUT', order: 50 },
    { key: 'other_expense',     name: 'その他支出', flow: 'OUT', order: 60 },
  ],
};

export const ALL_CATEGORY2: Category2Def[] = [...CATEGORY2.IN, ...CATEGORY2.OUT];

export function byFlow(flow: FlowType): Category2Def[] {
  return CATEGORY2[flow];
}

export function findByKey(key: Category2Key): Category2Def | undefined {
  return ALL_CATEGORY2.find(c => c.key === key);
}

// 表記ゆれ・同義語の正規化
const ALIASES: Record<Category2Key, string[]> = {
  fund_transfer:           ['資金移動','振替','fund transfer','transfer'],
  site_revenue:            ['サイト収益','売上','売上入金','site revenue'],
  other_income:            ['その他収益','雑収入','other income'],
  investment_income:       ['投資収益','配当','分配金','dividend','distribution'],
  bond_interest_income:    ['社債金利収益','債券利息','bond interest','coupon'],
  other_investment_income: ['その他投資収益','為替差益','fx gain'],
  corporate_expense:       ['法人支出','会社費用','company expense'],
  personal_expense:        ['個人支出','生活費','personal expense'],
  reimbursement:           ['立替費用','立替分','立替','精算','reimbursement'],
  investment_expense:      ['投資支出','投資費用','investment expense','capex'],
  other_expense:           ['その他支出','雑費','other expense'],
};

export function normalizeCategory2(input: string): Category2Key | null {
  const s = (input ?? '').trim().toLowerCase();
  if (!s) return null;
  for (const [key, names] of Object.entries(ALIASES) as [Category2Key, string[]][]) {
    if (names.some(n => s === n.toLowerCase() || s.includes(n.toLowerCase()))) return key;
  }
  return null;
}

export function toName(key: Category2Key): string {
  return findByKey(key)?.name ?? key;
}

export function isValidPair(flow: FlowType, key: Category2Key): boolean {
  return CATEGORY2[flow].some(c => c.key === key);
}

export const CATEGORY2_BADGE: Record<Category2Key, { bg: string; text: string }> = {
  fund_transfer:           { bg: 'bg-gray-100 text-gray-800',  text: '資金移動' },
  site_revenue:            { bg: 'bg-green-100 text-green-800', text: 'サイト収益' },
  other_income:            { bg: 'bg-green-100 text-green-800', text: 'その他収益' },
  investment_income:       { bg: 'bg-green-100 text-green-800', text: '投資収益' },
  bond_interest_income:    { bg: 'bg-green-100 text-green-800', text: '社債金利収益' },
  other_investment_income: { bg: 'bg-green-100 text-green-800', text: 'その他投資収益' },
  corporate_expense:       { bg: 'bg-red-100 text-red-800',    text: '法人支出' },
  personal_expense:        { bg: 'bg-red-100 text-red-800',    text: '個人支出' },
  reimbursement:           { bg: 'bg-red-100 text-red-800',    text: '立替費用' },
  investment_expense:      { bg: 'bg-red-100 text-red-800',    text: '投資支出' },
  other_expense:           { bg: 'bg-red-100 text-red-800',    text: 'その他支出' },
};