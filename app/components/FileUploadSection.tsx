"use client";

import { X } from "lucide-react";
import { useState } from "react";
import {
  CalculateErrorResponseBody,
  CalculateResponseBody,
} from "../lib/types";
import { formatChangeResult } from "../lib/calculateChange";
export default function FileUploadSection({
  setIsError,
  setErrorMessage,
  currency,
  isAdvancedPath,
}: {
  setIsError: (error: boolean) => void;
  setErrorMessage: (message: string) => void;
  currency?: string;
  isAdvancedPath: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileParseError, setFileParseError] = useState<boolean>(false);
  const [calculationResults, setCalculationResults] =
    useState<CalculateResponseBody | null>(null);
  const [isAllSmallestChecked, setIsAllSmallestChecked] =
    useState<boolean>(false);

  // Handle file processing and validation
  const handleFileProcessing = async (file: File) => {
    setFileParseError(false);
    if (file.type !== "text/plain" && file.type !== "text/csv") {
      setFileParseError(true);
      setIsError(true);
      setErrorMessage("Invalid file type. Please upload a .txt or .csv file.");
      return;
    }

    const text = await file.text();

    // Parse the file content into transaction lines
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    // Cheeck if the lines are valid transaction lines
    const invalidLines = lines.filter(
      (line) => !/^\d+(\.\d{1,2})?,\d+(\.\d{1,2})?$/.test(line),
    );
    if (invalidLines.length > 0) {
      setFileParseError(true);
      setIsError(true);
      setErrorMessage(
        `Invalid transaction lines: ${invalidLines.join(", ")}. Please use "amount owed,amount paid" with up to two decimal places (e.g. "2.12,3.00").`,
      );
      return;
    }
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileProcessing(file);
      setFile(file);
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileProcessing(file);
      setFile(file);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setCalculationResults(null);
  };

  const handleCalculateChange = async () => {
    if (!file) {
      setIsError(true);
      setErrorMessage("No file selected. Please upload a .txt or .csv file.");
      return;
    }
    const text = await file.text();

    // Parse the file content into transaction lines
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const body = {
      lines,
      currency,
      strategyId: isAllSmallestChecked ? "allSmallest" : undefined,
    };

    if (lines.length !== 0) {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data: CalculateResponseBody | CalculateErrorResponseBody =
        await res.json();

      if (res.ok) {
        setCalculationResults(data as CalculateResponseBody);
        setIsError(false);
        setErrorMessage("");
      } else {
        setIsError(true);
        setErrorMessage(
          (data as CalculateErrorResponseBody).message ||
            "An error occurred while calculating change.",
        );
      }
    }
  };

  return (
    <div role="tabpanel" className="tab-content min-h-72 border-base-300 p-6">
      <div className="relative w-full min-h-56 border-2 border-dashed border-base-300 rounded-box p-8 flex flex-col items-center justify-center gap-2 text-base-content/60">
        <input
          id="file-upload"
          type="file"
          aria-label="File upload"
          accept=".txt,.csv"
          className="w-full h-full opacity-0 absolute inset-0"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onChange={handleFileChange}
          disabled={file !== null} // Disable input if a file is already selected
        />
        {file ? (
          <div>
            <X
              className="absolute top-2 right-2"
              onClick={() => handleClearFile()}
            />
            <p className="text-lg font-semibold">File selected: {file.name}</p>
          </div>
        ) : (
          <>
            <p>Drag and drop a .txt file here</p>
            <p className="text-sm">or</p>
            <button type="button" className="btn btn-outline btn-sm">
              Browse Files
            </button>
          </>
        )}
      </div>

      {calculationResults === null ? (
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Output</legend>
          <div className="text-sm flex flex-col items-start gap-1 text-left border border-base-300 rounded-box p-4 w-full">
            <span className="ml-4 py-2"></span>
          </div>
        </fieldset>
      ) : (
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Output</legend>
          <div className="text-sm flex flex-col items-start gap-1 text-left border border-base-300 rounded-box p-4 w-full">
            {calculationResults.results.map((result, index) => (
              <li key={index} className="ml-4">
                {formatChangeResult(result)} - $
                {(result.changeOwed / 100).toFixed(2)}
              </li>
            ))}
          </div>
        </fieldset>
      )}

      {isAdvancedPath && (
        <div className="flex items-center gap-2 mt-2">
          <label htmlFor="allSmallest" className="label label-text">
            All Smallest Change
          </label>
          <input
            type="checkbox"
            name="strategy"
            value="allSmallest"
            checked={isAllSmallestChecked}
            onChange={(e) => setIsAllSmallestChecked(e.target.checked)}
            className="checkbox checkbox-sm ml-4"
          />
        </div>
      )}

      <div className="mt-4">
        {file && (
          <button
            type="button"
            className="btn btn-primary btn-wide"
            onClick={() => handleCalculateChange()}
            disabled={fileParseError} // Disable button if no file is selected or if there are parse errors
          >
            Calculate Change
          </button>
        )}
      </div>
    </div>
  );
}
