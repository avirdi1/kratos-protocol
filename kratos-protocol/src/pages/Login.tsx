import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  return (
    <div className="page">
      <h1>Sign in (mock)</h1>
      <p>Click sign in to go to home. Replace with real auth later.</p>
      <button className="btn" onClick={() => nav("/")}>Sign in</button>
    </div>
  );
}
