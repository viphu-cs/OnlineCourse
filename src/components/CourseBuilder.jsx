import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, ChevronUp, ChevronDown, Trash2, FileText, Play,
  Code, Settings, Layout, HelpCircle, Save, Upload,
  Eye, Check, ArrowLeft, ArrowUpRight, CheckCircle, Video, List, Link as LinkIcon,
  Users, DollarSign, Star, BookOpen, Sparkles, AlertCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function CourseBuilder({ 
  courses, 
  setCourses, 
  setCurrentPage, 
  setSelectedCourseId,
  user,
  userProfile,
  fetchCourses
}) {
  // Creator-specific states
  const [editingCourseId, setEditingCourseId] = useState(null);
  
  // Selected item inside active course outline
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // Active course reference
  const course = courses.find(c => String(c.id) === String(editingCourseId));

  // Status state
  const [isPublished, setIsPublished] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Filter courses owned by the user or all if admin
  const myCourses = courses.filter(c => c.authorId === user?.id || userProfile?.role === 'admin');

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

  // Add Chapter handler
  const handleAddChapter = async () => {
    if (!course) return;
    const title = prompt("Enter Chapter Title:");
    if (!title) return;

    try {
      const orderIdx = course.curriculum.length;
      // 1. Insert chapter
      const { data: newChapter, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          course_id: course.id,
          chapter_title: `Chapter ${orderIdx + 1}: ${title}`,
          duration: "10 mins",
          order_index: orderIdx
        })
        .select()
        .single();

      if (chapterError) throw chapterError;

      // 2. Insert default lesson
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert({
          chapter_id: newChapter.id,
          title: "Introduction Lecture",
          duration: "10:00",
          content: "Welcome to this new lecture. Start typing content...",
          order_index: 0
        });

      if (lessonError) throw lessonError;

      await fetchCourses();
      setActiveChapterIdx(orderIdx);
      setActiveLessonIdx(0);
    } catch (err) {
      console.error("Error adding chapter:", err);
      alert("Error adding chapter: " + err.message);
    }
  };

  // Add Lesson handler
  const handleAddLesson = async (cIdx) => {
    if (!course) return;
    const chapter = course.curriculum[cIdx];
    if (!chapter) return;

    const title = prompt("Enter Lesson Title:");
    if (!title) return;

    try {
      const orderIdx = chapter.lessons.length;
      const { error } = await supabase
        .from('lessons')
        .insert({
          chapter_id: chapter.id,
          title,
          duration: "10:00",
          content: "Start typing content for this lesson here...",
          order_index: orderIdx
        });

      if (error) throw error;

      await fetchCourses();
      setActiveChapterIdx(cIdx);
      setActiveLessonIdx(orderIdx);
    } catch (err) {
      console.error("Error adding lesson:", err);
      alert("Error: " + err.message);
    }
  };

  // Delete Lesson handler
  const handleDeleteLesson = async (cIdx, lIdx) => {
    if (!course) return;
    const chapter = course.curriculum[cIdx];
    if (!chapter) return;

    if (chapter.lessons.length <= 1) {
      alert("Each chapter must have at least one lesson.");
      return;
    }

    const lesson = chapter.lessons[lIdx];
    if (!lesson) return;

    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      if (error) throw error;

      await fetchCourses();
      setActiveLessonIdx(0);
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Error: " + err.message);
    }
  };

  // Delete Chapter handler
  const handleDeleteChapter = async (cIdx) => {
    if (!course) return;
    if (course.curriculum.length <= 1) {
      alert("A course must have at least one chapter.");
      return;
    }

    const chapter = course.curriculum[cIdx];
    if (!chapter) return;

    if (!confirm("Are you sure you want to delete this chapter and all its lessons?")) return;

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapter.id);

      if (error) throw error;

      await fetchCourses();
      setActiveChapterIdx(0);
      setActiveLessonIdx(0);
    } catch (err) {
      console.error("Error deleting chapter:", err);
      alert("Error: " + err.message);
    }
  };

  // Edit Chapter Title handler
  const handleEditChapterTitle = async (cIdx) => {
    if (!course) return;
    const chapter = course.curriculum[cIdx];
    if (!chapter) return;

    const newTitle = prompt("Edit Chapter Title:", chapter.chapterTitle);
    if (!newTitle || newTitle === chapter.chapterTitle) return;

    try {
      const { error } = await supabase
        .from('chapters')
        .update({ chapter_title: newTitle })
        .eq('id', chapter.id);

      if (error) throw error;
      await fetchCourses();
    } catch (err) {
      console.error("Error updating chapter title:", err);
      alert("Error: " + err.message);
    }
  };

  // Save changes to active lesson title & contents
  const handleSaveLessonChanges = async () => {
    if (!course) return;
    const chapter = course.curriculum[activeChapterIdx];
    const lesson = chapter?.lessons[activeLessonIdx];
    if (!lesson) return;

    try {
      // 1. Update lesson
      const { error: lessonError } = await supabase
        .from('lessons')
        .update({
          title: draftTitle,
          content: draftDesc
        })
        .eq('id', lesson.id);

      if (lessonError) throw lessonError;

      // 2. Update course status
      const { error: courseError } = await supabase
        .from('courses')
        .update({
          status: isPublished ? "Published" : "Draft"
        })
        .eq('id', course.id);

      if (courseError) throw courseError;

      await fetchCourses();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Error saving lesson changes:", err);
      alert("Error: " + err.message);
    }
  };

  // Create Course Flow
  const handleCreateCourse = async () => {
    const title = prompt("Enter New Course Name:");
    if (!title) return;

    try {
      // 1. Insert course
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          title,
          category: "Web Development",
          price_val: 49.99,
          author_id: user?.id,
          author_name: userProfile?.full_name || "Instructor",
          author_role: "Senior Tech Educator",
          author_bio: "Expert professional developer.",
          difficulty: "Beginner",
          gradient: "from-[#4f46e5] to-emerald-700/60",
          description: "New course created inside Instructor Studio builder.",
          objectives: ["Learn foundations", "Build production projects"],
          status: "Draft"
        })
        .select()
        .single();
      
      if (courseError) throw courseError;

      // 2. Insert default Chapter
      const { data: newChapter, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          course_id: newCourse.id,
          chapter_title: "Chapter 1: Kickoff",
          duration: "10 mins",
          order_index: 0
        })
        .select()
        .single();

      if (chapterError) throw chapterError;

      // 3. Insert default Lesson
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert({
          chapter_id: newChapter.id,
          title: "First Lesson Overview",
          duration: "10:00",
          content: "Write details here...",
          order_index: 0
        });

      if (lessonError) throw lessonError;

      await fetchCourses();
      setEditingCourseId(newCourse.id);
      setActiveChapterIdx(0);
      setActiveLessonIdx(0);
    } catch (err) {
      console.error("Error creating course:", err);
      alert("Error creating course: " + err.message);
    }
  };

  // Delete Course Flow
  const handleDeleteCourse = async (cId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', cId);

      if (error) throw error;

      await fetchCourses();
      if (editingCourseId === cId) {
        setEditingCourseId(null);
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Error deleting course: " + err.message);
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
