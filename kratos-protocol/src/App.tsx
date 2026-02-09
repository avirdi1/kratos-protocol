import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Workouts from "./pages/Workouts";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><Link to="/">Kratos</Link></div>
        <nav className="nav">
          <Link to="/workouts">Workouts</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login">Sign in</Link>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>

      <footer className="footer">
        <Link to="/">Home</Link>
        <Link to="/workouts">Workouts</Link>
        <Link to="/profile">Profile</Link>
      </footer>
    </div>
  );
}


