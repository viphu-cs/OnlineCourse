import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Filter, X, SlidersHorizontal, BookOpen, DollarSign, Award, Grid } from 'lucide-react';
import CourseCard from './CourseCard';

const COURSES_DATA = [
  {
    id: 1,
    title: "Advanced React Patterns & Performance",
    category: "Web Development",
    price: "$89.99",
    priceVal: 89.99,
    rating: "4.9",
    reviews: 2400,
    author: "Sarah Drasner",
    tag: "React 19",
    duration: "12 hours",
    difficulty: "Advanced",
    dateAdded: "2026-05-15",
    gradient: "from-indigo-600 to-emerald-600/75",
    description: "Deep dive into advanced state management, custom renderers, Concurrent features, and React Server Components."
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals",
    category: "AI & Machine Learning",
    price: "Free",
    priceVal: 0,
    rating: "4.8",
    reviews: 15000,
    author: "Andrew Ng",
    tag: "AI/ML",
    duration: "24 hours",
    difficulty: "Beginner",
    dateAdded: "2026-03-10",
    gradient: "from-slate-900 to-indigo-950/80",
    description: "Build a strong foundation in linear regression, classification, neural networks, and clustering with Python."
  },
  {
    id: 3,
    title: "Product Management 101",
    category: "Business Strategy",
    price: "$49.99",
    priceVal: 49.99,
    rating: "4.7",
    reviews: 1200,
    author: "Lenny Rachitsky",
    tag: "Product",
    duration: "8 hours",
    difficulty: "Beginner",
    dateAdded: "2026-04-20",
    gradient: "from-amber-600 to-rose-700/60",
    description: "Learn client discovery, write actionable PRDs, optimize engineering sprint cycles, and structure roadmaps."
  },
  {
    id: 4,
    title: "Modern UI/UX Design Systems",
    category: "Design & UX",
    price: "$79.99",
    priceVal: 79.99,
    rating: "4.9",
    reviews: 3200,
    author: "MDS",
    tag: "Figma",
    duration: "15 hours",
    difficulty: "Intermediate",
    dateAdded: "2026-05-01",
    gradient: "from-pink-500 to-violet-650/80",
    description: "Establish scalable UI libraries using variables, component properties, advanced auto-layout, and handoff guides."
  },
  {
    id: 5,
    title: "AI-Driven Product Design",
    category: "AI & Machine Learning",
    price: "$99.99",
    priceVal: 99.99,
    rating: "4.6",
    reviews: 850,
    author: "Dr. Elena Rostova",
    tag: "AI Art",
    duration: "10 hours",
    difficulty: "Intermediate",
    dateAdded: "2026-05-25",
    gradient: "from-cyan-900 to-emerald-900/60",
    description: "Create human-centered designs centered around generative LLMs, prompt interfaces, and dynamic layouts."
  },
  {
    id: 6,
    title: "Next.js 15 App Router Deep Dive",
    category: "Web Development",
    price: "$69.99",
    priceVal: 69.99,
    rating: "4.8",
    reviews: 1950,
    author: "Lee Robinson",
    tag: "Next.js",
    duration: "14 hours",
    difficulty: "Intermediate",
    dateAdded: "2026-05-29",
    gradient: "from-neutral-800 to-slate-900/90",
    description: "Master React Server Actions, routing lifecycles, full-scale static caching, and edge middleware optimization."
  },
  {
    id: 7,
    title: "Financial Modeling & Valuations",
    category: "Business Strategy",
    price: "$129.99",
    priceVal: 129.99,
    rating: "4.7",
    reviews: 940,
    author: "John Doe",
    tag: "Finance",
    duration: "18 hours",
    difficulty: "Advanced",
    dateAdded: "2026-02-15",
    gradient: "from-emerald-700 to-teal-900/80",
    description: "Develop professional three-statement operating models, DCF outputs, and merger analyses from scratch."
  },
  {
    id: 8,
    title: "Creative Coding with WebGL & Three.js",
    category: "Design & UX",
    price: "Free",
    priceVal: 0,
    rating: "4.9",
    reviews: 1100,
    author: "Yuri Artiukh",
    tag: "WebGL",
    duration: "20 hours",
    difficulty: "Advanced",
    dateAdded: "2026-05-10",
    gradient: "from-purple-900 to-rose-900/70",
    description: "Animate interactive 3D structures, customize vertex and fragment GLSL shaders, and optimize GPU processing."
  },
  {
    id: 9,
    title: "Data Structures & Algorithms in Go",
    category: "Web Development",
    price: "$59.99",
    priceVal: 59.99,
    rating: "4.5",
    reviews: 720,
    author: "Rob Pike",
    tag: "GoLang",
    duration: "16 hours",
    difficulty: "Intermediate",
    dateAdded: "2026-01-20",
    gradient: "from-sky-700 to-indigo-900/80",
    description: "Implement binary trees, graphs, sorting routines, dynamic programming, and complexity estimates in Go."
  },
  {
    id: 10,
    title: "Deep Learning Architectures",
    category: "AI & Machine Learning",
    price: "$149.99",
    priceVal: 149.99,
    rating: "5.0",
    reviews: 4300,
    author: "Geoff Hinton",
    tag: "Deep Learning",
    duration: "32 hours",
    difficulty: "Advanced",
    dateAdded: "2026-05-20",
    gradient: "from-blue-900 to-indigo-950",
    description: "Design convolutional neural nets, transformers, autoencoders, and training weights at scale."
  },
  {
    id: 11,
    title: "Designing for Growth & Scale",
    category: "Design & UX",
    price: "$59.99",
    priceVal: 59.99,
    rating: "4.8",
    reviews: 1600,
    author: "Julie Zhuo",
    tag: "Growth UX",
    duration: "9 hours",
    difficulty: "Beginner",
    dateAdded: "2026-05-02",
    gradient: "from-violet-600 to-pink-700/60",
    description: "Implement product experiments, onboarding flows, A/B feedback tests, and data-backed UX design."
  },
  {
    id: 12,
    title: "Executive Leadership Essentials",
    category: "Business Strategy",
    price: "Free",
    priceVal: 0,
    rating: "4.6",
    reviews: 2100,
    author: "Sheryl Sandberg",
    tag: "Leadership",
    duration: "6 hours",
    difficulty: "Advanced",
    dateAdded: "2026-02-28",
    gradient: "from-teal-600 to-emerald-950/80",
    description: "Build high-performing collaborative teams, manage global changes, and steer organizational culture."
  }
];

