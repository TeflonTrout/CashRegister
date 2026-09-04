/**
 * Domain types for the cash register problem described in README.md:
 * parse "amount owed,amount paid" lines and compute the change owed,
 * broken down by denomination.
 */

/**
 * An amount expressed in a currency's smallest unit (e.g. cents for USD).
 * Money is always represented this way internally so calculations stay
 * integer-based and avoid floating-point rounding errors.
 */
export type DenominationKind = "bill" | "coin";

/** A single physical form of currency, e.g. a quarter or a dollar bill. */
export interface Denomination {
  /** Singular display name, e.g. "dollar", "quarter", "penny". */
  name: string;
  /** Plural display name, e.g. "dollars", "quarters", "pennies". */
  pluralName: string;
  /** Value in the currency's minor units, e.g. 25 = $0.25 for USD. */
  valueInCents: number;
  kind: DenominationKind;
}

/** A currency and the denominations available for making change in it. */
export interface Currency {
  /** ISO 4217 currency code, e.g. "USD", "EUR". */
  code: string;
  /** Display name, e.g. "US Dollar". */
  name: string;
  symbol: string;
  denominations: Denomination[];
}

/** A currency's denominations, keyed by currency code. */
export type CurrencyDenominations = Record<Currency["code"], Denomination[]>;

/** One parsed input line: the amount owed and the amount paid. */
export interface Transaction {
  amountOwed: number;
  amountPaid: number;
}

/** A denomination and how many of it are included in a piece of change. */
export interface ChangeLineItem {
  denomination: Denomination;
  count: number;
}

/** The computed change for a single transaction. */
export interface ChangeResult {
  transaction: Transaction;
  changeOwed: number;
  breakdown: ChangeLineItem[];
  /** True when the "owed amount divisible by 3" random rule was applied. */
  isRandomized: boolean;
}

/** Request body for POST /api/calculate — one raw "amountOwed,amountPaid" line per transaction. */
export interface CalculateRequestBody {
  lines: string[];
}

/** Successful response body for POST /api/calculate. */
export interface CalculateResponseBody {
  /** Describes the outcome for debugging; not intended for end-user display. */
  message: string;
  results: ChangeResult[];
}

/** Error response body for POST /api/calculate. */
export interface CalculateErrorResponseBody {
  /** Describes what went wrong for debugging; not intended for end-user display. */
  message: string;
}
