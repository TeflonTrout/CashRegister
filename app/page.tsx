"use client";
import { useState } from "react";
import Calculator from "./components/Calculator";
import FileUploadSection from "./components/FileUploadSection";
import ErrorSection from "./components/ErrorSection";

export default function Home() {
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

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

        <div role="tablist" className="tabs tabs-lift w-full">
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
          />
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
