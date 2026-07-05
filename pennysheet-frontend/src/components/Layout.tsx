import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";

/**
 * Layout of the application.
 */
export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
