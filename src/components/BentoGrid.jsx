import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from './CourseCard';
import { COURSES_DATA } from '../data/coursesData';

const CATEGORIES = ["All", "Development", "Design", "AI & Data"];

const CATEGORY_MAP = {
  "Development": "Web Development",
  "Design": "Design & UX",
  "AI & Data": "AI & Machine Learning"
};

export default function BentoGrid({ courses = [], enrolledCourseIds = [], onSelectCourse, addToCart, cartItems, setCurrentPage, userProfile, onEditCourse }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const coursesToUse = courses && courses.length > 0 ? courses : COURSES_DATA;

  // Filter and show the first 3 matching courses for Bento view
  const filteredCourses = activeCategory === "All"
    ? coursesToUse.slice(0, 3)
    : coursesToUse.filter(course => course.category === CATEGORY_MAP[activeCategory]);

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
              <CourseCard 
                course={course} 
                onSelectCourse={onSelectCourse} 
                addToCart={addToCart} 
                cartItems={cartItems} 
                setCurrentPage={setCurrentPage} 
                isEnrolled={enrolledCourseIds.includes(course.id)}
                userProfile={userProfile}
                onEditCourse={onEditCourse}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
