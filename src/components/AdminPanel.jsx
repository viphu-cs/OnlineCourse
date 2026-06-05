import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, Clock, Check, X, ShieldAlert, 
  ArrowLeft, Search, RefreshCw, Loader2, Sparkles,
  BookOpen
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AdminPanel({ setCurrentPage, userProfile }) {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('profiles');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInstructors: 0,
    pendingRequests: 0
  });
  const [actioningId, setActioningId] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch all dashboard data (profiles and courses) for admin management
  const fetchAdminDashboardData = async () => {
    setLoading(true);
    try {
      const [profilesRes, coursesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (coursesRes.error) throw coursesRes.error;

      const profilesData = profilesRes.data || [];
      const coursesData = coursesRes.data || [];

      setProfiles(profilesData);
      setCourses(coursesData);
      calculateStats(profilesData, coursesData);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      showToast('error', 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (profilesData, coursesData) => {
    const totalStudents = profilesData.filter(p => p.role === 'student' && p.instructor_status !== 'pending').length;
    const activeInstructors = profilesData.filter(p => p.role === 'instructor').length;
    const pendingProfilesCount = profilesData.filter(p => p.instructor_status === 'pending').length;
    const pendingCoursesCount = coursesData.filter(c => c.status === 'Pending').length;
    
    setStats({ 
      totalStudents, 
      activeInstructors, 
      pendingRequests: pendingProfilesCount + pendingCoursesCount 
    });
  };

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Instructor application action handlers
  const handleApprove = async (profileId) => {
    setActioningId(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'instructor', instructor_status: 'approved' })
        .eq('id', profileId);

      if (error) throw error;
      
      showToast('success', 'Instructor application approved successfully!');
      fetchAdminDashboardData();
    } catch (err) {
      console.error('Error approving instructor:', err);
      showToast('error', 'Approval failed: ' + err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (profileId) => {
    setActioningId(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ instructor_status: 'rejected' })
        .eq('id', profileId);

      if (error) throw error;
      
      showToast('success', 'Instructor application rejected.');
      fetchAdminDashboardData();
    } catch (err) {
      console.error('Error rejecting instructor:', err);
      showToast('error', 'Rejection failed: ' + err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDemote = async (profileId) => {
    if (!window.confirm('Are you sure you want to demote this instructor back to student status?')) return;
    setActioningId(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'student', instructor_status: 'none' })
        .eq('id', profileId);

      if (error) throw error;
      
      showToast('success', 'Instructor demoted to student.');
      fetchAdminDashboardData();
    } catch (err) {
      console.error('Error demoting instructor:', err);
      showToast('error', 'Demotion failed: ' + err.message);
    } finally {
      setActioningId(null);
    }
  };

  // Course status action handlers
  const handleApproveCourse = async (courseId) => {
    setActioningId(courseId);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: 'Published' })
        .eq('id', courseId);

      if (error) throw error;

      showToast('success', 'Course approved and published successfully!');
      fetchAdminDashboardData();
    } catch (err) {
      console.error('Error approving course:', err);
      showToast('error', 'Approval failed: ' + err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectCourse = async (courseId) => {
    setActioningId(courseId);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: 'Rejected' })
        .eq('id', courseId);

      if (error) throw error;

      showToast('success', 'Course application rejected.');
      fetchAdminDashboardData();
    } catch (err) {
      console.error('Error rejecting course:', err);
      showToast('error', 'Rejection failed: ' + err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleUnpublishCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to unpublish this course? It will return to Draft status.')) return;
    setActioningId(courseId);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: 'Draft' })
        .eq('id', courseId);

      if (error) throw error;

      showToast('success', 'Course reverted to Draft status.');
      fetchAdminDashboardData();
    } catch (err) {
      console.error('Error unpublishing course:', err);
      showToast('error', 'Unpublish failed: ' + err.message);
    } finally {
      setActioningId(null);
    }
  };

  // Filter listings based on active tab and search query
  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Profiles Tab Data
  const pendingApplications = filteredProfiles.filter(p => p.instructor_status === 'pending');
  const activeInstructorsList = filteredProfiles.filter(p => p.role === 'instructor');

  // Courses Tab Data
  const pendingCourses = filteredCourses.filter(c => c.status === 'Pending');
  const activeCoursesList = filteredCourses.filter(c => c.status === 'Published' || c.status === 'Rejected');

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1c30] text-[#0b1c30] dark:text-[#f8f9ff] pt-28 pb-16 px-4 md:px-margin-desktop max-w-[1280px] mx-auto w-full flex flex-col gap-8">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 items-start">
          <button 
            onClick={() => setCurrentPage('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary dark:hover:text-primary-fixed-dim transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to marketplace</span>
          </button>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-on-surface dark:text-white tracking-tight flex items-center gap-2.5">
            Admin Portal
            <span className="text-xs bg-primary/10 text-primary dark:bg-primary-fixed/20 dark:text-primary-fixed rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider">
              Administration
            </span>
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant dark:text-slate-400 font-medium">
            Manage instructor requests, approve applications, and review platform courses.
          </p>
        </div>

        <button 
          onClick={fetchAdminDashboardData}
          disabled={loading}
          className="self-start sm:self-center bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </header>

      {/* Statistics section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 select-none">
        <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Students</p>
            <p className="font-display font-bold text-3xl text-on-surface dark:text-white mt-1.5">{stats.totalStudents}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary dark:bg-primary-fixed/15 dark:text-primary-fixed flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Requests</p>
            <p className="font-display font-bold text-3xl text-on-surface dark:text-white mt-1.5">{stats.pendingRequests}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.pendingRequests > 0 ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Instructors</p>
            <p className="font-display font-bold text-3xl text-on-surface dark:text-white mt-1.5">{stats.activeInstructors}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c7c4d8]/20 dark:border-white/5 pb-2">
        <div className="flex gap-6 select-none">
          <button 
            onClick={() => { setActiveTab('profiles'); setSearchQuery(''); }}
            className={`pb-2 text-xs md:text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
              activeTab === 'profiles' 
                ? 'text-primary border-primary dark:text-primary-fixed dark:border-primary-fixed font-bold' 
                : 'text-slate-400 border-transparent hover:text-on-surface dark:hover:text-white font-medium'
            }`}
          >
            Instructor Applications
          </button>
          <button 
            onClick={() => { setActiveTab('courses'); setSearchQuery(''); }}
            className={`pb-2 text-xs md:text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
              activeTab === 'courses' 
                ? 'text-primary border-primary dark:text-primary-fixed dark:border-primary-fixed font-bold' 
                : 'text-slate-400 border-transparent hover:text-on-surface dark:hover:text-white font-medium'
            }`}
          >
            Course Applications
          </button>
        </div>

        <div className="flex items-center bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-[#c7c4d8]/40 dark:border-white/5 shadow-sm w-full md:max-w-[320px] shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'profiles' ? "Search users by name or email..." : "Search courses by title or author..."} 
            className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs w-full text-on-surface dark:text-white placeholder-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Retrieving system details...</p>
        </div>
      ) : activeTab === 'profiles' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Pending applications */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 dark:border-white/5 pb-2">
              <h2 className="font-display font-bold text-lg text-on-surface dark:text-white flex items-center gap-2">
                Pending Applications 
                <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-bold">
                  {pendingApplications.length}
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {pendingApplications.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-900 border border-dashed border-[#c7c4d8]/50 dark:border-white/5 rounded-2xl p-8 text-center text-on-surface-variant dark:text-slate-400 text-xs font-semibold select-none shadow-sm"
                  >
                    No pending instructor applications found.
                  </motion.div>
                ) : (
                  pendingApplications.map(profile => (
                    <motion.div 
                      key={profile.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                          <img 
                            src={profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                            alt={profile.full_name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-on-surface dark:text-white truncate">{profile.full_name}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{profile.email}</p>
                          <span className="text-[9px] text-slate-450 mt-0.5 inline-block">Registered: {new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleReject(profile.id)}
                          disabled={actioningId === profile.id}
                          className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                          title="Reject Application"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(profile.id)}
                          disabled={actioningId === profile.id}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md hover:shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
                        >
                          {actioningId === profile.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Right Column: Active Instructors list */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 dark:border-white/5 pb-2">
              <h2 className="font-display font-bold text-lg text-on-surface dark:text-white flex items-center gap-2">
                Approved Instructors
                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">
                  {activeInstructorsList.length}
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {activeInstructorsList.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-900 border border-dashed border-[#c7c4d8]/50 dark:border-white/5 rounded-2xl p-8 text-center text-on-surface-variant dark:text-slate-400 text-xs font-semibold select-none shadow-sm"
                  >
                    No approved instructors found.
                  </motion.div>
                ) : (
                  activeInstructorsList.map(profile => (
                    <motion.div 
                      key={profile.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                          <img 
                            src={profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                            alt={profile.full_name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs md:text-sm text-on-surface dark:text-white truncate">{profile.full_name}</h4>
                          <p className="text-[10px] text-slate-450 truncate">{profile.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDemote(profile.id)}
                        disabled={actioningId === profile.id}
                        className="px-3 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/5 text-[10px] font-bold flex items-center gap-1.5 self-end sm:self-center transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Demote</span>
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

        </div>
      ) : (
        /* Courses Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Course Pending Approval */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 dark:border-white/5 pb-2">
              <h2 className="font-display font-bold text-lg text-on-surface dark:text-white flex items-center gap-2">
                Pending Review
                <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-bold">
                  {pendingCourses.length}
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {pendingCourses.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-900 border border-dashed border-[#c7c4d8]/50 dark:border-white/5 rounded-2xl p-8 text-center text-on-surface-variant dark:text-slate-400 text-xs font-semibold select-none shadow-sm"
                  >
                    No pending courses to review.
                  </motion.div>
                ) : (
                  pendingCourses.map(course => (
                    <motion.div 
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${course.gradient || 'from-primary/20 to-primary/45'} flex items-center justify-center shrink-0`}>
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-on-surface dark:text-white truncate">{course.title}</h4>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-[#c7c4d8]/20">
                              {course.difficulty}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            By {course.author_name} • {course.category}
                          </p>
                          <span className="text-[9px] text-slate-450 mt-1 inline-block">
                            Submitted: {new Date(course.updated_at || course.created_at).toLocaleDateString()} • Price: ${course.price_val || '0.00'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleRejectCourse(course.id)}
                          disabled={actioningId === course.id}
                          className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                          title="Reject Course"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApproveCourse(course.id)}
                          disabled={actioningId === course.id}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md hover:shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
                        >
                          {actioningId === course.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Right Column: Published & Rejected Courses */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 dark:border-white/5 pb-2">
              <h2 className="font-display font-bold text-lg text-on-surface dark:text-white flex items-center gap-2">
                Published & Rejected Courses
                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">
                  {activeCoursesList.length}
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {activeCoursesList.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-900 border border-dashed border-[#c7c4d8]/50 dark:border-white/5 rounded-2xl p-8 text-center text-on-surface-variant dark:text-slate-400 text-xs font-semibold select-none shadow-sm"
                  >
                    No published or rejected courses found.
                  </motion.div>
                ) : (
                  activeCoursesList.map(course => (
                    <motion.div 
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${course.gradient || 'from-primary/20 to-primary/45'} flex items-center justify-center shrink-0`}>
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs md:text-sm text-on-surface dark:text-white truncate">{course.title}</h4>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                              course.status === 'Published' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                              {course.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-450 truncate mt-0.5">By {course.author_name} • {course.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {course.status === 'Published' ? (
                          <button
                            onClick={() => handleUnpublishCourse(course.id)}
                            disabled={actioningId === course.id}
                            className="px-3 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/5 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Unpublish</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveCourse(course.id)}
                            disabled={actioningId === course.id}
                            className="px-3 py-2 rounded-lg border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
