import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Code, Palette, Cpu, Briefcase } from 'lucide-react';

export default function CourseCard({ course }) {
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
      layout
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
