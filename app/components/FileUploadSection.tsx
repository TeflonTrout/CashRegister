"use client";

import { X } from "lucide-react";
import { useState } from "react";
export default function FileUploadSection({
  setIsError,
  setErrorMessage,
}: {
  setIsError: (error: boolean) => void;
  setErrorMessage: (message: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  //   Placeholder for the file upload logic
  const handleFileProcessing = (file: File) => {
    if (file.type !== "text/plain" && file.type !== "text/csv") {
      setIsError(true);
      setErrorMessage("Invalid file type. Please upload a .txt or .csv file.");
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

  const handleCalculateChange = () => {
    console.log("Calculating change from file...");
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
              onClick={() => setFile(null)}
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

      <div className="mt-4">
        {file && (
          <button
            type="button"
            className="btn btn-primary btn-wide"
            onClick={() => handleCalculateChange()}
          >
            Calculate Change
          </button>
        )}
      </div>
    </div>
  );
}
