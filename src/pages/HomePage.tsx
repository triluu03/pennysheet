import { useAuth0 } from "@auth0/auth0-react";
import { useSpacetimeDB } from "spacetimedb/react";

export default function HomePage() {
  const { logout } = useAuth0();

  const conn = useSpacetimeDB();
  const { isActive: connected } = conn;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>SpacetimeDB React App</h1>
      <button style={{ marginLeft: "1rem" }} onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}
