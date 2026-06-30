import type {
  BreakEvenInputs,
  BreakEvenResult,
  BudgetLine,
  ProfitInputs,
  ProfitSnapshot,
  VarianceKind,
  VarianceResult,
  WorkingCapitalInputs,
  WorkingCapitalResult
} from "./types.js";

function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`);
  }
}

function ratio(numerator: number, denominator: number): number | null {
  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function classifyVariance(line: BudgetLine, variance: number): VarianceKind {
  if (variance === 0) {
    return "neutral";
  }

  const type = line.type ?? "cost";
  const isFavorable = type === "revenue" ? variance > 0 : variance < 0;
  return isFavorable ? "favorable" : "unfavorable";
}

export function analyzeVariance(lines: BudgetLine[]): VarianceResult[] {
  return lines.map((line) => {
    assertFiniteNumber(line.budget, `${line.name}.budget`);
    assertFiniteNumber(line.actual, `${line.name}.actual`);

    const variance = line.actual - line.budget;

    return {
      ...line,
      type: line.type ?? "cost",
      variance,
      variancePercent: ratio(variance, Math.abs(line.budget)),
      kind: classifyVariance(line, variance)
    };
  });
}

export function summarizeVariance(lines: BudgetLine[]): VarianceResult {
  const totals = lines.reduce<BudgetLine>(
    (sum, line) => ({
      name: "Total",
      budget: sum.budget + line.budget,
      actual: sum.actual + line.actual,
      type: "cost"
    }),
    { name: "Total", budget: 0, actual: 0, type: "cost" }
  );

  return analyzeVariance([totals])[0];
}

export function profitSnapshot(input: ProfitInputs): ProfitSnapshot {
  assertFiniteNumber(input.revenue, "revenue");
  assertFiniteNumber(input.variableCosts, "variableCosts");
  assertFiniteNumber(input.fixedCosts, "fixedCosts");

  if (input.units !== undefined) {
    assertFiniteNumber(input.units, "units");
  }

  const contributionMargin = input.revenue - input.variableCosts;
  const operatingProfit = contributionMargin - input.fixedCosts;

  return {
    revenue: input.revenue,
    variableCosts: input.variableCosts,
    fixedCosts: input.fixedCosts,
    contributionMargin,
    contributionMarginRatio: ratio(contributionMargin, input.revenue),
    operatingProfit,
    profitMargin: ratio(operatingProfit, input.revenue),
    unitContributionMargin:
      input.units === undefined ? null : ratio(contributionMargin, input.units)
  };
}

export function breakEven(input: BreakEvenInputs): BreakEvenResult {
  assertFiniteNumber(input.fixedCosts, "fixedCosts");
  assertFiniteNumber(input.pricePerUnit, "pricePerUnit");
  assertFiniteNumber(input.variableCostPerUnit, "variableCostPerUnit");

  const unitContributionMargin = input.pricePerUnit - input.variableCostPerUnit;
  const contributionMarginRatio = ratio(unitContributionMargin, input.pricePerUnit);

  if (unitContributionMargin <= 0) {
    return {
      unitContributionMargin,
      contributionMarginRatio,
      units: null,
      revenue: null
    };
  }

  const units = input.fixedCosts / unitContributionMargin;

  return {
    unitContributionMargin,
    contributionMarginRatio,
    units,
    revenue: units * input.pricePerUnit
  };
}

export function workingCapital(input: WorkingCapitalInputs): WorkingCapitalResult {
  const days = input.days ?? 365;

  assertFiniteNumber(input.inventory, "inventory");
  assertFiniteNumber(input.receivables, "receivables");
  assertFiniteNumber(input.payables, "payables");
  assertFiniteNumber(input.sales, "sales");
  assertFiniteNumber(input.costOfGoodsSold, "costOfGoodsSold");
  assertFiniteNumber(days, "days");

  const dio = ratio(input.inventory, input.costOfGoodsSold) === null
    ? null
    : (input.inventory / input.costOfGoodsSold) * days;
  const dso = ratio(input.receivables, input.sales) === null
    ? null
    : (input.receivables / input.sales) * days;
  const dpo = ratio(input.payables, input.costOfGoodsSold) === null
    ? null
    : (input.payables / input.costOfGoodsSold) * days;

  return {
    daysInventoryOutstanding: dio,
    daysSalesOutstanding: dso,
    daysPayablesOutstanding: dpo,
    cashConversionCycle: dio === null || dso === null || dpo === null ? null : dio + dso - dpo,
    netWorkingCapital: input.inventory + input.receivables - input.payables
  };
}
