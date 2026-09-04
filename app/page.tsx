export default function Home() {
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
          <div
            role="tabpanel"
            className="tab-content min-h-72 border-base-300 p-6"
          >
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">Transactions</legend>
              <textarea
                className="textarea textarea-bordered w-full h-48"
                placeholder="Enter transaction data..."
                aria-label="Transaction data"
              />
            </fieldset>
          </div>

          <input
            type="radio"
            name="input_method"
            role="tab"
            className="tab"
            aria-label="File Upload"
          />
          <div
            role="tabpanel"
            className="tab-content min-h-72 border-base-300 p-6"
          >
            <div className="w-full min-h-56 border-2 border-dashed border-base-300 rounded-box p-8 flex flex-col items-center justify-center gap-2 text-base-content/60">
              <p>Drag and drop a .txt file here</p>
              <p className="text-sm">or</p>
              <button type="button" className="btn btn-outline btn-sm">
                Browse Files
              </button>
            </div>
          </div>
        </div>

        <button type="button" className="btn btn-primary btn-wide">
          Calculate Change
        </button>
      </div>
    </main>
  );
}
