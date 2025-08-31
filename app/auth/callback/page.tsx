"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authApi } from "@/lib/api/auth";

export default function AuthCallback() {
  const { checkAuthStatus, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for success parameter
      const success = searchParams.get("success");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setError(errorDescription || "OAuth authentication failed");
        setIsProcessing(false);
        return;
      }

      if (success === "true") {
        // OAuth was successful, wait a moment for cookies to be set
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check auth status to update the context
        const authResult = await checkAuthStatus();

        // If auth check returns an error, check for specific OAuth errors
        if (
          !isAuthenticated &&
          authResult &&
          typeof authResult === "object" &&
          "error" in authResult
        ) {
          const authError = authResult as any;
          if (authError.error === "email_exists") {
            setError(
              "This email is already registered with a local account. Please sign in with your email and password instead, or use a different Google account."
            );
          } else {
            setError(
              authError.message || "Authentication failed. Please try again."
            );
          }
        }
      } else {
        // No success parameter or OAuth failed
        // Check if there's additional error info from the backend
        try {
          const oauthResult = await authApi.checkOAuthStatus();
          if (oauthResult.error) {
            setError(oauthResult.message || "OAuth authentication failed");
          } else if (!oauthResult.success) {
            setError("OAuth authentication failed. Please try again.");
          }
        } catch (err) {
          setError("OAuth authentication failed. Please try again.");
        }
      }

      setIsProcessing(false);
    };

    handleCallback();
  }, [checkAuthStatus, searchParams, isAuthenticated]);

  useEffect(() => {
    if (!isProcessing && !isLoading && !error) {
      if (isAuthenticated) {
        // User is authenticated, redirect to home
        router.replace("/");
      } else {
        // Authentication failed, redirect to login after showing error
        setTimeout(() => {
          router.replace("/login");
        }, 3000);
      }
    }
  }, [isProcessing, isLoading, isAuthenticated, error, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-transparent">
        <div className="max-w-md mx-auto p-6">
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Redirecting to login page in a few seconds...
            </p>
            <button
              onClick={() => router.replace("/login")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
