import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, CheckCircle, Award, Clock, ArrowRight, Play, Flame, Download, Check, Loader2
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const calculateStreak = (sessions) => {
  if (!sessions || sessions.length === 0) return 0;
  
  // Extract unique session dates formatted as YYYY-MM-DD
  const dates = sessions.map(s => s.session_date).sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0,0,0,0);
  
  const todayStr = currentDate.toISOString().split('T')[0];
  
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Check if today or yesterday is studied
  if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
    return 0;
  }
  
  let checkDate = dates.includes(todayStr) ? currentDate : yesterday;
  while (true) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (dates.includes(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

export default function Dashboard({ setCurrentPage, setSelectedCourseId, user, userProfile }) {
  const [loading, setLoading] = useState(true);
  const [courseStats, setCourseStats] = useState([]);
  const [totals, setTotals] = useState({
    enrolledCount: 0,
    completedCount: 0,
    certificatesCount: 0,
    learningHours: 0,
    streakDays: 0
  });

  const [activeTooltip, setActiveTooltip] = useState(null);
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 0 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 },
    { day: 'Fri', hours: 0 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 }
  ]);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch enrollments with course details
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select(`
            status,
            course_id,
            courses (
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
                  order_index
                )
              )
            )
          `)
          .eq('user_id', user.id);

        if (enrollError) throw enrollError;

        // 2. Fetch progress
        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', user.id);

        if (progressError) throw progressError;
        const completedLessonIds = progress ? progress.map(p => p.lesson_id) : [];

        // 3. Fetch study streak
        const { data: sessions, error: sessionsError } = await supabase
          .from('learning_sessions')
          .select('*')
          .eq('user_id', user.id);

        if (sessionsError) throw sessionsError;

        let enrolled = 0;
        let completed = 0;
        let certs = 0;

        const stats = (enrollments || []).map(enroll => {
          const course = enroll.courses;
          if (!course) return null;

          const allLessons = [];
          const sortedChapters = (course.chapters || []).sort((a, b) => a.order_index - b.order_index);
          sortedChapters.forEach(chap => {
            const sortedLessons = (chap.lessons || []).sort((a, b) => a.order_index - b.order_index);
            sortedLessons.forEach(les => {
              allLessons.push(les);
            });
          });

          const totalLessons = allLessons.length;
          const completedInThisCourse = allLessons.filter(l => completedLessonIds.includes(l.id));
          const percent = totalLessons > 0 ? Math.round((completedInThisCourse.length / totalLessons) * 100) : 0;

          enrolled += 1;
          if (percent === 100) {
            completed += 1;
            certs += 1;
          }

          // Resume Point
          let lastChapterIdx = 0;
          let lastLessonIdx = 0;
          const activeChapter = localStorage.getItem(`skillelevate_active_chapter_${course.id}`);
          const activeLesson = localStorage.getItem(`skillelevate_active_lesson_${course.id}`);
          if (activeChapter) lastChapterIdx = parseInt(activeChapter, 10);
          if (activeLesson) lastLessonIdx = parseInt(activeLesson, 10);

          const currentLessonTitle = sortedChapters[lastChapterIdx]?.lessons[lastLessonIdx]?.title || allLessons[0]?.title || 'Introduction';

          return {
            id: course.id,
            title: course.title,
            category: course.category,
            gradient: course.gradient || "from-[#4f46e5] to-emerald-700/60",
            progressPercent: percent,
            resumeTitle: currentLessonTitle,
            curriculum: sortedChapters.map(chap => ({
              chapterTitle: chap.chapter_title,
              lessons: (chap.lessons || []).map(les => ({
                id: les.id,
                title: les.title
              }))
            }))
          };
        }).filter(Boolean);

        const totalDurationSecs = sessions ? sessions.reduce((acc, s) => acc + s.duration_seconds, 0) : 0;
        const totalHours = Math.round(totalDurationSecs / 3600);
        const streak = calculateStreak(sessions);

        // Map weekly hours (Mon - Sun)
        const daysMap = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };
        const tempWeekly = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        (sessions || []).forEach(s => {
          const sDate = new Date(s.session_date);
          if (sDate >= oneWeekAgo) {
            const dayName = daysMap[sDate.getDay()];
            tempWeekly[dayName] = tempWeekly[dayName] + Number((s.duration_seconds / 3600).toFixed(1));
          }
        });

        const finalWeekly = Object.keys(tempWeekly).map(day => ({
          day,
          hours: Number(tempWeekly[day].toFixed(1))
        }));

        setCourseStats(stats);
        setWeeklyData(finalWeekly);
        setTotals({
          enrolledCount: enrolled,
          completedCount: completed,
          certificatesCount: certs,
          learningHours: totalHours,
          streakDays: streak
        });

      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Handler to resume learning course
  const handleResume = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentPage('learning-experience');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Printable mock certificate handler
  const handlePrintCertificate = (courseTitle) => {
    const printWindow = window.open('', '_blank');
    const studentName = userProfile?.full_name || 'SkillElevate Learner';
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate of Completion - ${courseTitle}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f8fafc;
            }
            .cert-card {
              border: 15px double #3525cd;
              padding: 50px;
              width: 800px;
              text-align: center;
              background-color: #ffffff;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h1 { font-size: 42px; color: #0b1c30; margin-bottom: 10px; }
            h2 { font-size: 20px; color: #777587; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; }
            .name { font-size: 32px; font-weight: bold; color: #3525cd; margin: 30px 0; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 5px; min-width: 300px; }
            .course-name { font-size: 28px; font-weight: bold; color: #0b1c30; margin-bottom: 20px; }
            .desc { font-size: 16px; color: #464555; max-width: 600px; margin: 0 auto; line-height: 1.6; }
            .seal { font-size: 80px; margin-top: 40px; color: #e2dfff; }
          </style>
        </head>
        <body>
          <div class="cert-card">
            <h2>Certificate of Completion</h2>
            <div class="seal">🎓</div>
            <p>This is proudly presented to</p>
            <div class="name">${studentName}</div>
            <p>for successfully completing the course</p>
            <div class="course-name">${courseTitle}</div>
            <p class="desc">Demonstrating rigorous expertise, hours of practice, and mastery of all advanced curriculum standards delivered by SkillElevate.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1c30] text-[#0b1c30] dark:text-[#f8f9ff] pt-32 pb-16 px-4 md:px-12 max-w-7xl mx-auto w-full flex flex-col items-center justify-center text-center">
        <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-8 max-w-md level-3-shadow flex flex-col items-center gap-6">
          <BookOpen className="w-16 h-16 text-primary animate-pulse" />
          <h1 className="font-display font-bold text-2xl text-on-surface dark:text-white">Track Your Progress</h1>
          <p className="text-sm text-on-surface-variant dark:text-slate-400 font-medium">
            Sign in to access your dashboard, resume your active lectures, view completions, and download official certificates.
          </p>
          <button 
            onClick={() => setCurrentPage('login')}
            className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1c30] text-[#0b1c30] dark:text-[#f8f9ff] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading student metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1c30] text-[#0b1c30] dark:text-[#f8f9ff] pt-24 pb-16 px-4 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-10">
      
      {/* Header Info */}
      <header className="flex flex-col gap-1">
        <h1 className="font-display font-bold text-3xl md:text-5xl text-on-surface dark:text-white tracking-tight">
          Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Learner'}.
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant dark:text-slate-400 font-medium">
          Here's a summary of your learning progress and upcoming milestones.
        </p>
      </header>

      {/* Grid of Statistics panels */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 select-none">
        
        {/* Stat Card 1 */}
        <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 level-2-shadow transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-center text-on-surface-variant dark:text-slate-400">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Courses Enrolled</span>
            <BookOpen className="w-5 h-5 text-primary dark:text-primary-fixed-dim" />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-on-surface dark:text-white mt-4">
            {totals.enrolledCount}
          </h2>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 level-2-shadow transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-center text-on-surface-variant dark:text-slate-400">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Courses Completed</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-on-surface dark:text-white mt-4">
            {totals.completedCount}
          </h2>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 level-2-shadow transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-center text-on-surface-variant dark:text-slate-400">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Certificates Earned</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-on-surface dark:text-white mt-4">
            {totals.certificatesCount}
          </h2>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 level-2-shadow transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-center text-on-surface-variant dark:text-slate-400">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Learning Hours</span>
            <Clock className="w-5 h-5 text-primary-container dark:text-primary-fixed" />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-on-surface dark:text-white mt-4">
            {totals.learningHours}
          </h2>
        </div>
      </section>

      {/* Main Split Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        
        {/* Left Columns (Active Learning & Recent Activities) */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* Continue Learning card list */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-end border-b border-[#c7c4d8]/20 dark:border-white/5 pb-3">
              <h3 className="font-display font-bold text-lg md:text-xl text-on-surface dark:text-white">
                Continue Learning
              </h3>
              <button 
                onClick={() => setCurrentPage('marketplace')}
                className="text-xs md:text-sm font-bold text-primary dark:text-primary-fixed-dim hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {courseStats.filter(c => c.progressPercent < 100).length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl p-8 text-center text-on-surface-variant dark:text-slate-400 text-sm font-medium select-none level-2-shadow">
                  No active courses in progress. Head to the Marketplace to enroll in a new subject!
                </div>
              ) : (
                courseStats.filter(c => c.progressPercent < 100).map(course => (
                  <div 
                    key={course.id}
                    className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary-fixed-dim/50 rounded-2xl p-5 level-2-shadow transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center group"
                  >
                    <div 
                      className={`w-full sm:w-28 h-20 rounded-xl bg-gradient-to-br ${course.gradient} shrink-0`}
                    />
                    <div className="flex-grow w-full min-w-0">
                      <div className="flex justify-between items-start gap-3 select-none">
                        <span className="text-[10px] font-bold text-primary dark:text-primary-fixed-dim uppercase tracking-widest">{course.category}</span>
                        <span className="bg-slate-50 dark:bg-slate-800 text-on-surface-variant dark:text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">{course.progressPercent}%</span>
                      </div>
                      <h4 className="font-display font-bold text-sm md:text-base text-on-surface dark:text-white truncate mt-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 line-clamp-1">
                        Active: {course.resumeTitle}
                      </p>
                      
                      {/* Course progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3 mb-4 select-none">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>

                      <button
                        onClick={() => handleResume(course.id)}
                        className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Course</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent activities ledger */}
          <section className="flex flex-col gap-4">
            <h3 className="font-display font-bold text-lg md:text-xl text-on-surface dark:text-white border-b border-[#c7c4d8]/20 dark:border-white/5 pb-3">
              Recent Activity
            </h3>
            
            <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl overflow-hidden level-2-shadow">
              <ul className="divide-y divide-[#c7c4d8]/20 dark:divide-white/5">
                {[
                  { id: 1, type: 'lesson', title: 'Lesson: Mastering Design Tokens completed', subtitle: 'Advanced UI/UX Systems Design', time: '2 hours ago' },
                  { id: 2, type: 'quiz', title: 'Quiz: Component Architecture - 95%', subtitle: 'Advanced UI/UX Systems Design', time: 'Yesterday' },
                  { id: 3, type: 'badge', title: "Earned 'CSS Grid Master' Badge", subtitle: 'Full-Stack Web Development Bootcamp', time: '3 days ago' },
                  { id: 4, type: 'lesson', title: 'Lesson: CSS Flexbox & CSS Grid Masterclass completed', subtitle: 'Full-Stack Web Development Bootcamp', time: '4 days ago' }
                ].map(act => (
                  <li 
                    key={act.id} 
                    className="p-4 flex gap-4 items-start hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-primary dark:text-primary-fixed-dim border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                      {act.type === 'lesson' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : act.type === 'quiz' ? (
                        <Award className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Flame className="w-4 h-4 text-red-500 fill-current" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-xs md:text-sm text-on-surface dark:text-white truncate">
                        {act.title}
                      </p>
                      <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                        {act.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap pt-0.5">
                      {act.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>

        {/* Right Columns (Weekly statistics bar-charts & Streak & Certificates) */}
        <div className="flex flex-col gap-10">
          
          {/* Weekly studies hours chart */}
          <section className="flex flex-col gap-4">
            <h3 className="font-display font-bold text-lg md:text-xl text-on-surface dark:text-white border-b border-[#c7c4d8]/20 dark:border-white/5 pb-3">
              Learning Statistics
            </h3>

            <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl p-5 level-2-shadow flex flex-col gap-6 select-none">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs md:text-sm text-on-surface dark:text-white">Weekly Activity</span>
                <span className="text-[11px] font-bold text-slate-400">STUDY HOURS</span>
              </div>

              {/* Chart container */}
              <div className="relative flex items-end justify-between h-32 pt-4 border-b border-[#c7c4d8]/20 dark:border-white/5 pb-2 px-1">
                {weeklyData.map((data, idx) => {
                  const maxHours = 8;
                  const pct = Math.min((data.hours / maxHours) * 100, 100);
                  const isToday = data.day === 'Sun';
                  const isHovered = activeTooltip === idx;

                  return (
                    <div 
                      key={data.day}
                      onMouseEnter={() => setActiveTooltip(idx)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      className="flex-grow flex flex-col items-center justify-end h-full relative group/bar cursor-pointer"
                    >
                      {/* Bar fill element */}
                      <div 
                        className={`w-5 md:w-6 rounded-t-lg transition-all duration-300 ${
                          isToday 
                            ? 'bg-emerald-500 hover:bg-emerald-400' 
                            : 'bg-primary dark:bg-primary-container hover:opacity-85'
                        }`}
                        style={{ height: `${pct}%` }}
                      />

                      {/* Bar tooltip widget */}
                      {isHovered && (
                        <div className="absolute bottom-full mb-1.5 bg-black/95 text-white text-[10px] font-mono font-bold px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
                          {data.hours} hrs
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Days overline tags */}
              <div className="flex justify-between px-1.5 text-[10px] font-bold text-slate-400">
                {weeklyData.map(data => (
                  <span key={data.day} className="w-5 md:w-6 text-center">{data.day[0]}</span>
                ))}
              </div>
            </div>

            {/* Flame continuous login streaks */}
            <div className="bg-primary-container text-white rounded-2xl p-5 shadow flex items-center justify-between level-2-shadow select-none">
              <div>
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Study Streak</p>
                <p className="font-display font-bold text-2xl md:text-3xl mt-1">{totals.streakDays} Days</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/15 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <Flame className="w-6 h-6 text-yellow-400 fill-current animate-bounce" />
              </div>
            </div>
          </section>

          {/* Course completion certificates grid */}
          <section className="flex flex-col gap-4">
            <h3 className="font-display font-bold text-lg md:text-xl text-on-surface dark:text-white border-b border-[#c7c4d8]/20 dark:border-white/5 pb-3">
              My Certificates
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Completed Course Certificates */}
              {courseStats.filter(c => c.progressPercent === 100).length === 0 ? (
                <div className="col-span-2 bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl p-5 text-center text-on-surface-variant dark:text-slate-400 text-xs font-medium level-2-shadow select-none">
                  Complete 100% of any course to unlock your official completion certificate!
                </div>
              ) : (
                courseStats.filter(c => c.progressPercent === 100).map(course => (
                  <div 
                    key={course.id}
                    className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/20 dark:border-white/5 rounded-2xl overflow-hidden level-2-shadow group transition-all"
                  >
                    <div className={`h-20 bg-gradient-to-br ${course.gradient} opacity-85 group-hover:opacity-100 transition-opacity`} />
                    <div className="p-3 select-none flex flex-col gap-1.5">
                      <h4 
                        className="font-bold text-xs text-on-surface dark:text-white truncate"
                        title={course.title}
                      >
                        {course.title}
                      </h4>
                      <button 
                        onClick={() => handlePrintCertificate(course.title)}
                        className="text-[10px] font-bold text-primary dark:text-primary-fixed-dim hover:underline flex items-center gap-1 self-start cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Print PDF</span>
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Demo Default Static Certificates for UI completeness (per design template screenshot specs) */}
              <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/25 dark:border-white/5 rounded-2xl overflow-hidden level-2-shadow group transition-all">
                <div className="h-20 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="p-3 select-none flex flex-col gap-1.5">
                  <h4 className="font-bold text-xs text-on-surface dark:text-white truncate" title="Front-End Foundations">
                    Front-End Foundations
                  </h4>
                  <button 
                    onClick={() => handlePrintCertificate("Front-End Foundations")}
                    className="text-[10px] font-bold text-primary dark:text-primary-fixed-dim hover:underline flex items-center gap-1 self-start cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/25 dark:border-white/5 rounded-2xl overflow-hidden level-2-shadow group transition-all">
                <div className="h-20 bg-gradient-to-br from-emerald-800 to-slate-900 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="p-3 select-none flex flex-col gap-1.5">
                  <h4 className="font-bold text-xs text-on-surface dark:text-white truncate" title="Agile Methodology Masterclass">
                    Agile Methodology Masterclass
                  </h4>
                  <button 
                    onClick={() => handlePrintCertificate("Agile Methodology Masterclass")}
                    className="text-[10px] font-bold text-primary dark:text-primary-fixed-dim hover:underline flex items-center gap-1 self-start cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
