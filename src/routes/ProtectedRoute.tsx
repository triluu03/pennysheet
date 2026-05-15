import { useAuth0 } from "@auth0/auth0-react";
import { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Identity } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection, ErrorContext } from "../module_bindings/index.ts";

const DB_HOST = import.meta.env.VITE_SPACETIMEDB_LOCALHOST ?? "ws://localhost:3000";
const DB_NAME = import.meta.env.VITE_SPACETIMEDB_DB_NAME ?? "pennysheet-db";
const TOKEN_KEY = `${DB_HOST}/${DB_NAME}/auth_token`;

const onConnect = (_conn: DbConnection, identity: Identity, token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  console.log("Connected to SpacetimeDB with identity:", identity.toHexString());
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (_ctx: ErrorContext, err: Error) => {
  console.log("Error connecting to SpacetimeDB:", err);
};

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth0();

  const connectionBuilder = useMemo(() => {
    return (
      DbConnection.builder()
        .withUri(DB_HOST)
        .withDatabaseName(DB_NAME)
        // .withToken(idToken)
        .withToken(localStorage.getItem(TOKEN_KEY) || undefined)
        .onConnect(onConnect)
        .onDisconnect(onDisconnect)
        .onConnectError(onConnectError)
    );
  }, [isAuthenticated]);

  if (isLoading) return "Loading...";
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <Outlet />
    </SpacetimeDBProvider>
  );
}
