import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Błąd logowania");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Zalogowano pomyślnie!");
      navigate("/"); 
    } catch (err) {
      setError(err.message || "Nieprawidłowy email lub hasło");
    }
  };

  return (
    <div className="container mt-4 text-white w-100">
      <h3 className="text-center mt-4 mx-auto text-black">Strona logowania</h3>
      <hr id="login-hr" />
      
      <form onSubmit={handleLogin} className="d-flex flex-column align-items-center text-left w-100 mt-3 mb-5">
        <div className="form-group mb-3 w-50">
          <input 
              type="email" 
              className="form-control" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />
        </div>

        <div className="form-group mb-3 w-50">
          <input 
              type="password" 
              className="form-control" 
              placeholder="Hasło" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          />
        </div>
        
        {error && <div className="alert alert-danger w-50">{error}</div>}
        
        <button type="submit" className="btn btn-dark w-50">Zaloguj się</button>

        <div className="mt-3 text-center">
  <p className="text-black">
    Nie masz konta? <Link to="/register" className="text-black">Zarejestruj się</Link>
  </p>
</div>
      </form>
    </div>
  );
}

export default Login;