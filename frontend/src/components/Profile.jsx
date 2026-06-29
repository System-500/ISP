import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [avatarPreview, setAvatarPreview] = useState("/img/avatar.png");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAvatarDeleted, setIsAvatarDeleted] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch('http://localhost:3000/auth/me', {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.user) {
                    setFormData({ name: data.user.user_name || '', email: data.user.email || '' });
                    if (data.user.avatar_url) {
                        setAvatarPreview(`/img/${data.user.avatar_url}`);
                    }
                }
            } catch (err) {
                console.error("Błąd pobierania danych:", err);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setIsAvatarDeleted(false);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview("/img/avatar.png");
        setSelectedFile(null);
        setIsAvatarDeleted(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('deleteAvatar', isAvatarDeleted);
        if (selectedFile) formDataToSend.append('avatar', selectedFile);

        try {
            const response = await fetch('http://localhost:3000/update-profile', {
                method: 'POST',
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
                body: formDataToSend
            });

            if (response.ok) {
                alert("Profil zaktualizowany!");
                navigate(-1);
            }
        } catch (err) {
            console.error("Błąd zapisu:", err);
        }
    };


    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate('/login');
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
                <div className="card-body p-4">
                    <h2 className="mb-4 text-center">Edytuj swój profil</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="text-center mb-4">
                            <img 
                                src={avatarPreview} 
                                alt="Avatar" 
                                className="rounded-circle border border-secondary shadow-sm" 
                                id="av"
                            />
                            <div className="mt-2">
                                <input type="file" id="fileInput" className="d-none"  onChange={handleFileChange} />
                                <label htmlFor="fileInput" className="btn btn-outline-secondary btn-sm">Zmień zdjęcie</label>
                                {avatarPreview !== "/img/avatar.png" && (
                                    <button type="button" className="btn btn-outline-danger btn-sm ms-2" onClick={handleRemoveAvatar}>
                                        Usuń avatar
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="mb-3">
                            <label>Imię:</label>
                            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} />
                        </div>
                        
                        <div className="mb-3">
                            <label>Email:</label>
                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary w-100">Zapisz zmiany</button>
                            <button type="button" className="btn btn-secondary w-100" onClick={() => navigate(-1)}>Anuluj</button>
                        </div>
                    </form>

                    <hr className="my-4" />

                    <button type="button" className="btn btn-danger w-100" onClick={handleLogout}>
                        Wyloguj się
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;