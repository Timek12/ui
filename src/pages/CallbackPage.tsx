import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function CallbackPage() {
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if OAuth was successful and update auth state
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get("success");

        if (success === "true") {
          // OAuth was successful, refresh auth state and redirect to dashboard
          await checkAuthStatus();
          navigate("/dashboard", { replace: true });
        } else {
          // OAuth failed, redirect to login
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [checkAuthStatus, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}
