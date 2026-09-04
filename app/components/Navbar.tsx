import { GitPullRequest } from "lucide-react";

export default function Navbar() {
  return (
    <div className="navbar max-w-4xl justify-between mx-auto bg-base-100 border-b border-base-200 px-4 sm:px-8">
      <div className="flex-1">
        <span className="text-xl font-semibold">
          Cash<span className="text-neutral">Register</span>
        </span>
      </div>
      <div className="flex items-center">
        <a
          href="https://github.com/TeflonTrout/CashRegister"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          <GitPullRequest className="size-5" />
          GitHub
        </a>
      </div>
    </div>
  );
}
