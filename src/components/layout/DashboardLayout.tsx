import { Key, Lock, LogOut, Shield, User, Users } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useLogoutMutation } from "../../services/authApi";
import { RootState } from "../../store";
import { logout } from "../../store/authSlice";

const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken
  );
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logoutApi({ token: refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear RTK Query cache to prevent showing stale data after logout
      dispatch(api.util.resetApiState());
      dispatch(logout());
      navigate("/login");
    }
  };

  // Only show admin features
  const isAdmin = user?.role === "admin";

  const navItems = [
    { to: "/dashboard", icon: Shield, label: "Dashboard" },
    { to: "/dashboard/secrets", icon: Key, label: "Secrets" },
    ...(isAdmin
      ? [
          { to: "/dashboard/all-secrets", icon: Key, label: "All Secrets" },
          { to: "/dashboard/vault", icon: Lock, label: "Vault Management" },
          { to: "/dashboard/users", icon: Users, label: "User Management" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                LunaGuard
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="card">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-100 text-primary-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
