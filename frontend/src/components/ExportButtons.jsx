export default function ExportButtons({ source }) {
  const baseUrl = "http://localhost:3000/api/stats";

  const handleDownload = async (format) => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${baseUrl}/${format}?source=${source}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Błąd autoryzacji: nie masz dostępu do tego pliku.");
      }


      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `statystyki.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Błąd pobierania:", error);
      alert("Nie udało się pobrać pliku. Sprawdź, czy jesteś zalogowany.");
    }
  };

  return (
    <div className="export-panel">
      <button className="btn btn-dark" onClick={() => handleDownload("yaml")}>YAML</button>
      <button className="btn btn-dark" onClick={() => handleDownload("json")}>JSON</button>
      <button className="btn btn-dark " onClick={() => handleDownload("xml")}>XML</button>
    </div>
  );
}