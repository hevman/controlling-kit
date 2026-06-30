export type VarianceKind = "favorable" | "unfavorable" | "neutral";

export interface BudgetLine {
  name: string;
  budget: number;
  actual: number;
  type?: "revenue" | "cost";
}

export interface VarianceResult extends BudgetLine {
  variance: number;
  variancePercent: number | null;
  kind: VarianceKind;
}

export interface ProfitInputs {
  revenue: number;
  variableCosts: number;
  fixedCosts: number;
  units?: number;
}

export interface ProfitSnapshot {
  revenue: number;
  variableCosts: number;
  fixedCosts: number;
  contributionMargin: number;
  contributionMarginRatio: number | null;
  operatingProfit: number;
  profitMargin: number | null;
  unitContributionMargin: number | null;
}

export interface BreakEvenInputs {
  fixedCosts: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
}

export interface BreakEvenResult {
  unitContributionMargin: number;
  contributionMarginRatio: number | null;
  units: number | null;
  revenue: number | null;
}

export interface WorkingCapitalInputs {
  inventory: number;
  receivables: number;
  payables: number;
  sales: number;
  costOfGoodsSold: number;
  days?: number;
}

export interface WorkingCapitalResult {
  daysInventoryOutstanding: number | null;
  daysSalesOutstanding: number | null;
  daysPayablesOutstanding: number | null;
  cashConversionCycle: number | null;
  netWorkingCapital: number;
}
