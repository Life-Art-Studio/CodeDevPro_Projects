import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useInviteCode } from "../../hooks/useInviteCode";

const Login = () => {
  // Capture invite code from URL if present
  useInviteCode();

  // Get the login handler from context
  const { handleLogin, handleLoginWithGoogle, isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleLogin(loginData);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      navigate("/dashboard"); // Redirect to dashboard
    }
  }, [isLoggedIn, isLoading, navigate]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#1a1d27] shadow-sm rounded-3xl p-8 border border-white/20 transition-colors animate-in fade-in duration-500 relative overflow-hidden group">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] -z-10 group-hover:bg-purple-500/30 transition-colors"></div>

      {/* Header Section */}
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-zinc-100 transition-colors tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 dark:text-zinc-400 mt-2 text-sm transition-colors">
          Sign in to your account to continue
        </p>
      </div>

      <div className="space-y-6">
        {/* Admin Login Section */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 relative z-10">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4 tracking-wide uppercase">Admin Login</h3>
          <button
            type="button"
            onClick={handleLoginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium py-3 rounded-xl transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Team Login Section */}
        <div className="relative z-10 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4 tracking-wide uppercase">Team Login</h3>
          
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Username Input Group */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5 transition-colors"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">👤</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  placeholder="e.g. john_sales"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner focus:bg-white dark:focus:bg-zinc-950"
                  value={loginData.username}
                  onChange={(e) =>
                    setLoginData({ ...loginData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })
                  }
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5 transition-colors"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="********"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner focus:bg-white dark:focus:bg-zinc-950"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-3 rounded-xl transition-all mt-2 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      <div className="text-center mt-6 relative z-10">
        <p className="text-sm text-gray-500 dark:text-zinc-500 transition-colors">
          Need an account? Contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default Login;
