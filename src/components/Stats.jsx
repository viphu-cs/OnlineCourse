import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS_DATA = [
  { id: 1, label: "Active Learners", value: 10, suffix: "M+", step: 1 },
  { id: 2, label: "Premium Courses", value: 25, suffix: "K+", step: 1 },
  { id: 3, label: "Average Rating", value: 4.9, suffix: "/5", step: 0.1 },
  { id: 4, label: "Completion Rate", value: 98, suffix: "%", step: 2 }
];

function CountUpNumber({ value, suffix, step }) {
  const [currentVal, setCurrentVal] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const duration = 1200; // ms
    const intervalTime = 30; // ms
    const totalSteps = duration / intervalTime;
    const increment = value / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCurrentVal(value);
        clearInterval(timer);
      } else {
        // Handle decimal format for rating
        if (step % 1 !== 0) {
          setCurrentVal(Number(start.toFixed(1)));
        } else {
          setCurrentVal(Math.floor(start));
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isInView, value, step]);

  return (
    <span ref={ref}>
      {currentVal}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 select-none">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-[#f8f9ff] dark:bg-[#0f172a] rounded-3xl p-8 md:p-10 border border-[#c7c4d8]/40 dark:border-white/5 level-2-shadow">
        {STATS_DATA.map((stat, index) => (
          <div 
            key={stat.id} 
            className={`flex flex-col items-center justify-center text-center p-4 ${
              index !== STATS_DATA.length - 1 ? 'lg:border-r border-[#c7c4d8]/30 dark:border-white/10' : ''
            }`}
          >
            <h3 className="font-bold text-3xl md:text-4xl lg:text-[44px] text-primary dark:text-primary-fixed tracking-tight">
              <CountUpNumber value={stat.value} suffix={stat.suffix} step={stat.step} />
            </h3>
            <p className="font-semibold text-xs md:text-sm text-on-surface-variant dark:text-slate-400 mt-2 uppercase tracking-widest">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
