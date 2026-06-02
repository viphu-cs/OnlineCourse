import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import BentoGrid from './components/BentoGrid';
import Categories from './components/Categories';
import Footer from './components/Footer';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

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
        {/* Header Navigation */}
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        
        {/* Main Content Area */}
        <main className="flex-grow pt-28 pb-16 flex flex-col gap-6 md:gap-10">
          <Hero />
          <Stats />
          <BentoGrid />
          <Categories />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
