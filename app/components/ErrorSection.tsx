import { X } from "lucide-react";
export default function ErrorSection({
  isError,
  errorMessage,
  setIsError,
}: {
  isError: boolean;
  errorMessage: string;
  setIsError: (error: boolean) => void;
}) {
  return (
    <div
      className={
        isError
          ? "relative alert alert-error flex-col flex justify-start gap-0 items-start mt-2 transition-all"
          : "opacity-0 pointer-events-none transition-all relative alert alert-error flex-col flex justify-start gap-0 items-start mt-2"
      }
    >
      <X className="absolute top-2 right-2" onClick={() => setIsError(false)} />
      <h1 className="text-lg font-bold">Error:</h1>
      <span>{errorMessage}</span>
    </div>
  );
}
