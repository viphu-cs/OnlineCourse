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
import { supabase } from './supabaseClient';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Supabase Auth and Profile state
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  // Fetch student enrollments
  const fetchEnrollments = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId);
      if (error) throw error;
      if (data) {
        setEnrolledCourseIds(data.map(e => e.course_id));
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  };

  // Sync auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchEnrollments(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchEnrollments(session.user.id);
      } else {
        setUserProfile(null);
        setEnrolledCourseIds([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('landing');
  };

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

  // Fetch courses dynamically from Supabase
  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          chapters (
            id,
            chapter_title,
            duration,
            order_index,
            lessons (
              id,
              title,
              duration,
              content,
              order_index
            )
          )
        `);

      if (error) throw error;

      if (data) {
        const mapped = data.map(dbCourse => {
          const sortedChapters = (dbCourse.chapters || []).sort((a, b) => a.order_index - b.order_index);
          const mappedChapters = sortedChapters.map(chap => {
            const sortedLessons = (chap.lessons || []).sort((a, b) => a.order_index - b.order_index);
            return {
              id: chap.id,
              chapterTitle: chap.chapter_title,
              duration: chap.duration,
              lessons: sortedLessons.map(les => ({
                id: les.id,
                title: les.title,
                duration: les.duration,
                content: les.content
              }))
            };
          });

          return {
            id: dbCourse.id,
            title: dbCourse.title,
            category: dbCourse.category,
            price: dbCourse.price_val === 0 ? 'Free' : `$${dbCourse.price_val}`,
            priceVal: Number(dbCourse.price_val),
            rating: dbCourse.author_rating ? dbCourse.author_rating.split(' ')[0] : '4.9',
            reviews: 120, // fallback mock count
            author: dbCourse.author_name,
            authorId: dbCourse.author_id,
            authorRole: dbCourse.author_role,
            authorBio: dbCourse.author_bio,
            authorRating: dbCourse.author_rating,
            authorStudents: dbCourse.author_students,
            tag: dbCourse.tag,
            duration: dbCourse.duration,
            difficulty: dbCourse.difficulty,
            gradient: dbCourse.gradient,
            description: dbCourse.description,
            objectives: dbCourse.objectives || [],
            requirements: dbCourse.requirements || [],
            curriculum: mappedChapters
          };
        });

        setCourses(mapped);
        localStorage.setItem('skillelevate_courses', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error('Error fetching courses from Supabase:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [session]); // refetch when session changes (e.g. login/logout)

  const getCourseById = (id) => courses.find(c => String(c.id) === String(id));

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentPage('course-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isInstructor = userProfile?.role === 'instructor' || userProfile?.role === 'admin';

  // Navigate to Course Builder to edit a specific course
  const handleEditCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentPage('course-builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guard cart/checkout pages for instructors
  const handleSetCurrentPage = (page) => {
    if (isInstructor && (page === 'cart' || page === 'checkout')) {
      return; // Silently block navigation
    }
    setCurrentPage(page);
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
            setCurrentPage={handleSetCurrentPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cartItems={cartItems}
            session={session}
            userProfile={userProfile}
            onLogout={handleLogout}
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
                  <BentoGrid 
                    courses={courses} 
                    enrolledCourseIds={enrolledCourseIds} 
                    onSelectCourse={handleSelectCourse} 
                    addToCart={addToCart} 
                    cartItems={cartItems} 
                    setCurrentPage={handleSetCurrentPage}
                    userProfile={userProfile}
                    onEditCourse={handleEditCourse}
                  />
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
                <Marketplace 
                  courses={courses} 
                  enrolledCourseIds={enrolledCourseIds} 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                  onSelectCourse={handleSelectCourse} 
                  addToCart={addToCart} 
                  cartItems={cartItems} 
                  setCurrentPage={handleSetCurrentPage}
                  userProfile={userProfile}
                  onEditCourse={handleEditCourse}
                />
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
                  setCurrentPage={handleSetCurrentPage} 
                  addToCart={addToCart}
                  cartItems={cartItems}
                  setSelectedCourseId={setSelectedCourseId}
                  enrolledCourseIds={enrolledCourseIds}
                  userProfile={userProfile}
                  onEditCourse={handleEditCourse}
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
                  user={session?.user}
                  userProfile={userProfile}
                  onCheckoutSuccess={() => { if (session?.user) fetchEnrollments(session.user.id); }}
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
                  user={session?.user}
                  userProfile={userProfile}
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
                  course={getCourseById(selectedCourseId || (courses.length > 0 ? courses[0].id : null))} 
                  courses={courses}
                  setCourses={setCourses}
                  setCurrentPage={setCurrentPage}
                  setSelectedCourseId={setSelectedCourseId}
                  user={session?.user}
                  userProfile={userProfile}
                  fetchCourses={fetchCourses}
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
                <Auth initialMode={currentPage} setCurrentPage={setCurrentPage} session={session} userProfile={userProfile} />
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
                  user={session?.user}
                  userProfile={userProfile}
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

