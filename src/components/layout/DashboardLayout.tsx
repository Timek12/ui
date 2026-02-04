import {
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Folder,
  LayoutDashboard,
  LogOut,
  Moon,
  Shield,
  Sun,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useLogoutMutation } from "../../services/authApi";
import { RootState } from "../../store";
import { logout } from "../../store/authSlice";
import LanguageSwitcher from "../common/LanguageSwitcher";

const DashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken,
  );
  const [logoutApi] = useLogoutMutation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const navItems = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/dashboard/data", label: t("nav.secrets"), icon: Database },
    { to: "/dashboard/projects", label: t("nav.projects"), icon: Folder },
    { to: "/dashboard/audit", label: t("nav.audit"), icon: FileText },
    {
      to: "/dashboard/users",
      label: t("nav.users"),
      icon: Users,
      adminOnly: true,
    },
    {
      to: "/dashboard/vault",
      label: t("nav.vault"),
      icon: Shield,
      adminOnly: true,
    },
  ];

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

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === "admin",
  );

  // Only show admin features
  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl shadow-sm border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-tr from-primary-600 to-primary-400 p-2 rounded-lg shadow-lg shadow-primary-500/20 mr-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                Luna
              </span>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors"
                aria-label={t("common.toggleDarkMode")}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.name || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t("auth.logout")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}
          >
            <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 relative min-h-[calc(100vh-8rem)]">
              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10 text-primary-600 dark:text-primary-400"
                aria-label={
                  sidebarCollapsed
                    ? t("common.expandSidebar")
                    : t("common.collapseSidebar")
                }
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronLeft className="w-3 h-3" />
                )}
              </button>

              <nav className="p-3 space-y-1">
                {filteredNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25"
                          : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-primary-400"
                      } ${sidebarCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"}`
                    }
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? "" : ""}`}
                    />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
