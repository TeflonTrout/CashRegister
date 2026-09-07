import { GitPullRequest } from "lucide-react";
import Link from "next/link";
export default function Navbar() {
  return (
    <div className="navbar max-w-4xl justify-between mx-auto bg-base-100 border-b border-base-200 px-4 sm:px-8">
      <div className="flex-1 gap-4 flex items-center">
        <Link href="/" className="text-xl font-semibold">
          Cash<span className="text-neutral">Register</span>
        </Link>
        <Link href="/advanced" className="btn btn-ghost-outline btn-sm">
          Advanced
        </Link>
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
