import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ArrowLeft, Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';

export default function Auth({ initialMode = 'login', setCurrentPage }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync state if initialMode prop changes
  useEffect(() => {
    setIsLogin(initialMode === 'login');
    // Clear inputs and errors on toggle
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setAgreeTerms(false);
    setRememberMe(false);
    setErrors({});
  }, [initialMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = 'Email address is required';
    if (!password) newErrors.password = 'Password is required';
    if (!isLogin && !confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!isLogin && !name) newErrors.name = 'Full name is required';
    if (!isLogin && !agreeTerms) newErrors.terms = 'You must agree to the Terms and Privacy Policy';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate authentication API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Mock login state inside application context
      setCurrentPage('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0b1c30] text-[#0b1c30] dark:text-[#f8f9ff] flex items-center justify-center font-sans overflow-hidden transition-colors duration-300">
      
      {/* Dynamic Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary/5 dark:bg-primary/3 rounded-full blur-[160px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/2 rounded-full blur-[140px]" />
      </div>

      <main className="w-full h-screen flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* Left Side: Branding & Imagery (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 flex-col relative overflow-hidden">
          {/* Full-bleed illustration as atmospheric background */}
          <div className="absolute inset-0 z-0">
            <img 
              alt="Collaborative online learning session" 
              className="w-full h-full object-cover object-center"
              src="/auth-illustration.png"
              width="1024"
              height="686"
              loading="eager"
            />
            {/* Gradient overlay: bottom-heavy to seat typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30] via-[#0b1c30]/70 to-[#0b1c30]/20" />
            {/* Indigo atmospheric tint */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-emerald-900/20 mix-blend-multiply" />
          </div>

          {/* Content layer */}
          <div className="relative z-10 flex flex-col h-full p-10 lg:p-12 select-none">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <button 
                onClick={() => setCurrentPage('landing')}
                className="text-lg font-bold text-white/90 flex items-center gap-2.5 hover:text-white transition-colors cursor-pointer"
              >
                <School className="w-6 h-6" />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SkillElevate</span>
              </button>
            </motion.div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Bottom content block — anchored to bottom */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              {/* Decorative accent line */}
              <div className="w-10 h-[3px] rounded-full bg-primary-container mb-6" />

              <h2 
                className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold text-white leading-[1.15] tracking-tight mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", textWrap: 'balance' }}
              >
                {isLogin ? 'Pick up where you left off.' : 'Start building real skills today.'}
              </h2>
              <p className="text-[15px] text-white/65 leading-relaxed mb-8" style={{ textWrap: 'pretty' }}>
                {isLogin 
                  ? 'Your courses, progress, and notes are waiting. Sign in to continue learning.'
                  : 'Structured courses in data science, design, and engineering. Built by practitioners, not content farms.'
                }
              </p>

              {/* Social proof — inline, not the hero-metric template */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    'bg-indigo-400', 
                    'bg-emerald-400', 
                    'bg-amber-400', 
                    'bg-rose-400'
                  ].map((bg, i) => (
                    <div 
                      key={i} 
                      className={`w-7 h-7 rounded-full ${bg} border-2 border-[#0b1c30] flex items-center justify-center text-[10px] font-bold text-white/90`}
                    >
                      {['A','M','S','J'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-white/55 font-medium">
                  12,400+ learners enrolled this month
                </p>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <p className="text-[11px] text-white/30 font-medium tracking-wide">
                © {new Date().getFullYear()} SkillElevate
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 h-full overflow-y-auto bg-white dark:bg-[#0b1c30]">
          <div className="w-full max-w-[400px] flex flex-col justify-center relative">
            
            {/* Inline Back Button */}
            <button 
              onClick={() => setCurrentPage('landing')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-450 hover:text-primary dark:hover:text-primary-fixed transition-colors group cursor-pointer mb-6 self-start"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to home</span>
            </button>

            {/* Mobile Logo Branding */}
            <div className="md:hidden font-headline-lg-mobile text-xl font-bold text-primary dark:text-primary-fixed mb-8 flex items-center gap-2 justify-center select-none">
              <School className="w-6 h-6 text-primary dark:text-primary-fixed" />
              <span>SkillElevate</span>
            </div>

            {/* Form Title Header */}
            <div className="text-center md:text-left mb-6 overflow-hidden">
              <motion.div
                key={isLogin ? 'login-header' : 'signup-header'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-on-surface dark:text-white tracking-tight">
                  {isLogin ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="font-body-md text-xs text-on-surface-variant dark:text-slate-400 mt-1">
                  {isLogin ? 'Please enter your details to sign in.' : 'Enter your details to get started.'}
                </p>
              </motion.div>
            </div>

            {/* Form Submission */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name Input (Sign Up Only) */}
              <AnimatePresence initial={false}>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pb-1"
                  >
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 tracking-wide" htmlFor="name">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input 
                        id="name"
                        type="text" 
                        placeholder="Alex Carter"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-500/80 transition-all duration-200`}
                      />
                    </div>
                    {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.name}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 tracking-wide" htmlFor="email">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    id="email"
                    type="email" 
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-500/80 transition-all duration-200`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 tracking-wide" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-500/80 transition-all duration-200`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-on-surface dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password Input (Sign Up Only) */}
              <AnimatePresence initial={false}>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pb-1"
                  >
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 tracking-wide" htmlFor="confirm-password">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.confirmPassword ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-500/80 transition-all duration-200`}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-on-surface dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.confirmPassword}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Checkboxes: Remember Me / Terms agreement */}
              <div className="flex items-center justify-between select-none">
                {isLogin ? (
                  <>
                    <div className="flex items-center">
                      <input 
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-[#c7c4d8]/40 dark:border-white/10 rounded cursor-pointer accent-primary"
                      />
                      <label className="ml-2 block text-xs font-semibold text-on-surface-variant dark:text-slate-350 cursor-pointer" htmlFor="remember-me">
                        Remember me
                      </label>
                    </div>
                    <div className="text-xs">
                      <a className="font-semibold text-primary hover:underline transition-colors" href="#">
                        Forgot password?
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start">
                    <input 
                      id="terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-[#c7c4d8]/40 dark:border-white/10 rounded cursor-pointer accent-primary"
                    />
                    <label className="ml-2 block text-xs font-semibold text-on-surface-variant dark:text-slate-350 cursor-pointer text-left leading-normal" htmlFor="terms">
                      I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>
                    </label>
                  </div>
                )}
              </div>
              {!isLogin && errors.terms && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.terms}</p>}

              {/* Form Submit Trigger */}
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md bg-gradient-to-b from-[#4f46e5] to-[#3525cd] hover:from-[#5c54f2] hover:to-[#3e2ee3] border-t border-white/15 text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none hover:shadow-indigo-500/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isLogin ? 'Signing in...' : 'Registering...'}</span>
                    </>
                  ) : (
                    <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  )}
                </button>
              </div>

            </form>

            {/* Social Oauth Segment */}
            <div className="mt-6">
              <div className="relative select-none">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#c7c4d8]/20 dark:border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="bg-white dark:bg-[#0b1c30] px-2.5 text-slate-400">Or continue with</span>
                </div>
              </div>

              {/* Social buttons grid */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#c7c4d8]/30 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 py-2.5 font-semibold text-xs text-on-surface dark:text-slate-300 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span>Google</span>
                </button>
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#c7c4d8]/30 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 py-2.5 font-semibold text-xs text-on-surface dark:text-slate-300 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <svg className="h-4.5 w-4.5 text-on-surface dark:text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.365 7.113c-.653.791-1.587 1.305-2.583 1.267-.132-.98.31-1.944.962-2.735.653-.79 1.636-1.304 2.583-1.267.147.994-.31 1.944-.962 2.735zM16.634 8.784c-1.365 0-2.613.864-3.266.864-.653 0-1.68-.864-2.8-.864-1.446 0-2.798.817-3.545 2.072-1.54 2.614-.393 6.48 1.12 8.583.723 1.003 1.562 2.122 2.682 2.072 1.073-.046 1.493-.676 2.798-.676 1.306 0 1.68.676 2.8.676 1.166-.046 1.89-1.026 2.613-2.072.84-1.165 1.185-2.285 1.203-2.341-.027-.01-2.22-.816-2.24-3.32-.018-2.09 1.764-3.084 1.848-3.13-1.008-1.446-2.566-1.62-3.125-1.654z"></path>
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </div>

            {/* Bottom Form Toggler link */}
            <div className="mt-8 text-center select-none">
              <p className="font-body-md text-xs text-on-surface-variant dark:text-slate-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-primary dark:text-primary-fixed-dim hover:underline cursor-pointer"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
