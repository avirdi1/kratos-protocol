import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Workouts from "./pages/Workouts";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-kratos-dark text-kratos-text">
      <header className="bg-kratos-darker border-b border-kratos-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold">
            <Link to="/" className="hover:text-kratos-blue">Kratos</Link>
          </div>
          <nav className="flex gap-6">
            <Link to="/workouts" className="hover:text-kratos-blue transition-colors">Workouts</Link>
            <Link to="/profile" className="hover:text-kratos-blue transition-colors">Profile</Link>
            <Link to="/login" className="hover:text-kratos-blue transition-colors">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </main>

      <footer className="bg-kratos-darker border-t border-kratos-border px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-center gap-6">
          <Link to="/" className="text-sm hover:text-kratos-blue transition-colors">Home</Link>
          <Link to="/workouts" className="text-sm hover:text-kratos-blue transition-colors">Workouts</Link>
          <Link to="/profile" className="text-sm hover:text-kratos-blue transition-colors">Profile</Link>
        </nav>
      </footer>
    </div>
  );
}
