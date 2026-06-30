import test from "node:test";
import assert from "node:assert/strict";
import { analyzeVariance, breakEven, parseBudgetCsv, profitSnapshot, workingCapital } from "../dist/index.js";

test("analyzes favorable and unfavorable variance by line type", () => {
  const [revenue, cost] = analyzeVariance([
    { name: "Revenue", budget: 100, actual: 120, type: "revenue" },
    { name: "Cost", budget: 100, actual: 120, type: "cost" }
  ]);

  assert.equal(revenue.kind, "favorable");
  assert.equal(cost.kind, "unfavorable");
  assert.equal(revenue.variancePercent, 0.2);
});

test("calculates contribution margin snapshot", () => {
  const snapshot = profitSnapshot({
    revenue: 200000,
    variableCosts: 120000,
    fixedCosts: 50000,
    units: 1000
  });

  assert.equal(snapshot.contributionMargin, 80000);
  assert.equal(snapshot.operatingProfit, 30000);
  assert.equal(snapshot.unitContributionMargin, 80);
});

test("calculates break-even point", () => {
  const result = breakEven({
    fixedCosts: 25000,
    pricePerUnit: 125,
    variableCostPerUnit: 75
  });

  assert.equal(result.units, 500);
  assert.equal(result.revenue, 62500);
});

test("calculates cash conversion cycle", () => {
  const result = workingCapital({
    inventory: 30000,
    receivables: 40000,
    payables: 20000,
    sales: 365000,
    costOfGoodsSold: 182500
  });

  assert.equal(result.daysInventoryOutstanding, 60);
  assert.equal(result.daysSalesOutstanding, 40);
  assert.equal(result.daysPayablesOutstanding, 40);
  assert.equal(result.cashConversionCycle, 60);
});

test("parses budget CSV", () => {
  const rows = parseBudgetCsv("name,budget,actual,type\nSales,1000,1200,revenue\nRent,500,500,cost");

  assert.equal(rows.length, 2);
  assert.equal(rows[0].type, "revenue");
  assert.equal(rows[1].actual, 500);
});
