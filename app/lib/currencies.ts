import { Currency, Denomination } from "./types";

export const USD_DENOMINATIONS: Denomination[] = [
  { name: "hundred", pluralName: "hundreds", valueInCents: 10000, kind: "bill" },
  { name: "fifty", pluralName: "fifties", valueInCents: 5000, kind: "bill" },
  { name: "twenty", pluralName: "twenties", valueInCents: 2000, kind: "bill" },
  { name: "ten", pluralName: "tens", valueInCents: 1000, kind: "bill" },
  { name: "five", pluralName: "fives", valueInCents: 500, kind: "coin" },
  { name: "one", pluralName: "ones", valueInCents: 100, kind: "coin" },
  { name: "quarter", pluralName: "quarters", valueInCents: 25, kind: "coin" },
  { name: "dime", pluralName: "dimes", valueInCents: 10, kind: "coin" },
  { name: "nickel", pluralName: "nickels", valueInCents: 5, kind: "coin" },
  { name: "penny", pluralName: "pennies", valueInCents: 1, kind: "coin" },
];

export const USD: Currency = {
  code: "USD",
  name: "United States Dollar",
  symbol: "$",
  denominations: USD_DENOMINATIONS,
};

// EURO FOR SCALING TO OTHER CURRENCIES
export const EUR_DENOMINATIONS: Denomination[] = [
  { name: "euro", pluralName: "euros", valueInCents: 100, kind: "bill" },
    { name: "fifty cent", pluralName: "fifty cents", valueInCents: 50, kind: "coin" },
    { name: "twenty cent", pluralName: "twenty cents", valueInCents: 20, kind: "coin" },
    { name: "ten cent", pluralName: "ten cents", valueInCents: 10, kind: "coin" },
    { name: "five cent", pluralName: "five cents", valueInCents: 5, kind: "coin" },
    { name: "two cent", pluralName: "two cents", valueInCents: 2, kind: "coin" },
    { name: "one cent", pluralName: "one cents", valueInCents: 1, kind: "coin" },
];

export const EUR: Currency = {
  code: "EUR",
  name: "Euro",
  symbol: "€",
  denominations: EUR_DENOMINATIONS,
};

export const CURRENCIES: Record<string, Currency> = {
  USD: USD,
  EUR: EUR,
};

export const DEFAULT_CURRENCY = USD;