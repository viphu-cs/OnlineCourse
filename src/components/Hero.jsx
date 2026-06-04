import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Star, GraduationCap } from 'lucide-react';


export default function Hero({ setCurrentPage }) {
  const videoRef = useRef(null);
  const isInView = useInView(videoRef, { once: false, amount: 0.2 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView) {
      video.currentTime = 0;
      video.play().catch(err => {
        console.log("Video auto-play failed: ", err);
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isInView]);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 100 }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative w-full min-h-[600px] h-[75vh] md:h-[80vh] flex items-center overflow-hidden z-10 select-none">
      {/* Background Video */}
      <video 
        ref={videoRef}
        src="/hero-video.mp4"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover -z-20" 
      />

      {/* Dark/Light Side Gradient Mask Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9ff] via-[#f8f9ff]/95 to-[#f8f9ff]/50 dark:from-[#0b1c30] dark:via-[#0b1c30]/95 dark:to-[#0b1c30]/50 md:bg-gradient-to-r md:from-[#f8f9ff] md:via-[#f8f9ff]/95 md:to-transparent md:dark:from-[#0b1c30] md:dark:via-[#0b1c30]/95 md:dark:to-transparent -z-10 pointer-events-none" />

      {/* Foreground Content Container */}
      <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 md:px-margin-desktop flex items-center justify-between h-full relative z-10 pt-28">
        
        {/* Content Box — left-aligned, constrained to prevent overflow */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5 md:gap-6 max-w-full sm:max-w-2xl md:max-w-2xl text-left py-10 md:py-0 w-full relative z-20 items-start overflow-hidden"
        >
          {/* Tag Badge */}
          <div className="flex flex-col gap-3 md:gap-3.5 items-start">
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-primary-fixed/20 dark:bg-primary-fixed/10 py-1.5 px-4 rounded-full w-fit border border-primary/10 dark:border-primary-fixed/5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-xs text-primary dark:text-primary-fixed uppercase tracking-wider">
                New Courses Added Weekly
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              variants={itemVariants}
              className="font-bold text-[28px] sm:text-4xl md:text-5xl lg:text-[54px] text-on-background dark:text-white leading-[1.15] tracking-tight font-display text-balance"
            >
              Master Future Skills <br className="hidden sm:block" />
              <span className="text-primary dark:text-primary-fixed"> Online</span>
            </motion.h1>
          </div>

          {/* Description */}
          <motion.div 
            variants={itemVariants}
            className="w-full py-1"
          >
            <p className="font-normal text-[15px] md:text-base text-on-surface-variant dark:text-slate-300 leading-relaxed text-pretty">
              Join over 10 million learners to gain the skills needed for tomorrow's challenges.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto"
          >
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                if (setCurrentPage) {
                  setCurrentPage('marketplace');
                }
              }}
              className="inline-flex justify-center items-center gap-2 font-semibold text-[15px] md:text-sm bg-primary hover:bg-primary-container text-white min-h-[48px] md:min-h-0 py-3.5 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border-t border-white/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer w-full sm:w-auto"
            >
              Explore Courses
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            
            <motion.a 
              whileHover={{ scale: 1.02, bg: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
              href="#" 
              className="inline-flex justify-center items-center gap-2 font-semibold text-[15px] md:text-sm bg-transparent text-on-surface dark:text-slate-200 border border-[#c7c4d8]/60 dark:border-white/10 min-h-[48px] md:min-h-0 py-3.5 px-8 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none w-full sm:w-auto"
            >
              Become Instructor
            </motion.a>
          </motion.div>

          {/* Ratings & Avatars */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-row items-center gap-4 sm:gap-6 mt-4 pt-5 md:pt-6 border-t border-[#c7c4d8]/30 dark:border-white/10 w-full justify-start"
          >
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#e5eeff] dark:bg-slate-800 border-2 border-white dark:border-[#0b1c30] flex items-center justify-center text-xs text-[#0b1c30] dark:text-[#e2dfff] font-bold shadow-sm">
                AJ
              </div>
              <div className="w-10 h-10 rounded-full bg-[#c3c0ff] dark:bg-slate-700 border-2 border-white dark:border-[#0b1c30] flex items-center justify-center text-xs text-primary dark:text-[#c3c0ff] font-bold shadow-sm">
                SD
              </div>
              <div className="w-10 h-10 rounded-full bg-[#4edea3] dark:bg-slate-600 border-2 border-white dark:border-[#0b1c30] flex items-center justify-center text-xs text-secondary dark:text-[#4edea3] font-bold shadow-sm">
                MR
              </div>
              <div className="w-10 h-10 rounded-full bg-primary hover:scale-105 border-2 border-white dark:border-[#0b1c30] flex items-center justify-center text-[10px] text-white font-bold shadow-sm cursor-pointer transition-transform">
                +10k
              </div>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex text-yellow-500 dark:text-yellow-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-xs text-on-surface-variant dark:text-slate-400 mt-1">
                4.9/5 from 10k+ reviews
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Active Learners Badge (Absolute bottom right of container context) */}
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 right-4 md:right-margin-desktop hidden md:flex glass-panel rounded-2xl p-5 items-center gap-4 shadow-xl z-20 border border-white/40 dark:border-white/10 will-change-transform"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary-fixed/15 text-primary dark:text-primary-fixed flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-medium text-xs text-on-surface-variant dark:text-slate-400">Active Learners</p>
            <p className="font-bold text-2xl text-on-surface dark:text-white tracking-tight">10,000,000+</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
