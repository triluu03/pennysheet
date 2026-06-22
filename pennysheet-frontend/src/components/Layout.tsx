import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";

/**
 * Layout of the application.
 */
export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      <main className="flex-5 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
