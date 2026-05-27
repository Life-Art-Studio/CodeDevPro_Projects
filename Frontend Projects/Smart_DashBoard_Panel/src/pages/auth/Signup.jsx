import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
const Signup = () => {
   const { handleSignUp } = useAuth();
   const navigate = useNavigate();

   // Form State
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      role: "ADMIN", // Default role
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Pass the form data to the context handler
      handleSignUp(formData);
      navigate("/dashboard"); // Redirect to dashboard
    };
  return (
    <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/20 transition-colors animate-in fade-in duration-500 relative overflow-hidden group">
      
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] -z-10 group-hover:bg-purple-500/30 transition-colors"></div>

      {/* Header Section */}
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 transition-colors tracking-tight">Admin Registration</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm transition-colors">Register a new admin account</p>
      </div>

      {/* The Form */}
      <form className="flex flex-col gap-5 relative z-10" onSubmit={handleSubmit}>
        
        {/* Full Name Input - NEW */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 transition-colors">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">👤</span>
            <input 
              type="text" 
              id="name"
              name="name"
              placeholder="Enter Your Name"
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 transition-colors">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">✉️</span>
            <input 
              type="email" 
              id="email"
              name="email"
              placeholder="Enter Your Email Address"
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 transition-colors">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔒</span>
            <input 
              type="password" 
              id="password"
              name="password"
              placeholder="Enter Your Password"
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-3 rounded-xl transition-all mt-2 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transform hover:scale-[1.02]"
        >
          Sign Up
        </button>

      </form>

      {/* Footer Link */}
      <div className="text-center mt-6 relative z-10">
        <p className="text-sm text-gray-600 dark:text-slate-400 transition-colors">
          Already have an account?{' '}
          {/* Notice how this links BACK to the login page */}
          <Link to="/auth/login" className="text-purple-600 dark:text-purple-400 font-medium hover:text-pink-500 dark:hover:text-pink-400 hover:underline transition-colors">
            Log in
          </Link>
        </p>
      </div>

    </div>
  );
};

export default Signup;