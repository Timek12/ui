# LunaGuard LP (Landing page)

> > > > > > > main

A React.js version of the LunaGuard frontend built with Vite, ShadCN UI components, and modern React patterns.

## 🛠️ Technology Stack

| Component            | Technology        | Purpose                      |
| -------------------- | ----------------- | ---------------------------- |
| **Framework**        | React 18          | Core UI framework            |
| **Build Tool**       | Vite 5.x          | Fast development & bundling  |
| **UI Components**    | ShadCN UI + Radix | Accessible component library |
| **Styling**          | Tailwind CSS      | Utility-first CSS            |
| **Routing**          | React Router 6    | Client-side navigation       |
| **State Management** | React Context     | Authentication state         |
| **Type Safety**      | TypeScript        | Static type checking         |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Running backend services (security + storage + postgres)

### Installation

```bash
cd lunaguard-ui
pnpm install
```

### Development Server

```bash
pnpm dev
```

The application will be available at: **http://localhost:3000**

## 🔐 Authentication Flow

The React frontend implements the same HTTP-only cookie authentication as the Next.js version:

### 1. OAuth Login

```typescript
// Redirect to Google OAuth
authApi.oauthLogin("google");
// User is redirected to: localhost:8080/auth/google
```

### 2. OAuth Callback

```typescript
// After successful OAuth, user is redirected to:
// localhost:3001/auth/callback?success=true

// CallbackPage.tsx handles the redirect
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("success");

  if (success === "true") {
    await checkAuthStatus(); // Verify cookies are set
    navigate("/dashboard", { replace: true });
  }
}, []);
```

### 3. Protected Routes

```typescript
// App.tsx implements route protection
function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
```

## 🎨 ShadCN UI Integration

The project uses ShadCN UI for consistent, accessible components:

### Component Examples

```typescript
// Button component
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Sign in with Google
</Button>;

// Card component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Welcome to LunaGuard!</p>
  </CardContent>
</Card>;

// Input component
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div>
  <Label htmlFor="data">Data to encrypt</Label>
  <Input id="data" placeholder="Enter your secret data" />
</div>;
```

## 🌐 API Integration

The React app uses the same API endpoints as the Next.js version:

### Authentication API

```typescript
// lib/api.ts
export const authApi = {
  checkAuth: () => fetch("/user", { credentials: "include" }),
  oauthLogin: (provider) => (window.location.href = `/auth/${provider}`),
  logout: () => fetch("/logout", { method: "POST", credentials: "include" }),
};
```

### Crypto API

```typescript
export const cryptoApi = {
  encrypt: (data, keyPhrase) =>
    fetch("/encrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, keyPhrase }),
      credentials: "include",
    }),

  decrypt: (data, keyPhrase) =>
    fetch("/decrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, keyPhrase }),
      credentials: "include",
    }),
};
```
