import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Users, Clock, ArrowLeft, Play, Pause, ChevronDown, ChevronUp, 
  Check, GraduationCap, Link2, Mail, Video, Download, Infinity, 
  Tv, Award, X, Sparkles, CreditCard, Lock, Calendar, CheckCircle2, ShoppingCart, Pencil
} from 'lucide-react';

export default function CourseDetails({ course, setCurrentPage, addToCart, cartItems = [], setSelectedCourseId, enrolledCourseIds = [], userProfile, onEditCourse }) {
  const isInstructor = userProfile?.role === 'instructor' || userProfile?.role === 'admin';
  const isOwnCourse = isInstructor && course?.authorId && userProfile?.id && String(course.authorId) === String(userProfile.id);
  const isEnrolled = enrolledCourseIds.includes(course?.id) || localStorage.getItem(`skillelevate_progress_course_${course?.id}`) !== null;
  const isInCart = cartItems?.some(item => item.id === course.id);
  const [expandedChapters, setExpandedChapters] = useState({ 0: true }); // Chapter 1 expanded by default
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Form states for Checkout
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardType, setCardType] = useState('visa');
  const [focusedField, setFocusedField] = useState(null);
  
  // Checkout progress states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  if (!course) {
    return (
      <div className="pt-32 text-center">
        <p className="text-lg">No course selected.</p>
        <button 
          onClick={() => setCurrentPage('landing')} 
          className="mt-4 px-6 py-2.5 bg-primary text-white rounded-full font-semibold cursor-pointer"
        >
          Go Home
        </button>
      </div>
    );
  }

  // Calculate prices
  const basePrice = course.priceVal;
  const hasDiscount = basePrice > 0;
  const originalPrice = hasDiscount ? (basePrice * 1.5).toFixed(2) : '0.00';
  const finalPrice = Math.max(0, basePrice - discountAmount).toFixed(2);

  const toggleChapter = (index) => {
    setExpandedChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'ELEVATE20') {
      setDiscountAmount(basePrice * 0.2); // 20% discount
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try "ELEVATE20"');
      setCouponApplied(false);
    }
  };

  // Card formatting helper
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Format with spaces
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
    
    // Detect card type
    if (value.startsWith('4')) {
      setCardType('visa');
    } else if (value.startsWith('5')) {
      setCardType('mastercard');
    } else {
      setCardType('visa');
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardExpiry(value);
  };

  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvc(value);
  };

  // Submit checkout logic
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!checkoutName.trim()) newErrors.name = 'Full name is required';
    if (!checkoutEmail.trim() || !/\S+@\S+\.\S+/.test(checkoutEmail)) {
      newErrors.email = 'Valid email is required';
    }

    if (basePrice > 0) {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length !== 16) newErrors.card = 'Card number must be 16 digits';
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) newErrors.expiry = 'Expiry format MM/YY is required';
      if (cardCvc.length !== 3) newErrors.cvc = 'CVC must be 3 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate payment transaction api call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handleCloseCheckout = () => {
    setShowCheckoutModal(false);
    setIsSuccess(false);
    setCheckoutName('');
    setCheckoutEmail('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setErrors({});
  };

  return (
    <div className="pt-24 min-h-screen relative flex flex-col bg-background dark:bg-[#0b1c30] transition-colors duration-300">
      
      {/* Dynamic Background Mesh */}
      <div className="absolute top-0 inset-x-0 h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 dark:bg-primary/3 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[-20%] w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/1 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="bg-white dark:bg-[#0f172a]/40 border-b border-[#c7c4d8]/30 dark:border-white/5 py-8 md:py-12 relative overflow-hidden transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 md:px-margin-desktop">
          
          {/* Breadcrumb Navigation & Back Button */}
          <div className="flex flex-wrap items-center gap-xs text-xs text-on-surface-variant dark:text-slate-400 mb-6 font-medium">
            <button 
              onClick={() => setCurrentPage('marketplace')}
              className="flex items-center gap-1.5 hover:text-primary dark:hover:text-primary-fixed transition-colors font-semibold group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to courses
            </button>
            <span className="text-[#c7c4d8]/60">/</span>
            <span className="text-[#c7c4d8]/60 dark:text-slate-600">{course.category}</span>
            <span className="text-[#c7c4d8]/60">/</span>
            <span className="text-on-surface dark:text-slate-200 select-all font-semibold">{course.title}</span>
          </div>

          {/* Grid: Header details vs Video Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-center">
            
            {/* Left Header info */}
            <div className="lg:col-span-7 flex flex-col gap-4 text-left">
              <span className="inline-flex max-w-fit px-3 py-1 bg-primary/10 dark:bg-primary-fixed/20 text-primary dark:text-primary-fixed text-xs font-bold rounded-full uppercase tracking-wider">
                {course.category}
              </span>
              <h1 className="font-bold text-3xl md:text-5xl text-on-surface dark:text-white leading-tight font-display tracking-tight">
                {course.title}
              </h1>
              <p className="text-base md:text-lg text-on-surface-variant dark:text-slate-400 max-w-2xl leading-relaxed">
                {course.description}
              </p>

              {/* Rating and Quick Stats */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-xs md:text-sm font-semibold text-on-surface-variant dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4.5 h-4.5 text-yellow-500 dark:text-yellow-400 fill-current" />
                  <span className="text-on-surface dark:text-white font-bold">{course.rating}</span>
                  <span className="text-slate-400 font-medium hover:underline cursor-pointer">({course.reviews} reviews)</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#c7c4d8]/60 dark:bg-slate-700 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary dark:text-primary-fixed" />
                  <span>{(course.reviews * 6).toLocaleString()} students</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#c7c4d8]/60 dark:bg-slate-700 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Author badge */}
              <div className="flex items-center gap-3 mt-4 pt-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary-fixed/25 flex items-center justify-center text-xs font-bold text-primary dark:text-primary-fixed border border-primary/20">
                  {course.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Instructor</span>
                  <span className="text-sm font-bold text-on-surface dark:text-slate-100">{course.author}</span>
                </div>
              </div>
            </div>

            {/* Right Video Mock Preview */}
            <div className="lg:col-span-5 w-full">
              <div 
                onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/10 group cursor-pointer level-3-shadow"
              >
                {isPlayingVideo ? (
                  /* Animated Visual loop representation for play state */
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-4">
                    <div className="flex gap-1.5 items-end justify-center h-16 w-32 mb-4">
                      <motion.div animate={{ height: [20, 60, 20] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="w-2.5 bg-primary dark:bg-primary-fixed rounded-full" />
                      <motion.div animate={{ height: [30, 80, 30] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }} className="w-2.5 bg-[#10b981] rounded-full" />
                      <motion.div animate={{ height: [15, 50, 15] }} transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut", delay: 0.4 }} className="w-2.5 bg-primary dark:bg-primary-fixed rounded-full" />
                      <motion.div animate={{ height: [40, 70, 40] }} transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut", delay: 0.1 }} className="w-2.5 bg-[#10b981] rounded-full" />
                      <motion.div animate={{ height: [10, 40, 10] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", delay: 0.5 }} className="w-2.5 bg-primary dark:bg-primary-fixed rounded-full" />
                    </div>
                    <span className="text-xs text-slate-400 font-semibold tracking-wide flex items-center gap-1.5">
                      <Pause className="w-3.5 h-3.5 fill-current" /> Click anywhere to pause preview
                    </span>
                  </div>
                ) : (
                  /* Static Cover Image overlay */
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-tr ${course.gradient} opacity-85 mix-blend-multiply transition-opacity duration-300`} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 bg-white/95 dark:bg-slate-900/90 text-primary dark:text-primary-fixed rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform active:scale-95 duration-200 z-20">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                      <span className="text-sm font-bold text-white mt-4 tracking-wide drop-shadow-md">Preview Course Trailer</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Grid & Layout */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-12 flex-grow w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          
          {/* Left Column: Course Details */}
          <div className="col-span-1 lg:col-span-8 space-y-12 text-left">
            
            {/* What you'll learn Bento */}
            <section className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#c7c4d8]/40 dark:border-white/5 p-6 md:p-8 level-2-shadow transition-colors">
              <h2 className="font-bold text-xl md:text-2xl text-on-surface dark:text-white mb-6 font-display tracking-tight flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary dark:text-primary-fixed" />
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(course.objectives || [
                  "Gain comprehensive industry insights on advanced methodologies.",
                  "Master clean architectures and code patterns.",
                  "Deploy highly performant scalable applications.",
                  "Learn developer handoffs and token system setups."
                ]).map((objective, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 text-[#10b981] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                    <p className="text-sm text-on-surface-variant dark:text-slate-300 leading-relaxed">
                      {objective}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum Section */}
            <section>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
                <div>
                  <h2 className="font-bold text-xl md:text-2xl text-on-surface dark:text-white font-display tracking-tight">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1">
                    Structured roadmap of lectures. Expand chapters to explore resources.
                  </p>
                </div>
                <span className="text-xs font-semibold text-on-surface-variant dark:text-slate-400 shrink-0">
                  {course.curriculum?.length || 3} Chapters • {course.duration} total length
                </span>
              </div>

              {/* Chapters Accordion */}
              <div className="border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#0f172a] level-2-shadow transition-colors">
                {(course.curriculum || [
                  {
                    chapterTitle: "Chapter 1: Getting Started",
                    duration: "45 mins",
                    lessons: [
                      { title: "Introduction and setup guides", duration: "15:00" },
                      { title: "Terminology & structural overviews", duration: "15:00" },
                      { title: "Core configurations", duration: "15:00" }
                    ]
                  },
                  {
                    chapterTitle: "Chapter 2: Intermediate Deep Dive",
                    duration: "1h 30m",
                    lessons: [
                      { title: "Building structures and layouts", duration: "30:00" },
                      { title: "Component properties & variable scopes", duration: "30:00" },
                      { title: "Standard optimizations", duration: "30:00" }
                    ]
                  }
                ]).map((chapter, index) => {
                  const isExpanded = expandedChapters[index];
                  return (
                    <div key={index} className="border-b border-[#c7c4d8]/30 dark:border-white/5 last:border-b-0">
                      
                      {/* Accordion header button */}
                      <button 
                        onClick={() => toggleChapter(index)}
                        className="w-full px-6 py-5 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left group cursor-pointer focus:outline-none"
                      >
                        <div className="flex flex-col gap-1 pr-4">
                          <h3 className="font-bold text-base md:text-lg text-on-surface dark:text-slate-100 group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">
                            {chapter.chapterTitle}
                          </h3>
                          <span className="text-xs text-on-surface-variant dark:text-slate-400 font-semibold">
                            {chapter.lessons.length} lessons • {chapter.duration}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-on-surface-variant dark:text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-on-surface-variant dark:text-slate-400 shrink-0" />
                        )}
                      </button>

                      {/* Expandable lesson container */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden bg-[#f8f9ff]/40 dark:bg-slate-900/10 px-6 border-t border-[#c7c4d8]/20 dark:border-white/5"
                          >
                            <div className="py-2.5 divide-y divide-[#c7c4d8]/20 dark:divide-white/5">
                              {chapter.lessons.map((lesson, li) => (
                                <div key={li} className="flex justify-between items-center py-3.5 group cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <Video className="w-4 h-4 text-primary dark:text-primary-fixed opacity-70 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-sm font-semibold text-on-surface dark:text-slate-300 group-hover:underline text-left leading-snug">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span className="text-xs text-on-surface-variant dark:text-slate-500 shrink-0 font-medium font-mono">
                                    {lesson.duration}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })}
              </div>
            </section>

            {/* Prerequisites */}
            <section className="space-y-4">
              <h2 className="font-bold text-xl md:text-2xl text-on-surface dark:text-white font-display tracking-tight">
                Course Requirements
              </h2>
              <ul className="space-y-3 pl-1">
                {(course.requirements || [
                  "Basic programming background or interest in advanced setups.",
                  "A computer with high speed internet access."
                ]).map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#c7c4d8] dark:bg-slate-600 shrink-0" />
                    <span className="text-sm md:text-base text-on-surface-variant dark:text-slate-400">
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructor Section */}
            <section className="border-t border-[#c7c4d8]/30 dark:border-white/10 pt-10">
              <h2 className="font-bold text-xl md:text-2xl text-on-surface dark:text-white font-display tracking-tight mb-6">
                Your Instructor
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 items-start bg-white dark:bg-[#0f172a] rounded-2xl border border-[#c7c4d8]/40 dark:border-white/5 p-6 level-2-shadow transition-colors">
                <div className="w-20 h-20 rounded-full bg-primary-container dark:bg-primary-fixed/25 border-2 border-primary/20 shrink-0 flex items-center justify-center text-xl font-bold text-white dark:text-primary-fixed select-none">
                  {course.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex flex-col text-left gap-2.5">
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-on-surface dark:text-white">
                      {course.author}
                    </h3>
                    <p className="text-xs md:text-sm font-semibold text-primary dark:text-primary-fixed-dim">
                      {course.authorRole || "Masterclass Instructor"}
                    </p>
                  </div>
                  
                  {/* Instructor quick review counts */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-[#c7c4d8] dark:text-slate-400">
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3.5 h-3.5 fill-current" /> {course.rating} Rating
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {course.authorStudents || "35,000+ Students"}
                    </span>
                  </div>

                  <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed">
                    {course.authorBio || `${course.author} is a lead specialist in their field, lecturing globally and training professionals at tier-one environments. They focus on delivering high fidelity, structural concepts that bridge knowledge boundaries.`}
                  </p>

                  {/* Mail & Web Link mockup buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <button className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-slate-300 rounded-full transition-colors active:scale-95 duration-200 cursor-pointer">
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-slate-300 rounded-full transition-colors active:scale-95 duration-200 cursor-pointer">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Sticky Purchase Sidebar */}
          <div className="col-span-1 lg:col-span-4 relative w-full lg:sticky lg:top-28">
            <div className="bg-white dark:bg-[#0f172a] border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-6 level-2-shadow flex flex-col gap-6 text-left transition-colors">
              
              {/* Price Details */}
              <div className="flex items-baseline justify-between">
                {course.priceVal > 0 ? (
                  <>
                    <span className="font-bold text-3xl md:text-4xl text-on-surface dark:text-white font-mono">
                      ${finalPrice}
                    </span>
                    <span className="text-sm text-slate-400 font-semibold line-through">
                      ${originalPrice}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-3xl md:text-4xl text-emerald-500 dark:text-emerald-400 uppercase">
                    Free
                  </span>
                )}
              </div>

              {/* Purchase Actions */}
              <div className="flex flex-col gap-3">
                {isInstructor ? (
                  isOwnCourse ? (
                    /* Edit Course button for instructor's own course */
                    <button 
                      onClick={() => {
                        if (onEditCourse) {
                          onEditCourse(course.id);
                        } else {
                          setSelectedCourseId?.(course.id);
                          setCurrentPage('course-builder');
                        }
                      }}
                      className="w-full py-3.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 border-t border-white/20 flex justify-center items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit Course</span>
                    </button>
                  ) : (
                    /* View-only state for other instructors' courses */
                    <div className="w-full py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none">
                      <span>View Only — Instructors cannot purchase</span>
                    </div>
                  )
                ) : isEnrolled ? (
                  <button 
                    onClick={() => {
                      setSelectedCourseId?.(course.id);
                      setCurrentPage('learning-experience');
                    }}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 border-t border-white/20 flex justify-center items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Resume Learning</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedCourseId?.(course.id);
                        setCurrentPage('checkout');
                      }}
                      className="w-full py-3.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 border-t border-white/20 flex justify-center items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      {course.priceVal > 0 ? 'Buy Course Now' : 'Enroll for Free'}
                    </button>
                    
                    {course.priceVal > 0 && (
                      <button 
                        onClick={() => {
                          if (isInCart) {
                            setCurrentPage('cart');
                          } else {
                            addToCart?.(course);
                          }
                        }}
                        className={`w-full py-3 font-bold rounded-xl active:scale-95 duration-200 cursor-pointer border transition-colors flex justify-center items-center gap-2 ${
                          isInCart 
                            ? 'bg-primary text-white border-primary/20 hover:opacity-90' 
                            : 'bg-transparent border-[#c7c4d8] dark:border-white/10 text-on-surface dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{isInCart ? 'Go to Cart' : 'Add to Cart'}</span>
                      </button>
                    )}
                  </>
                )}
                
                <span className="text-xs text-center text-on-surface-variant dark:text-slate-400 font-medium">
                  30-Day Money-Back Guarantee
                </span>
              </div>

              <div className="h-px bg-[#c7c4d8]/20 dark:bg-white/5" />

              {/* Coupon Application Form */}
              {course.priceVal > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Coupon Code</span>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Try 'ELEVATE20'" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                      className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 font-semibold"
                    />
                    <button 
                      type="submit"
                      disabled={couponApplied || !couponCode.trim()}
                      className="px-3.5 py-2 bg-primary dark:bg-primary-container disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all active:scale-95 duration-200 cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                  {couponApplied && (
                    <p className="text-[11px] font-bold text-[#10b981] flex items-center gap-1 animate-pulse">
                      <Check className="w-3.5 h-3.5" /> 20% discount applied successfully!
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] font-bold text-red-500">
                      {couponError}
                    </p>
                  )}
                </div>
              )}

              {/* Course Includes Meta list */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#c7c4d8]">
                  This Course Includes:
                </h4>
                <ul className="space-y-3.5 text-xs md:text-sm font-semibold text-on-surface-variant dark:text-slate-300">
                  <li className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-primary dark:text-primary-fixed shrink-0" />
                    <span>On-demand lectures ({course.duration})</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Downloadable learning resources</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Infinity className="w-4 h-4 text-primary dark:text-primary-fixed shrink-0" />
                    <span>Full lifetime credentials access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Tv className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Access on mobile, tablet & TV</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-primary dark:text-primary-fixed shrink-0" />
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* MOBILE BOTTOM STICKY CTA BAR (Only visible on screens smaller than lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-[#c7c4d8]/40 dark:border-white/5 py-4 px-6 z-40 flex items-center justify-between shadow-2xl transition-colors">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total price</span>
          <span className="font-bold text-xl text-on-surface dark:text-white font-mono">${finalPrice}</span>
        </div>
        <button 
          onClick={() => {
            if (isEnrolled) {
              setSelectedCourseId?.(course.id);
              setCurrentPage('learning-experience');
            } else {
              setSelectedCourseId?.(course.id);
              setCurrentPage('checkout');
            }
          }}
          className={`px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-95 duration-200 cursor-pointer text-white ${
            isEnrolled ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-primary-container'
          }`}
        >
          {isEnrolled ? 'Resume Learning' : course.priceVal > 0 ? 'Buy Course' : 'Enroll Free'}
        </button>
      </div>

      {/* CHECKOUT / PAYMENT MODAL */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCheckout}
              className="absolute inset-0 bg-slate-950"
            />

            {/* Modal Content Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="bg-white dark:bg-[#0f172a] w-full max-w-[512px] rounded-2xl shadow-2xl border border-[#c7c4d8]/30 dark:border-white/5 overflow-hidden z-10 flex flex-col relative max-h-[90vh] transition-colors"
            >
              {/* Close Button */}
              <button 
                onClick={handleCloseCheckout}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-on-surface dark:hover:text-white transition-colors cursor-pointer z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 overflow-y-auto">
                
                {isSuccess ? (
                  /* Enrollment Success Screen */
                  <div className="text-center py-8 flex flex-col items-center justify-center gap-5">
                    <motion.div 
                      initial={{ scale: 0.8, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                      className="w-16 h-16 bg-[#10b981]/15 text-[#10b981] rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-2xl text-on-surface dark:text-white font-display tracking-tight">
                        Enrollment Successful!
                      </h3>
                      <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed w-full">
                        Welcome to <span className="font-bold text-primary dark:text-primary-fixed">{course.title}</span>. Your billing receipt has been sent.
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-900 border border-[#c7c4d8]/20 dark:border-white/5 rounded-xl p-4 w-full text-left text-xs font-semibold text-on-surface-variant dark:text-slate-300 mt-2 space-y-2 select-none">
                      <div className="flex justify-between"><span>Course</span><span className="text-on-surface dark:text-white">{course.title}</span></div>
                      <div className="flex justify-between"><span>Transaction ID</span><span className="text-on-surface dark:text-white text-right">SE-{Math.floor(100000 + Math.random() * 900000)}</span></div>
                      <div className="flex justify-between"><span>Amount Paid</span><span className="text-on-surface dark:text-white font-mono">${finalPrice}</span></div>
                    </div>

                    <button 
                      onClick={() => {
                        handleCloseCheckout();
                        setCurrentPage('landing');
                      }}
                      className="w-full mt-4 py-3 bg-[#10b981] hover:bg-[#0ea5e9] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 duration-200 cursor-pointer"
                    >
                      Browse More Courses
                    </button>
                  </div>
                ) : (
                  /* Interactive Payment Form */
                  <div className="space-y-6 text-left">
                    <div>
                      <h3 className="font-bold text-xl md:text-2xl text-on-surface dark:text-white font-display tracking-tight flex items-center gap-2">
                        <Lock className="w-5 h-5 text-[#10b981]" />
                        Secure Checkout
                      </h3>
                      <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1">
                        Enrollment validation for: <span className="font-semibold text-on-surface dark:text-slate-200">{course.title}</span>
                      </p>
                    </div>

                    {/* Interactive Credit Card Graphic representation (Only if price > 0) */}
                    {course.priceVal > 0 && (
                      <div className="relative w-full h-40 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-xl p-5 text-white flex flex-col justify-between shadow-lg overflow-hidden border border-white/10 select-none">
                        
                        {/* Interactive glow spotlight centered around focused inputs */}
                        <div className={`absolute w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none -z-10 transition-all duration-500 ${
                          focusedField === 'cardNumber' ? 'top-[-20%] left-[-10%]' :
                          focusedField === 'cardExpiry' ? 'bottom-[-20%] left-[20%]' :
                          focusedField === 'cardCvc' ? 'bottom-[-20%] right-[-10%]' : 'top-[-50%] right-[-50%]'
                        }`} />

                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">SkillElevate Learning</span>
                          <span className="font-bold text-sm tracking-wide font-display italic">
                            {cardType === 'visa' ? 'VISA' : 'Mastercard'}
                          </span>
                        </div>
                        
                        <div className="font-mono text-lg md:text-xl tracking-widest text-slate-100 py-1.5 select-all">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-mono">Card Holder</span>
                            <span className="font-semibold tracking-wide uppercase truncate max-w-[160px]">
                              {checkoutName || 'YOUR FULL NAME'}
                            </span>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex flex-col text-right">
                              <span className="text-[8px] text-slate-400 uppercase tracking-wider font-mono">Expires</span>
                              <span className="font-semibold font-mono tracking-wider">{cardExpiry || 'MM/YY'}</span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-[8px] text-slate-400 uppercase tracking-wider font-mono">CVC</span>
                              <span className="font-semibold font-mono tracking-wider">{cardCvc || '•••'}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Real-time validated Checkout form */}
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="John Doe" 
                          value={checkoutName}
                          onChange={(e) => setCheckoutName(e.target.value)}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400`}
                        />
                        {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name}</p>}
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="johndoe@example.com" 
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400`}
                        />
                        {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email}</p>}
                      </div>

                      {/* Credit Card Input Grid (Only if price > 0) */}
                      {course.priceVal > 0 && (
                        <div className="space-y-4">
                          {/* Card Number */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" /> Card Number
                            </label>
                            <input 
                              type="text" 
                              placeholder="4000 1234 5678 9010" 
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              onFocus={() => setFocusedField('cardNumber')}
                              onBlur={() => setFocusedField(null)}
                              className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.card ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 font-mono`}
                            />
                            {errors.card && <p className="text-[10px] text-red-500 font-bold">{errors.card}</p>}
                          </div>

                          {/* Expiry & CVC Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            
                            {/* Expiry Date */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> Expiry Date
                              </label>
                              <input 
                                type="text" 
                                placeholder="MM/YY" 
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                onFocus={() => setFocusedField('cardExpiry')}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.expiry ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 font-mono`}
                              />
                              {errors.expiry && <p className="text-[10px] text-red-500 font-bold">{errors.expiry}</p>}
                            </div>

                            {/* CVC Code */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5" /> CVC Code
                              </label>
                              <input 
                                type="password" 
                                placeholder="123" 
                                value={cardCvc}
                                onChange={handleCvcChange}
                                onFocus={() => setFocusedField('cardCvc')}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.cvc ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 font-mono`}
                              />
                              {errors.cvc && <p className="text-[10px] text-red-500 font-bold">{errors.cvc}</p>}
                            </div>

                          </div>
                        </div>
                      )}

                      {/* Summary Pricing */}
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-1 text-xs font-semibold text-on-surface-variant dark:text-slate-400 border border-[#c7c4d8]/20 dark:border-white/5 select-none">
                        <div className="flex justify-between"><span>Subtotal</span><span>${course.priceVal.toFixed(2)}</span></div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-[#10b981]"><span>Coupon Discount</span><span>-${discountAmount.toFixed(2)}</span></div>
                        )}
                        <div className="h-px bg-[#c7c4d8]/20 dark:bg-white/5 my-1.5" />
                        <div className="flex justify-between text-sm text-on-surface dark:text-white font-bold font-mono">
                          <span>Total Amount</span>
                          <span>${finalPrice}</span>
                        </div>
                      </div>

                      {/* Purchase Submit Button */}
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 py-3.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing Secure Payment...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 fill-current" />
                            Complete Enrollment (${finalPrice})
                          </>
                        )}
                      </button>

                    </form>
                  </div>
                )}

              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
