import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ExportButtons from "./ExportButtons.jsx";
import Chart from "./Chart.jsx";
import "../style/index.css";

function Grafic() {
  const navigate = useNavigate();
  const [source, setSource] = useState("db");
  const [chartData, setChartData] = useState([]);
  const [uploadedData, setUploadedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:3000/auth/me', { 
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then((response) => {
      if (!response.ok) throw new Error('Nieprawidłowy token');
      return response.json();
    })
    .then((data) => {
      if (data.loggedIn && data.user) {
        setCurrentUser({
          id: data.user.id,
          name: data.user.user_name,
          avatar: data.user.avatar_url,
          email: data.user.email,
          role: data.user.role
        });
      }
    })
    .catch((error) => {
      console.error('Błąd weryfikacji:', error);
      localStorage.removeItem("token");
      navigate('/login'); 
    });
  }, [navigate]);
  useEffect(() => {
    if (source === "file") {
      setChartData(uploadedData || []);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:3000/api/stats/chart?source=${source}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (!res.ok) throw new Error("Błąd pobierania danych");

        const data = await res.json();
        if (Array.isArray(data)) {
          setChartData(data.map((item) => ({
            ...item,
            okres: `${item.rok}-W${item.tydzien}`,
          })));
        }
      } catch (err) {
        console.error("Błąd:", err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [source, uploadedData]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    if (e.type === "dragleave") setIsDragging(false);
  };

  const processFile = (file) => {
    if (!file || file.type !== "application/json") {
      alert("Proszę przesłać prawidłowy plik JSON!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const formatted = json.map((item) => ({
          ...item,
          okres: `${item.rok}-W${item.tydzien}`,
        }));
        setUploadedData(formatted);
      } catch (err) {
        alert("Błąd podczas parsowania pliku JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

return (
    <div className="app-container">
      
      <header id="hh">
        
        <div className="source-selector ">
          <button className={`source-btn ${source === "db" ? "active" : ""}`} onClick={() => setSource("db")}>Baza danych</button>
          <button className={`source-btn ${source === "api" ? "active" : ""}`} onClick={() => setSource("api")}>Rządowe API</button>
          {currentUser && currentUser.role === "admin" && (
            <button className={`source-btn ${source === "file" ? "active" : ""}`} onClick={() => setSource("file")}>Import z pliku</button>
            
          )}

          {currentUser && currentUser.role === "admin" && (
           <Link to="/admin" id="admin-link">
            <button className={`source-btn ${source === "admin" ? "active" : ""}`} onClick={() => setSource("admin")}>Panel Admina</button>
            </Link>
          )}

        </div>

 
        {currentUser && (
           <Link to="/profile"  id="profile-link">
          <div className="user-actions d-flex align-items-center gap-3">
            <h3 className="mb-0 fs-5 ">Cześć, <strong>{currentUser.name}</strong></h3>
            {currentUser.role === "admin" && <span className="badge bg-primary">Admin</span>}
           
              <img 
                src={`/img/${currentUser.avatar}`} 
                alt="Avatar" 
                id="profile-avatar"
              />
           
          </div>
           </Link>
        )}
      </header>

    
      {loading && <p>Ładowanie danych...</p>}

      {!loading && source === "file" && !uploadedData && (
        <div className={`dropzone ${isDragging ? "dragging" : ""}`} onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} onClick={() => document.getElementById("hidden-file-input").click()}>
          <p>Przeciągnij i upuść plik JSON</p>
          <input id="hidden-file-input" type="file" accept=".json" style={{ display: "none" }} onChange={(e) => processFile(e.target.files[0])} />
        </div>
      )}

      {!loading && (source !== "file" || uploadedData) && <Chart data={chartData} />}

      {source === "file" && uploadedData && (
        <button className="clear-btn" onClick={() => setUploadedData(null)}>Usuń plik / Załaduj inny</button>
      )}
{source !== "file" && (
    <div className="export-panel-container">
        <ExportButtons source={source} />
    </div>
)}
      
    </div>
  );
}

export default Grafic;