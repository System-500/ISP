# Statistical Data Analysis System

A web application designed for the visualization and management of statistical data . The system is built using a microservices architecture and containerized using Docker.

## 🛠 Technology Stack

### Frontend
* **Framework:** React 19
* **Library:** Recharts (data visualization)
* **Styling:** Bootstrap 5
* **Routing:** React Router
* **Build Tool:** Vite

### Backend & Infrastructure
* **Backend:** Node.js, Express
* **Database:** MySQL
* **Orchestration:** Docker & Docker Compose
* **Web Server:** Nginx (Reverse Proxy)

---

## 🏗 System Architecture
The system utilizes Nginx as a single entry point (Reverse Proxy), which routes requests to either the frontend or the backend API.

---

## 👥 Role Model

The system implements Role-Based Access Control (RBAC) to ensure secure management:

| Role | Permissions |
| :--- | :--- |
| **User** | Manage personal profile, view/interact with the data library. No administrative access. |
| **Admin** | All user permissions, plus access to the admin dashboard, user management, and content administration. |

---

## 📁 Project Structure

* `/frontend` — Source code for the React application.
* `/backend` — Server-side API logic.
* `/docker-compose.yaml` — Configuration for the entire environment.
* `/init.sql` — SQL script for initial database setup.
* `/nginx.conf` — Nginx configuration for request routing.
* `zgony.csv` — Raw statistical data.

---

## 🚀 How to Run

### Prerequisites
* [Docker](https://www.docker.com/) installed.
* [Docker Compose](https://docs.docker.com/compose/) installed.

