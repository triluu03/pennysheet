import { useAuth0 } from "@auth0/auth0-react";

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  const login = async () => {
    await loginWithRedirect().catch(error => console.error("Error in logging in: ", error));
  };
  const signup = async () => {
    await loginWithRedirect({ authorizationParams: { screen_hint: "signup" } }).catch(error =>
      console.error("Error in signing up: ", error)
    );
  };

  return (
    <>
      <button onClick={login}>Login</button>
      <button onClick={signup}>Signup</button>
    </>
  );
}
