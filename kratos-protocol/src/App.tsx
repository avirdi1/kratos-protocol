import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Workouts from "./pages/Workouts";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function Nav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="flex gap-6 items-center">
      {user ? (
        <>
          <Link to="/workouts" className="hover:text-kratos-blue transition-colors">Workouts</Link>
          <Link to="/profile" className="hover:text-kratos-blue transition-colors">Profile</Link>
          <button onClick={handleSignOut} className="hover:text-kratos-blue transition-colors text-kratos-text-dim text-sm">
            Sign out
          </button>
        </>
      ) : (
        <Link to="/login" className="hover:text-kratos-blue transition-colors">Sign in</Link>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-kratos-dark text-kratos-text">
      <header className="bg-kratos-darker border-b border-kratos-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold">
            <Link to="/" className="hover:text-kratos-blue">Kratos</Link>
          </div>
          <Nav />
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
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
