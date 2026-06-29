import React, { useState, useEffect } from 'react';
import { Line } from 'recharts';
import { useNavigate, Link } from 'react-router-dom';

function Admin() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/users', {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(err => console.error(err));
    }, []);

const deleteUser = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;

    try {
        const response = await fetch(`http://localhost:3000/users/${id}`, {
            method: 'DELETE',
            headers: { 
                "Authorization": `Bearer ${localStorage.getItem("token")}` 
            }
        });

        if (response.ok) {
          
            setUsers(users.filter(user => user.id !== id));
        } else {
            alert("Nie można usunąć tego użytkownika");
        }
    } catch (err) {
        console.error("Błąd:", err);
    }
};

    return (
        <div className="container mt-4">
            <Link to="/" className="btn btn-secondary mb-3">Powrót</Link>
            <h2>Lista użytkowników</h2>
            <table className="table table-normal  ">
                <thead><tr><th>ID</th><th>Avatar</th><th>Imię</th><th>Email</th><th>Rola</th><th>Operacje</th></tr></thead>
        <tbody className="table-group-divider">
    {users.map(u => (
        <tr key={u.id}>
            <td>{u.id}</td>
<td>
    <img 
        src={`/img/${u.avatar_url || 'avatar.png'}`} 
        alt={`Avatar użytkownika ${u.user_name }`}
        title={`Avatar użytkownika ${u.user_name}`}
        className="rounded-circle border border-secondary shadow-sm"
        id ="avmini" 
    />  
</td>
            <td>{u.user_name}</td>
            <td>{u.email}</td>
            <td>{u.role}</td>
            <td>
                <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => deleteUser(u.id)}
                >
                    Usuń
                </button>
            </td>
        </tr>
    ))}
</tbody>
            </table>
        </div>
    );
}
export default Admin;