const DEFAULT_COURSES = [
  {
    id: 1,
    title: "Full-Stack Web Development Bootcamp",
    category: "Web Development",
    price: "$89.99",
    priceVal: 89.99,
    rating: "4.9",
    reviews: 2400,
    author: "Sarah Wong",
    authorRole: "Senior Tech Architect at Vercel",
    authorBio: "Sarah is a seasoned web developer with 8+ years of production experience in JavaScript frameworks and cloud infrastructures. She is passionate about clean code and teaching modern software development practices.",
    authorRating: "4.9 Instructor Rating",
    authorStudents: "38,000+ Students",
    tag: "Bestseller",
    duration: "12 hours",
    difficulty: "Beginner",
    dateAdded: "2026-05-15",
    gradient: "from-[#4f46e5] to-emerald-700/60",
    description: "Master modern web technologies from frontend to backend. React, Node.js, and Postgres.",
    objectives: [
      "Build dynamic and interactive frontend UIs using React and Next.js.",
      "Develop robust backend servers and APIs using Express.js and Node.js.",
      "Understand database architecture and relational queries with PostgreSQL.",
      "Configure modern state management, routing, and deployment workflows."
    ],
    requirements: [
      "Basic understanding of HTML, CSS, and elementary Javascript logic.",
      "A code editor (VS Code recommended) and a stable internet connection."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Frontend Basics",
        duration: "3 hours",
        lessons: [
          { title: "Introduction to HTML5 and Semantics", duration: "25:00" },
          { title: "CSS Flexbox & CSS Grid Masterclass", duration: "45:00" },
          { title: "Javascript DOM Manipulation and Async Flow", duration: "50:00" }
        ]
      },
      {
        chapterTitle: "Chapter 2: React Deep Dive",
        duration: "5 hours",
        lessons: [
          { title: "React Component Lifecycle & Hooks", duration: "35:00" },
          { title: "State Management with Context API", duration: "55:00" },
          { title: "Building a Multi-page App with Next.js App Router", duration: "1:10:00" }
        ]
      },
      {
        chapterTitle: "Chapter 3: Backend & Database",
        duration: "4 hours",
        lessons: [
          { title: "Node.js Event Loop & Express API Router", duration: "40:00" },
          { title: "Relational Modeling with PostgreSQL", duration: "50:00" },
          { title: "JWT Authentication and Secure Deployments", duration: "45:00" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Advanced UI/UX Systems Design",
    category: "Design & UX",
    price: "$65.00",
    priceVal: 65.00,
    rating: "4.8",
    reviews: 1240,
    author: "Marcus Doe",
    authorRole: "Principal Product Designer @ TechFlow",
    authorBio: "Marcus is a Principal Product Designer with over 10 years of experience building scalable design systems for top-tier tech firms including Stripe, Linear, and Vercel. He specializes in bridging the gap between design and engineering, creating rigorous methodologies that improve team velocity and product consistency.",
    authorRating: "4.9 Instructor Rating",
    authorStudents: "45,000+ Students",
    tag: "Popular",
    duration: "15 hours",
    difficulty: "Advanced",
    dateAdded: "2026-03-10",
    gradient: "from-amber-600 to-[#ba1a1a]/50",
    description: "Create scalable design systems and master Figma components for enterprise applications.",
    objectives: [
      "Build scalable, enterprise-grade design systems from scratch.",
      "Master advanced Figma prototyping including variables and conditional logic.",
      "Establish seamless handoff workflows for development teams.",
      "Implement design tokens for consistent multi-platform branding.",
      "Audit and refactor legacy components to modern standards."
    ],
    requirements: [
      "Basic to intermediate knowledge of Figma interface and shortcuts.",
      "Understanding of foundational design principles (typography, color, spacing).",
      "A working computer with internet access and a Figma account."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Foundations of Design Systems",
        duration: "45 mins",
        lessons: [
          { title: "What is a Design System?", duration: "15:00" },
          { title: "Atomic Design Principles", duration: "20:00" },
          { title: "Setting up your Figma environment", duration: "10:00" }
        ]
      },
      {
        chapterTitle: "Chapter 2: Component Architecture",
        duration: "1 hour 20 mins",
        lessons: [
          { title: "Creating Scalable Component Libraries", duration: "30:00" },
          { title: "Figma Variables & Auto Layout v5", duration: "25:00" },
          { title: "Nested Components & Configurable Properties", duration: "25:00" }
        ]
      },
      {
        chapterTitle: "Chapter 3: Advanced Prototyping & Handoff",
        duration: "55 mins",
        lessons: [
          { title: "Variables & Conditional Logic Flow", duration: "25:00" },
          { title: "Design Tokens & Cross-Platform Syncing", duration: "15:00" },
          { title: "Developer Handoff Specifications & Documentation", duration: "15:00" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Applied Machine Learning Models",
    category: "AI & Machine Learning",
    price: "$120.00",
    priceVal: 120.00,
    rating: "5.0",
    reviews: 900,
    author: "Dr. Elena Rostova",
    authorRole: "AI Research Scientist at DeepMind",
    authorBio: "Dr. Elena Rostova specializes in Large Language Models and reinforcement learning. With a PhD in Computer Science, she designs enterprise AI workflows and consults for Fortune 500 tech systems.",
    authorRating: "4.8 Instructor Rating",
    authorStudents: "12,000+ Students",
    tag: "New",
    duration: "24 hours",
    difficulty: "Intermediate",
    dateAdded: "2026-04-20",
    gradient: "from-slate-900 to-[#4f46e5]/70",
    description: "Practical guide to deploying LLMs and building AI-driven applications using Python.",
    objectives: [
      "Understand supervised and unsupervised machine learning algorithms.",
      "Deploy open-source LLMs locally and orchestrate API pipelines.",
      "Apply prompt engineering and vector database retrieval (RAG).",
      "Train model endpoints and integrate them into modern web stacks."
    ],
    requirements: [
      "Intermediate familiarity with Python syntax.",
      "Basic mathematics, linear algebra, and statistics fundamentals."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: ML Fundamentals",
        duration: "6 hours",
        lessons: [
          { title: "Linear and Logistic Regression in Python", duration: "1:30:00" },
          { title: "Decision Trees & Random Forests", duration: "2:00:00" },
          { title: "Evaluating Accuracy and Feature Engineering", duration: "2:30:00" }
        ]
      },
      {
        chapterTitle: "Chapter 2: Deep Learning & Neural Nets",
        duration: "10 hours",
        lessons: [
          { title: "Introduction to PyTorch & Neural Structures", duration: "3:00:00" },
          { title: "Convolutional Neural Nets (CNN) for Computer Vision", duration: "3:30:00" },
          { title: "Transformers and Self-Attention Networks", duration: "3:30:00" }
        ]
      },
      {
        chapterTitle: "Chapter 3: LLMs & Production Deployments",
        duration: "8 hours",
        lessons: [
          { title: "Fine-tuning models using HuggingFace", duration: "2:30:00" },
          { title: "Retrieval-Augmented Generation (RAG) with ChromaDB", duration: "3:00:00" },
          { title: "Deploying API models with FastAPI and Docker", duration: "2:30:00" }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Machine Learning Fundamentals",
    category: "AI & Machine Learning",
    price: "Free",
    priceVal: 0,
    rating: "4.8",
    reviews: 15000,
    author: "Andrew Ng",
    authorRole: "Co-founder of Coursera & Stanford Adjunct Professor",
    authorBio: "Andrew Ng is a global pioneer in AI, former chief scientist at Baidu, and founder of Google Brain. He has taught millions of students globally about machine learning.",
    authorRating: "5.0 Instructor Rating",
    authorStudents: "4.5M+ Students",
    tag: "AI/ML",
    duration: "24 hours",
    difficulty: "Beginner",
    dateAdded: "2026-03-10",
    gradient: "from-slate-900 to-indigo-950/80",
    description: "Build a strong foundation in linear regression, classification, neural networks, and clustering with Python.",
    objectives: [
      "Master foundational concepts of Machine Learning.",
      "Write efficient vectorised implementations in Python.",
      "Understand supervised learning algorithms (regression & classification)."
    ],
    requirements: [
      "Basic programming logic in Python.",
      "Basic algebra concepts."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Intro to Supervised Learning",
        duration: "8 hours",
        lessons: [
          { title: "Supervised vs Unsupervised Models", duration: "1:20:00" },
          { title: "Linear Regression with Single Variable", duration: "3:10:00" },
          { title: "Gradient Descent Algorithm and Convergence", duration: "3:30:00" }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Product Management 101",
    category: "Business Strategy",
    price: "$49.99",
    priceVal: 49.99,
    rating: "4.7",
    reviews: 1200,
    author: "Lenny Rachitsky",
    authorRole: "Author of Lenny's Newsletter & Ex-Airbnb PM",
    authorBio: "Lenny writes the #1 business newsletter on Substack. He was previously a product lead at Airbnb and has spent years researching and advising modern product teams.",
    authorRating: "4.8 Instructor Rating",
    authorStudents: "95,000+ Students",
    tag: "Product",
    duration: "8 hours",
    difficulty: "Beginner",
    dateAdded: "2026-04-20",
    gradient: "from-amber-600 to-rose-700/60",
    description: "Learn client discovery, write actionable PRDs, optimize engineering sprint cycles, and structure roadmaps.",
    objectives: [
      "Learn client discovery methodologies.",
      "Draft actionable PRDs and coordinate sprint cycles.",
      "Understand and define clear product metrics (North Star Metric)."
    ],
    requirements: [
      "None. Perfect for transitioning designers, engineers, and marketers."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Product Strategy & Vision",
        duration: "4 hours",
        lessons: [
          { title: "What is Product Management?", duration: "45:00" },
          { title: "Finding Product-Market Fit (PMF)", duration: "1:15:00" },
          { title: "Defining the North Star Metric", duration: "2:00:00" }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "AI-Driven Product Design",
    category: "AI & Machine Learning",
    price: "$99.99",
    priceVal: 99.99,
    rating: "4.6",
    reviews: 850,
    author: "Dr. Elena Rostova",
    authorRole: "AI Research Scientist at DeepMind",
    authorBio: "Dr. Elena Rostova specializes in Large Language Models and reinforcement learning. With a PhD in Computer Science, she designs enterprise AI workflows and consults for Fortune 500 tech systems.",
    authorRating: "4.8 Instructor Rating",
    authorStudents: "12,000+ Students",
    tag: "AI Art",
    duration: "10 hours",
    difficulty: "Intermediate",
    dateAdded: "2026-05-25",
    gradient: "from-cyan-900 to-emerald-900/60",
    description: "Create human-centered designs centered around generative LLMs, prompt interfaces, and dynamic layouts.",
    objectives: [
      "Design systems optimized for generative LLMs.",
      "Create high-quality prompt interfaces and dynamic responsive feeds.",
      "Understand human-AI interaction patterns."
    ],
    requirements: [
      "Familiarity with modern UI layout design."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Prompt UI Engineering",
        duration: "5 hours",
        lessons: [
          { title: "LLM States and UI Response Microcopy", duration: "1:30:00" },
          { title: "Designing Conversational Interfaces", duration: "2:00:00" },
          { title: "Streaming Data State Layouts", duration: "1:30:00" }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Next.js 15 App Router Deep Dive",
    category: "Web Development",
    price: "$69.99",
    priceVal: 69.99,
    rating: "4.8",
    reviews: 1950,
    author: "Lee Robinson",
    authorRole: "VP of Developer Experience at Vercel",
    authorBio: "Lee directs dev experience at Vercel and is one of the leading authorities on Next.js, hosting workshops and teaching hundreds of thousands of developers worldwide.",
    authorRating: "4.9 Instructor Rating",
    authorStudents: "150,000+ Students",
    tag: "Next.js",
    duration: "14 hours",
    difficulty: "Intermediate",
    dateAdded: "2026-05-29",
    gradient: "from-neutral-800 to-slate-900/90",
    description: "Master React Server Actions, routing lifecycles, full-scale static caching, and edge middleware optimization.",
    objectives: [
      "Configure complex directory layouts and dynamic routes.",
      "Leverage React Server Components and Server Actions.",
      "Integrate advanced client caching and page pre-rendering."
    ],
    requirements: [
      "Good familiarity with React hooks and functional programming."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: App Router & Routing States",
        duration: "7 hours",
        lessons: [
          { title: "Server vs Client Components", duration: "2:00:00" },
          { title: "Nested Directories & Parallel Routing", duration: "2:30:00" },
          { title: "Intercepting Routes & Modal Overlays", duration: "2:30:00" }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Financial Modeling & Valuations",
    category: "Business Strategy",
    price: "$129.99",
    priceVal: 129.99,
    rating: "4.7",
    reviews: 940,
    author: "John Doe",
    authorRole: "Ex-Goldman Sachs Senior Analyst",
    authorBio: "John spent 7 years as a senior investment banking analyst, advising corporations on mergers, acquisitions, and restructuring metrics.",
    authorRating: "4.6 Instructor Rating",
    authorStudents: "8,500+ Students",
    tag: "Finance",
    duration: "18 hours",
    difficulty: "Advanced",
    dateAdded: "2026-02-15",
    gradient: "from-emerald-700 to-teal-900/80",
    description: "Develop professional three-statement operating models, DCF outputs, and merger analyses from scratch.",
    objectives: [
      "Build professional 3-statement corporate models.",
      "Perform DCF valuations and mergers analysis.",
      "Understand capital structure modeling."
    ],
    requirements: [
      "Basic knowledge of accounting spreadsheets (Excel or Google Sheets)."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Modeling Foundations",
        duration: "8 hours",
        lessons: [
          { title: "Creating the Income Statement Flow", duration: "2:30:00" },
          { title: "Balancing the Balance Sheet", duration: "3:00:00" },
          { title: "Drafting the Statement of Cash Flows", duration: "2:30:00" }
        ]
      }
    ]
  },
  {
    id: 9,
    title: "Creative Coding with WebGL & Three.js",
    category: "Design & UX",
    price: "Free",
    priceVal: 0,
    rating: "4.9",
    reviews: 1100,
    author: "Yuri Artiukh",
    authorRole: "Creative Director at Cydump & Shader Educator",
    authorBio: "Yuri is a creative coder who creates state of the art web designs. He educates thousands on the power of canvas, shaders, and creative mathematics.",
    authorRating: "4.9 Instructor Rating",
    authorStudents: "14,000+ Students",
    tag: "WebGL",
    duration: "20 hours",
    difficulty: "Advanced",
    dateAdded: "2026-05-10",
    gradient: "from-purple-900 to-rose-900/70",
    description: "Animate interactive 3D structures, customize vertex and fragment GLSL shaders, and optimize GPU processing.",
    objectives: [
      "Understand WebGL concepts and canvas coordinates.",
      "Implement custom GLSL fragment and vertex shaders.",
      "Design complex Three.js particle clouds and materials."
    ],
    requirements: [
      "Good knowledge of vanilla Javascript.",
      "Basic trigonometry."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Three.js Setup & Meshes",
        duration: "10 hours",
        lessons: [
          { title: "Vite + Three.js Setup", duration: "2:00:00" },
          { title: "Understanding Lights, Cameras & Geometries", duration: "4:00:00" },
          { title: "Adding Custom Textures and Orbit Controls", duration: "4:00:00" }
        ]
      }
    ]
  },
  {
    id: 10,
    title: "Data Structures & Algorithms in Go",
    category: "Web Development",
    price: "$59.99",
    priceVal: 59.99,
    rating: "4.5",
    reviews: 720,
    author: "Rob Pike",
    authorRole: "Co-creator of the Go Language",
    authorBio: "Rob Pike is a legendary software engineer, pioneer in Unix systems, and co-creator of Go. He was formerly a distinguished engineer at Google.",
    authorRating: "5.0 Instructor Rating",
    authorStudents: "300,000+ Students",
    tag: "GoLang",
    duration: "16 hours",
    difficulty: "Intermediate",
    dateAdded: "2026-01-20",
    gradient: "from-sky-700 to-indigo-900/80",
    description: "Implement binary trees, graphs, sorting routines, dynamic programming, and complexity estimates in Go.",
    objectives: [
      "Master Go pointers and struct methods.",
      "Write efficient sorting and search routines.",
      "Understand and implement complex binary trees and graph nodes."
    ],
    requirements: [
      "Basic familiarity with compiler setups and static typing."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Golang Pointers & Memory",
        duration: "5 hours",
        lessons: [
          { title: "Understanding Stack vs Heap in Go", duration: "1:30:00" },
          { title: "Custom Structs & Pointer Receivers", duration: "1:30:00" },
          { title: "Slices, Arrays, & Internal Mechanics", duration: "2:00:00" }
        ]
      }
    ]
  },
  {
    id: 11,
    title: "Designing for Growth & Scale",
    category: "Design & UX",
    price: "$59.99",
    priceVal: 59.99,
    rating: "4.8",
    reviews: 1600,
    author: "Julie Zhuo",
    authorRole: "Author of The Making of a Manager & Ex-VP Design FB",
    authorBio: "Julie was the VP of Product Design at Facebook, managing massive teams. She is a prominent designer, advisor, and author.",
    authorRating: "4.9 Instructor Rating",
    authorStudents: "42,000+ Students",
    tag: "Growth UX",
    duration: "9 hours",
    difficulty: "Beginner",
    dateAdded: "2026-05-02",
    gradient: "from-violet-600 to-pink-700/60",
    description: "Implement product experiments, onboarding flows, A/B feedback tests, and data-backed UX design.",
    objectives: [
      "Formulate product tests and cohort A/B frameworks.",
      "Design user onboarding flows that maximize conversions.",
      "Read and integrate usage analytics to design iteratively."
    ],
    requirements: [
      "None. Highly suitable for UI designers and growth managers."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Growth UX Principles",
        duration: "4 hours",
        lessons: [
          { title: "Understanding User Activation", duration: "1:30:00" },
          { title: "Reducing Onboarding Friction Points", duration: "1:30:00" },
          { title: "Designing Call to Actions (CTAs)", duration: "1:00:00" }
        ]
      }
    ]
  },
  {
    id: 12,
    title: "Executive Leadership Essentials",
    category: "Business Strategy",
    price: "Free",
    priceVal: 0,
    rating: "4.6",
    reviews: 2100,
    author: "Sheryl Sandberg",
    authorRole: "Ex-COO of Meta & Author of Lean In",
    authorBio: "Sheryl served as COO of Meta for 14 years, scaling the company from a startup to a tech conglomerate. She is an author and leader of global scale.",
    authorRating: "4.7 Instructor Rating",
    authorStudents: "60,000+ Students",
    tag: "Leadership",
    duration: "6 hours",
    difficulty: "Advanced",
    dateAdded: "2026-02-28",
    gradient: "from-teal-600 to-emerald-950/80",
    description: "Build high-performing collaborative teams, manage global changes, and steer organizational culture.",
    objectives: [
      "Lead cross-functional engineering and business teams.",
      "Build clear organizational hierarchies and communication channels.",
      "Understand crisis management strategies."
    ],
    requirements: [
      "Basic corporate management experience."
    ],
    curriculum: [
      {
        chapterTitle: "Chapter 1: Leading Teams",
        duration: "3 hours",
        lessons: [
          { title: "Building Trust and Ownership in Teams", duration: "1:00:00" },
          { title: "Aligning Objectives (OKRs)", duration: "1:00:00" },
          { title: "Fostering Open Feedback Culture", duration: "1:00:00" }
        ]
      }
    ]
  }
];

let loadedCourses = DEFAULT_COURSES;
if (typeof window !== 'undefined' && window.localStorage) {
  const saved = localStorage.getItem('skillelevate_courses');
  if (saved) {
    try {
      loadedCourses = JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing courses from localStorage:", e);
      loadedCourses = DEFAULT_COURSES;
    }
  } else {
    localStorage.setItem('skillelevate_courses', JSON.stringify(DEFAULT_COURSES));
  }
}

export const COURSES_DATA = loadedCourses;
export const getCourseById = (id) => COURSES_DATA.find(course => course.id === parseInt(id));
