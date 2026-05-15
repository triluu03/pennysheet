import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useReducer, useSpacetimeDB, useTable } from "spacetimedb/react";
import { reducers, tables } from "../module_bindings";

export default function HomePage() {
  const { logout } = useAuth0();

  const [name, setName] = useState("");

  const conn = useSpacetimeDB();
  const { isActive: connected } = conn;

  // Subscribe to all people in the database
  const [people] = useTable(tables.person);

  const addReducer = useReducer(reducers.add);

  const addPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !connected) return;

    // Call the add reducer
    addReducer({ name: name });
    setName("");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>SpacetimeDB React App</h1>

      <div style={{ marginBottom: "1rem" }}>
        Status:{" "}
        <strong style={{ color: connected ? "green" : "red" }}>{connected ? "Connected" : "Disconnected"}</strong>
        <button style={{ marginLeft: "1rem" }} onClick={() => logout()}>
          Logout
        </button>
      </div>

      <form onSubmit={addPerson} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
          disabled={!connected}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }} disabled={!connected}>
          Add Person
        </button>
      </form>

      <div>
        <h2>People ({people.length})</h2>
        {people.length === 0 ? (
          <p>No people yet. Add someone above!</p>
        ) : (
          <ul>
            {people.map((person, index) => (
              <li key={index}>{person.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
