import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-kratos-darker border border-kratos-border rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Sign In</h1>
        <p className="text-kratos-text-dim text-center mb-6">
          Mock authentication - click sign in to continue
        </p>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nav("/"); }}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full bg-kratos-dark border border-kratos-border rounded-lg px-4 py-2 text-kratos-text focus:outline-none focus:ring-2 focus:ring-kratos-blue focus:border-transparent"
              placeholder="demo@kratos.app"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full bg-kratos-dark border border-kratos-border rounded-lg px-4 py-2 text-kratos-text focus:outline-none focus:ring-2 focus:ring-kratos-blue focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-kratos-blue-dark hover:bg-kratos-blue-darker text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="text-kratos-text-dim text-sm text-center mt-6">
          Don't have an account? <span className="text-kratos-blue hover:underline cursor-pointer">Sign up</span>
        </p>
      </div>
    </div>
  );
}
