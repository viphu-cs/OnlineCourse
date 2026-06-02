import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, GraduationCap } from 'lucide-react';
import heroArt from '../assets/hero-art.png';

export default function Hero() {
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
    <section className="relative max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pt-12 pb-xl grid grid-cols-1 lg:grid-cols-2 gap-xl items-center overflow-visible">
      {/* Dynamic Background Blur Blobs */}
      <div className="absolute top-10 -left-48 w-80 h-80 bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute -top-32 -right-48 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Hero Content Left */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 z-10 text-left"
      >
        {/* Title & Badge Group (Tighter spatial grouping for visual rhythm) */}
        <div className="flex flex-col gap-3.5">
          {/* Weekly Tag Badge */}
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
            className="font-bold text-4xl md:text-5xl lg:text-[54px] text-on-background dark:text-white leading-[1.1] tracking-tight font-display text-balance"
          >
            Master Future Skills <br />
            <span className="text-primary dark:text-primary-fixed">Online</span>
          </motion.h1>
        </div>

        {/* Description (Polished side-by-side horizontal split for visual rhythm variety) */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 items-stretch max-w-2xl py-2 text-left"
        >
          {/* Segment 1 */}
          <p className="font-normal text-base text-on-surface-variant dark:text-slate-300 flex-1 leading-relaxed text-pretty">
            Join over 10 million learners to gain the skills needed for tomorrow's challenges.
          </p>
          
          {/* Visual Divider (Only visible on sm screens and up, self-stretches) */}
          <div className="w-full h-px sm:w-px bg-[#c7c4d8]/40 dark:bg-white/10 shrink-0 hidden sm:block" />
          
          {/* Segment 2 */}
          <p className="font-normal text-base text-on-surface-variant/80 dark:text-slate-400 flex-1 leading-relaxed text-pretty">
            High-impact learning designed specifically for modern professionals.
          </p>
        </motion.div>

        {/* Action CTAs (Generous spacing offset) */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <motion.a 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            href="#courses" 
            className="inline-flex justify-center items-center gap-2 font-semibold text-sm bg-primary hover:bg-primary-container text-white py-3.5 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border-t border-white/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Explore Courses
            <ArrowRight className="w-4 h-4" />
          </motion.a>
          
          <motion.a 
            whileHover={{ scale: 1.02, bg: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.98 }}
            href="#" 
            className="inline-flex justify-center items-center gap-2 font-semibold text-sm bg-transparent text-on-surface dark:text-slate-200 border border-[#c7c4d8]/60 dark:border-white/10 py-3.5 px-8 rounded-full hover:bg-slate-100/50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Become Instructor
          </motion.a>
        </motion.div>

        {/* Team Avatars & Star Rating */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-6 mt-6 pt-6 border-t border-[#c7c4d8]/30 dark:border-white/10"
        >
          {/* Avatar Pile */}
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

          {/* Rating Stars */}
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

      {/* Hero Image Right */}
      <motion.div 
        variants={imageVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-visible z-10 flex items-center justify-center"
      >
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 group cursor-pointer">
          <img 
            alt="Diverse students learning online" 
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-[1.2s] ease-[0.16, 1, 0.3, 1]" 
            src={heroArt}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/40 dark:from-[#0b1c30]/70 via-transparent to-transparent opacity-80 pointer-events-none" />
        </div>

        {/* Floating Glass Card (Active Learners) */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-6 right-6 md:-left-8 md:right-auto md:w-80 glass-panel rounded-2xl p-5 flex items-center gap-4 shadow-xl z-20 border border-white/40 dark:border-white/10 will-change-transform"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary-fixed/15 text-primary dark:text-primary-fixed flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-medium text-xs text-on-surface-variant dark:text-slate-400">Active Learners</p>
            <p className="font-bold text-2xl text-on-surface dark:text-white tracking-tight">10,000,000+</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
