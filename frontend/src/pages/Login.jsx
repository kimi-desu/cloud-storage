import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "../styles/modern.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-auth-wrap">
      <div className="cs-auth-card">
        <div className="cs-auth-header">
          <div className="cs-auth-title">Welcome back</div>
          <div className="cs-auth-sub">Sign in to your account</div>
        </div>

        {error && <div className="cs-error">{error}</div>}

        <form className="cs-form" onSubmit={handleLogin}>
          <input
            className="cs-input"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="cs-input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="cs-actions">
            <button className="cs-btn cs-btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <Link to="/register" className="cs-link">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;