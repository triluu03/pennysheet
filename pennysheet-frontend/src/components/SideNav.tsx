import {
  ArchiveBoxArrowDownIcon,
  ChartBarSquareIcon,
  HomeIcon,
  UserCircleIcon,
  WalletIcon
} from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";

/** Delay in milliseconds before the sidebar collapses after the mouse leaves. */
const COLLAPSE_DELAY_MS = 300;

const navItems = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/details", label: "Details", icon: ChartBarSquareIcon },
  { to: "/budgets", label: "Budgets", icon: WalletIcon },
  { to: "/requests", label: "Import Requests", icon: ArchiveBoxArrowDownIcon }
];

/**
 * Side-bar navigation.
 *
 * Collapses by default and expands on mouse hover. Collapses again
 * after a short delay when the mouse leaves, to avoid flicker
 * when moving to the main content area.
 */
export default function SideNav() {
  const [collapsed, setCollapsed] = useState(true);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <aside
      onMouseEnter={() => {
        if (collapseTimer.current) {
          clearTimeout(collapseTimer.current);
          collapseTimer.current = null;
        }
        setCollapsed(false);
      }}
      onMouseLeave={() => {
        collapseTimer.current = setTimeout(() => setCollapsed(true), COLLAPSE_DELAY_MS);
      }}
      className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? "w-21" : "w-60"}`}
    >
      {/* Logo */}
      <div
        className={`border-b border-gray-200 ${collapsed ? "flex items-center justify-center py-6" : "px-7 py-6"}`}
      >
        <span className="text-2xl font-semibold text-gray-900">
          {collapsed ? "P" : "Pennysheet"}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-5 space-y-1 border-b border-gray-200">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <Icon className="size-6" />
            {collapsed ? "" : label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2 px-4 py-5">
        <NavLink
          key="/users"
          to="/user"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`
          }
        >
          <UserCircleIcon className="size-6" />
          {collapsed ? "" : "Tri Luu"}
        </NavLink>
      </div>
    </aside>
  );
}
