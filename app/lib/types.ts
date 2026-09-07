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

/**
 * Identifies a way of breaking change down into denominations. Declared as a
 * plain string (rather than a closed union) so new strategies can be added —
 * including by code outside this module — without editing this type.
 */
export type ChangeStrategyId = string;

/** Identifies a rule that decides which strategy a transaction should use. */
export type ChangeRuleId = string;

/**
 * Everything a strategy is allowed to look at when building a breakdown.
 * New inputs (a cashier's till, the store's stock of each denomination, the
 * time of day, ...) belong here so strategy signatures never have to change.
 */
export interface ChangeStrategyContext {
  /** The parsed input line the change is being made for. */
  transaction: Transaction;
  /** Change owed, in minor units — what the breakdown must sum to. */
  changeOwed: number;
  /** The currency the change is being made in. */
  currency: Currency;
  /** Convenience alias for `currency.denominations`. */
  denominations: Denomination[];
}

/**
 * One way of turning an amount of change into physical denominations, e.g.
 * "the fewest pieces possible" or "all pennies". Implementations must return a
 * breakdown that sums back to exactly `context.changeOwed`.
 */
export interface ChangeStrategy {
  id: ChangeStrategyId;
  /** Display name for a future strategy picker, e.g. "All pennies". */
  name: string;
  /** One-line explanation of what the strategy does, for the same picker. */
  description: string;
  /**
   * False when the strategy uses randomness, so the same transaction can
   * produce different (but still correct) breakdowns on repeat runs.
   */
  isDeterministic: boolean;
  buildBreakdown(context: ChangeStrategyContext): ChangeLineItem[];
}

/**
 * A condition that selects a strategy for a transaction, e.g. the README's
 * "if the owed amount is divisible by 3, randomize the change" twist.
 */
export interface ChangeRule {
  id: ChangeRuleId;
  /** Display name, e.g. "Randomize when divisible by 3". */
  name: string;
  description: string;
  /** The strategy to use when `matches` returns true. */
  strategyId: ChangeStrategyId;
  /** Higher priority rules are evaluated first; ties keep declaration order. */
  priority: number;
  matches(context: ChangeStrategyContext): boolean;
}

/**
 * The rules in force plus the strategy to fall back on when none of them
 * match. Swapping rule sets (per client, per store, per experiment) is the
 * intended way to change behaviour without touching the calculation code.
 */
export interface ChangeRuleSet {
  rules: ChangeRule[];
  defaultStrategyId: ChangeStrategyId;
}

/** Optional knobs for a single change calculation. */
export interface CalculateChangeOptions {
  /** Rule set to evaluate; defaults to `DEFAULT_CHANGE_RULE_SET`. */
  ruleSet?: ChangeRuleSet;
  /**
   * Forces a strategy and skips rule evaluation entirely. This is the hook a
   * future "pick your change style" UI control would drive.
   */
  strategyId?: ChangeStrategyId;
}

/** Which strategy was used for a transaction, and why. */
export interface AppliedChangeStrategy {
  strategyId: ChangeStrategyId;
  strategyName: string;
  /**
   * The rule that selected the strategy, or null when it came from the rule
   * set's default or from an explicit `options.strategyId` override.
   */
  ruleId: ChangeRuleId | null;
  /** True when the strategy came from an explicit caller override. */
  wasOverridden: boolean;
}

/** The computed change for a single transaction. */
export interface ChangeResult {
  transaction: Transaction;
  changeOwed: number;
  breakdown: ChangeLineItem[];
  /** Which strategy produced `breakdown`, and which rule (if any) chose it. */
  applied: AppliedChangeStrategy;
  /**
   * Derived from the applied strategy's `isDeterministic` flag: true when the
   * breakdown is one of several valid ones rather than the canonical minimum.
   */
  isRandomized: boolean;
}

/** Request body for POST /api/calculate — one raw "amountOwed,amountPaid" line per transaction. */
export interface CalculateRequestBody {
  lines: string[];
  currency?: Currency["code"];
  /**
   * Optional strategy override applied to every line, bypassing the rules.
   * Reserved for a future strategy picker; omit it for standard behaviour.
   */
  strategyId?: ChangeStrategyId;
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
