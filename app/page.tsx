import Link from "next/link";
import { LogoIcon } from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-transparent px-4">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <LogoIcon className="mx-auto" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Welcome to LunaGuard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
            Secure authentication system for your applications
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
