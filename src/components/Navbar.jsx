import React, { useRef, useEffect, useState } from 'react';
import { Bolt, Search, Sun, Moon, ShoppingCart } from 'lucide-react';

export default function Navbar({ 
  darkMode, 
  setDarkMode, 
  currentPage, 
  setCurrentPage, 
  searchQuery, 
  setSearchQuery,
  cartItems = []
}) {
  const searchInputRef = useRef(null);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  // Keep local search query in sync with global search query
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (currentPage !== 'marketplace') {
      setCurrentPage('marketplace');
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 dark:bg-[#0b1c30]/80 backdrop-blur-md border-b border-[#c7c4d8]/30 dark:border-white/10 shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 max-w-[1280px] mx-auto w-full">
        {/* Brand Logo */}
        <div className="flex items-center gap-gutter">
          <button 
            onClick={() => {
              setCurrentPage('landing');
              setSearchQuery('');
            }}
            className="font-semibold text-2xl text-primary dark:text-primary-fixed flex items-center gap-2 hover:opacity-95 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg p-1 cursor-pointer"
          >
            <Bolt className="w-7 h-7 text-primary-container dark:text-primary-fixed fill-current animate-pulse" />
            <span className="font-bold tracking-tight text-[#0b1c30] dark:text-[#f8f9ff] font-display">SkillElevate</span>
          </button>
          
          {/* Search Field */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-surface-container-low dark:bg-slate-800/50 px-4 py-2 rounded-full border border-outline-variant/30 dark:border-white/5 transition-all focus-within:border-primary/50 dark:focus-within:border-primary-fixed/50 focus-within:ring-2 focus-within:ring-primary/20 w-96">
            <Search className="w-4 h-4 text-on-surface-variant dark:text-slate-400 mr-2" />
            <input 
              ref={searchInputRef}
              type="text" 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search premium courses..." 
              className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm w-full text-on-surface dark:text-white placeholder-slate-400"
            />
            <kbd className="text-[10px] bg-slate-200/80 dark:bg-slate-700/80 px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-slate-600/40 ml-1.5 shrink-0 text-slate-500 dark:text-slate-400 font-semibold select-none shadow-sm">/</kbd>
          </form>
        </div>

        {/* Links & Theme Toggle */}
        <div className="flex items-center gap-6 md:gap-gutter">
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <button 
              onClick={() => {
                setCurrentPage('landing');
                setSearchQuery('');
              }}
              className={`transition-colors py-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded cursor-pointer ${
                currentPage === 'landing'
                  ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed'
                  : 'text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('marketplace')}
              className={`transition-colors py-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded cursor-pointer ${
                currentPage === 'marketplace'
                  ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed'
                  : 'text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed'
              }`}
            >
              Browse Courses
            </button>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={`transition-colors py-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded cursor-pointer ${
                currentPage === 'dashboard'
                  ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed'
                  : 'text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed'
              }`}
            >
              My Learning
            </button>
          </div>

          <div className="flex items-center gap-sm">
            {/* Instructor Studio button */}
            <button 
              onClick={() => setCurrentPage('course-builder')}
              className="text-xs font-bold border border-[#c7c4d8]/40 dark:border-white/10 text-on-surface-variant dark:text-slate-300 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer flex items-center gap-1.5"
              aria-label="Instructor Studio"
            >
              <span>Instructor Studio</span>
            </button>

            {/* Shopping Cart button */}
            <button 
              onClick={() => setCurrentPage('cart')}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-slate-300 transition-all active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer relative"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-[#0b1c30]">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle Button */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-yellow-400 transition-all active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* CTA Buttons */}
            <button 
              onClick={() => setCurrentPage('login')}
              className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed transition-colors py-2 px-4 rounded active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
            >
              Login
            </button>
            <button 
              onClick={() => setCurrentPage('signup')}
              className="text-sm font-semibold bg-primary hover:bg-primary-container text-white py-2 px-6 rounded-full shadow-sm transition-all hover:shadow-md active:scale-95 duration-200 border-t border-white/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

