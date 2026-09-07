/**
 * Change rules: the conditions that decide *which* strategy a transaction
 * gets. Strategies live in `strategies.ts`; this module only maps a
 * transaction to a strategy id.
 *
 * The README asks what happens when the client changes the random divisor or
 * adds another special case. Both are handled here: change the divisor by
 * passing a different one to `createDivisibleByRule`, and add a special case
 * by appending another rule to a rule set.
 */

import {
  ChangeRule,
  ChangeRuleSet,
  ChangeStrategyContext,
  ChangeStrategyId,
} from "./types";
import { MINIMUM_STRATEGY_ID, RANDOM_STRATEGY_ID } from "./strategies";

/** Owed amounts (in cents) divisible by this get a randomized breakdown. */
export const RANDOM_CHANGE_DIVISOR = 3;

/** Default priority for rules that do not care about ordering. */
export const DEFAULT_RULE_PRIORITY = 0;

/** Small helper so a new rule is a single object literal. */
export function defineChangeRule(rule: ChangeRule): ChangeRule {
  return rule;
}

/**
 * "If the owed amount is divisible by N, use `strategyId`" — the README's
 * twist, with the divisor and target strategy both configurable.
 */
export function createDivisibleByRule(
  divisor: number = RANDOM_CHANGE_DIVISOR,
  strategyId: ChangeStrategyId = RANDOM_STRATEGY_ID,
  priority: number = DEFAULT_RULE_PRIORITY,
): ChangeRule {
  return defineChangeRule({
    id: `divisible-by-${divisor}`,
    name: `Divisible by ${divisor}`,
    description: `Uses the "${strategyId}" strategy when the amount owed is divisible by ${divisor}.`,
    strategyId,
    priority,
    matches: ({ transaction }: ChangeStrategyContext) =>
      transaction.amountOwed % divisor === 0,
  });
}

/**
 * The rules in force today: the README's divisible-by-3 twist over a minimum
 * change default. Pass a different rule set through
 * `CalculateChangeOptions.ruleSet` to change behaviour per client or store.
 */
export const DEFAULT_CHANGE_RULE_SET: ChangeRuleSet = {
  rules: [createDivisibleByRule()],
  defaultStrategyId: MINIMUM_STRATEGY_ID,
};

/**
 * Returns the first matching rule, highest priority first. Ties keep the
 * order the rules were declared in, so a rule set reads top to bottom.
 */
export function findMatchingRule(
  ruleSet: ChangeRuleSet,
  context: ChangeStrategyContext,
): ChangeRule | null {
  const byPriority = [...ruleSet.rules].sort(
    (a, b) => b.priority - a.priority,
  );

  return byPriority.find((rule) => rule.matches(context)) ?? null;
}