const CATEGORIES = ["AI & Machine Learning", "Web Development", "Business Strategy", "Design & UX"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const PRICE_RANGES = ["Free", "Paid"];

export default function Marketplace({ searchQuery, setSearchQuery }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [visibleCount, setVisibleCount] = useState(6);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync category cards click to sidebar checkbox filters
  useEffect(() => {
    if (searchQuery && CATEGORIES.includes(searchQuery)) {
      setSelectedCategories([searchQuery]);
      setSearchQuery('');
    }
  }, [searchQuery, setSearchQuery]);

  // Toggle handlers
  const handleToggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setVisibleCount(6);
  };

  const handleTogglePrice = (priceRange) => {
    setSelectedPriceRanges(prev => 
      prev.includes(priceRange) ? prev.filter(p => p !== priceRange) : [...prev, priceRange]
    );
    setVisibleCount(6);
  };

  const handleToggleDifficulty = (diff) => {
    setSelectedDifficulties(prev => 
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    );
    setVisibleCount(6);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedDifficulties([]);
    setSearchQuery('');
    setSortBy('Most Popular');
    setVisibleCount(6);
  };

  const handleLocalSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter computation
  const filteredCourses = COURSES_DATA.filter((course) => {
    const matchesSearch = 
      searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategories.length === 0 || 
      selectedCategories.includes(course.category);

    const matchesPrice = 
      selectedPriceRanges.length === 0 || 
      selectedPriceRanges.some(range => {
        if (range === 'Free') return course.priceVal === 0;
        if (range === 'Paid') return course.priceVal > 0;
        return true;
      });

    const matchesDifficulty = 
      selectedDifficulties.length === 0 || 
      selectedDifficulties.includes(course.difficulty);

    return matchesSearch && matchesCategory && matchesPrice && matchesDifficulty;
  });

  // Sort computation
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'Most Popular') {
      return b.reviews - a.reviews;
    }
    if (sortBy === 'Newest') {
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    }
    if (sortBy === 'Highest Rated') {
      return parseFloat(b.rating) - parseFloat(a.rating);
    }
    return 0;
  });

  const displayedCourses = sortedCourses.slice(0, visibleCount);
  const hasMore = sortedCourses.length > visibleCount;

  return (
    <section id="courses" className="max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-8 md:py-12 select-none relative">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-5%] right-[-10%] w-[350px] h-[350px] bg-primary/5 dark:bg-primary-fixed/2 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[-5%] w-[350px] h-[350px] bg-emerald-500/5 dark:bg-emerald-500/2 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Page Header */}
      <div className="text-left mb-8 md:mb-12">
        <h1 className="font-bold text-3xl md:text-5xl text-[#0b1c30] dark:text-[#f8f9ff] mb-3 tracking-tight font-display">
          Premium Knowledge Hub
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant dark:text-slate-400 max-w-2xl leading-relaxed">
          Level up your credentials. Filter and browse through our exclusive database of expert-led masterclasses.
        </p>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-[#c7c4d8]/40 dark:border-white/5 p-6 level-2-shadow transition-colors duration-300">
          <div className="flex justify-between items-center pb-4 border-b border-[#c7c4d8]/30 dark:border-white/10">
            <h3 className="font-bold text-lg text-[#0b1c30] dark:text-[#f8f9ff] flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary dark:text-primary-fixed" />
              Filters
            </h3>
            {(selectedCategories.length > 0 || selectedPriceRanges.length > 0 || selectedDifficulties.length > 0 || searchQuery) && (
              <button 
                onClick={handleResetFilters}
                className="text-xs font-semibold text-primary dark:text-primary-fixed hover:underline transition-all cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0b1c30]/60 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Categories
            </h4>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-3 text-sm text-[#0b1c30]/80 dark:text-slate-300 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleToggleCategory(category)}
                    className="rounded border-[#c7c4d8] text-primary focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 w-4.5 h-4.5 cursor-pointer accent-primary" 
                  />
                  <span className="group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors text-left">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#c7c4d8]/30 dark:border-white/10 w-full" />

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0b1c30]/60 dark:text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Price Range
            </h4>
            <div className="space-y-2">
              {PRICE_RANGES.map((price) => (
                <label key={price} className="flex items-center gap-3 text-sm text-[#0b1c30]/80 dark:text-slate-300 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedPriceRanges.includes(price)}
                    onChange={() => handleTogglePrice(price)}
                    className="rounded border-[#c7c4d8] text-primary focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 w-4.5 h-4.5 cursor-pointer accent-primary" 
                  />
                  <span className="group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">{price}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#c7c4d8]/30 dark:border-white/10 w-full" />

          {/* Difficulty */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0b1c30]/60 dark:text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Difficulty
            </h4>
            <div className="space-y-2">
              {DIFFICULTIES.map((diff) => (
                <label key={diff} className="flex items-center gap-3 text-sm text-[#0b1c30]/80 dark:text-slate-300 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedDifficulties.includes(diff)}
                    onChange={() => handleToggleDifficulty(diff)}
                    className="rounded border-[#c7c4d8] text-primary focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 w-4.5 h-4.5 cursor-pointer accent-primary" 
                  />
                  <span className="group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">{diff}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN MARKETPLACE AREA */}
        <div className="col-span-1 lg:col-span-9 space-y-6">
          
          {/* SEARCH, SORT & MOBILE FILTER BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#c7c4d8]/40 dark:border-white/5 level-2-shadow transition-colors duration-300">
            {/* Search Input Box */}
            <div className="relative flex-grow max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant dark:text-slate-400 pointer-events-none" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleLocalSearchChange}
                placeholder="Search courses, mentors..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-surface dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions: Counter, Sorter, Mobile Toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-3 font-semibold text-sm">
              
              {/* Dynamic Counters */}
              <span className="text-xs text-on-surface-variant dark:text-slate-400 shrink-0 font-medium">
                Showing {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}
              </span>

              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant dark:text-slate-300 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              {/* Sort Selector */}
              <div className="relative shrink-0">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white cursor-pointer select-none font-medium transition-colors"
                >
                  <option value="Most Popular">Most Popular</option>
                  <option value="Newest">Newest</option>
                  <option value="Highest Rated">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant dark:text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER BADGES */}
          {(selectedCategories.length > 0 || selectedPriceRanges.length > 0 || selectedDifficulties.length > 0) && (
            <div className="flex flex-wrap gap-2 items-center text-left">
              <span className="text-xs font-semibold text-on-surface-variant dark:text-slate-400">Active:</span>
              {selectedCategories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 dark:bg-primary-fixed/20 text-primary dark:text-primary-fixed text-xs font-bold rounded-full">
                  {cat}
                  <button onClick={() => handleToggleCategory(cat)} className="cursor-pointer hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedPriceRanges.map(pr => (
                <span key={pr} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary-container/20 text-on-secondary-container dark:text-emerald-300 text-xs font-bold rounded-full">
                  {pr}
                  <button onClick={() => handleTogglePrice(pr)} className="cursor-pointer hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedDifficulties.map(d => (
                <span key={d} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-300 text-xs font-bold rounded-full">
                  {d}
                  <button onClick={() => handleToggleDifficulty(d)} className="cursor-pointer hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}

          {/* COURSE CARDS GRID */}
          {displayedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter items-stretch">
              <AnimatePresence>
                {displayedCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full"
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#c7c4d8]/40 dark:border-white/5 py-16 px-6 text-center level-2-shadow transition-colors"
            >
              <Grid className="w-12 h-12 text-[#c7c4d8] dark:text-slate-600 mx-auto mb-4 animate-pulse" />
              <h3 className="font-bold text-xl text-[#0b1c30] dark:text-[#f8f9ff] mb-2 font-display">No courses found</h3>
              <p className="text-sm text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto mb-6">
                We couldn't find any courses matching your search criteria. Try modifying your filters or clear them to start over.
              </p>
              <button 
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-semibold rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
              >
                Reset All Filters
              </button>
            </motion.div>
          )}

          {/* LOAD MORE BUTTON */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button 
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 px-8 py-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface dark:text-slate-200 font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer flex items-center gap-2"
              >
                Load More Masterclasses
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS SIDE DRAWER */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#0f172a] z-50 p-6 flex flex-col gap-6 shadow-2xl border-l border-[#c7c4d8]/40 dark:border-white/5 lg:hidden overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#c7c4d8]/30 dark:border-white/10">
                <h3 className="font-bold text-lg text-[#0b1c30] dark:text-[#f8f9ff] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary dark:text-primary-fixed" />
                  Filters
                </h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-on-surface dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0b1c30]/60 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Categories
                </h4>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center gap-3 text-sm text-[#0b1c30]/80 dark:text-slate-300 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleToggleCategory(category)}
                        className="rounded border-[#c7c4d8] text-primary focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 w-4.5 h-4.5 cursor-pointer accent-primary" 
                      />
                      <span className="group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors text-left">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#c7c4d8]/30 dark:border-white/10 w-full" />

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0b1c30]/60 dark:text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Price Range
                </h4>
                <div className="space-y-2">
                  {PRICE_RANGES.map((price) => (
                    <label key={price} className="flex items-center gap-3 text-sm text-[#0b1c30]/80 dark:text-slate-300 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={selectedPriceRanges.includes(price)}
                        onChange={() => handleTogglePrice(price)}
                        className="rounded border-[#c7c4d8] text-primary focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 w-4.5 h-4.5 cursor-pointer accent-primary" 
                      />
                      <span className="group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">{price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#c7c4d8]/30 dark:border-white/10 w-full" />

              {/* Difficulty */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0b1c30]/60 dark:text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Difficulty
                </h4>
                <div className="space-y-2">
                  {DIFFICULTIES.map((diff) => (
                    <label key={diff} className="flex items-center gap-3 text-sm text-[#0b1c30]/80 dark:text-slate-300 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={selectedDifficulties.includes(diff)}
                        onChange={() => handleToggleDifficulty(diff)}
                        className="rounded border-[#c7c4d8] text-primary focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 w-4.5 h-4.5 cursor-pointer accent-primary" 
                      />
                      <span className="group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">{diff}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset/Apply actions */}
              <div className="mt-auto pt-6 border-t border-[#c7c4d8]/30 dark:border-white/10 flex gap-3">
                <button 
                  onClick={handleResetFilters}
                  className="flex-1 py-2.5 border border-[#c7c4d8]/50 dark:border-white/10 rounded-full text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-container text-white rounded-full text-sm font-semibold transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
