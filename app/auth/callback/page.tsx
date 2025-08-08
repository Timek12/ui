"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallback() {
  const { checkAuthStatus, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Wait a moment for the backend to process the OAuth callback
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check auth status to update the context
      await checkAuthStatus();

      setIsProcessing(false);
    };

    handleCallback();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!isProcessing && !isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to home
        router.replace("/");
      } else {
        // Authentication failed, redirect to login
        router.replace("/login");
      }
    }
  }, [isProcessing, isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-transparent">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
        <p className="text-gray-600">
          Please wait while we finish setting up your account.
        </p>
      </div>
    </div>
  );
}
