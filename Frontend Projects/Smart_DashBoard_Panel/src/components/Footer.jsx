import React from 'react';

// Premium glassmorphic footer for CodeDevPro Dashboard
const Footer = () => {
  return (
    <footer className="w-full py-5 px-6 border-t border-zinc-200/30 dark:border-white/15 bg-white/30 dark:bg-[#0a0c14]/60 backdrop-blur-xl mt-auto z-10 shrink-0 flex-shrink-0 transition-colors duration-500 hidden md:block md:relative md:mt-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 text-center md:text-left">
          © {new Date().getFullYear()} Smart Dashboard. All rights reserved.
        </p>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 text-center md:text-right">
          Powered by{' '}
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
