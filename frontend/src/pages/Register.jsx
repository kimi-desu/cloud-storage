import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../styles/modern.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      setSuccess(res.data.message || "Registered successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-auth-wrap">
      <div className="cs-auth-card">
        <div className="cs-auth-header">
          <div className="cs-auth-title">Create an account</div>
          <div className="cs-auth-sub">Join and start storing files securely</div>
        </div>

        {error && <div className="cs-error">{error}</div>}
        {success && <div className="cs-auth-sub" style={{color: 'var(--cs-success)'}}>{success}</div>}

        <form className="cs-form" onSubmit={handleRegister}>
          <input
            className="cs-input"
            type="text"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="cs-actions">
            <button className="cs-btn cs-btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>

            <Link to="/" className="cs-link">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;