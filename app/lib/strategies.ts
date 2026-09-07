/**
 * Change strategies: the interchangeable ways of turning an amount of change
 * into physical denominations.
 *
 * Adding a strategy is a three-step job with no edits to the calculation code:
 *   1. Build it with `defineChangeStrategy` below (or implement `ChangeStrategy`).
 *   2. Register it in `CHANGE_STRATEGIES`.
 *   3. Optionally point a rule at its id in `changeRules.ts`, or let a caller
 *      select it directly via `CalculateChangeOptions.strategyId`.
 *
 * Every strategy must return a breakdown that sums back to exactly
 * `context.changeOwed` — see `assertBreakdownSums` in `calculateChange.ts`.
 */

import {
  ChangeLineItem,
  ChangeStrategy,
  ChangeStrategyContext,
  ChangeStrategyId,
  Denomination,
} from "./types";

/** Fewest possible pieces of change, largest denomination first. */
export const MINIMUM_STRATEGY_ID: ChangeStrategyId = "minimum";
/** Random-but-correct breakdown — the README's "divisible by 3" twist. */
export const RANDOM_STRATEGY_ID: ChangeStrategyId = "random";
/** Everything in the smallest denomination, e.g. all pennies for USD. */
export const ALL_SMALLEST_STRATEGY_ID: ChangeStrategyId = "allSmallest";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Denominations sorted largest value first. */
function byValueDescending(denominations: Denomination[]): Denomination[] {
  return [...denominations].sort((a, b) => b.valueInCents - a.valueInCents);
}

/** Denominations sorted smallest value first. */
function byValueAscending(denominations: Denomination[]): Denomination[] {
  return [...denominations].sort((a, b) => a.valueInCents - b.valueInCents);
}

/**
 * Small helper so a new strategy is a single object literal rather than a
 * class or a hand-rolled implementation of the interface.
 */
export function defineChangeStrategy(strategy: ChangeStrategy): ChangeStrategy {
  return strategy;
}

export const minimumChangeStrategy = defineChangeStrategy({
  id: MINIMUM_STRATEGY_ID,
  name: "Minimum change",
  description: "The fewest physical pieces of change possible.",
  isDeterministic: true,
  buildBreakdown({ changeOwed, denominations }: ChangeStrategyContext) {
    let remaining = changeOwed;
    const breakdown: ChangeLineItem[] = [];

    // Iterate through the sorted denominations and calculate the count of
    // each denomination needed to make the change.
    for (const denomination of byValueDescending(denominations)) {
      const count = Math.floor(remaining / denomination.valueInCents);
      if (count > 0) {
        breakdown.push({ denomination, count });
        remaining -= count * denomination.valueInCents;
      }
    }

    return breakdown;
  },
});

export const randomChangeStrategy = defineChangeStrategy({
  id: RANDOM_STRATEGY_ID,
  name: "Random change",
  description:
    "Random pieces of change that still sum to the exact amount owed.",
  isDeterministic: false,
  buildBreakdown({ changeOwed, denominations }: ChangeStrategyContext) {
    const [smallest, ...rest] = byValueAscending(denominations);
    const shuffledRest = shuffle(rest);

    let remaining = changeOwed;
    const breakdown: ChangeLineItem[] = [];

    for (const denomination of shuffledRest) {
      const maxCount = Math.floor(remaining / denomination.valueInCents);
      const count = Math.floor(Math.random() * (maxCount + 1));
      if (count > 0) {
        breakdown.push({ denomination, count });
        remaining -= count * denomination.valueInCents;
      }
    }

    // The smallest denomination absorbs whatever remains exactly, rather than
    // a random count, so the breakdown always sums back to changeOwed.
    const finalCount = remaining / smallest.valueInCents;
    if (finalCount > 0) {
      breakdown.push({ denomination: smallest, count: finalCount });
    }

    return breakdown;
  },
});

/**
 * Pays the whole amount in the currency's smallest denomination — "all
 * pennies" for USD, "one cents" for EUR. Only exact when that denomination
 * divides the change owed, which holds for every currency we ship (their
 * smallest unit is 1).
 */
export const allSmallestChangeStrategy = defineChangeStrategy({
  id: ALL_SMALLEST_STRATEGY_ID,
  name: "All smallest denomination",
  description:
    "Pays the entire amount in the smallest denomination, e.g. all pennies.",
  isDeterministic: true,
  buildBreakdown({ changeOwed, denominations }: ChangeStrategyContext) {
    const [smallest] = byValueAscending(denominations);
    const count = changeOwed / smallest.valueInCents;

    if (count <= 0) {
      return [];
    }

    if (!Number.isInteger(count)) {
      throw new Error(
        `Cannot pay ${changeOwed} in ${smallest.pluralName} (worth ${smallest.valueInCents} each).`,
      );
    }

    return [{ denomination: smallest, count }];
  },
});

/**
 * Every strategy the app knows about, keyed by id. A future strategy picker
 * can render this registry directly — each entry carries its own name and
 * description for display.
 */
export const CHANGE_STRATEGIES: Record<ChangeStrategyId, ChangeStrategy> = {
  [minimumChangeStrategy.id]: minimumChangeStrategy,
  [randomChangeStrategy.id]: randomChangeStrategy,
  [allSmallestChangeStrategy.id]: allSmallestChangeStrategy,
};

/** True when `id` names a registered strategy — for validating user input. */
export function isChangeStrategyId(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(CHANGE_STRATEGIES, id);
}

/** Looks up a registered strategy, throwing on an unknown id. */
export function getChangeStrategy(id: ChangeStrategyId): ChangeStrategy {
  const strategy = CHANGE_STRATEGIES[id];

  if (!strategy) {
    throw new Error(
      `Unknown change strategy "${id}". Known strategies: ${Object.keys(
        CHANGE_STRATEGIES,
      ).join(", ")}.`,
    );
  }

  return strategy;
}

/** The registry as a list, for menus and docs. */
export function listChangeStrategies(): ChangeStrategy[] {
  return Object.values(CHANGE_STRATEGIES);
}

/**
 * Adds a strategy to the registry at runtime, so a strategy can live outside
 * this module (a client-specific package, a test, a plugin) and still be
 * selectable by id from rules and `CalculateChangeOptions`.
 */
export function registerChangeStrategy(strategy: ChangeStrategy): void {
  CHANGE_STRATEGIES[strategy.id] = strategy;
}
