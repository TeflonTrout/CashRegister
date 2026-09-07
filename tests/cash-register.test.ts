import {
    calculateChangeForTransaction,
  formatChangeResult,
  parseTransactionLine,
} from "../app/lib/calculateChange";
import {
  ALL_SMALLEST_STRATEGY_ID,
  MINIMUM_STRATEGY_ID,
  RANDOM_STRATEGY_ID,
  registerChangeStrategy,
} from "../app/lib/strategies";
import { createDivisibleByRule } from "../app/lib/changeRules";

import type { ChangeRuleSet, Currency } from "../app/lib/types";


const usd: Currency = {
  denominations: [
    {
      name: "dollar",
      pluralName: "dollars",
      valueInCents: 100,
      kind: "bill",
    },
    {
      name: "quarter",
      pluralName: "quarters",
      valueInCents: 25,
      kind: "coin",
    },
    {
      name: "dime",
      pluralName: "dimes",
      valueInCents: 10,
      kind: "coin",
    },
    {
      name: "nickel",
      pluralName: "nickels",
      valueInCents: 5,
      kind: "coin",
    },
    {
      name: "penny",
      pluralName: "pennies",
      valueInCents: 1,
      kind: "coin",
    },
  ],
    code: "USD",
    name: "US Dollar",
    symbol: "$",
};

describe("parseTransactionLine", () => {
  it("parses dollar amounts into cents", () => {
    expect(parseTransactionLine("2.12,3.00")).toEqual({
      amountOwed: 212,
      amountPaid: 300,
    });
  });

  it("trims whitespace", () => {
    expect(parseTransactionLine(" 2.12 , 3.00 ")).toEqual({
      amountOwed: 212,
      amountPaid: 300,
    });
  });

  it("throws when the line does not contain two values", () => {
    expect(() => parseTransactionLine("2.12")).toThrow(
      'Expected "amountOwed,amountPaid"',
    );
  });

  it("throws when a currency value is invalid", () => {
    expect(() => parseTransactionLine("banana,3.00")).toThrow();
  });
});

describe("calculateChangeForTransaction", () => {
  it("returns minimum change when amount owed is not divisible by 3", () => {
    const transaction = parseTransactionLine("2.12,3.00");

    const result = calculateChangeForTransaction(transaction, usd);

    expect(result.changeOwed).toBe(88);
    expect(result.isRandomized).toBe(false);

    expect(result.breakdown).toEqual([
      {
        denomination: usd.denominations[1],
        count: 3,
      },
      {
        denomination: usd.denominations[2],
        count: 1,
      },
      {
        denomination: usd.denominations[4],
        count: 3,
      },
    ]);
  });
});

it("formats the minimum change result", () => {
  const transaction = parseTransactionLine("2.12,3.00");
  const result = calculateChangeForTransaction(transaction, usd);

  expect(formatChangeResult(result)).toBe(
    "3 quarters, 1 dime, 3 pennies",
  );
});

it("returns randomized change when amount owed is divisible by 3", () => {
  const transaction = parseTransactionLine("3.33,5.00");

  const result = calculateChangeForTransaction(transaction, usd);

  expect(result.changeOwed).toBe(167);
  expect(result.isRandomized).toBe(true);

  const total = result.breakdown.reduce(
    (sum, item) =>
      sum + item.denomination.valueInCents * item.count,
    0,
  );

  expect(total).toBe(167);
});
describe("change strategies", () => {
  it("records which rule selected the strategy", () => {
    const minimum = calculateChangeForTransaction(
      parseTransactionLine("2.12,3.00"),
      usd,
    );

    expect(minimum.applied).toEqual({
      strategyId: "minimum",
      strategyName: "Minimum change",
      ruleId: null,
      wasOverridden: false,
    });

    const randomized = calculateChangeForTransaction(
      parseTransactionLine("3.33,5.00"),
      usd,
    );

    expect(randomized.applied.strategyId).toBe("random");
    expect(randomized.applied.ruleId).toBe("divisible-by-3");
  });

  it("uses an explicit strategy override instead of the rules", () => {
    // 3.33 is divisible by 3, so the rules would normally randomize it.
    const result = calculateChangeForTransaction(
      parseTransactionLine("3.33,5.00"),
      usd,
      { strategyId: ALL_SMALLEST_STRATEGY_ID },
    );

    expect(result.applied.strategyId).toBe(ALL_SMALLEST_STRATEGY_ID);
    expect(result.applied.ruleId).toBeNull();
    expect(result.applied.wasOverridden).toBe(true);
    expect(result.isRandomized).toBe(false);
    expect(formatChangeResult(result)).toBe("167 pennies");
  });

  it("throws on an unknown strategy id", () => {
    expect(() =>
      calculateChangeForTransaction(parseTransactionLine("2.12,3.00"), usd, {
        strategyId: "notAStrategy",
      }),
    ).toThrow('Unknown change strategy "notAStrategy"');
  });
});

