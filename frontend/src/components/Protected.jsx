import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {

  const [isAuth, setIsAuth] = useState(null); 

  useEffect(() => {

    const token = localStorage.getItem("token");
    
    if (!token) {
      setIsAuth(false);
      return;
    }
    fetch('http://localhost:3000/auth/me', { 
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Token wygasł lub jest nieprawidłowy');
        }
        return response.json();
      })
      .then((data) => {
        if (data.loggedIn === true) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      })
      .catch((error) => {
        console.error("Błąd ochrony ścieżki JWT:", error);
        setIsAuth(false); 
      });
  }, []);

  if (isAuth === null) {
    return (
      <div className="text-white text-center mt-5">
        <h3>Weryfikacja uprawnień JWT w bazie danych...</h3>
      </div>
    );
  }

  if (isAuth === true) {
    return children;
  }
  return <Navigate to="/login" replace />;
}

export default ProtectedRoute;