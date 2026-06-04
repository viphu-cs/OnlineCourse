import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Code, Palette, Cpu, Briefcase, ShoppingCart, Check, Pencil } from 'lucide-react';

export default function CourseCard({ course, onSelectCourse, addToCart, cartItems = [], setCurrentPage, isEnrolled: isEnrolledProp, userProfile, onEditCourse }) {
  const isInstructor = userProfile?.role === 'instructor' || userProfile?.role === 'admin';
  const isOwnCourse = isInstructor && course.authorId && userProfile?.id && String(course.authorId) === String(userProfile.id);
  const isEnrolled = isEnrolledProp !== undefined ? isEnrolledProp : localStorage.getItem(`skillelevate_progress_course_${course.id}`) !== null;
  const isInCart = cartItems?.some(item => item.id === course.id);
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(0);
  const [glowY, setGlowY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Handle cursor movement inside card for 3D tilt and glow spotlight
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Cursor location relative to the card bounds
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Card dimensions
    const width = rect.width;
    const height = rect.height;
    
    // Calculate rotation (-10 to 10 degrees)
    const rotX = -((y - height / 2) / (height / 2)) * 8;
    const rotY = ((x - width / 2) / (width / 2)) * 8;
    
    setRotateX(rotX);
    setRotateY(rotY);
    setGlowX(x);
    setGlowY(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  // Get corresponding Icon
  const getIcon = (category) => {
    switch (category) {
      case 'Development':
      case 'Web Development':
        return <Code className="w-12 h-12 text-white opacity-80" />;
      case 'Design':
      case 'Design & UX':
        return <Palette className="w-12 h-12 text-white opacity-80" />;
      case 'AI & Data':
      case 'AI & Machine Learning':
        return <Cpu className="w-12 h-12 text-white opacity-80" />;
      case 'Business Strategy':
        return <Briefcase className="w-12 h-12 text-white opacity-80" />;
      default:
        return <Code className="w-12 h-12 text-white opacity-80" />;
    }
  };


  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectCourse?.(course.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectCourse?.(course.id);
        }
      }}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
      className="group relative bg-[#f8f9ff] dark:bg-[#0f172a] rounded-2xl border border-[#c7c4d8]/40 dark:border-white/5 overflow-hidden flex flex-col h-full cursor-pointer level-2-shadow hover:border-primary/50 dark:hover:border-primary-fixed/30 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      tabIndex={0}
    >
      {/* 3D Spotlight Glow Effect */}
      <div 
        className="glow-effect"
        style={{
          left: `${glowX}px`,
          top: `${glowY}px`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Course Banner Overlay */}
      <div className="h-48 bg-slate-200 dark:bg-slate-800 relative overflow-hidden shrink-0 z-10 select-none">
        {/* Dynamic gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-tr ${course.gradient} opacity-80 mix-blend-multiply group-hover:opacity-90 transition-opacity duration-300`} />
        
        {/* Icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
          {getIcon(course.category)}
        </div>
        
        {/* Shimmering Badge */}
        {course.tag && (
          <div className="absolute top-4 left-4 overflow-hidden rounded bg-white/95 dark:bg-slate-900/90 text-on-surface dark:text-white font-bold text-xs px-3 py-1 backdrop-blur-sm shadow-sm">
            <span className="relative z-10">{course.tag}</span>
            <div className="absolute inset-0 shimmer-badge animate-shimmer opacity-40 dark:opacity-20" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow z-10" style={{ transform: 'translateZ(20px)' }}>
        <div className="flex justify-between items-start mb-3">
          <span className="font-bold text-xs text-primary dark:text-primary-fixed uppercase tracking-wider bg-primary/10 dark:bg-primary-fixed/20 px-3 py-1 rounded-full">
            {course.category}
          </span>
          <span className="font-bold text-lg text-on-surface dark:text-white">
            {course.price}
          </span>
        </div>

        <h3 className="font-bold text-xl text-on-background dark:text-slate-100 leading-tight mb-2 group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-on-surface-variant dark:text-slate-400 line-clamp-2 mb-4 flex-grow">
          {course.description}
        </p>

        {/* Action button — varies by role */}
        <div className="mb-4">
          {isInstructor ? (
            isOwnCourse ? (
              /* Edit Course button for instructor's own course */
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCourse?.(course.id);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1.5 select-none bg-primary text-white hover:opacity-90 border-t border-white/20 shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Course</span>
              </button>
            ) : (
              /* Disabled placeholder for other courses when instructor */
              <div className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 select-none bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed">
                <span>View Only</span>
              </div>
            )
          ) : (
            /* Normal student Add to Cart / Enrolled button */
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isEnrolled) {
                  onSelectCourse?.(course.id);
                } else if (isInCart) {
                  setCurrentPage?.('cart');
                } else {
                  addToCart?.(course);
                }
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1.5 select-none ${
                isEnrolled
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                  : isInCart
                  ? 'bg-primary text-white hover:opacity-90 border-t border-white/20 shadow-sm'
                  : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 hover:shadow shadow-sm'
              }`}
            >
              {isEnrolled ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Enrolled • Learn Now</span>
                </>
              ) : isInCart ? (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Go to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Card Footer - Author & Rating */}
        <div className="flex items-center justify-between border-t border-[#c7c4d8]/30 dark:border-white/10 pt-4 mt-auto select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 dark:bg-primary-fixed/25 flex items-center justify-center text-[10px] font-bold text-primary dark:text-primary-fixed border border-primary/20">
              {course.author.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="font-semibold text-xs text-on-surface dark:text-slate-300">
              {course.author}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-yellow-500 dark:text-yellow-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold text-xs text-on-surface dark:text-slate-300">{course.rating}</span>
            <span className="text-xs text-on-surface-variant dark:text-slate-500">({course.reviews})</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
