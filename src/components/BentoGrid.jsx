import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from './CourseCard';

const COURSES_DATA = [
  {
    id: 1,
    title: "Full-Stack Web Development Bootcamp",
    category: "Development",
    price: "$89",
    rating: "4.9",
    reviews: "2.4k",
    author: "Sarah Wong",
    tag: "Bestseller",
    gradient: "from-[#4f46e5] to-emerald-700/60",
    description: "Master modern web technologies from frontend to backend. React, Node.js, and Postgres."
  },
  {
    id: 2,
    title: "Advanced UI/UX Systems Design",
    category: "Design",
    price: "$65",
    rating: "4.8",
    reviews: "1.8k",
    author: "Marcus Doe",
    tag: null,
    gradient: "from-amber-600 to-[#ba1a1a]/50",
    description: "Create scalable design systems and master Figma components for enterprise applications."
  },
  {
    id: 3,
    title: "Applied Machine Learning Models",
    category: "AI & Data",
    price: "$120",
    rating: "5.0",
    reviews: "900",
    author: "Dr. Elena Rostova",
    tag: "New",
    gradient: "from-slate-900 to-[#4f46e5]/70",
    description: "Practical guide to deploying LLMs and building AI-driven applications using Python."
  }
];

const CATEGORIES = ["All", "Development", "Design", "AI & Data"];

export default function BentoGrid() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCourses = activeCategory === "All"
    ? COURSES_DATA
    : COURSES_DATA.filter(course => course.category === activeCategory);

  return (
    <section id="courses" className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      {/* Header and Filter Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-6 text-left w-full select-none">
        <div>
          <h2 className="font-bold text-3xl md:text-4xl text-on-background dark:text-white mb-2 tracking-tight font-display">
            Level Up with Our Best Courses
          </h2>
          <p className="text-base text-on-surface-variant dark:text-slate-400">
            Curated programs to accelerate your professional career.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2.5 bg-slate-100 dark:bg-slate-800/40 p-1.5 rounded-full border border-[#c7c4d8]/20 dark:border-white/5">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setActiveCategory(category);
                  }
                }}
                tabIndex={0}
                className={`relative px-5 py-2 rounded-full text-xs font-bold transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                  isActive
                    ? "text-white"
                    : "text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-primary rounded-full z-0 shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter items-stretch">
        <AnimatePresence>
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
