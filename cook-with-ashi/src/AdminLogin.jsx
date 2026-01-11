import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

function AdminLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

      // ensure password is configured
      if (!ADMIN_PASS) {
        setError("Admin password not configured. Please set VITE_ADMIN_PASS in .env and restart the dev server.");
        return;
      }

      if (password === ADMIN_PASS && username===ADMIN_USER) {

        // navigate first, then show alert after a short delay so the admin page can render
        navigate("/admin");
        setError("");
        setTimeout(() => {
          alert("Login successful ✅");
        }, 150);
        return;
      }

      setError("Invalid password ❌");
    };

  return (
      <div className="login-container">
      {/* Video background */}
      <video autoPlay loop muted className="bg-video">
        <source src="/kitchen.mp4" type="video/mp4" />
      </video>
      <form onSubmit={handleLogin} className="login-box">
        <h2>Admin Login</h2>
        <img src='/favicon.ico'  alt="icon" className="loginimg"></img>
        

        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <button type="submit">Login</button>
      </form>
      </div>
  );
}

export default AdminLogin;
