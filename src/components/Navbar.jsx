import React, { useRef, useEffect } from 'react';
import { Bolt, Search, Sun, Moon } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode }) {
  const searchInputRef = useRef(null);

  // Focus search input on pressing the '/' key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' && 
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 dark:bg-[#0b1c30]/80 backdrop-blur-md border-b border-[#c7c4d8]/30 dark:border-white/10 shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 max-w-[1280px] mx-auto w-full">
        {/* Brand Logo */}
        <div className="flex items-center gap-gutter">
          <a href="#" className="font-semibold text-2xl text-primary dark:text-primary-fixed flex items-center gap-2 hover:opacity-95 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg p-1">
            <Bolt className="w-7 h-7 text-primary-container dark:text-primary-fixed fill-current animate-pulse" />
            <span className="font-bold tracking-tight text-[#0b1c30] dark:text-[#f8f9ff] font-display">SkillElevate</span>
          </a>
          
          {/* Search Field */}
          <div className="hidden lg:flex items-center bg-surface-container-low dark:bg-slate-800/50 px-4 py-2 rounded-full border border-outline-variant/30 dark:border-white/5 transition-all focus-within:border-primary/50 dark:focus-within:border-primary-fixed/50 focus-within:ring-2 focus-within:ring-primary/20 w-72">
            <Search className="w-4 h-4 text-on-surface-variant dark:text-slate-400 mr-2" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search premium courses..." 
              className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm w-full text-on-surface dark:text-white placeholder-slate-400"
            />
            <kbd className="text-[10px] bg-slate-200/80 dark:bg-slate-700/80 px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-slate-600/40 ml-1.5 shrink-0 text-slate-500 dark:text-slate-400 font-semibold select-none shadow-sm">/</kbd>
          </div>
        </div>

        {/* Links & Theme Toggle */}
        <div className="flex items-center gap-6 md:gap-gutter">
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a href="#" className="text-primary dark:text-primary-fixed font-semibold border-b-2 border-primary dark:border-primary-fixed pb-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
              Browse Courses
            </a>
            <a href="#" className="text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-sm">
            {/* Dark Mode Toggle Button */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-yellow-400 transition-all active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* CTA Buttons */}
            <a href="#" className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed transition-colors py-2 px-4 rounded active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
              Login
            </a>
            <a href="#" className="text-sm font-semibold bg-primary hover:bg-primary-container text-white py-2 px-6 rounded-full shadow-sm transition-all hover:shadow-md active:scale-95 duration-200 border-t border-white/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
