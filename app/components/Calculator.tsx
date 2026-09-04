import { useState } from "react";
import { formatChangeResult } from "../lib/calculateChange";
import type {
  CalculateErrorResponseBody,
  CalculateRequestBody,
  CalculateResponseBody,
  ChangeResult,
} from "../lib/types";

const TRANSACTION_LINE_PATTERN = /^\d+(\.\d{1,2})?,\d+(\.\d{1,2})?$/;

export default function Calculator({
  setIsError,
  setErrorMessage,
}: {
  setIsError: (error: boolean) => void;
  setErrorMessage: (message: string) => void;
}) {
  const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<ChangeResult[]>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const getTransactionLines = (input: string): string[] =>
    input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

  const validateInput = (input: string): string | null => {
    if (!input.trim()) {
      return "Please enter transaction data or upload a file.";
    }

    if (input.length > 10_000) {
      return "Input data is too long. Please limit to 10,000 characters.";
    }

    if (!/^[\x00-\x7F]*$/.test(input)) {
      return "Input data contains non-ASCII characters. Please use only ASCII characters.";
    }

    for (const line of getTransactionLines(input)) {
      if (!TRANSACTION_LINE_PATTERN.test(line)) {
        return `Each line must be "amount owed,amount paid" with up to two decimal places (e.g. "2.12,3.00"). Problem line: "${line}"`;
      }
    }

    return null;
  };

  const handleCalculateChange = async () => {
    setIsError(false);
    setErrorMessage("");
    setResults([]);

    if (!input.trim()) {
      setErrorMessage("Please enter transaction data or upload a file.");
      setIsError(true);
      return;
    }

    const validationError = validateInput(input);
    if (validationError) {
      setErrorMessage(validationError);
      setIsError(true);
      return;
    }

    const requestBody: CalculateRequestBody = {
      lines: getTransactionLines(input),
    };

    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data: CalculateResponseBody | CalculateErrorResponseBody =
      await res.json();

    console.log(data);

    if (res.ok && "results" in data) {
      // Debugging only — never rendered in the UI.
      console.log("[Calculator] /api/calculate:", data.message);
      setResults(data.results);
    } else {
      setErrorMessage(
        data.message || "An error occurred while calculating change.",
      );
      setIsError(true);
    }
  };
  return (
    <div role="tabpanel" className="tab-content min-h-72 border-base-300 p-6">
      <fieldset className="fieldset w-full">
        <legend className="fieldset-legend">Transactions</legend>
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Enter transaction data..."
          aria-label="Transaction data"
          value={input}
          onChange={handleInputChange}
        />
      </fieldset>

      {results.length > 0 && (
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Output</legend>
          <div className="text-sm flex flex-col items-start gap-1 text-left border border-base-300 rounded-box p-4 w-full">
            {results.map((result, index) => (
              <li key={index} className="ml-4">
                {formatChangeResult(result)} - $
                {(result.changeOwed / 100).toFixed(2)}
              </li>
            ))}
          </div>
        </fieldset>
      )}

      <button
        type="button"
        className="btn btn-primary btn-wide mt-4"
        onClick={() => handleCalculateChange()}
      >
        Calculate Change
      </button>
    </div>
  );
}
