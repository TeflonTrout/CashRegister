import {
  ChangeLineItem,
  ChangeResult,
  Currency,
  Denomination,
  Transaction,
} from "./types";

/** Owed amounts (in cents) divisible by this get a randomized breakdown. */
const RANDOM_CHANGE_DIVISOR = 3;

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

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Fewest possible pieces of change, largest denomination first. */
function minimumChangeBreakdown(
  amountInCents: number,
  denominations: Denomination[],
): ChangeLineItem[] {
  const sorted = [...denominations].sort(
    (a, b) => b.valueInCents - a.valueInCents,
  );
  let remaining = amountInCents;
  const breakdown: ChangeLineItem[] = [];

  // Iterate through the sorted denominations and calculate the count of 
  // each denomination needed to make the change.
  for (const denomination of sorted) {
    const count = Math.floor(remaining / denomination.valueInCents);
    if (count > 0) {
      breakdown.push({ denomination, count });
      remaining -= count * denomination.valueInCents;
    }
  }

  return breakdown;
}

/**
 * Random pieces of change that still sum to the exact amount owed. The
 * smallest denomination (assumed to have a value of 1, e.g. a penny) is
 * always applied last so it can absorb whatever remainder is left over.
 */
function randomChangeBreakdown(
  amountInCents: number,
  denominations: Denomination[],
): ChangeLineItem[] {
  const [smallest, ...rest] = [...denominations].sort(
    (a, b) => a.valueInCents - b.valueInCents,
  );
  const shuffledRest = shuffle(rest);

  let remaining = amountInCents;
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
  // a random count, so the breakdown always sums back to amountInCents.
  const finalCount = remaining / smallest.valueInCents;
  if (finalCount > 0) {
    breakdown.push({ denomination: smallest, count: finalCount });
  }

  return breakdown;
}

export function calculateChangeForTransaction(
  transaction: Transaction,
  currency: Currency,
): ChangeResult {
  const changeOwed = transaction.amountPaid - transaction.amountOwed;

  if (changeOwed < 0) {
    throw new Error("Amount paid is less than amount owed.");
  }

  const isRandomized = transaction.amountOwed % RANDOM_CHANGE_DIVISOR === 0;
  const breakdown = isRandomized
    ? randomChangeBreakdown(changeOwed, currency.denominations)
    : minimumChangeBreakdown(changeOwed, currency.denominations);

  return { transaction, changeOwed, breakdown, isRandomized };
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
