import {
    calculateChangeForTransaction,
  formatChangeResult,
  parseTransactionLine,
} from "../app/lib/calculateChange";

import type { Currency } from "../app/lib/types";


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