import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (error) {
      setError(error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-kratos-darker border border-kratos-border rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="text-kratos-text-dim text-center mb-6">
          {mode === 'signin' ? 'Welcome back' : 'Start tracking your training'}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-kratos-dark border border-kratos-border rounded-lg px-4 py-2 text-kratos-text focus:outline-none focus:ring-2 focus:ring-kratos-blue focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-kratos-dark border border-kratos-border rounded-lg px-4 py-2 text-kratos-text focus:outline-none focus:ring-2 focus:ring-kratos-blue focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kratos-blue-dark hover:bg-kratos-blue-darker disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-kratos-text-dim text-sm text-center mt-6">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
            className="text-kratos-blue hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
