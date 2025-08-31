"use client";

import { LogoIcon } from "@/components/logo";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  cryptoApi,
  type EncryptRequest,
  type DecryptRequest,
} from "@/lib/api/auth";
import {
  Lock,
  Unlock,
  Key,
  Shield,
  User,
  LogOut,
  Copy,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // State for encryption/decryption
  const [encryptData, setEncryptData] = useState("");
  const [encryptKey, setEncryptKey] = useState("");
  const [encryptResult, setEncryptResult] = useState("");
  const [decryptData, setDecryptData] = useState("");
  const [decryptKey, setDecryptKey] = useState("");
  const [decryptResult, setDecryptResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [copied, setCopied] = useState("");

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleEncrypt = async () => {
    if (!encryptData || !encryptKey) {
      setError("Please provide both data and key");
      return;
    }

    setError("");
    setIsLoading1(true);
    const request: EncryptRequest = {
      data: encryptData,
      keyPhrase: encryptKey,
    };

    const result = await cryptoApi.encrypt(request);
    if (result.error) {
      setError(result.error);
    } else {
      setEncryptResult(result.data);
    }
    setIsLoading1(false);
  };

  const handleDecrypt = async () => {
    if (!decryptData || !decryptKey) {
      setError("Please provide both encrypted data and key");
      return;
    }

    setError("");
    setIsLoading2(true);
    const request: DecryptRequest = {
      data: decryptData,
      keyPhrase: decryptKey,
    };

    const result = await cryptoApi.decrypt(request);
    if (result.error) {
      setError(result.error);
    } else {
      setDecryptResult(result.data);
    }
    setIsLoading2(false);
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-transparent">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show login/signup page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-transparent px-4">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <LogoIcon className="mx-auto" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome to LunaGuard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
              Secure key management system for your organization
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

  // Authenticated home page with Vault-like interface
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <LogoIcon />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  LunaGuard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Key Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Secure Cryptographic Operations
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Encrypt and decrypt sensitive data using industry-standard AES-GCM
            encryption. Your keys never leave your control.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Operations Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Encrypt Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex items-center text-white">
                <Lock className="h-6 w-6 mr-3" />
                <h3 className="text-xl font-semibold">Encrypt Data</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <Label
                  htmlFor="encrypt-data"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Data to Encrypt
                </Label>
                <Textarea
                  id="encrypt-data"
                  value={encryptData}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEncryptData(e.target.value)
                  }
                  placeholder="Enter sensitive data to encrypt..."
                  className="mt-2 min-h-[120px]"
                />
              </div>
              <div>
                <Label
                  htmlFor="encrypt-key"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Encryption Key
                </Label>
                <div className="mt-2 relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="encrypt-key"
                    type="password"
                    value={encryptKey}
                    onChange={(e) => setEncryptKey(e.target.value)}
                    placeholder="Enter 16, 24, or 32 character key"
                    className="pl-10"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Key must be 16, 24, or 32 characters long
                </p>
              </div>
              <Button
                onClick={handleEncrypt}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading1}
              >
                {isLoading1 ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                Encrypt Data
              </Button>
              {encryptResult && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Encrypted Result
                  </Label>
                  <div className="relative">
                    <Textarea
                      value={encryptResult}
                      readOnly
                      className="font-mono text-sm bg-gray-50 dark:bg-gray-700 min-h-[80px]"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(encryptResult, "encrypt")}
                    >
                      {copied === "encrypt" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Decrypt Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center text-white">
                <Unlock className="h-6 w-6 mr-3" />
                <h3 className="text-xl font-semibold">Decrypt Data</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <Label
                  htmlFor="decrypt-data"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Encrypted Data
                </Label>
                <Textarea
                  id="decrypt-data"
                  value={decryptData}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDecryptData(e.target.value)
                  }
                  placeholder="Paste encrypted data here..."
                  className="mt-2 font-mono text-sm min-h-[120px]"
                />
              </div>
              <div>
                <Label
                  htmlFor="decrypt-key"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Decryption Key
                </Label>
                <div className="mt-2 relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="decrypt-key"
                    type="password"
                    value={decryptKey}
                    onChange={(e) => setDecryptKey(e.target.value)}
                    placeholder="Enter the same key used for encryption"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={handleDecrypt}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading2}
              >
                {isLoading2 ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Unlock className="h-4 w-4 mr-2" />
                )}
                Decrypt Data
              </Button>
              {decryptResult && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Decrypted Result
                  </Label>
                  <div className="relative">
                    <Textarea
                      value={decryptResult}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700 min-h-[80px]"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(decryptResult, "decrypt")}
                    >
                      {copied === "decrypt" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Security Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Encryption Standard
              </h4>
              <p>
                AES-GCM (Galois/Counter Mode) provides both confidentiality and
                authenticity.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Key Security
              </h4>
              <p>
                Your encryption keys are never transmitted or stored on our
                servers.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Data Privacy
              </h4>
              <p>
                All encryption/decryption operations are performed securely with
                no data retention.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
