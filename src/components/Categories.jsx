import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Terminal, Briefcase, Palette, Megaphone } from 'lucide-react';

const CATEGORY_ITEMS = [
  { id: 1, name: "AI & Data", icon: <Brain className="w-7 h-7" /> },
  { id: 2, name: "Programming", icon: <Terminal className="w-7 h-7" /> },
  { id: 3, name: "Business", icon: <Briefcase className="w-7 h-7" /> },
  { id: 4, name: "Design", icon: <Palette className="w-7 h-7" /> },
  { id: 5, name: "Marketing", icon: <Megaphone className="w-7 h-7" /> }
];

export default function Categories() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', damping: 15 }
    }
  };

  return (
    <section className="relative max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl bg-[#f8f9ff]/50 dark:bg-slate-900/30 rounded-3xl my-lg border border-[#c7c4d8]/20 dark:border-white/5 shadow-sm overflow-hidden select-none">
      {/* Decorative Blur Blob */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-lg relative z-10">
        <h2 className="font-bold text-3xl md:text-4xl text-on-background dark:text-white mb-2 tracking-tight font-display">
          Explore Popular Categories
        </h2>
        <p className="text-base text-on-surface-variant dark:text-slate-400">
          Find the perfect roadmap for your next big career milestone.
        </p>
      </div>

      {/* Categories Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10 w-full"
      >
        {CATEGORY_ITEMS.map((item) => (
          <motion.a
            key={item.id}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            href="#"
            className="flex flex-col items-center justify-center p-6 md:p-8 bg-[#f8f9ff] dark:bg-[#0f172a] rounded-2xl border border-[#c7c4d8]/40 dark:border-white/5 level-2-shadow hover:border-primary dark:hover:border-primary-fixed/30 transition-colors duration-300 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-primary dark:text-primary-fixed flex items-center justify-center mb-4 group-hover:bg-primary-fixed dark:group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              {item.icon}
            </div>
            <h4 className="font-bold text-sm md:text-base text-on-surface dark:text-slate-200 group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">
              {item.name}
            </h4>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}
