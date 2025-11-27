import {
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Shield,
  Sun,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useLogoutMutation } from "../../services/authApi";
import { RootState } from "../../store";
import { logout } from "../../store/authSlice";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/data", label: "Data", icon: Database },
  { to: "/dashboard/audit", label: "Audit", icon: FileText },
  { to: "/dashboard/users", label: "Users", icon: Users, adminOnly: true },
  { to: "/dashboard/vault", label: "Vault", icon: Shield, adminOnly: true },
];

const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken
  );
  const [logoutApi] = useLogoutMutation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

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

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  // Only show admin features
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Luna
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.name || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <nav className="space-y-1">
                {filteredNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
