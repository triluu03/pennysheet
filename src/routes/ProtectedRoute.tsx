import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Identity } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection, ErrorContext } from "../module_bindings/index.ts";

const DB_HOST = import.meta.env.VITE_SPACETIMEDB_LOCALHOST ?? "ws://localhost:3000";
const DB_NAME = import.meta.env.VITE_SPACETIMEDB_DB_NAME ?? "pennysheet-db";

const onConnect = (_conn: DbConnection, identity: Identity, _token: string) => {
  console.log("Connected to SpacetimeDB with identity:", identity.toHexString());
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (_ctx: ErrorContext, err: Error) => {
  console.log("Error connecting to SpacetimeDB:", err);
};

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, getIdTokenClaims } = useAuth0();

  const [idToken, setIdToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isAuthenticated) {
        if (!cancelled) setIdToken(undefined);
        return;
      }

      const claims = await getIdTokenClaims().catch(error =>
        console.error("Error found when getting ID token claims: ", error)
      );
      const token = claims?.__raw ?? undefined;

      if (!token) {
        console.error("Auth0 returned no ID token (__raw missing).");
      }

      if (!cancelled) {
        setIdToken(token);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, getIdTokenClaims]);

  const connectionBuilder = useMemo(() => {
    return DbConnection.builder()
      .withUri(DB_HOST)
      .withDatabaseName(DB_NAME)
      .withToken(idToken)
      .onConnect(onConnect)
      .onDisconnect(onDisconnect)
      .onConnectError(onConnectError);
  }, [isAuthenticated, idToken]);

  if (!isLoading && !isAuthenticated) return <Navigate to="/login" />;

  const ready = !isLoading && isAuthenticated && !!idToken;
  if (!ready) return "Loading...";

  return (
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <Outlet />
    </SpacetimeDBProvider>
  );
}
