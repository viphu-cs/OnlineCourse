import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, ChevronUp, ChevronDown, Trash2, FileText, Play,
  Code, Settings, Layout, HelpCircle, Save, Upload,
  Eye, Check, ArrowLeft, ArrowUpRight, CheckCircle, Video, List, Link as LinkIcon,
  Users, DollarSign, Star, BookOpen, Sparkles, AlertCircle,
  Bold, Italic, Underline, Menu
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const CATEGORIES = ["AI & Machine Learning", "Web Development", "Business Strategy", "Design & UX"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const GRADIENTS = [
  { name: "Indigo Emerald", value: "from-[#4f46e5] to-emerald-700/60" },
  { name: "Purple Rose", value: "from-purple-600 to-rose-500" },
  { name: "Cyan Blue", value: "from-cyan-500 to-blue-600" },
  { name: "Amber Orange", value: "from-amber-500 to-orange-600" },
  { name: "Slate Dark", value: "from-slate-700 to-slate-900" }
];

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileStructureOpen, setMobileStructureOpen] = useState(false);
  
  // Selected item inside active course outline
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // Active course reference
  const course = courses.find(c => String(c.id) === String(editingCourseId));

  // Editor sub-views ('lesson' for curriculum workspace, 'settings' for course metadata)
  const [editorView, setEditorView] = useState('settings');

  // Shared form states for creating/editing course details
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCategory, setCourseCategory] = useState(CATEGORIES[0]);
  const [courseDifficulty, setCourseDifficulty] = useState(DIFFICULTIES[0]);
  const [coursePrice, setCoursePrice] = useState('0.00');
  const [courseIsFree, setCourseIsFree] = useState(true);
  const [courseGradient, setCourseGradient] = useState(GRADIENTS[0].value);
  const [courseObjectives, setCourseObjectives] = useState([""]);
  const [courseRequirements, setCourseRequirements] = useState([""]);

  // Status state
  const [isPublished, setIsPublished] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Custom premium modal/dialog state
  const [modalConfig, setModalConfig] = useState(null);

  // Filter courses owned by the user or all if admin
  const myCourses = courses.filter(c => c.authorId === user?.id || userProfile?.role === 'admin');

  // Sync settings fields when entering a course
  useEffect(() => {
    if (editingCourseId && course) {
      setEditorView('settings');
      setActiveChapterIdx(0);
      setActiveLessonIdx(0);

      // Prefill metadata
      setCourseTitle(course.title || '');
      setCourseDesc(course.description || '');
      setCourseCategory(course.category || CATEGORIES[0]);
      setCourseDifficulty(course.difficulty || DIFFICULTIES[0]);
      setCoursePrice(course.priceVal !== undefined ? course.priceVal.toString() : '0.00');
      setCourseIsFree(course.priceVal === 0);
      setCourseGradient(course.gradient || GRADIENTS[0].value);
      setCourseObjectives(course.objectives && course.objectives.length > 0 ? course.objectives : [""]);
      setCourseRequirements(course.requirements && course.requirements.length > 0 ? course.requirements : [""]);
    }
  }, [editingCourseId]);

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
  const handleAddChapter = () => {
    if (!course) return;

    setModalConfig({
      title: "Add New Chapter",
      placeholder: "Enter Chapter Title...",
      inputType: "text",
      confirmText: "Add Chapter",
      onConfirm: async (title) => {
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
          setModalConfig({
            title: "Error",
            message: "Error adding chapter: " + err.message,
            confirmText: "OK",
            onConfirm: () => {}
          });
        }
      }
    });
  };

  // Add Lesson handler
  const handleAddLesson = (cIdx) => {
    if (!course) return;
    const chapter = course.curriculum[cIdx];
    if (!chapter) return;

    setModalConfig({
      title: "Add New Lesson",
      placeholder: "Enter Lesson Title...",
      inputType: "text",
      confirmText: "Add Lesson",
      onConfirm: async (title) => {
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
          setModalConfig({
            title: "Error",
            message: "Error adding lesson: " + err.message,
            confirmText: "OK",
            onConfirm: () => {}
          });
        }
      }
    });
  };

  // Delete Lesson handler
  const handleDeleteLesson = (cIdx, lIdx) => {
    if (!course) return;
    const chapter = course.curriculum[cIdx];
    if (!chapter) return;

    if (chapter.lessons.length <= 1) {
      setModalConfig({
        title: "Action Blocked",
        message: "Each chapter must have at least one lesson.",
        confirmText: "OK",
        onConfirm: () => {}
      });
      return;
    }

    const lesson = chapter.lessons[lIdx];
    if (!lesson) return;

    setModalConfig({
      title: "Delete Lesson",
      message: `Are you sure you want to delete the lesson "${lesson.title}"?`,
      confirmText: "Delete",
      onConfirm: async () => {
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
          setModalConfig({
            title: "Error",
            message: "Error deleting lesson: " + err.message,
            confirmText: "OK",
            onConfirm: () => {}
          });
        }
      }
    });
  };

  // Delete Chapter handler
  const handleDeleteChapter = (cIdx) => {
    if (!course) return;
    if (course.curriculum.length <= 1) {
      setModalConfig({
        title: "Action Blocked",
        message: "A course must have at least one chapter.",
        confirmText: "OK",
        onConfirm: () => {}
      });
      return;
    }

    const chapter = course.curriculum[cIdx];
    if (!chapter) return;

    setModalConfig({
      title: "Delete Chapter",
      message: `Are you sure you want to delete the chapter "${chapter.chapterTitle}" and all its lessons?`,
      confirmText: "Delete",
      onConfirm: async () => {
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
          setModalConfig({
            title: "Error",
            message: "Error deleting chapter: " + err.message,
            confirmText: "OK",
            onConfirm: () => {}
          });
        }
      }
    });
  };

  // Edit Chapter Title handler
  const handleEditChapterTitle = (cIdx) => {
    if (!course) return;
    const chapter = course.curriculum[cIdx];
    if (!chapter) return;

    setModalConfig({
      title: "Rename Chapter",
      placeholder: "Enter Chapter Title...",
      defaultValue: chapter.chapterTitle,
      inputType: "text",
      confirmText: "Rename",
      onConfirm: async (newTitle) => {
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
          setModalConfig({
            title: "Error",
            message: "Error updating chapter title: " + err.message,
            confirmText: "OK",
            onConfirm: () => {}
          });
        }
      }
    });
  };

  // Save course settings updates to Supabase
  const handleSaveCourseSettings = async () => {
    if (!course) return;

    if (!courseTitle.trim()) {
      setModalConfig({
        title: "Validation Error",
        message: "Course Title is required.",
        confirmText: "OK",
        onConfirm: () => {}
      });
      return;
    }

    try {
      const cleanObjectives = courseObjectives.filter(o => o.trim() !== "");
      const cleanRequirements = courseRequirements.filter(r => r.trim() !== "");
      const finalPriceVal = courseIsFree ? 0 : parseFloat(coursePrice) || 0;

      const { error } = await supabase
        .from('courses')
        .update({
          title: courseTitle.trim(),
          description: courseDesc.trim(),
          category: courseCategory,
          difficulty: courseDifficulty,
          price_val: finalPriceVal,
          gradient: courseGradient,
          objectives: cleanObjectives,
          requirements: cleanRequirements
        })
        .eq('id', course.id);

      if (error) throw error;

      await fetchCourses();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Error saving course settings:", err);
      setModalConfig({
        title: "Error",
        message: "Error saving course settings: " + err.message,
        confirmText: "OK",
        onConfirm: () => {}
      });
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

      await fetchCourses();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Error saving lesson changes:", err);
      setModalConfig({
        title: "Error",
        message: "Error saving lesson changes: " + err.message,
        confirmText: "OK",
        onConfirm: () => {}
      });
    }
  };

  // Update course status (e.g. submit for review, unpublish)
  const handleUpdateCourseStatus = async (newStatus) => {
    if (!course) return;
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: newStatus })
        .eq('id', course.id);

      if (error) throw error;
      await fetchCourses();
    } catch (err) {
      console.error("Error updating course status:", err);
      setModalConfig({
        title: "Error",
        message: "Error updating course status: " + err.message,
        confirmText: "OK",
        onConfirm: () => {}
      });
    }
  };

  // Execute Course Creation using up-to-date states
  const executeCreateCourse = async () => {
    if (!courseTitle.trim()) {
      setModalConfig({
        title: "Validation Error",
        message: "Course Title is required.",
        confirmText: "OK",
        onConfirm: () => {
          setModalConfig({ type: "create-course" });
        }
      });
      return;
    }

    try {
      const cleanObjectives = courseObjectives.filter(o => o.trim() !== "");
      const cleanRequirements = courseRequirements.filter(r => r.trim() !== "");
      const finalPriceVal = courseIsFree ? 0 : parseFloat(coursePrice) || 0;

      // 1. Insert course
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseTitle.trim(),
          category: courseCategory,
          price_val: finalPriceVal,
          author_id: user?.id,
          author_name: userProfile?.full_name || "Instructor",
          author_role: "Senior Tech Educator",
          author_bio: "Expert professional developer.",
          difficulty: courseDifficulty,
          gradient: courseGradient,
          description: courseDesc.trim() || "No course description provided.",
          objectives: cleanObjectives,
          requirements: cleanRequirements,
          status: "Draft",
          duration: "12 hours"
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
      setEditorView('settings');
      setActiveChapterIdx(0);
      setActiveLessonIdx(0);
      setModalConfig(null);
    } catch (err) {
      console.error("Error creating course:", err);
      setModalConfig({
        title: "Error",
        message: "Error creating course: " + err.message,
        confirmText: "OK",
        onConfirm: () => {
          setModalConfig({ type: "create-course" });
        }
      });
    }
  };

  // Create Course Flow
  const handleCreateCourse = () => {
    // Reset form states for creation
    setCourseTitle('');
    setCourseDesc('');
    setCourseCategory(CATEGORIES[0]);
    setCourseDifficulty(DIFFICULTIES[0]);
    setCoursePrice('0.00');
    setCourseIsFree(true);
    setCourseGradient(GRADIENTS[0].value);
    setCourseObjectives([""]);
    setCourseRequirements([""]);

    setModalConfig({
      type: "create-course"
    });
  };

  // Delete Course Flow
  const handleDeleteCourse = (cId, e) => {
    e.stopPropagation();
    setModalConfig({
      title: "Delete Course",
      message: "Are you sure you want to delete this course? This action cannot be undone.",
      confirmText: "Delete",
      onConfirm: async () => {
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
          setModalConfig({
            title: "Error",
            message: "Error deleting course: " + err.message,
            confirmText: "OK",
            onConfirm: () => {}
          });
        }
      }
    });
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
      
      {/* Mobile main menu backdrop overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Navigation (Instructor Studio Panel) - Premium Dark Theme */}
      <nav className={`bg-[#0b1c30] text-slate-300 border-r border-white/10 flex flex-col p-6 space-y-4 w-64 h-full shrink-0 z-30 shadow-lg fixed md:static transition-transform duration-300 ease-in-out md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="mb-6 select-none flex justify-between items-center">
          <div>
            <h1 className="font-display font-bold text-lg md:text-xl text-white">Creator Studio</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Management Hub</p>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={() => { handleCreateCourse(); setMobileMenuOpen(false); }}
          className="w-full bg-primary hover:bg-primary-container text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-md transition-all cursor-pointer border-t border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>

        <div className="flex-grow space-y-1 select-none">
          <button 
            onClick={() => { setEditingCourseId(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
              editingCourseId === null 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Layout className="w-4 h-4 text-slate-400" />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setCurrentPage('marketplace'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white text-left font-semibold text-xs transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>Marketplace</span>
          </button>
        </div>

        {/* Switch to Student Hub */}
        <div className="pt-4 border-t border-white/5 select-none">
          <button 
            onClick={() => {
              setCurrentPage('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
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
            {/* Mobile Top Navigation Header */}
            <div className="flex md:hidden items-center justify-between bg-white dark:bg-slate-900 border-b border-[#c7c4d8]/30 dark:border-white/5 p-4 -mx-6 -mt-6 mb-2 shrink-0 select-none shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="font-display font-bold text-base text-[#0b1c30] dark:text-white">Creator Studio</h1>
              </div>
              <button 
                onClick={handleCreateCourse}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
                title="Create New Course"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase border ${
                        c.status === 'Published' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' :
                        c.status === 'Pending' ? 'bg-amber-500/15 text-amber-500 border-amber-500/20 animate-pulse' :
                        c.status === 'Rejected' ? 'bg-red-500/15 text-red-500 border-red-500/20' :
                        'bg-slate-500/15 text-slate-500 border-slate-500/20'
                      }`}>
                        {c.status || 'Draft'}
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
            
            {mobileStructureOpen && (
              <div 
                onClick={() => setMobileStructureOpen(false)}
                className="fixed inset-0 bg-black/60 z-15 md:hidden backdrop-blur-sm"
              />
            )}

            {/* Secondary Panel: Course curriculum list outline */}
            <aside className={`w-80 bg-slate-50 dark:bg-slate-900 border-r border-[#c7c4d8]/30 dark:border-white/5 flex flex-col h-full shrink-0 z-20 text-left fixed md:static transition-transform duration-300 ease-in-out md:translate-x-0 ${
              mobileStructureOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
              <div className="p-5 border-b border-[#c7c4d8]/20 dark:border-white/5 flex justify-between items-center select-none bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setMobileStructureOpen(false)}
                    className="md:hidden p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer mr-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h2 className="font-display font-bold text-base md:text-lg text-on-surface dark:text-white">Course Structure</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditorView('settings'); setMobileStructureOpen(false); }}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      editorView === 'settings' 
                        ? 'bg-primary/15 text-primary dark:bg-primary-fixed-dim/20 dark:text-primary-fixed-dim ring-1 ring-primary-container/30' 
                        : 'text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Course Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">
                    {course?.difficulty}
                  </span>
                </div>
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
                              setEditorView('lesson');
                              setMobileStructureOpen(false);
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
              <header className="h-16 border-b border-[#c7c4d8]/30 dark:border-white/5 flex items-center justify-between px-3 md:px-6 shrink-0 z-10 bg-white dark:bg-slate-950 select-none">
                <div className="flex items-center gap-1.5 md:gap-3">
                  <button 
                    onClick={() => setEditingCourseId(null)}
                    className="px-2 md:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Back to Studio</span>
                  </button>
                  <button 
                    onClick={() => setMobileStructureOpen(true)}
                    className="md:hidden p-1.5 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Course Structure"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Status:</span>
                  {course.status === 'Published' ? (
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="px-2 md:px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] md:text-xs font-bold border border-emerald-500/20">
                        Published
                      </span>
                      <button 
                        onClick={() => handleUpdateCourseStatus('Draft')}
                        className="px-2 md:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface dark:text-slate-300 text-[10px] md:text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Unpublish
                      </button>
                    </div>
                  ) : course.status === 'Pending' ? (
                    <span className="px-2 md:px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] md:text-xs font-bold border border-amber-500/20 animate-pulse">
                      Pending Approval
                    </span>
                  ) : course.status === 'Rejected' ? (
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="px-2 md:px-3 py-1.5 bg-red-500/10 text-red-500 rounded-xl text-[10px] md:text-xs font-bold border border-red-500/20">
                        Rejected
                      </span>
                      <button 
                        onClick={() => handleUpdateCourseStatus('Pending')}
                        className="px-2.5 md:px-4 py-1.5 bg-primary hover:bg-primary-container text-white text-[10px] md:text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden xs:inline">Submit</span>
                        <span className="hidden md:inline">for Review</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="px-2 md:px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] md:text-xs font-bold border border-[#c7c4d8]/20 dark:border-white/5">
                        Draft
                      </span>
                      <button 
                        onClick={() => handleUpdateCourseStatus('Pending')}
                        className="px-2.5 md:px-4 py-1.5 bg-primary hover:bg-primary-container text-white text-[10px] md:text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Submit</span>
                        <span className="hidden md:inline">for Review</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 md:gap-3">
                  {editorView === 'settings' ? (
                    <>
                      <button 
                        onClick={() => {
                          if (course) {
                            setSelectedCourseId(course.id);
                            setCurrentPage('learning-experience');
                          }
                        }}
                        className="text-[10px] md:text-xs font-bold text-on-surface-variant dark:text-slate-300 hover:text-primary transition-colors px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl border border-[#c7c4d8]/40 dark:border-white/10 hover:border-primary/50 cursor-pointer"
                      >
                        Preview
                      </button>
                      <button 
                        onClick={handleSaveCourseSettings}
                        className="bg-primary hover:bg-primary-container text-white text-[10px] md:text-xs font-bold py-2 md:py-2.5 px-3 md:px-6 rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1 md:gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          if (course) {
                            setSelectedCourseId(course.id);
                            setCurrentPage('learning-experience');
                          }
                        }}
                        className="text-[10px] md:text-xs font-bold text-on-surface-variant dark:text-slate-300 hover:text-primary transition-colors px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl border border-[#c7c4d8]/40 dark:border-white/10 hover:border-primary/50 cursor-pointer"
                      >
                        Preview
                      </button>
                      <button 
                        onClick={handleSaveLessonChanges}
                        className="bg-primary hover:bg-primary-container text-white text-[10px] md:text-xs font-bold py-2 md:py-2.5 px-3 md:px-6 rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1 md:gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </>
                  )}
                </div>
              </header>

              {/* Text/Media Editor Canvas Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9ff] dark:bg-[#0b1c30]/40">
                <div className="max-w-[760px] mx-auto space-y-8 pb-16">
                  {editorView === 'settings' ? (
                    /* COURSE SETTINGS FORM */
                    <div className="space-y-6">
                      <div className="flex flex-col gap-1 border-b border-[#c7c4d8]/20 dark:border-white/5 pb-4">
                        <h2 className="font-display font-bold text-2xl text-on-surface dark:text-white">
                          Course Settings
                        </h2>
                        <p className="text-xs text-slate-400">
                          Configure course meta tags, pricing, gradients, requirements and learning objectives.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* Title */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Title</label>
                          <input 
                            type="text"
                            placeholder="e.g. Advanced React Architecture"
                            value={courseTitle}
                            onChange={(e) => setCourseTitle(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold shadow-sm"
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
                          <textarea 
                            placeholder="Write a brief overview of what this course covers..."
                            value={courseDesc}
                            onChange={(e) => setCourseDesc(e.target.value)}
                            rows={4}
                            className="w-full bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium resize-none shadow-sm"
                          />
                        </div>

                        {/* Category & Difficulty Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
                            <select 
                              value={courseCategory}
                              onChange={(e) => setCourseCategory(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold cursor-pointer shadow-sm"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Difficulty</label>
                            <select 
                              value={courseDifficulty}
                              onChange={(e) => setCourseDifficulty(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold cursor-pointer shadow-sm"
                            >
                              {DIFFICULTIES.map(diff => (
                                <option key={diff} value={diff}>{diff}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Price Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Price (USD)</label>
                            <input 
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={courseIsFree}
                              placeholder="e.g. 49.99"
                              value={coursePrice}
                              onChange={(e) => setCoursePrice(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold disabled:opacity-40 shadow-sm"
                            />
                          </div>

                          <div className="pb-2 flex items-center">
                            <label className="flex items-center gap-2.5 text-sm font-bold text-on-surface-variant dark:text-slate-350 cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={courseIsFree}
                                onChange={(e) => {
                                  setCourseIsFree(e.target.checked);
                                  if (e.target.checked) setCoursePrice('0.00');
                                }}
                                className="rounded border-[#c7c4d8] text-primary focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 w-4.5 h-4.5 cursor-pointer accent-primary"
                              />
                              <span>This is a free course</span>
                            </label>
                          </div>
                        </div>

                        {/* Cover Theme Gradients */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Cover Theme Gradient</label>
                          <div className="flex flex-wrap gap-3">
                            {GRADIENTS.map((grad) => {
                              const isActive = courseGradient === grad.value;
                              return (
                                <button
                                  key={grad.name}
                                  type="button"
                                  onClick={() => setCourseGradient(grad.value)}
                                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad.value} relative cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center ${
                                    isActive ? 'ring-2 ring-primary dark:ring-primary-fixed-dim ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-md' : 'border border-white/10'
                                  }`}
                                  title={grad.name}
                                >
                                  {isActive && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Objectives */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                            <span>What You'll Learn (Objectives)</span>
                            <button
                              type="button"
                              onClick={() => setCourseObjectives([...courseObjectives, ""])}
                              className="text-[11px] text-primary dark:text-primary-fixed-dim hover:underline font-bold lowercase cursor-pointer"
                            >
                              + add objective
                            </button>
                          </label>
                          <div className="space-y-2">
                            {courseObjectives.map((obj, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input 
                                  type="text"
                                  placeholder="e.g. Master React Hooks and Context API"
                                  value={obj}
                                  onChange={(e) => setCourseObjectives(courseObjectives.map((item, i) => i === idx ? e.target.value : item))}
                                  className="flex-grow bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface dark:text-white outline-none focus:border-primary font-medium shadow-sm"
                                />
                                {courseObjectives.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setCourseObjectives(courseObjectives.filter((_, i) => i !== idx))}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer border border-[#c7c4d8]/20 dark:border-white/5"
                                    title="Remove Objective"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                            <span>Requirements / Prerequisites</span>
                            <button
                              type="button"
                              onClick={() => setCourseRequirements([...courseRequirements, ""])}
                              className="text-[11px] text-primary dark:text-primary-fixed-dim hover:underline font-bold lowercase cursor-pointer"
                            >
                              + add requirement
                            </button>
                          </label>
                          <div className="space-y-2">
                            {courseRequirements.map((req, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input 
                                  type="text"
                                  placeholder="e.g. Solid understanding of basic JavaScript"
                                  value={req}
                                  onChange={(e) => setCourseRequirements(courseRequirements.map((item, i) => i === idx ? e.target.value : item))}
                                  className="flex-grow bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface dark:text-white outline-none focus:border-primary font-medium shadow-sm"
                                />
                                {courseRequirements.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setCourseRequirements(courseRequirements.filter((_, i) => i !== idx))}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer border border-[#c7c4d8]/20 dark:border-white/5"
                                    title="Remove Requirement"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 border-t border-[#c7c4d8]/15 dark:border-white/5 pt-6 mt-4">
                        <button
                          type="button"
                          onClick={handleSaveCourseSettings}
                          className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all cursor-pointer shadow active:scale-[0.98] flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Course Settings</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* LESSON WORKSPACE EDITOR */
                    <>
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
                            <button 
                              onClick={() => {
                                const textarea = document.getElementById('lesson-content-textarea');
                                if (textarea) {
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const text = textarea.value;
                                  const selectedText = text.substring(start, end);
                                  const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                                  setDraftDesc(newText);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                              title="Bold"
                            >
                              <Bold className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                const textarea = document.getElementById('lesson-content-textarea');
                                if (textarea) {
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const text = textarea.value;
                                  const selectedText = text.substring(start, end);
                                  const newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                                  setDraftDesc(newText);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                              title="Italic"
                            >
                              <Italic className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                const textarea = document.getElementById('lesson-content-textarea');
                                if (textarea) {
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const text = textarea.value;
                                  const selectedText = text.substring(start, end);
                                  const newText = text.substring(0, start) + `<u>${selectedText}</u>` + text.substring(end);
                                  setDraftDesc(newText);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                              title="Underline"
                            >
                              <Underline className="w-4 h-4" />
                            </button>
                            <div className="w-px h-5 bg-[#c7c4d8]/20 dark:bg-white/5 mx-1" />
                            <button 
                              onClick={() => {
                                const textarea = document.getElementById('lesson-content-textarea');
                                if (textarea) {
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const text = textarea.value;
                                  const selectedText = text.substring(start, end);
                                  const newText = text.substring(0, start) + `\n- ${selectedText}` + text.substring(end);
                                  setDraftDesc(newText);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                              title="Bullet List"
                            >
                              <List className="w-4 h-4" />
                            </button>
                            <div className="w-px h-5 bg-[#c7c4d8]/20 dark:bg-white/5 mx-1" />
                            <button 
                              onClick={() => {
                                const textarea = document.getElementById('lesson-content-textarea');
                                if (textarea) {
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const text = textarea.value;
                                  const selectedText = text.substring(start, end);
                                  const newText = text.substring(0, start) + `[${selectedText || 'Link Text'}](url)` + text.substring(end);
                                  setDraftDesc(newText);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                              title="Add Link"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Main Textarea */}
                          <textarea 
                            id="lesson-content-textarea"
                            value={draftDesc}
                            onChange={(e) => setDraftDesc(e.target.value)}
                            placeholder="Start typing the lesson content here..."
                            className="w-full min-h-[240px] border-0 focus:ring-0 p-5 text-sm md:text-base text-on-surface-variant dark:text-slate-300 resize-y bg-transparent placeholder-slate-400 font-medium leading-relaxed outline-none"
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
                                  <p className="text-[10px] text-slate-450 dark:text-slate-400 font-medium mt-0.5">
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
                    </>
                  )}
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
                    <span>{editorView === 'settings' ? 'Course settings updated successfully!' : 'Syllabus layout updated successfully!'}</span>
                  </motion.div>
                )}
              </AnimatePresence>

            </main>
          </React.Fragment>

        )}
      </AnimatePresence>

      {/* Custom dialog overlay */}
      <AnimatePresence>
        {modalConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalConfig(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Modal Dialog Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/10 rounded-2xl p-6 shadow-2xl w-full relative z-10 text-left flex flex-col gap-4 ${
                modalConfig.type === 'create-course' ? 'max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin' : 'max-w-[480px]'
              }`}
            >
              {modalConfig.type === 'create-course' ? (
                <div className="flex flex-col gap-4 select-text">
                  <div className="flex items-center gap-2 border-b border-[#c7c4d8]/15 dark:border-white/5 pb-2">
                    <Sparkles className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="font-display font-bold text-base md:text-lg text-on-surface dark:text-white">
                      Create New Course
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Title</label>
                      <input 
                        type="text"
                        placeholder="e.g. Advanced React Architecture"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full bg-[#f8f9ff] dark:bg-slate-950 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold"
                        autoFocus
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
                      <textarea 
                        placeholder="Write a brief overview of what this course covers..."
                        value={courseDesc}
                        onChange={(e) => setCourseDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-[#f8f9ff] dark:bg-slate-950 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium resize-none"
                      />
                    </div>

                    {/* Category & Difficulty Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
                        <select 
                          value={courseCategory}
                          onChange={(e) => setCourseCategory(e.target.value)}
                          className="w-full bg-[#f8f9ff] dark:bg-slate-950 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold cursor-pointer"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Difficulty</label>
                        <select 
                          value={courseDifficulty}
                          onChange={(e) => setCourseDifficulty(e.target.value)}
                          className="w-full bg-[#f8f9ff] dark:bg-slate-950 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold cursor-pointer"
                        >
                          {DIFFICULTIES.map(diff => (
                            <option key={diff} value={diff}>{diff}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Price Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Price (USD)</label>
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={courseIsFree}
                          placeholder="e.g. 49.99"
                          value={coursePrice}
                          onChange={(e) => setCoursePrice(e.target.value)}
                          className="w-full bg-[#f8f9ff] dark:bg-slate-950 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold disabled:opacity-40"
                        />
                      </div>

                      <div className="pb-2 flex items-center">
                        <label className="flex items-center gap-2.5 text-xs font-bold text-on-surface-variant dark:text-slate-350 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={courseIsFree}
                            onChange={(e) => {
                              setCourseIsFree(e.target.checked);
                              if (e.target.checked) setCoursePrice('0.00');
                            }}
                            className="rounded border-[#c7c4d8] text-primary focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 w-4.5 h-4.5 cursor-pointer accent-primary"
                          />
                          <span>This is a free course</span>
                        </label>
                      </div>
                    </div>

                    {/* Cover Theme Gradients */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Cover Theme Gradient</label>
                      <div className="flex flex-wrap gap-3">
                        {GRADIENTS.map((grad) => {
                          const isActive = courseGradient === grad.value;
                          return (
                            <button
                              key={grad.name}
                              type="button"
                              onClick={() => setCourseGradient(grad.value)}
                              className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad.value} relative cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center ${
                                isActive ? 'ring-2 ring-primary dark:ring-primary-fixed-dim ring-offset-2 dark:ring-offset-slate-900 scale-105' : 'border border-white/10'
                              }`}
                              title={grad.name}
                            >
                              {isActive && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Objectives */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                        <span>What You'll Learn (Objectives)</span>
                        <button
                          type="button"
                          onClick={() => setCourseObjectives([...courseObjectives, ""])}
                          className="text-[10px] text-primary dark:text-primary-fixed-dim hover:underline font-bold lowercase cursor-pointer"
                        >
                          + add objective
                        </button>
                      </label>
                      <div className="space-y-2">
                        {courseObjectives.map((obj, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text"
                              placeholder="e.g. Master React Hooks and Context API"
                              value={obj}
                              onChange={(e) => setCourseObjectives(courseObjectives.map((item, i) => i === idx ? e.target.value : item))}
                              className="flex-grow bg-[#f8f9ff] dark:bg-slate-950 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-on-surface dark:text-white outline-none focus:border-primary font-medium"
                            />
                            {courseObjectives.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setCourseObjectives(courseObjectives.filter((_, i) => i !== idx))}
                                className="p-2 bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer border border-[#c7c4d8]/20 dark:border-white/5"
                                title="Remove Objective"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                        <span>Requirements / Prerequisites</span>
                        <button
                          type="button"
                          onClick={() => setCourseRequirements([...courseRequirements, ""])}
                          className="text-[10px] text-primary dark:text-primary-fixed-dim hover:underline font-bold lowercase cursor-pointer"
                        >
                          + add requirement
                        </button>
                      </label>
                      <div className="space-y-2">
                        {courseRequirements.map((req, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text"
                              placeholder="e.g. Solid understanding of basic JavaScript"
                              value={req}
                              onChange={(e) => setCourseRequirements(courseRequirements.map((item, i) => i === idx ? e.target.value : item))}
                              className="flex-grow bg-[#f8f9ff] dark:bg-slate-950 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-on-surface dark:text-white outline-none focus:border-primary font-medium"
                            />
                            {courseRequirements.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setCourseRequirements(courseRequirements.filter((_, i) => i !== idx))}
                                className="p-2 bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer border border-[#c7c4d8]/20 dark:border-white/5"
                                title="Remove Requirement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-[#c7c4d8]/15 dark:border-white/5 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setModalConfig(null)}
                      className="px-4 py-2.5 rounded-xl border border-[#c7c4d8]/30 dark:border-white/10 text-xs font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-on-surface dark:hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={executeCreateCourse}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      Create Course
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display font-bold text-sm md:text-base text-on-surface dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                      {modalConfig.title}
                    </h3>
                    {modalConfig.message && (
                      <p className="text-[11px] md:text-xs text-slate-450 dark:text-slate-400 font-medium leading-relaxed">
                        {modalConfig.message}
                      </p>
                    )}
                  </div>

                  {modalConfig.inputType && (
                    <input
                      type={modalConfig.inputType}
                      id="modal-input"
                      placeholder={modalConfig.placeholder}
                      defaultValue={modalConfig.defaultValue}
                      className="w-full bg-[#f8f9ff] dark:bg-slate-950 border border-[#c7c4d8]/40 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-on-surface dark:text-white outline-none focus:border-primary dark:focus:border-primary-fixed focus:ring-1 focus:ring-primary dark:focus:ring-primary-fixed placeholder-slate-450 font-semibold"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = document.getElementById('modal-input')?.value;
                          modalConfig.onConfirm(val);
                          setModalConfig(null);
                        }
                      }}
                      autoFocus
                    />
                  )}

                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      onClick={() => setModalConfig(null)}
                      className="px-3 py-2 rounded-xl border border-[#c7c4d8]/30 dark:border-white/10 text-[10px] font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-on-surface dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {modalConfig.cancelText || 'Cancel'}
                    </button>
                    <button
                      onClick={() => {
                        const val = modalConfig.inputType ? document.getElementById('modal-input')?.value : undefined;
                        modalConfig.onConfirm(val);
                        setModalConfig(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-[10px] font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      {modalConfig.confirmText || 'Confirm'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
