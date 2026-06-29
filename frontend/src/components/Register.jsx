import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Hasła nie są takie same");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }), 
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Błąd rejestracji");
        return; 
      }
      navigate("/login");
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    }
  };

  return (
    <div className="container mt-4 text-white w-100">
      <h3 className="text-center mt-4 text-black">Rejestracja</h3>
      <form onSubmit={handleRegister} className="d-flex flex-column align-items-center mt-3">
    
        <input
          type="text"
          className="form-control mb-3 w-50"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          className="form-control mb-3 w-50"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3 w-50"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3 w-50"
          placeholder="Powtórz hasło"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        {error && <div className="alert alert-danger w-50">{error}</div>}
        <button type="submit" className="btn btn-dark w-50">Zarejestruj się</button>
        
        <div className="mt-3">
           <span className="text-black">
             Masz już konto? <Link to="/login" className="text-black">Zaloguj się</Link>
           </span>
        </div>
      </form>
    </div>
  );
}

export default Register;