#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { analyzeVariance, breakEven, parseBudgetCsv, profitSnapshot, summarizeVariance, workingCapital } from "./index.js";

function formatMoney(value: number | null): string {
  return value === null ? "n/a" : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatPercent(value: number | null): string {
  return value === null ? "n/a" : `${(value * 100).toFixed(2)}%`;
}

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function readNumber(args: string[], name: string): number {
  const raw = readOption(args, name);

  if (raw === undefined) {
    throw new Error(`Missing ${name}`);
  }

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a number`);
  }

  return value;
}

function printHelp(): void {
  console.log(`controlling-kit

Usage:
  controlling-kit variance <file.csv>
  controlling-kit profit --revenue 120000 --variable 72000 --fixed 25000 --units 1000
  controlling-kit breakeven --fixed 25000 --price 120 --variable 72
  controlling-kit working-capital --inventory 40000 --receivables 55000 --payables 30000 --sales 420000 --cogs 260000

CSV columns for variance: name,budget,actual,type
type is optional and accepts revenue or cost.`);
}

async function run(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "variance") {
    const file = args[0];

    if (!file) {
      throw new Error("Missing CSV file path");
    }

    const csv = await readFile(file, "utf8");
    const lines = parseBudgetCsv(csv);
    const results = analyzeVariance(lines);
    const total = summarizeVariance(lines);

    console.table(results.map((row) => ({
      name: row.name,
      type: row.type,
      budget: formatMoney(row.budget),
      actual: formatMoney(row.actual),
      variance: formatMoney(row.variance),
      variancePercent: formatPercent(row.variancePercent),
      kind: row.kind
    })));
    console.log(`Total variance: ${formatMoney(total.variance)} (${formatPercent(total.variancePercent)})`);
    return;
  }

  if (command === "profit") {
    const snapshot = profitSnapshot({
      revenue: readNumber(args, "--revenue"),
      variableCosts: readNumber(args, "--variable"),
      fixedCosts: readNumber(args, "--fixed"),
      units: readOption(args, "--units") === undefined ? undefined : readNumber(args, "--units")
    });

    console.table({
      contributionMargin: formatMoney(snapshot.contributionMargin),
      contributionMarginRatio: formatPercent(snapshot.contributionMarginRatio),
      operatingProfit: formatMoney(snapshot.operatingProfit),
      profitMargin: formatPercent(snapshot.profitMargin),
      unitContributionMargin: formatMoney(snapshot.unitContributionMargin)
    });
    return;
  }

  if (command === "breakeven") {
    const result = breakEven({
      fixedCosts: readNumber(args, "--fixed"),
      pricePerUnit: readNumber(args, "--price"),
      variableCostPerUnit: readNumber(args, "--variable")
    });

    console.table({
      unitContributionMargin: formatMoney(result.unitContributionMargin),
      contributionMarginRatio: formatPercent(result.contributionMarginRatio),
      units: formatMoney(result.units),
      revenue: formatMoney(result.revenue)
    });
    return;
  }

  if (command === "working-capital") {
    const result = workingCapital({
      inventory: readNumber(args, "--inventory"),
      receivables: readNumber(args, "--receivables"),
      payables: readNumber(args, "--payables"),
      sales: readNumber(args, "--sales"),
      costOfGoodsSold: readNumber(args, "--cogs"),
      days: readOption(args, "--days") === undefined ? undefined : readNumber(args, "--days")
    });

    console.table({
      DIO: formatMoney(result.daysInventoryOutstanding),
      DSO: formatMoney(result.daysSalesOutstanding),
      DPO: formatMoney(result.daysPayablesOutstanding),
      cashConversionCycle: formatMoney(result.cashConversionCycle),
      netWorkingCapital: formatMoney(result.netWorkingCapital)
    });
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
