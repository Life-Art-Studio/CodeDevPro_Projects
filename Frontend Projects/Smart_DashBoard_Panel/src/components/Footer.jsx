import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-4 px-6 border-t border-slate-200/50 dark:border-white/10 bg-white/30 dark:bg-[#0a0c14]/50 backdrop-blur-md mt-auto z-10 shrink-0 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} Smart Dashboard. All rights reserved.
        </p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          Powered by
          <a 
            href="#" 
            className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 hover:from-pink-500 hover:to-orange-400 transition-all font-bold"
          >
            CodeDevPro
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
