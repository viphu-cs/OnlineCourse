import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bolt, Search, Sun, Moon, ShoppingCart, Menu, X, Home, BookOpen, GraduationCap, Zap, LogOut, User, LogIn } from 'lucide-react';

export default function Navbar({ 
  darkMode, 
  setDarkMode, 
  currentPage, 
  setCurrentPage, 
  searchQuery, 
  setSearchQuery,
  cartItems = [],
  session,
  userProfile,
  onLogout
}) {
  const searchInputRef = useRef(null);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isInstructor = userProfile?.role === 'instructor' || userProfile?.role === 'admin';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownOpen && !e.target.closest('.user-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [dropdownOpen]);

  // Close mobile menu on resize to sm+
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
      // Close mobile menu on Escape
      if (e.key === 'Escape') setMobileMenuOpen(false);
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

  // Navigate and close mobile menu
  const navigate = (page) => {
    setMobileMenuOpen(false);
    setCurrentPage(page);
  };

  const handleLogoutMobile = () => {
    setMobileMenuOpen(false);
    onLogout();
  };

  const navLinkClass = (page) =>
    `transition-colors py-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded cursor-pointer ${
      currentPage === page
        ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed'
        : 'text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed'
    }`;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 dark:bg-[#0b1c30]/80 backdrop-blur-md border-b border-[#c7c4d8]/30 dark:border-white/10 shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 max-w-[1280px] mx-auto w-full">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-gutter">
            <button 
              onClick={() => {
                navigate('landing');
                setSearchQuery('');
              }}
              className="font-semibold text-2xl text-primary dark:text-primary-fixed flex items-center gap-2 hover:opacity-95 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg p-1 cursor-pointer"
            >
              <Bolt className="w-7 h-7 text-primary-container dark:text-primary-fixed fill-current animate-pulse" />
              <span className="font-bold tracking-tight text-[#0b1c30] dark:text-[#f8f9ff] font-display">SkillElevate</span>
            </button>
            
            {/* Search Field — desktop only */}
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

          {/* ── Desktop: Links & Controls ── */}
          <div className="hidden md:flex items-center gap-6 md:gap-gutter">
            <div className="hidden md:flex items-center gap-8 font-medium text-sm">
              <button 
                onClick={() => { setCurrentPage('landing'); setSearchQuery(''); }}
                className={navLinkClass('landing')}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentPage('marketplace')}
                className={navLinkClass('marketplace')}
              >
                Browse Courses
              </button>
              {session && !isInstructor && (
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className={navLinkClass('dashboard')}
                >
                  My Learning
                </button>
              )}
            </div>

            <div className="flex items-center gap-sm">
              {/* Instructor Studio button */}
              {isInstructor && (
                <button 
                  onClick={() => setCurrentPage('course-builder')}
                  className="text-xs font-bold border border-[#c7c4d8]/40 dark:border-white/10 text-on-surface-variant dark:text-slate-300 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer flex items-center gap-1.5"
                  aria-label="Instructor Studio"
                >
                  <span>Instructor Studio</span>
                </button>
              )}

              {/* Admin Portal button */}
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => setCurrentPage('admin')}
                  className="text-xs font-bold border border-primary/20 bg-primary/5 dark:bg-primary-fixed/10 text-primary dark:text-primary-fixed px-3.5 py-2.5 rounded-xl hover:bg-primary/10 transition-colors active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer flex items-center gap-1.5"
                  aria-label="Admin Portal"
                >
                  <span>Admin Portal</span>
                </button>
              )}

              {/* Shopping Cart — hidden for instructors */}
              {!isInstructor && (
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
              )}

              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-yellow-400 transition-all active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Profile / Auth */}
              {session ? (
                <div className="relative user-dropdown-container">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 rounded-full border border-[#c7c4d8]/40 dark:border-white/10 overflow-hidden cursor-pointer active:scale-95 duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  >
                    <img 
                      src={userProfile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl shadow-lg py-2 z-50 text-left text-xs font-semibold text-on-surface dark:text-slate-200">
                      <div className="px-4 py-2 border-b border-[#c7c4d8]/20 dark:border-white/5">
                        <p className="font-bold truncate text-slate-800 dark:text-white">{userProfile?.full_name || 'Learner'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{userProfile?.email}</p>
                        <span className="text-[9px] bg-primary/10 text-primary dark:bg-primary-fixed-dim/10 dark:text-primary-fixed-dim rounded px-1.5 py-0.5 mt-1 inline-block uppercase tracking-wider font-bold">{userProfile?.role || 'student'}</span>
                      </div>
                      {!isInstructor && (
                        <button 
                          onClick={() => { setDropdownOpen(false); setCurrentPage('dashboard'); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                        >
                          My Learning
                        </button>
                      )}
                      {isInstructor && (
                        <button 
                          onClick={() => { setDropdownOpen(false); setCurrentPage('course-builder'); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                        >
                          Instructor Studio
                        </button>
                      )}
                      {userProfile?.role === 'admin' && (
                        <button 
                          onClick={() => { setDropdownOpen(false); setCurrentPage('admin'); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                        >
                          Admin Portal
                        </button>
                      )}
                      <button 
                        onClick={() => { setDropdownOpen(false); onLogout(); }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors border-t border-[#c7c4d8]/20 dark:border-white/5 cursor-pointer font-bold"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* ── Mobile: Right side controls ── */}
          <div className="flex md:hidden items-center gap-2">
            {/* Dark mode toggle — always visible on mobile */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-yellow-400 transition-all active:scale-95 duration-200 cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Hamburger / X toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-slate-300 transition-all active:scale-95 duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

        </div>
      </nav>

      {/* ── Mobile Full-Screen Overlay Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-40 bg-[#f8f9ff]/97 dark:bg-[#0b1c30]/97 backdrop-blur-xl flex flex-col md:hidden"
          >
            {/* Spacer for navbar height */}
            <div className="h-[72px] shrink-0" />

            {/* Search bar inside mobile menu */}
            <div className="px-6 pt-4 pb-2">
              <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="flex items-center bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-[#c7c4d8]/40 dark:border-white/10 shadow-sm">
                <Search className="w-4 h-4 text-on-surface-variant dark:text-slate-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search courses..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-on-surface dark:text-white placeholder-slate-400"
                />
              </form>
            </div>

            {/* Nav Links */}
            <nav className="flex-grow overflow-y-auto px-6 py-4 space-y-1">

              {/* User info (if logged in) */}
              {session && userProfile && (
                <div className="flex items-center gap-3 p-4 mb-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-[#c7c4d8]/40 dark:border-white/10">
                  <img 
                    src={userProfile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover border border-primary/20"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm text-[#0b1c30] dark:text-white truncate">{userProfile.full_name || 'Learner'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{userProfile.email}</p>
                  </div>
                  <span className="text-[9px] bg-primary/10 text-primary dark:bg-primary-fixed/20 dark:text-primary-fixed rounded-full px-2 py-0.5 font-bold uppercase tracking-wider shrink-0">
                    {userProfile.role || 'student'}
                  </span>
                </div>
              )}

              {/* Home */}
              <MobileNavLink
                icon={<Home className="w-5 h-5" />}
                label="Home"
                active={currentPage === 'landing'}
                onClick={() => { navigate('landing'); setSearchQuery(''); }}
              />

              {/* Browse Courses */}
              <MobileNavLink
                icon={<BookOpen className="w-5 h-5" />}
                label="Browse Courses"
                active={currentPage === 'marketplace'}
                onClick={() => navigate('marketplace')}
              />

              {/* My Learning — students only */}
              {session && !isInstructor && (
                <MobileNavLink
                  icon={<GraduationCap className="w-5 h-5" />}
                  label="My Learning"
                  active={currentPage === 'dashboard'}
                  onClick={() => navigate('dashboard')}
                />
              )}

              {/* Instructor Studio — instructors only */}
              {isInstructor && (
                <MobileNavLink
                  icon={<Zap className="w-5 h-5" />}
                  label="Instructor Studio"
                  active={currentPage === 'course-builder'}
                  onClick={() => navigate('course-builder')}
                />
              )}

              {/* Admin Portal — admins only */}
              {userProfile?.role === 'admin' && (
                <MobileNavLink
                  icon={<Bolt className="w-5 h-5" />}
                  label="Admin Portal"
                  active={currentPage === 'admin'}
                  onClick={() => navigate('admin')}
                />
              )}

              {/* Cart — students only */}
              {session && !isInstructor && (
                <MobileNavLink
                  icon={
                    <div className="relative">
                      <ShoppingCart className="w-5 h-5" />
                      {cartItems.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                          {cartItems.length}
                        </span>
                      )}
                    </div>
                  }
                  label={`Cart${cartItems.length > 0 ? ` (${cartItems.length})` : ''}`}
                  active={currentPage === 'cart'}
                  onClick={() => navigate('cart')}
                />
              )}

              {/* Divider */}
              <div className="h-px bg-[#c7c4d8]/30 dark:bg-white/10 my-2" />

              {/* Guest: Login / Sign Up */}
              {!session && (
                <>
                  <MobileNavLink
                    icon={<LogIn className="w-5 h-5" />}
                    label="Login"
                    active={currentPage === 'login'}
                    onClick={() => navigate('login')}
                  />
                  <button
                    onClick={() => navigate('signup')}
                    className="w-full mt-2 py-3.5 bg-primary hover:bg-primary-container text-white font-bold rounded-2xl shadow-sm transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Sign Up — It's Free
                  </button>
                </>
              )}

              {/* Logged-in: Log Out */}
              {session && (
                <button
                  onClick={handleLogoutMobile}
                  className="w-full mt-2 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              )}
            </nav>

            {/* Bottom decorative gradient */}
            <div className="h-8 bg-gradient-to-t from-[#f8f9ff] dark:from-[#0b1c30] to-transparent pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Helper: Mobile Nav Link ──
function MobileNavLink({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer text-left ${
        active
          ? 'bg-primary/10 dark:bg-primary-fixed/15 text-primary dark:text-primary-fixed'
          : 'text-[#0b1c30] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      <span className={active ? 'text-primary dark:text-primary-fixed' : 'text-slate-400 dark:text-slate-500'}>
        {icon}
      </span>
      <span>{label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary-fixed" />
      )}
    </button>
  );
}
