import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  ArrowLeft, ChevronRight, ChevronDown, CheckCircle2, PlayCircle, 
  Lock, Bookmark, Download, FileText, Code, Settings, Subtitles,
  HelpCircle, MessageSquare, Plus, Trash2, Edit3, ArrowRight, Check,
  Sun, Moon
} from 'lucide-react';

export default function LearningExperience({ course, setCurrentPage, darkMode, setDarkMode }) {
  if (!course) return null;

  const storageProgressKey = `skillelevate_progress_course_${course.id}`;
  const storageNotesKey = `skillelevate_notes_course_${course.id}`;
  const storageDiscussionKey = `skillelevate_discussion_course_${course.id}`;

  // Active state within curriculum
  const [activeChapterIndex, setActiveChapterIndex] = useState(() => {
    const saved = localStorage.getItem(`skillelevate_active_chapter_${course.id}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [activeLessonIndex, setActiveLessonIndex] = useState(() => {
    const saved = localStorage.getItem(`skillelevate_active_lesson_${course.id}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Track expanded chapters in sidebar
  const [expandedChapters, setExpandedChapters] = useState(() => {
    // Keep active chapter expanded by default
    const saved = localStorage.getItem(`skillelevate_active_chapter_${course.id}`);
    const activeIdx = saved ? parseInt(saved, 10) : 0;
    return { [activeIdx]: true };
  });

  // Completed lessons tracking
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem(storageProgressKey);
    return saved ? JSON.parse(saved) : ["0-0"]; // Default first lesson completed for presentation
  });

  // Notes state
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(storageNotesKey);
    return saved ? JSON.parse(saved) : [
      {
        id: 'note-1',
        timestamp: 85,
        timeFormatted: '01:25',
        text: 'Semantic naming (e.g. primary-action) is much better than color names (blue-500) for scaling multi-theme platforms.',
        chapterTitle: course.curriculum[0]?.chapterTitle || 'Chapter 1',
        lessonTitle: course.curriculum[0]?.lessons[0]?.title || 'Lesson 1'
      }
    ];
  });
  const [noteInput, setNoteInput] = useState('');

  // Discussion comments state
  const [discussions, setDiscussions] = useState(() => {
    const saved = localStorage.getItem(storageDiscussionKey);
    return saved ? JSON.parse(saved) : {
      "0-0": [
        {
          id: 'comm-1',
          author: 'Alex Carter',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          role: 'Student',
          timestamp: '2 hours ago',
          content: 'This clear explanation of Global vs Semantic tokens cleared up so many naming debates on our team!',
          likes: 4,
          replies: []
        },
        {
          id: 'comm-2',
          author: 'Elena Rostova',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
          role: 'Instructor',
          timestamp: '1 hour ago',
          content: 'So glad it helped, Alex! In Chapter 3 we will write a script to sync these straight into JSON outputs.',
          likes: 12,
          replies: []
        }
      ]
    };
  });
  const [commentInput, setCommentInput] = useState('');

  // Active learning layout tabs
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'attachments', 'notes', 'discussion'
  
  // Custom video player states
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloading, setIsDownloading] = useState({}); // tracker for dynamic attachments download triggers
  const controlsTimeoutRef = useRef(null);

  // Sync active lesson choices to localStorage
  useEffect(() => {
    localStorage.setItem(`skillelevate_active_chapter_${course.id}`, activeChapterIndex.toString());
    localStorage.setItem(`skillelevate_active_lesson_${course.id}`, activeLessonIndex.toString());
  }, [activeChapterIndex, activeLessonIndex, course.id]);

  // Sync completed lessons to localStorage
  useEffect(() => {
    localStorage.setItem(storageProgressKey, JSON.stringify(completedLessons));
  }, [completedLessons, storageProgressKey]);

  // Sync notes to localStorage
  useEffect(() => {
    localStorage.setItem(storageNotesKey, JSON.stringify(notes));
  }, [notes, storageNotesKey]);

  // Sync discussions to localStorage
  useEffect(() => {
    localStorage.setItem(storageDiscussionKey, JSON.stringify(discussions));
  }, [discussions, storageDiscussionKey]);

  // Expand chapter automatically if changed
  useEffect(() => {
    setExpandedChapters(prev => ({ ...prev, [activeChapterIndex]: true }));
  }, [activeChapterIndex]);

  // Handle active video change
  const currentChapter = course.curriculum[activeChapterIndex];
  const currentLesson = currentChapter?.lessons[activeLessonIndex];

  // We loop a beautiful public demo stream or switch it slightly based on selection to create realism
  const getMockVideoSource = () => {
    // Alternate video paths to create realistic changes
    const hash = (activeChapterIndex + activeLessonIndex) % 3;
    if (hash === 0) return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    if (hash === 1) return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
  };

  useEffect(() => {
    // Reset states on lesson change
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [activeChapterIndex, activeLessonIndex]);

  // Format seconds into MM:SS
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Video controller handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Auto complete lesson if user hits 98% duration
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      const lessonKey = `${activeChapterIndex}-${activeLessonIndex}`;
      if (percent >= 98 && !completedLessons.includes(lessonKey)) {
        setCompletedLessons(prev => [...prev, lessonKey]);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleScrubberChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (videoRef.current) {
      videoRef.current.muted = nextMute;
      videoRef.current.volume = nextMute ? 0 : volume;
    }
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Notes Logic
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      timestamp: currentTime,
      timeFormatted: formatTime(currentTime),
      text: noteInput,
      chapterTitle: currentChapter?.chapterTitle || `Chapter ${activeChapterIndex + 1}`,
      lessonTitle: currentLesson?.title || `Lesson ${activeLessonIndex + 1}`
    };

    setNotes(prev => [newNote, ...prev]);
    setNoteInput('');
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleJumpToTime = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
      videoRef.current.play();
      setIsPlaying(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Discussions Logic
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const lessonKey = `${activeChapterIndex}-${activeLessonIndex}`;
    const newComment = {
      id: `comm-${Date.now()}`,
      author: 'You (Student)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      role: 'Student',
      timestamp: 'Just now',
      content: commentInput,
      likes: 0,
      replies: []
    };

    setDiscussions(prev => ({
      ...prev,
      [lessonKey]: [newComment, ...(prev[lessonKey] || [])]
    }));
    setCommentInput('');
  };

  // Curriculum stats
  const totalLessonsCount = course.curriculum.reduce((acc, chap) => acc + chap.lessons.length, 0);
  const completedLessonsCount = course.curriculum.reduce((acc, chap, cIdx) => {
    const completedInChapter = chap.lessons.filter((_, lIdx) => 
      completedLessons.includes(`${cIdx}-${lIdx}`)
    ).length;
    return acc + completedInChapter;
  }, 0);
  const progressPercent = Math.round((completedLessonsCount / totalLessonsCount) * 100) || 0;

  // Toggle chapter expansion
  const toggleChapter = (cIdx) => {
    setExpandedChapters(prev => ({
      ...prev,
      [cIdx]: !prev[cIdx]
    }));
  };

  // Lesson traversal: Prev / Next buttons
  const navigateLesson = (direction) => {
    let nextChap = activeChapterIndex;
    let nextLess = activeLessonIndex;

    if (direction === 'next') {
      if (nextLess + 1 < currentChapter.lessons.length) {
        nextLess += 1;
      } else if (nextChap + 1 < course.curriculum.length) {
        nextChap += 1;
        nextLess = 0;
      } else {
        return; // reached end of course
      }
    } else { // prev
      if (nextLess - 1 >= 0) {
        nextLess -= 1;
      } else if (nextChap - 1 >= 0) {
        nextChap -= 1;
        nextLess = course.curriculum[nextChap].lessons.length - 1;
      } else {
        return; // reached beginning
      }
    }

    // Auto mark current lesson complete when going forward
    if (direction === 'next') {
      const currentKey = `${activeChapterIndex}-${activeLessonIndex}`;
      if (!completedLessons.includes(currentKey)) {
        setCompletedLessons(prev => [...prev, currentKey]);
      }
    }

    setActiveChapterIndex(nextChap);
    setActiveLessonIndex(nextLess);
  };

  const hasNextLesson = activeChapterIndex + 1 < course.curriculum.length || 
                       activeLessonIndex + 1 < currentChapter?.lessons.length;
  const hasPrevLesson = activeChapterIndex > 0 || activeLessonIndex > 0;

  // Attachment files
  const mockAttachments = [
    { id: 'att-1', name: 'Token Mapping Workspace Schema', size: '2.4 MB', ext: 'PDF', icon: FileText },
    { id: 'att-2', name: 'Figma-to-Code Styling Script', size: '12 KB', ext: 'JSON', icon: Code }
  ];

  const handleDownload = (attId) => {
    setIsDownloading(prev => ({ ...prev, [attId]: true }));
    setTimeout(() => {
      setIsDownloading(prev => ({ ...prev, [attId]: 'done' }));
      setTimeout(() => {
        setIsDownloading(prev => ({ ...prev, [attId]: false }));
      }, 1500);
    }, 2000);
  };

  // Subtitles mock content mapping to current play percentage
  const getSubtitles = () => {
    if (!subtitlesEnabled) return null;
    const pct = currentTime / (duration || 1);
    if (pct < 0.1) return "Welcome back! Today, we are deep diving into design frameworks.";
    if (pct < 0.3) return "Let's first map out our global branding tokens and semantic values.";
    if (pct < 0.5) return "This abstraction guarantees absolute consistency across our React app.";
    if (pct < 0.7) return "Notice how shifting from static values to variables optimizes transitions.";
    if (pct < 0.9) return "Try implementing this checklist in your custom dashboard projects.";
    return "In the next lecture, we will audit legacy models and connect JSON config outputs.";
  };

  return (
    <div className="bg-[#f8f9ff] dark:bg-[#0b1c30] text-[#0b1c30] dark:text-[#f8f9ff] min-h-screen flex flex-col font-sans transition-colors duration-300">
      
      {/* Header bar */}
      <header className="bg-white/90 dark:bg-[#0b1c30]/90 backdrop-blur-md border-b border-[#c7c4d8]/30 dark:border-white/5 px-4 md:px-12 py-4 flex justify-between items-center sticky top-0 z-40">
        <button 
          onClick={() => setCurrentPage('course-details')}
          className="flex items-center gap-2 text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim transition-colors group font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Course Hub</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle Button */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-yellow-400 transition-all active:scale-95 duration-200 cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            aria-label="Help" 
            className="text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim transition-colors flex items-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col w-full mx-auto max-w-[1600px]">
        
        {/* Aspect Ratio Video container */}
        <section 
          ref={playerContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          className="w-full bg-[#0f172a] aspect-video max-h-[640px] relative group overflow-hidden shadow-2xl transition-all"
        >
          <video
            ref={videoRef}
            src={getMockVideoSource()}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={handlePlayPause}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Subtitles Overlay */}
          {subtitlesEnabled && getSubtitles() && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-xl text-white text-sm md:text-base font-medium max-w-xl text-center select-none shadow-md z-20 pointer-events-none transition-all">
              {getSubtitles()}
            </div>
          )}

          {/* Custom Controls Overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between transition-opacity duration-300 pointer-events-none z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Top controls (Bookmark & Settings badge) */}
            <div className="p-4 flex justify-between items-start pointer-events-auto">
              <span className="text-white/80 text-xs md:text-sm font-semibold truncate bg-black/45 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5 select-none">
                {currentChapter?.chapterTitle} • {currentLesson?.title}
              </span>
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all cursor-pointer ${isBookmarked ? 'bg-primary text-white border-primary-container' : 'bg-black/50 text-white hover:bg-slate-800'}`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Center Play/Pause Indicator (Tap trigger) */}
            <div className="flex-grow flex items-center justify-center pointer-events-auto">
              <button 
                onClick={handlePlayPause}
                className="w-16 h-16 md:w-20 md:h-20 bg-primary/95 hover:bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform backdrop-blur-md border border-white/20 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                )}
              </button>
            </div>

            {/* Bottom Controls panel */}
            <div className="p-4 md:p-6 w-full pointer-events-auto flex flex-col gap-3">
              
              {/* Custom Timeline Scrubber */}
              <div className="flex items-center gap-3 group/progress">
                <span className="text-white/80 text-xs font-mono select-none">
                  {formatTime(currentTime)}
                </span>
                <div className="relative flex-grow flex items-center h-2 cursor-pointer">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleScrubberChange}
                    className="absolute inset-0 w-full h-1.5 bg-white/20 rounded-full cursor-pointer appearance-none outline-none focus:outline-none accent-primary [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%)`
                    }}
                  />
                </div>
                <span className="text-white/80 text-xs font-mono select-none">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Bottom Buttons row */}
              <div className="flex items-center justify-between text-white select-none">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePlayPause}
                    className="hover:text-primary-fixed-dim transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  {/* Volume controllers */}
                  <div className="flex items-center gap-2 group/volume">
                    <button 
                      onClick={toggleMute}
                      className="hover:text-primary-fixed-dim transition-colors cursor-pointer"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white hover:accent-primary-fixed-dim transition-all [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none"
                    />
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-4 text-sm font-semibold">
                  
                  {/* Playback speed selector */}
                  <div className="relative group/speed">
                    <button className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded text-xs transition-colors font-mono cursor-pointer">
                      {playbackRate}x
                    </button>
                    <div className="absolute bottom-full right-0 mb-1 hidden group-hover/speed:flex flex-col bg-black/90 backdrop-blur-md rounded border border-white/15 overflow-hidden text-xs w-16">
                      {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handleRateChange(rate)}
                          className={`w-full py-1.5 hover:bg-primary hover:text-white transition-colors cursor-pointer font-mono ${playbackRate === rate ? 'text-primary' : 'text-white'}`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitle toggle */}
                  <button 
                    onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                    className={`hover:text-primary-fixed-dim transition-colors cursor-pointer ${subtitlesEnabled ? 'text-primary' : 'text-white/80'}`}
                    title="Subtitles"
                  >
                    <Subtitles className="w-5 h-5" />
                  </button>

                  {/* Fullscreen control */}
                  <button 
                    onClick={toggleFullscreen}
                    className="hover:text-primary-fixed-dim transition-colors cursor-pointer"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Layout split columns */}
        <div className="flex flex-col lg:flex-row flex-grow px-4 md:px-12 py-8 gap-8 w-full">
          
          {/* Left Column (Lesson content descriptions + tab widgets) */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            
            {/* Header description */}
            <div className="flex flex-col gap-2 pb-5 border-b border-[#c7c4d8]/30 dark:border-white/5">
              <div className="flex items-center gap-1 text-primary dark:text-primary-fixed-dim font-bold text-xs uppercase tracking-wider">
                <span>{currentChapter?.chapterTitle}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-on-surface-variant dark:text-slate-400">Lesson {activeLessonIndex + 1}</span>
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface dark:text-white leading-tight">
                {currentLesson?.title}
              </h1>
              <p className="text-sm md:text-base text-on-surface-variant dark:text-slate-400 leading-relaxed mt-2 max-w-4xl">
                {course.description}
              </p>
            </div>

            {/* Content Tabs headers */}
            <div className="pt-2">
              <div className="flex border-b border-[#c7c4d8]/30 dark:border-white/5 overflow-x-auto no-scrollbar gap-1 select-none">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'attachments', label: `Attachments (${mockAttachments.length})` },
                  { id: 'notes', label: 'My Notes' },
                  { id: 'discussion', label: 'Discussions' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 font-semibold text-sm transition-all relative border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id 
                        ? 'text-primary dark:text-primary-fixed-dim border-primary dark:border-primary-fixed-dim' 
                        : 'text-on-surface-variant dark:text-slate-400 border-transparent hover:text-primary dark:hover:text-primary-fixed-dim'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dynamic tab contents panel */}
              <div className="py-6 min-h-[220px]">
                <AnimatePresence mode="wait">
                  
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview-tab"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="font-bold text-base md:text-lg text-on-surface dark:text-white mb-3">
                          What You'll Learn in This Lesson
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {course.objectives.map((obj, i) => (
                            <li key={i} className="flex gap-2.5 items-start text-sm text-on-surface-variant dark:text-slate-300">
                              <span className="p-0.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-full mt-0.5 shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-[#c7c4d8]/20 dark:border-white/5 rounded-2xl flex items-start gap-4">
                        <img 
                          src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80" 
                          alt="Instructor"
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-on-surface dark:text-white">{course.author}</h4>
                          <p className="text-xs text-primary dark:text-primary-fixed-dim font-medium">{course.authorRole}</p>
                          <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 leading-relaxed">
                            {course.authorBio}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ATTACHMENTS TAB */}
                  {activeTab === 'attachments' && (
                    <motion.div
                      key="attachments-tab"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {mockAttachments.map(att => {
                        const Icon = att.icon;
                        const dlState = isDownloading[att.id];
                        return (
                          <div 
                            key={att.id}
                            className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary-fixed-dim/50 rounded-2xl p-4 flex items-center justify-between level-2-shadow transition-all group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2.5 bg-primary/10 text-primary dark:bg-primary-fixed-dim/10 dark:text-primary-fixed-dim rounded-xl shrink-0">
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-on-surface dark:text-white truncate group-hover:text-primary dark:group-hover:text-primary-fixed-dim transition-colors">
                                  {att.name}
                                </h4>
                                <p className="text-xs text-on-surface-variant dark:text-slate-400 font-medium mt-0.5">
                                  {att.ext} • {att.size}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDownload(att.id)}
                              disabled={dlState === true || dlState === 'done'}
                              className={`p-2.5 rounded-xl cursor-pointer transition-all shrink-0 ${
                                dlState === 'done'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : dlState === true
                                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                    : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300 hover:bg-primary hover:text-white'
                              }`}
                            >
                              {dlState === 'done' ? (
                                <Check className="w-4 h-4 stroke-[3.5]" />
                              ) : dlState === true ? (
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* NOTES TAB */}
                  {activeTab === 'notes' && (
                    <motion.div
                      key="notes-tab"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <form onSubmit={handleAddNote} className="space-y-3">
                        <label htmlFor="note-textarea" className="block text-xs font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                          Take a Note at {formatTime(currentTime)}
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            id="note-textarea"
                            rows="2"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Type important takeaway points, formulas, or reminders..."
                            className="flex-grow px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 resize-none font-medium leading-relaxed"
                          />
                          <button
                            type="submit"
                            className="px-4 bg-primary hover:bg-primary-container text-white font-bold rounded-xl flex items-center justify-center shadow transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </form>

                      <div className="space-y-3">
                        {notes.length === 0 ? (
                          <div className="text-center py-8 text-on-surface-variant dark:text-slate-400 text-sm">
                            No notes added for this course yet. Move the video playback and take a note!
                          </div>
                        ) : (
                          notes.map(note => (
                            <div 
                              key={note.id}
                              className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/20 dark:border-white/5 rounded-xl p-4 flex gap-4 transition-all hover:shadow-md group level-2-shadow"
                            >
                              <button
                                onClick={() => handleJumpToTime(note.timestamp)}
                                className="px-2.5 py-1 bg-primary/10 text-primary dark:bg-primary-fixed-dim/10 dark:text-primary-fixed-dim hover:bg-primary hover:text-white rounded-lg text-xs font-mono font-bold self-start cursor-pointer transition-colors"
                              >
                                {note.timeFormatted}
                              </button>
                              <div className="flex-grow min-w-0">
                                <p className="text-xs font-semibold text-primary dark:text-primary-fixed-dim truncate">
                                  {note.chapterTitle} • {note.lessonTitle}
                                </p>
                                <p className="text-sm text-on-surface-variant dark:text-slate-300 mt-1 font-medium leading-relaxed">
                                  {note.text}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 self-start opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Delete note"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* DISCUSSION TAB */}
                  {activeTab === 'discussion' && (
                    <motion.div
                      key="discussion-tab"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <form onSubmit={handleAddComment} className="flex gap-3">
                        <img 
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" 
                          alt="Your Avatar"
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-grow flex gap-2">
                          <textarea
                            rows="2"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Ask a question or contribute to the lecture discussion..."
                            className="flex-grow px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 resize-none font-medium leading-relaxed"
                          />
                          <button
                            type="submit"
                            className="px-4 bg-primary hover:bg-primary-container text-white font-bold rounded-xl flex items-center justify-center shadow transition-all active:scale-[0.98] cursor-pointer"
                          >
                            Post
                          </button>
                        </div>
                      </form>

                      <div className="space-y-4">
                        {((discussions[`${activeChapterIndex}-${activeLessonIndex}`]) || []).length === 0 ? (
                          <div className="text-center py-8 text-on-surface-variant dark:text-slate-400 text-sm">
                            No discussion posts for this lecture yet. Be the first to ask!
                          </div>
                        ) : (
                          (discussions[`${activeChapterIndex}-${activeLessonIndex}`] || []).map(comment => (
                            <div key={comment.id} className="flex gap-3 items-start">
                              <img 
                                src={comment.avatar} 
                                alt={comment.author} 
                                className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                              />
                              <div className="flex-grow bg-white dark:bg-slate-900 border border-[#c7c4d8]/20 dark:border-white/5 rounded-xl p-4 level-2-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-on-surface dark:text-white">{comment.author}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      comment.role === 'Instructor' 
                                        ? 'bg-primary/10 text-primary dark:bg-primary-fixed-dim/20 dark:text-primary-fixed-dim' 
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                      {comment.role}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">{comment.timestamp}</span>
                                </div>
                                <p className="text-sm text-on-surface-variant dark:text-slate-300 mt-2 font-medium leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Nav Bar buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-[#c7c4d8]/30 dark:border-white/5 mt-8 select-none">
              <button
                onClick={() => navigateLesson('prev')}
                disabled={!hasPrevLesson}
                className={`flex items-center gap-1.5 font-bold text-sm border rounded-xl px-5 py-3 transition-all cursor-pointer ${
                  hasPrevLesson 
                    ? 'text-on-surface border-[#c7c4d8] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800' 
                    : 'text-slate-300 dark:text-slate-700 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Lesson</span>
              </button>

              <button
                onClick={() => navigateLesson('next')}
                disabled={!hasNextLesson}
                className={`flex items-center gap-1.5 font-bold text-sm text-white bg-primary hover:bg-primary-container rounded-xl px-5 py-3 transition-all shadow cursor-pointer ${
                  !hasNextLesson ? 'opacity-40 cursor-not-allowed hover:bg-primary' : ''
                }`}
              >
                <span>{hasNextLesson ? 'Next Lesson' : 'Course Completed!'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Sidebar Column (Right - Curriculum contents) */}
          <aside className="lg:w-1/3 flex flex-col h-fit lg:sticky lg:top-[90px] select-none">
            <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              
              {/* Sidebar stats tracker */}
              <div className="p-5 border-b border-[#c7c4d8]/20 dark:border-white/5 bg-slate-50/60 dark:bg-slate-900">
                <h3 className="font-display font-bold text-base md:text-lg text-on-surface dark:text-white">
                  Course Curriculum
                </h3>
                <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant dark:text-slate-400 mt-3 mb-1.5">
                  <span>{progressPercent}% COMPLETE</span>
                  <span className="text-primary dark:text-primary-fixed-dim">{completedLessonsCount}/{totalLessonsCount} LESSONS</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Interactive Curriculum Accordions */}
              <div className="p-3 max-h-[500px] overflow-y-auto no-scrollbar space-y-2">
                {course.curriculum.map((chapter, cIdx) => {
                  const isExpanded = !!expandedChapters[cIdx];
                  return (
                    <div 
                      key={cIdx}
                      className="border border-[#c7c4d8]/15 dark:border-white/5 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleChapter(cIdx)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-left"
                      >
                        <h4 className="font-bold text-xs md:text-sm text-on-surface dark:text-white pr-2 leading-snug">
                          {chapter.chapterTitle}
                        </h4>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-2 pb-3 pt-1 border-t border-[#c7c4d8]/10 dark:border-white/5 space-y-1 bg-slate-50/20 dark:bg-slate-900/20">
                          {chapter.lessons.map((lesson, lIdx) => {
                            const isCurrent = activeChapterIndex === cIdx && activeLessonIndex === lIdx;
                            const isCompleted = completedLessons.includes(`${cIdx}-${lIdx}`);
                            
                            return (
                              <button
                                key={lIdx}
                                onClick={() => {
                                  setActiveChapterIndex(cIdx);
                                  setActiveLessonIndex(lIdx);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer group/item relative overflow-hidden ${
                                  isCurrent
                                    ? 'bg-primary/10 text-primary dark:bg-primary-fixed-dim/15 dark:text-primary-fixed-dim font-bold'
                                    : 'text-on-surface-variant dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                }`}
                              >
                                {isCurrent && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary dark:bg-primary-fixed-dim" />
                                )}

                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                                ) : isCurrent ? (
                                  <PlayCircle className="w-4 h-4 text-primary dark:text-primary-fixed-dim shrink-0 animate-pulse" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 text-slate-400 shrink-0 group-hover/item:text-primary dark:group-hover/item:text-primary-fixed-dim transition-colors" />
                                )}

                                <div className="flex-grow min-w-0 text-xs md:text-sm">
                                  <p className="truncate">{lesson.title}</p>
                                </div>

                                <span className="text-[10px] font-mono opacity-65 shrink-0 self-center">
                                  {lesson.duration}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </aside>

        </div>

      </main>

    </div>
  );
}
