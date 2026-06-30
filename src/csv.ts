import type { BudgetLine } from "./types.js";

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function parseAmount(value: string, label: string): number {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const amount = Number(normalized);

  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid numeric value in ${label}: ${value}`);
  }

  return amount;
}

export function parseBudgetCsv(csv: string): BudgetLine[] {
  const rows = csv
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    return [];
  }

  const headers = splitCsvLine(rows[0]).map((header) => header.toLowerCase());
  const required = ["name", "budget", "actual"];

  for (const header of required) {
    if (!headers.includes(header)) {
      throw new Error(`CSV must include a ${header} column`);
    }
  }

  return rows.slice(1).map((row, rowIndex) => {
    const values = splitCsvLine(row);
    const cell = (name: string) => values[headers.indexOf(name)] ?? "";
    const type = cell("type").toLowerCase();

    return {
      name: cell("name") || `Row ${rowIndex + 2}`,
      budget: parseAmount(cell("budget"), `row ${rowIndex + 2}, budget`),
      actual: parseAmount(cell("actual"), `row ${rowIndex + 2}, actual`),
      type: type === "revenue" ? "revenue" : "cost"
    };
  });
}
