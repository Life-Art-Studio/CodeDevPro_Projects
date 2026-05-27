import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // Get the login handler from context
  const { handleLogin, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(loginData);
  };

  // ... inside Login component
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard"); // Redirect to dashboard
    }
  }, [isLoggedIn, navigate]);

  // Main Card: White background, rounded corners, subtle shadow
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

      {/* The Form */}
      <form className="flex flex-col gap-5 relative z-10" onSubmit={handleSubmit}>
        {/* Email Input Group */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5 transition-colors"
          >
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">✉️</span>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter Your Email Address"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] focus:bg-white dark:focus:bg-zinc-950"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
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
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] focus:bg-white dark:focus:bg-zinc-950"
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
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-3 rounded-xl transition-all mt-2 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transform hover:scale-[1.02]"
        >
          Sign In
        </button>
      </form>

      {/* Public sign-up is disabled. Contact admin for an account. */}
      <div className="text-center mt-6 relative z-10">
        <p className="text-sm text-gray-600 dark:text-zinc-400 transition-colors">
          Need an account? Contact your system administrator.
        </p>
      </div>
    </div>
  );
};

export default Login;
