/**
 * Parses transaction lines and turns them into change, delegating the actual
 * denomination breakdown to a strategy (`strategies.ts`) chosen by a rule
 * (`changeRules.ts`). Nothing in this file needs to change when a new
 * strategy or rule is added.
 */

import {
  AppliedChangeStrategy,
  CalculateChangeOptions,
  ChangeLineItem,
  ChangeResult,
  ChangeStrategy,
  ChangeStrategyContext,
  Currency,
  Transaction,
} from "./types";
import { getChangeStrategy } from "./strategies";
import { DEFAULT_CHANGE_RULE_SET, findMatchingRule } from "./changeRules";

function centsFromDollars(value: number): number {
  return Math.round(value * 100);
}

/** Parses a single "amountOwed,amountPaid" line, e.g. "2.12,3.00". */
export function parseTransactionLine(line: string): Transaction {
  const parts = line.split(",").map((part) => part.trim());

  if (parts.length !== 2) {
    throw new Error(`Expected "amountOwed,amountPaid" but got "${line}".`);
  }

  const [owedRaw, paidRaw] = parts;
  const amountOwed = Number(owedRaw);
  const amountPaid = Number(paidRaw);

  if (!Number.isFinite(amountOwed) || !Number.isFinite(amountPaid)) {
    throw new Error(`Could not parse numbers from "${line}".`);
  }

  return {
    amountOwed: centsFromDollars(amountOwed),
    amountPaid: centsFromDollars(amountPaid),
  };
}

/** Total value of a breakdown, in minor units. */
export function totalBreakdownValue(breakdown: ChangeLineItem[]): number {
  return breakdown.reduce(
    (sum, { denomination, count }) => sum + denomination.valueInCents * count,
    0,
  );
}

/**
 * Guards the one invariant every strategy shares: the breakdown must sum back
 * to the change owed. Checked centrally so a buggy new strategy surfaces as a
 * clear error instead of silently short-changing a customer.
 */
function assertBreakdownSums(
  breakdown: ChangeLineItem[],
  context: ChangeStrategyContext,
  strategy: ChangeStrategy,
): void {
  const total = totalBreakdownValue(breakdown);

  if (total !== context.changeOwed) {
    throw new Error(
      `Strategy "${strategy.id}" produced ${total} but ${context.changeOwed} was owed.`,
    );
  }
}

/**
 * Picks the strategy for a transaction: an explicit override wins, otherwise
 * the first matching rule, otherwise the rule set's default.
 */
export function resolveChangeStrategy(
  context: ChangeStrategyContext,
  options: CalculateChangeOptions = {},
): { strategy: ChangeStrategy; applied: AppliedChangeStrategy } {
  if (options.strategyId) {
    const strategy = getChangeStrategy(options.strategyId);
    return {
      strategy,
      applied: {
        strategyId: strategy.id,
        strategyName: strategy.name,
        ruleId: null,
        wasOverridden: true,
      },
    };
  }

  const ruleSet = options.ruleSet ?? DEFAULT_CHANGE_RULE_SET;
  const matchedRule = findMatchingRule(ruleSet, context);
  const strategy = getChangeStrategy(
    matchedRule?.strategyId ?? ruleSet.defaultStrategyId,
  );

  return {
    strategy,
    applied: {
      strategyId: strategy.id,
      strategyName: strategy.name,
      ruleId: matchedRule?.id ?? null,
      wasOverridden: false,
    },
  };
}

export function calculateChangeForTransaction(
  transaction: Transaction,
  currency: Currency,
  options: CalculateChangeOptions = {},
): ChangeResult {
  const changeOwed = transaction.amountPaid - transaction.amountOwed;

  if (changeOwed < 0) {
    throw new Error("Amount paid is less than amount owed.");
  }

  const context: ChangeStrategyContext = {
    transaction,
    changeOwed,
    currency,
    denominations: currency.denominations,
  };

  const { strategy, applied } = resolveChangeStrategy(context, options);
  const breakdown = strategy.buildBreakdown(context);
  assertBreakdownSums(breakdown, context, strategy);

  return {
    transaction,
    changeOwed,
    breakdown,
    applied,
    isRandomized: !strategy.isDeterministic,
  };
}

/** Formats a result as "1 dollar, 2 quarters, 1 nickel", per README. */
export function formatChangeResult(result: ChangeResult): string {
  if (result.breakdown.length === 0) {
    return "No change due";
  }

  return result.breakdown
    .map(
      ({ denomination, count }) =>
        `${count} ${count === 1 ? denomination.name : denomination.pluralName}`,
    )
    .join(", ");
}
