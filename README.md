# controlling-kit

Finance and controlling calculations as a small TypeScript library and CLI.

It is useful for quick study examples, budget reviews, project controlling and repeatable spreadsheet checks without opening a spreadsheet.

## Features

- Budget vs actual variance analysis with favorable/unfavorable classification.
- Contribution margin, operating profit and profit margin.
- Break-even units and break-even revenue.
- Working capital metrics: DIO, DSO, DPO, cash conversion cycle and net working capital.
- Zero runtime dependencies.

## Install

```bash
npm install controlling-kit
```

For local development:

```bash
npm install
npm test
```

## CLI

Analyze a CSV file:

```bash
npx controlling-kit variance examples/budget-vs-actual.csv
```

CSV format:

```csv
name,budget,actual,type
Sales revenue,180000,192500,revenue
Direct materials,62000,68100,cost
```

Other commands:

```bash
npx controlling-kit profit --revenue 120000 --variable 72000 --fixed 25000 --units 1000
npx controlling-kit breakeven --fixed 25000 --price 120 --variable 72
npx controlling-kit working-capital --inventory 40000 --receivables 55000 --payables 30000 --sales 420000 --cogs 260000
```

## Library

```ts
import { analyzeVariance, breakEven, profitSnapshot } from "controlling-kit";

const variance = analyzeVariance([
  { name: "Sales", budget: 180000, actual: 192500, type: "revenue" },
  { name: "Materials", budget: 62000, actual: 68100, type: "cost" }
]);

const profit = profitSnapshot({
  revenue: 120000,
  variableCosts: 72000,
  fixedCosts: 25000,
  units: 1000
});

const threshold = breakEven({
  fixedCosts: 25000,
  pricePerUnit: 120,
  variableCostPerUnit: 72
});

console.log({ variance, profit, threshold });
```

## Publishing

Before publishing:

```bash
npm test
npm pack --dry-run
npm publish --access public
```

If the package name is already taken later, publish under a scope:

```bash
npm pkg set name="@your-npm-user/controlling-kit"
npm publish --access public
```

## License

MIT