describe("change rules", () => {
  it("honours a custom divisor", () => {
    const ruleSet: ChangeRuleSet = {
      rules: [createDivisibleByRule(5)],
      defaultStrategyId: MINIMUM_STRATEGY_ID,
    };

    // 2.15 is divisible by 5 but not by 3.
    const result = calculateChangeForTransaction(
      parseTransactionLine("2.15,3.00"),
      usd,
      { ruleSet },
    );

    expect(result.applied.ruleId).toBe("divisible-by-5");
    expect(result.isRandomized).toBe(true);
  });

  it("evaluates higher priority rules first", () => {
    const ruleSet: ChangeRuleSet = {
      rules: [
        createDivisibleByRule(3, RANDOM_STRATEGY_ID, 0),
        createDivisibleByRule(1, ALL_SMALLEST_STRATEGY_ID, 10),
      ],
      defaultStrategyId: MINIMUM_STRATEGY_ID,
    };

    const result = calculateChangeForTransaction(
      parseTransactionLine("3.33,5.00"),
      usd,
      { ruleSet },
    );

    expect(result.applied.ruleId).toBe("divisible-by-1");
    expect(result.applied.strategyId).toBe(ALL_SMALLEST_STRATEGY_ID);
  });

  it("falls back to the default strategy when no rule matches", () => {
    const ruleSet: ChangeRuleSet = {
      rules: [],
      defaultStrategyId: ALL_SMALLEST_STRATEGY_ID,
    };

    const result = calculateChangeForTransaction(
      parseTransactionLine("2.12,3.00"),
      usd,
      { ruleSet },
    );

    expect(result.applied.ruleId).toBeNull();
    expect(result.applied.strategyId).toBe(ALL_SMALLEST_STRATEGY_ID);
  });
});

describe("registered strategies", () => {
  it("accepts a strategy registered at runtime", () => {
    registerChangeStrategy({
      id: "allBills",
      name: "All bills",
      description: "Test-only strategy that pays in whole dollars.",
      isDeterministic: true,
      buildBreakdown: ({ changeOwed, denominations }) => [
        {
          denomination: denominations[0],
          count: changeOwed / denominations[0].valueInCents,
        },
      ],
    });

    const result = calculateChangeForTransaction(
      parseTransactionLine("2.00,5.00"),
      usd,
      { strategyId: "allBills" },
    );

    expect(formatChangeResult(result)).toBe("3 dollars");
  });

  it("rejects a strategy whose breakdown does not sum to the change owed", () => {
    registerChangeStrategy({
      id: "shortChange",
      name: "Short change",
      description: "Test-only strategy that deliberately under-pays.",
      isDeterministic: true,
      buildBreakdown: () => [],
    });

    expect(() =>
      calculateChangeForTransaction(parseTransactionLine("2.12,3.00"), usd, {
        strategyId: "shortChange",
      }),
    ).toThrow('Strategy "shortChange" produced 0 but 88 was owed');
  });
});
