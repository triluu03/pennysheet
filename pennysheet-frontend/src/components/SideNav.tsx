import {
  BackwardIcon,
  ChartBarSquareIcon,
  ForwardIcon,
  HomeIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/details", label: "Details", icon: ChartBarSquareIcon }
];

/**
 * Side-bar navigation.
 */
export default function SideNav() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${collapsed ? "w-21" : "w-60"}`}
    >
      {/* Logo */}
      <div className="px-7 py-6 border-b border-gray-200">
        <span className="text-xl font-semibold text-gray-900">
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
        <button
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ForwardIcon className="size-6" /> : <BackwardIcon className="size-6" />}
          {collapsed ? "" : "Collapse"}
        </button>
      </div>
    </aside>
  );
}
