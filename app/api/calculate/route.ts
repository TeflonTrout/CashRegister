import { NextResponse } from "next/server";
import {
  calculateChangeForTransaction,
  parseTransactionLine,
} from "@/app/lib/calculateChange";
import { DEFAULT_CURRENCY, CURRENCIES } from "@/app/lib/currencies";
import { isChangeStrategyId } from "@/app/lib/strategies";
import {
  CalculateChangeOptions,
  CalculateErrorResponseBody,
  CalculateRequestBody,
  CalculateResponseBody,
  Currency,
} from "@/app/lib/types";

export async function POST(request: Request) {
  let body: CalculateRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<CalculateErrorResponseBody>(
      { message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json<CalculateErrorResponseBody>(
      { message: "Expected a non-empty array of transaction lines." },
      { status: 400 },
    );
  }

  const currency: Currency | undefined = body.currency
    ? CURRENCIES[body.currency]
    : DEFAULT_CURRENCY;

  if (!currency) {
    return NextResponse.json<CalculateErrorResponseBody>(
      { message: `Unsupported currency "${body.currency}".` },
      { status: 400 },
    );
  }

  // An explicit strategy bypasses the rules for every line — the hook a future
  // strategy picker in the UI would use.
  if (body.strategyId && !isChangeStrategyId(body.strategyId)) {
    return NextResponse.json<CalculateErrorResponseBody>(
      { message: `Unknown change strategy "${body.strategyId}".` },
      { status: 400 },
    );
  }

  const options: CalculateChangeOptions = body.strategyId
    ? { strategyId: body.strategyId }
    : {};

  try {
    const results = body.lines
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) =>
        calculateChangeForTransaction(
          parseTransactionLine(line),
          currency,
          options,
        ),
      );

    return NextResponse.json<CalculateResponseBody>({
      message: `Calculated change for ${results.length} transaction(s) in ${currency.code}.`,
      results,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to calculate change.";
    return NextResponse.json<CalculateErrorResponseBody>(
      { message },
      { status: 400 },
    );
  }
}
