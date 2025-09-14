import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 text-lg">{user?.name || user?.email}</p>
        </div>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Your Account</CardTitle>
            <CardDescription>Account information and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Login Method:</span>
                <span className="font-medium capitalize">{user?.provider}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold">
                  ✅ Authenticated
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Manage your session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Sign Out
            </Button>
            <Button variant="secondary" className="w-full">
              Refresh Session
            </Button>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            LunaGuard Main UI • Port 3000 • React + Vite
          </p>
        </div>
      </div>
    </div>
  );
}
