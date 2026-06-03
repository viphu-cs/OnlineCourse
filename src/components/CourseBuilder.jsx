import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, ChevronUp, ChevronDown, Trash2, FileText, Play,
  Code, Settings, Layout, HelpCircle, Save, Upload,
  Eye, Check, ArrowLeft, ArrowUpRight, CheckCircle, Video, List, Link as LinkIcon,
  Users, DollarSign, Star, BookOpen, Sparkles, AlertCircle
} from 'lucide-react';

export default function CourseBuilder({ 
  courses, 
  setCourses, 
  setCurrentPage, 
  setSelectedCourseId 
}) {
  // Creator-specific states
  const [editingCourseId, setEditingCourseId] = useState(null);
  
  // Selected item inside active course outline
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // Active course reference
  const course = courses.find(c => c.id === editingCourseId);

  // Status state
  const [isPublished, setIsPublished] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Filter courses owned by the user (Alex Carter)
  const myCourses = courses.filter(c => c.author === "Alex Carter");

  // Sync editor fields on active lesson change
  useEffect(() => {
    if (course) {
      const currentChapter = course.curriculum[activeChapterIdx];
      const currentLesson = currentChapter?.lessons[activeLessonIdx];
      if (currentLesson) {
        setDraftTitle(currentLesson.title || '');
        setDraftDesc(currentLesson.content || `This document outlines the core objectives, reading materials, and instructions for the ${currentLesson.title} lesson. Please review it carefully.`);
        setMediaList(currentLesson.media || [
          { id: 'm-1', name: 'Worksheet_Reference.pdf', size: '2.4 MB', type: 'PDF' }
        ]);
        setIsPublished(course.tag === "Published" || course.priceVal > 0);
      }
    }
  }, [activeChapterIdx, activeLessonIdx, editingCourseId]);

  // Inject a default template course if Alex Carter has no courses yet, ensuring the page looks premium and populated on first launch
  useEffect(() => {
    if (myCourses.length === 0) {
      const templateCourse = {
        id: 101,
        title: "Next.js 14 Developer Blueprint",
        category: "Web Development",
        price: "$49.99",
        priceVal: 49.99,
        rating: "5.0",
        reviews: 0,
        author: "Alex Carter",
        authorRole: "Senior Tech Educator",
        authorBio: "Expert professional developer.",
        tag: "Draft",
        duration: "8 hours",
        difficulty: "Intermediate",
        gradient: "from-[#4f46e5] to-emerald-700/60",
        description: "Learn server actions, routing, rendering modes, and advanced Next.js features.",
        objectives: [
          "Master Next.js App Router and server side actions",
          "Build scalable production applications with PostgreSQL backing",
          "Implement responsive styled frameworks and layouts"
        ],
        requirements: [
          "Intermediate knowledge of React.js and modern JavaScript principles."
        ],
        curriculum: [
          {
            chapterTitle: "Chapter 1: Routing & Rendering",
            duration: "30 mins",
            lessons: [
              { title: "Introduction to Server Actions", duration: "10:00", content: "Learn how to use server-side mutations with form actions directly..." },
              { title: "Static vs Dynamic Rendering Modes", duration: "20:00", content: "Optimize page generation speed using static caching mechanisms..." }
            ]
          }
        ]
      };
      const updated = [...courses, templateCourse];
      setCourses(updated);
      localStorage.setItem('skillelevate_courses', JSON.stringify(updated));
    }
  }, []);

  // Add Chapter handler
  const handleAddChapter = () => {
    if (!course) return;
    const title = prompt("Enter Chapter Title:");
    if (!title) return;

    const newChapter = {
      chapterTitle: `Chapter ${course.curriculum.length + 1}: ${title}`,
      duration: "0 mins",
      lessons: [
        { title: "Introduction Lecture", duration: "10:00", content: "Welcome to this new lecture. Start typing content..." }
      ]
    };

    const updatedCurriculum = [...course.curriculum, newChapter];
    updateCourseCurriculum(updatedCurriculum);
    setActiveChapterIdx(course.curriculum.length); // go to new chapter
    setActiveLessonIdx(0);
  };

  // Add Lesson handler
  const handleAddLesson = (cIdx) => {
    if (!course) return;
    const title = prompt("Enter Lesson Title:");
    if (!title) return;

    const newLesson = {
      title,
      duration: "10:00",
      content: "Start typing content for this lesson here..."
    };

    const updatedCurriculum = [...course.curriculum];
    updatedCurriculum[cIdx].lessons.push(newLesson);
    updateCourseCurriculum(updatedCurriculum);
    
    // Set active lesson to new one
    setActiveChapterIdx(cIdx);
    setActiveLessonIdx(updatedCurriculum[cIdx].lessons.length - 1);
  };

  // Delete Lesson handler
  const handleDeleteLesson = (cIdx, lIdx) => {
    if (!course) return;
    if (course.curriculum[cIdx].lessons.length <= 1) {
      alert("Each chapter must have at least one lesson.");
      return;
    }

    if (!confirm("Are you sure you want to delete this lesson?")) return;

    const updatedCurriculum = [...course.curriculum];
    updatedCurriculum[cIdx].lessons.splice(lIdx, 1);
    updateCourseCurriculum(updatedCurriculum);

    // Adjust active indices if current active lesson was deleted
    if (activeChapterIdx === cIdx && activeLessonIdx === lIdx) {
      setActiveLessonIdx(0);
    }
  };

  // Delete Chapter handler
  const handleDeleteChapter = (cIdx) => {
    if (!course) return;
    if (course.curriculum.length <= 1) {
      alert("A course must have at least one chapter.");
      return;
    }

    if (!confirm("Are you sure you want to delete this chapter and all its lessons?")) return;

    const updatedCurriculum = [...course.curriculum];
    updatedCurriculum.splice(cIdx, 1);
    updateCourseCurriculum(updatedCurriculum);

    setActiveChapterIdx(0);
    setActiveLessonIdx(0);
  };

  // Edit Chapter Title handler
  const handleEditChapterTitle = (cIdx) => {
    if (!course) return;
    const oldTitle = course.curriculum[cIdx].chapterTitle;
    const newTitle = prompt("Edit Chapter Title:", oldTitle);
    if (!newTitle || newTitle === oldTitle) return;

    const updatedCurriculum = [...course.curriculum];
    updatedCurriculum[cIdx].chapterTitle = newTitle;
    updateCourseCurriculum(updatedCurriculum);
  };

  // Update unified courses list helper
  const updateCourseCurriculum = (newCurriculum) => {
    const updatedCourses = courses.map(c => {
      if (c.id === course.id) {
        return {
          ...c,
          curriculum: newCurriculum
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    localStorage.setItem('skillelevate_courses', JSON.stringify(updatedCourses));
  };

  // Save changes to active lesson title & contents
  const handleSaveLessonChanges = () => {
    if (!course) return;
    const currentChapter = course.curriculum[activeChapterIdx];
    const currentLesson = currentChapter?.lessons[activeLessonIdx];
    if (!currentLesson) return;

    const updatedCurriculum = [...course.curriculum];
    updatedCurriculum[activeChapterIdx].lessons[activeLessonIdx] = {
      ...currentLesson,
      title: draftTitle,
      content: draftDesc,
      media: mediaList
    };

    const updatedCourses = courses.map(c => {
      if (c.id === course.id) {
        return {
          ...c,
          tag: isPublished ? "Published" : "Draft",
          curriculum: updatedCurriculum
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    localStorage.setItem('skillelevate_courses', JSON.stringify(updatedCourses));

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  // Create Course Flow
  const handleCreateCourse = () => {
    const title = prompt("Enter New Course Name:");
    if (!title) return;
    const newId = Date.now();
    const newCourse = {
      id: newId,
      title,
      category: "Web Development",
      price: "$49.99",
      priceVal: 49.99,
      rating: "5.0",
      reviews: 0,
      author: "Alex Carter",
      authorRole: "Senior Tech Educator",
      authorBio: "Expert professional developer.",
      tag: "Draft",
      duration: "4 hours",
      difficulty: "Beginner",
      gradient: "from-[#4f46e5] to-emerald-700/60",
      description: "New course created inside Instructor Studio builder.",
      objectives: ["Learn foundations", "Build production projects"],
      curriculum: [
        {
          chapterTitle: "Chapter 1: Kickoff",
          duration: "10 mins",
          lessons: [
            { title: "First Lesson Overview", duration: "10:00", content: "Write details here..." }
          ]
        }
      ]
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem('skillelevate_courses', JSON.stringify(updated));
    setEditingCourseId(newId);
    setActiveChapterIdx(0);
    setActiveLessonIdx(0);
  };

  // Delete Course Flow
  const handleDeleteCourse = (cId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    const updated = courses.filter(c => c.id !== cId);
    setCourses(updated);
    localStorage.setItem('skillelevate_courses', JSON.stringify(updated));
    if (editingCourseId === cId) {
      setEditingCourseId(null);
    }
  };

  // Mock upload file trigger
  const handleMockUpload = () => {
    const names = ["Coding_Script_V2.js", "Layout_Guidelines_Grid.pdf", "Mockup_Asset_JSON.json", "Lecture_CheatSheet.pdf"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const size = `${(Math.random() * 5 + 1).toFixed(1)} MB`;
    const type = randomName.endsWith('.pdf') ? 'PDF' : randomName.endsWith('.js') ? 'JS' : 'JSON';

    const newMedia = {
      id: `m-${Date.now()}`,
      name: randomName,
      size,
      type
    };

    setMediaList(prev => [...prev, newMedia]);
  };

  const handleDeleteMedia = (id) => {
    setMediaList(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="bg-[#f8f9ff] dark:bg-[#0b1c30] text-[#0b1c30] dark:text-[#f8f9ff] min-h-screen h-screen overflow-hidden flex font-sans transition-colors duration-300">
      
      {/* Sidebar Navigation (Instructor Studio Panel) - Premium Dark Theme */}
      <nav className="bg-[#0b1c30] text-slate-300 border-r border-white/10 hidden md:flex flex-col p-6 space-y-4 w-64 h-full shrink-0 z-10 shadow-lg">
        <div className="mb-6 select-none">
          <h1 className="font-display font-bold text-lg md:text-xl text-white">Creator Studio</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Management Hub</p>
        </div>

        <button 
          onClick={handleCreateCourse}
          className="w-full bg-primary hover:bg-primary-container text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-md transition-all cursor-pointer border-t border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>

        <div className="flex-grow space-y-1 select-none">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white text-left font-semibold text-xs transition-all cursor-pointer"
          >
            <Layout className="w-4 h-4 text-slate-400" />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('marketplace')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white text-left font-semibold text-xs transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>Marketplace</span>
          </button>

          <button 
            onClick={() => setEditingCourseId(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
              editingCourseId === null 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <List className="w-4 h-4 text-primary-fixed-dim" />
            <span>My Studio Courses</span>
          </button>
        </div>

        {/* Switch to Student Hub */}
        <div className="pt-4 border-t border-white/5 select-none">
          <button 
            onClick={() => {
              setCurrentPage('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Student View</span>
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {editingCourseId === null ? (
          
          /* INSTRUCTOR DASHBOARD VIEW */
          <motion.main 
            key="studio-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-grow overflow-y-auto p-6 md:p-10 bg-[#f8f9ff] dark:bg-[#0b1c30]/40 text-[#0b1c30] dark:text-[#f8f9ff] flex flex-col gap-8 md:gap-10 text-left"
          >
            <header className="flex flex-col gap-1 select-none">
              <h1 className="font-display font-bold text-2xl md:text-4xl text-on-surface dark:text-white tracking-tight">
                Instructor Studio Dashboard
              </h1>
              <p className="text-xs md:text-sm text-on-surface-variant dark:text-slate-400 font-medium">
                Review course metrics, update syllabus parameters, and manage published programs.
              </p>
            </header>

            {/* Creator Metrics Panel */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 select-none">
              
              <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 level-2-shadow flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
                  <Users className="w-4.5 h-4.5 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-on-surface dark:text-white mt-3">1,428</h2>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 level-2-shadow flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Course Rating</span>
                  <Star className="w-4.5 h-4.5 text-yellow-500 fill-current" />
                </div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-on-surface dark:text-white mt-3">4.9 / 5.0</h2>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 level-2-shadow flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Monthly Revenue</span>
                  <DollarSign className="w-4.5 h-4.5 text-emerald-500" />
                </div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-on-surface dark:text-white mt-3">$3,250.00</h2>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 level-2-shadow flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Completion Rate</span>
                  <CheckCircle className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-on-surface dark:text-white mt-3">78%</h2>
              </div>

            </section>

            {/* Courses list */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#c7c4d8]/20 dark:border-white/5 pb-3">
                <h2 className="font-display font-bold text-lg md:text-xl text-on-surface dark:text-white">
                  My Authored Courses
                </h2>
                <button 
                  onClick={handleCreateCourse}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Course</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => setEditingCourseId(c.id)}
                    className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl overflow-hidden level-2-shadow hover:border-primary/40 dark:hover:border-primary-fixed/30 transition-all cursor-pointer flex flex-col group"
                  >
                    <div className={`h-28 bg-gradient-to-br ${c.gradient} opacity-85 group-hover:opacity-100 transition-opacity flex items-center justify-center relative`}>
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-white/90 dark:bg-slate-950/90 text-on-surface dark:text-white">
                        {c.category}
                      </span>
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase ${
                        c.tag === 'Published' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                      }`}>
                        {c.tag || 'Draft'}
                      </span>
                      <BookOpen className="w-8 h-8 text-white opacity-80" />
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between text-left gap-3">
                      <div>
                        <h4 className="font-display font-bold text-sm md:text-base text-on-surface dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                          {c.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant dark:text-slate-400 line-clamp-2 mt-1">
                          {c.description}
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-t border-[#c7c4d8]/20 dark:border-white/5 pt-3">
                        <span className="font-mono text-xs font-bold text-on-surface dark:text-white">
                          {c.price}
                        </span>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingCourseId(c.id); }}
                            className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary dark:hover:text-primary-fixed rounded-lg transition-colors cursor-pointer"
                            title="Edit Curriculum"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteCourse(c.id, e)}
                            className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.main>

        ) : (

          /* SYLLABUS CURRICULUM EDITOR VIEW */
          <React.Fragment key="studio-editor">
            
            {/* Secondary Panel: Course curriculum list outline */}
            <aside className="w-80 bg-slate-50 dark:bg-slate-900 border-r border-[#c7c4d8]/30 dark:border-white/5 flex flex-col h-full shrink-0 z-10 text-left">
              <div className="p-5 border-b border-[#c7c4d8]/20 dark:border-white/5 flex justify-between items-center select-none bg-white dark:bg-slate-900">
                <h2 className="font-display font-bold text-base md:text-lg text-on-surface dark:text-white">Course Structure</h2>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">
                  {course?.difficulty}
                </span>
              </div>

              {/* Chapters/Lessons accordion in Sidebar */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {course?.curriculum.map((chapter, cIdx) => (
                  <div 
                    key={cIdx}
                    className="bg-white dark:bg-slate-950 rounded-xl border border-[#c7c4d8]/20 dark:border-white/5 overflow-hidden shadow-sm"
                  >
                    {/* Chapter header */}
                    <div className="bg-slate-50/50 dark:bg-slate-900 p-3 flex items-center justify-between border-b border-[#c7c4d8]/15 dark:border-white/5 group">
                      <span 
                        className="font-bold text-xs md:text-sm text-on-surface dark:text-white truncate pr-1 cursor-pointer hover:text-primary"
                        onClick={() => handleEditChapterTitle(cIdx)}
                        title="Click to Rename"
                      >
                        {chapter.chapterTitle}
                      </span>
                      
                      <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditChapterTitle(cIdx)}
                          className="text-slate-400 hover:text-primary p-1 rounded transition-colors cursor-pointer"
                          title="Rename Chapter"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteChapter(cIdx)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons inside chapter */}
                    <div className="p-1.5 space-y-0.5">
                      {chapter.lessons.map((lesson, lIdx) => {
                        const isCurrent = activeChapterIdx === cIdx && activeLessonIdx === lIdx;
                        return (
                          <div 
                            key={lIdx}
                            onClick={() => {
                              setActiveChapterIdx(cIdx);
                              setActiveLessonIdx(lIdx);
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all group/item ${
                              isCurrent 
                                ? 'bg-primary/10 text-primary dark:bg-primary-fixed-dim/15 dark:text-primary-fixed-dim font-bold'
                                : 'text-on-surface-variant dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {lesson.media && lesson.media[0]?.type === 'PDF' ? (
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <Play className="w-4 h-4 text-primary shrink-0" />
                              )}
                              <span className="text-xs md:text-sm truncate pr-1">{lesson.title}</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLesson(cIdx, lIdx);
                              }}
                              className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer opacity-0 group-hover/item:opacity-100"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add lesson button */}
                    <button 
                      onClick={() => handleAddLesson(cIdx)}
                      className="w-full text-center py-2 text-primary dark:text-primary-fixed-dim font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border-t border-[#c7c4d8]/15 dark:border-white/5 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lesson</span>
                    </button>
                  </div>
                ))}

                {/* Add chapter button (Dashed border) */}
                <button 
                  onClick={handleAddChapter}
                  className="w-full border-2 border-dashed border-[#c7c4d8]/50 hover:border-primary dark:border-white/10 dark:hover:border-primary-fixed-dim/50 rounded-xl py-4 text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-white/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Chapter</span>
                </button>
              </div>
            </aside>

            {/* Main Course Editor Canvas */}
            <main className="flex-grow flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden relative text-left">
              
              {/* Editor Top Status Header */}
              <header className="h-16 border-b border-[#c7c4d8]/30 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-10 bg-white dark:bg-slate-950 select-none">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setEditingCourseId(null)}
                    className="mr-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Studio</span>
                  </button>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  <div className="flex bg-slate-50 dark:bg-slate-900 rounded-xl p-1 border border-slate-200/50 dark:border-slate-800">
                    <button 
                      onClick={() => setIsPublished(false)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !isPublished 
                          ? 'bg-white dark:bg-slate-800 shadow-sm text-on-background dark:text-white' 
                          : 'text-on-surface-variant dark:text-slate-400'
                      }`}
                    >
                      Draft
                    </button>
                    <button 
                      onClick={() => setIsPublished(true)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isPublished 
                          ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-500' 
                          : 'text-on-surface-variant dark:text-slate-400'
                      }`}
                    >
                      Published
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      if (course) {
                        setSelectedCourseId(course.id);
                        setCurrentPage('learning-experience');
                      }
                    }}
                    className="text-xs font-bold text-on-surface-variant dark:text-slate-300 hover:text-primary transition-colors px-4 py-2.5 rounded-xl border border-[#c7c4d8]/40 dark:border-white/10 hover:border-primary/50 cursor-pointer"
                  >
                    Preview Lesson
                  </button>
                  <button 
                    onClick={handleSaveLessonChanges}
                    className="bg-primary hover:bg-primary-container text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </header>

              {/* Text/Media Editor Canvas Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9ff] dark:bg-[#0b1c30]/40">
                <div className="max-w-[760px] mx-auto space-y-8 pb-16">
                  
                  {/* Title editing input */}
                  <section className="space-y-4">
                    <input 
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Lesson Title..."
                      className="w-full bg-transparent text-3xl font-display font-bold text-on-background dark:text-white border-none outline-none focus:outline-none focus:ring-0 p-0 placeholder-slate-300"
                    />
                    
                    {/* Rich-Text styled mock editing container */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#c7c4d8]/30 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
                      
                      {/* Formatting toolbar */}
                      <div className="flex items-center gap-1.5 border-b border-[#c7c4d8]/15 dark:border-white/5 p-2 bg-slate-50/50 dark:bg-slate-900 select-none">
                        {['format_bold', 'format_italic', 'format_underlined'].map((format, i) => (
                          <button 
                            key={i} 
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">{format}</span>
                          </button>
                        ))}
                        <div className="w-px h-5 bg-[#c7c4d8]/20 dark:bg-white/5 mx-1" />
                        {['format_list_bulleted', 'format_list_numbered'].map((format, i) => (
                          <button 
                            key={i} 
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">{format}</span>
                          </button>
                        ))}
                        <div className="w-px h-5 bg-[#c7c4d8]/20 dark:bg-white/5 mx-1" />
                        <button className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
                          <span className="material-symbols-outlined text-[18px]">link</span>
                        </button>
                      </div>

                      {/* Main Textarea */}
                      <textarea 
                        value={draftDesc}
                        onChange={(e) => setDraftDesc(e.target.value)}
                        placeholder="Start typing the lesson content here..."
                        className="w-full min-h-[240px] border-0 focus:ring-0 p-5 text-sm md:text-base text-on-surface-variant dark:text-slate-300 resize-y bg-transparent placeholder-slate-400 font-medium leading-relaxed"
                      />
                    </div>
                  </section>

                  {/* Media uploads management */}
                  <section className="space-y-4">
                    <h3 className="font-display font-bold text-base md:text-lg text-on-surface dark:text-white">
                      Lesson Media Resources
                    </h3>
                    
                    {/* Media lists */}
                    <div className="space-y-2">
                      {mediaList.map(media => (
                        <div 
                          key={media.id}
                          className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-[#c7c4d8]/20 dark:border-white/5 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/5 text-primary rounded-lg shrink-0">
                              {media.type === 'PDF' ? <FileText className="w-5 h-5 text-primary" /> : <Code className="w-5 h-5 text-emerald-500" />}
                            </div>
                            <div>
                              <p className="font-semibold text-xs md:text-sm text-on-surface dark:text-white truncate">
                                {media.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {media.type} • {media.size}
                              </p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleDeleteMedia(media.id)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Upload drag drop box */}
                    <div 
                      onClick={handleMockUpload}
                      className="border-2 border-dashed border-[#c7c4d8]/40 hover:border-primary dark:border-white/5 dark:hover:border-primary-fixed-dim/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white dark:hover:bg-slate-900/40 transition-all cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary dark:bg-primary-fixed-dim/10 dark:text-primary-fixed-dim mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-xs md:text-sm text-on-surface dark:text-white">
                        Click to add materials or drag-and-drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1 select-none font-medium">
                        Supports PDF, JSON, ZIP, or mp4 (max. 500MB)
                      </p>
                    </div>
                  </section>

                </div>
              </div>

              {/* Float Save Success notification */}
              <AnimatePresence>
                {showSaveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.9 }}
                    className="absolute bottom-6 right-6 bg-slate-900 border border-white/10 px-5 py-3 rounded-xl flex items-center gap-2.5 text-white shadow-2xl z-30 select-none text-xs md:text-sm font-semibold"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>Syllabus layout updated successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>

            </main>
          </React.Fragment>

        )}
      </AnimatePresence>

    </div>
  );
}
