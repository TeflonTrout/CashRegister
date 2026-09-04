import { useState } from "react";

export default function Calculator({
  setIsError,
  setErrorMessage,
}: {
  setIsError: (error: boolean) => void;
  setErrorMessage: (message: string) => void;
}) {
  const [inputData, setInputData] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputData(event.target.value);
  };

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

    if (!/^[0-9.,\s]*$/.test(input)) {
      return "Input data contains invalid characters. Please use only numbers, commas, periods, and whitespace.";
    }

    if (input.split(".").length > 2) {
      return "Input data contains multiple decimal points. Please ensure each number has at most one decimal point.";
    }

    if (input.split(".").length === 2 && input.split(".")[1].length > 2) {
      return "Input data contains numbers with more than two decimal places. Please ensure each number has at most two decimal places.";
    }

    return null;
  };

  const handleCalculateChange = () => {
    setIsError(false);
    setErrorMessage("");
    if (!inputData.trim()) {
      setErrorMessage("Please enter transaction data or upload a file.");
      setIsError(true);
      return;
    }

    const validationError = validateInput(inputData);
    if (validationError) {
      setErrorMessage(validationError);
      setIsError(true);
      return;
    }
    // Placeholder for the change calculation logic
    console.log("Calculating change...");
  };
  return (
    <div role="tabpanel" className="tab-content min-h-72 border-base-300 p-6">
      <fieldset className="fieldset w-full">
        <legend className="fieldset-legend">Transactions</legend>
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Enter transaction data..."
          aria-label="Transaction data"
          value={inputData}
          onChange={handleInputChange}
        />
      </fieldset>

      {/* Output section */}
      <fieldset className="fieldset w-full">
        <legend className="fieldset-legend">Output</legend>
        <span className="text-sm flex">{parseFloat(inputData).toFixed(2)}</span>
      </fieldset>

      <button
        type="button"
        className="btn btn-primary btn-wide"
        onClick={() => handleCalculateChange()}
      >
        Calculate Change
      </button>
    </div>
  );
}
