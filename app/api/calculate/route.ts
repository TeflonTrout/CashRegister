import { NextRequest, NextResponse } from "next/server";
import {
  calculateChangeForTransaction,
  parseTransactionLine,
} from "@/app/lib/calculateChange";
import { DEFAULT_CURRENCY } from "@/app/lib/currencies";
import {
  CalculateErrorResponseBody,
  CalculateRequestBody,
  CalculateResponseBody,
} from "@/app/lib/types";

export async function POST(request: NextRequest) {
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

  try {
    const results = body.lines
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const transaction = parseTransactionLine(line);
        return calculateChangeForTransaction(transaction, DEFAULT_CURRENCY);
      });

    return NextResponse.json<CalculateResponseBody>({
      message: `Calculated change for ${results.length} transaction(s) in ${DEFAULT_CURRENCY.code}.`,
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
