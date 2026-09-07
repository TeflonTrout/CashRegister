"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Calculator from "../components/Calculator";
import FileUploadSection from "../components/FileUploadSection";
import ErrorSection from "../components/ErrorSection";

export default function Home() {
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const pathname = usePathname();
  const isAdvancedPath = pathname === "/advanced";

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Calculate Change</h1>
          <p className="text-base-content/70">
            Paste your transactions below, or upload a .txt file, then calculate
            the change owed.
          </p>
        </div>

        <div role="tablist" className="tabs tabs-lift w-full relative">
          <input
            type="radio"
            name="input_method"
            role="tab"
            className="tab"
            aria-label="Calculator"
            defaultChecked
          />
          <Calculator
            setIsError={setIsError}
            setErrorMessage={setErrorMessage}
            currency={currency}
            isAdvancedPath={isAdvancedPath}
          />

          <input
            type="radio"
            name="input_method"
            role="tab"
            className="tab"
            aria-label="File Upload"
          />
          <FileUploadSection
            setIsError={setIsError}
            setErrorMessage={setErrorMessage}
            currency={currency}
            isAdvancedPath={isAdvancedPath}
          />

          {/* Create a currency selector */}
          <div className="w-1/4 absolute top-2 right-0 flex items-center gap-2">
            <label htmlFor="currency" className="w-full text-sm font-medium">
              Currency:
            </label>
            <select
              id="currency"
              name="currency"
              onChange={(e) => setCurrency(e.target.value)}
              className="select select-bordered w-full max-w-xs h-2"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        <ErrorSection
          isError={isError}
          errorMessage={errorMessage}
          setIsError={setIsError}
        />
      </div>
    </main>
  );
}
