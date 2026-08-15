import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:5000/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save token and navigate
                localStorage.setItem("token", data.token);
                navigate("/admin");
                
                setTimeout(() => {
                  alert("Login successful ✅");
                }, 150);
            } else {
                setError(data.error || "Invalid credentials ❌");
            }
        } catch (err) {
            setError("Could not connect to server ❌");
        } finally {
            setLoading(false);
        }
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

      <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      </div>
  );
}

export default AdminLogin;
