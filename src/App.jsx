import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import BentoGrid from './components/BentoGrid';
import Categories from './components/Categories';
import Footer from './components/Footer';
import Marketplace from './components/Marketplace';
import CourseDetails from './components/CourseDetails';
import Checkout from './components/Checkout';
import LearningExperience from './components/LearningExperience';
import Dashboard from './components/Dashboard';
import CourseBuilder from './components/CourseBuilder';
import Cart from './components/Cart';
import Auth from './components/Auth';
import { getCourseById as staticGetCourseById, COURSES_DATA } from './data/coursesData';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Shopping Cart state with localStorage persistence
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('skillelevate_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync cart items to localStorage
  useEffect(() => {
    localStorage.setItem('skillelevate_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (course) => {
    if (!cartItems.some(item => item.id === course.id)) {
      setCartItems(prev => [...prev, course]);
    }
  };

  const removeFromCart = (courseId) => {
    setCartItems(prev => prev.filter(item => item.id !== courseId));
  };

  const clearCart = () => {
    setCartItems([]);
  };
  
  // Reactive courses state synchronized with localStorage
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('skillelevate_courses');
    return saved ? JSON.parse(saved) : COURSES_DATA;
  });

  const getCourseById = (id) => courses.find(c => c.id === parseInt(id));

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentPage('course-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync dark mode state with document class list
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1c30] text-[#0b1c30] dark:text-[#f8f9ff] flex flex-col font-sans transition-colors duration-300 antialiased selection:bg-primary/20 dark:selection:bg-primary-fixed/20 overflow-x-hidden">
      {/* Dynamic Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary/5 dark:bg-primary/3 rounded-full blur-[160px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/2 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Navigation - suppressed on learning experience, course builder & auth pages */}
        {currentPage !== 'learning-experience' && currentPage !== 'course-builder' && currentPage !== 'login' && currentPage !== 'signup' && (
          <Navbar 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cartItems={cartItems}
          />
        )}
        
        {/* Main Content Area */}
        <main className={`flex-grow flex flex-col ${currentPage === 'login' || currentPage === 'signup' ? '' : 'pb-16'}`}>
          <AnimatePresence mode="wait">
            {currentPage === 'landing' ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col"
              >
                <Hero setCurrentPage={setCurrentPage} />
                <div className="flex flex-col gap-6 md:gap-10 pt-6 md:pt-10">
                  <Stats />
                  <BentoGrid onSelectCourse={handleSelectCourse} addToCart={addToCart} cartItems={cartItems} setCurrentPage={setCurrentPage} />
                  <Categories setCurrentPage={setCurrentPage} setSearchQuery={setSearchQuery} />
                </div>
              </motion.div>
            ) : currentPage === 'marketplace' ? (
              <motion.div
                key="marketplace"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="pt-28"
              >
                <Marketplace searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectCourse={handleSelectCourse} addToCart={addToCart} cartItems={cartItems} setCurrentPage={setCurrentPage} />
              </motion.div>
            ) : currentPage === 'course-details' ? (
              <motion.div
                key="course-details"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <CourseDetails 
                  course={getCourseById(selectedCourseId)} 
                  setCurrentPage={setCurrentPage} 
                  addToCart={addToCart}
                  cartItems={cartItems}
                  setSelectedCourseId={setSelectedCourseId}
                />
              </motion.div>
            ) : currentPage === 'checkout' ? (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Checkout 
                  course={selectedCourseId ? getCourseById(selectedCourseId) : null} 
                  cartItems={cartItems}
                  clearCart={clearCart}
                  setCurrentPage={setCurrentPage} 
                  setSelectedCourseId={setSelectedCourseId}
                />
              </motion.div>
            ) : currentPage === 'cart' ? (
              <motion.div
                key="cart"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Cart 
                  cartItems={cartItems}
                  removeFromCart={removeFromCart}
                  setCurrentPage={setCurrentPage} 
                  setSelectedCourseId={setSelectedCourseId}
                />
              </motion.div>
            ) : currentPage === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Dashboard 
                  setCurrentPage={setCurrentPage}
                  setSelectedCourseId={setSelectedCourseId}
                />
              </motion.div>
            ) : currentPage === 'course-builder' ? (
              <motion.div
                key="course-builder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full flex flex-col"
              >
                <CourseBuilder 
                  course={getCourseById(selectedCourseId || 1)} 
                  courses={courses}
                  setCourses={setCourses}
                  setCurrentPage={setCurrentPage}
                  setSelectedCourseId={setSelectedCourseId}
                />
              </motion.div>
            ) : currentPage === 'login' || currentPage === 'signup' ? (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Auth initialMode={currentPage} setCurrentPage={setCurrentPage} />
              </motion.div>
            ) : (
              <motion.div
                key="learning-experience"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <LearningExperience 
                  course={getCourseById(selectedCourseId)} 
                  setCurrentPage={setCurrentPage}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Footer - suppressed on learning experience, course builder & auth pages */}
        {currentPage !== 'learning-experience' && currentPage !== 'course-builder' && currentPage !== 'login' && currentPage !== 'signup' && <Footer />}
      </div>
    </div>
  );
}

