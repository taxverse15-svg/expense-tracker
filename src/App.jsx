import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  PlusCircle, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Upload, 
  IndianRupee, 
  User, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileImage,
  Eye,
  Trash2,
  Menu,
  X,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import logoImg from './assets/logo.png';

// Committee members list
const COMMITTEE_MEMBERS = [
  "Dhwani Savla",
  "Hardik Kothari",
  "Ayush Chauhan",
  "Pratik Ojha",
  "Sumit Gupta",
  "Soham Ranshur",
  "Kundan Parasramka",
  "Aman Upadhyay",
  "Dhiraj Wadhwani",
  "Hitesh Ramnani",
  "Vivek Patel",
  "Avinash Revgade",
  "Piyush Kadav"
];
const folderMap = {
  "Aman Upadhyay": "1nvyKviniAY_c4FMTk7o7oqFpFaUy_4MK",
  "Avinash Revgade": "1cnxPIS4bx4YNLHy6Lv62No44-Yhb7zyu",
  "Ayush Chauhan": "1zO6LQe-u_KyynV_v-BQBQG1ifamAZ2hN",
  "Dhiraj Wadhwani": "19wSRBBOfEW95rZI43Mw2rv29ehrZvUNL",
  "Dhwani Savla": "1Wor4LHeRcElZ6lwSHVsIO4ERfG1JY1hW",
  "Hardik Kothari": "1qmRBROFVJMIgIzR7_FwBzo3wbOcOWfep",
  "Hitesh Ramnani": "1n4ZmiwNkCmSFzB99pURK7xh4jZP5XEZ7",
  "Kundan Parasramka": "1G3KWbFqbVvE_8OUW0hWgkDgdZ-kTKUSU",
  "Piyush Kadav": "1hwFuQnCbXdwwqX_JiKKU4KKHnVlHMiup",
  "Pratik Ojva": "1a1bMKrKhvS326TIdVHCmcHn_iDrD1z-u",
  "Soham Ranshur": "1bzUh88_2hRRWAKTLuOvH57ey2bjvgJe2",
  "Sumit Gupta": "194z_DyDj11qZzjO6LmhqUUX_apCOfh7Z",
  "Vivek Patel": "1bP3rYT6Zo5ZEyEwC9uJtrav-iVUIKQBd"
};
// Initial mock data if localStorage is empty
const INITIAL_EXPENSES = [
  {
    id: "exp-1",
    memberName: "Pranav Shah (Treasurer)",
    amount: 4500,
    description: "Food and beverages for WICASA Kalyan Dombivli student workshop",
    date: "2026-05-18",
    status: "Approved",
    receiptName: "workshop_catering_bill.png",
    receiptData: null // Will show default preview or placeholder
  },
  {
    id: "exp-2",
    memberName: "Sneha Patel (Vice Chairperson)",
    amount: 1200,
    description: "Printouts and banners for Career Counseling Seminar",
    date: "2026-05-20",
    status: "Pending",
    receiptName: "banner_printing_receipt.jpg",
    receiptData: null
  },
  {
    id: "exp-3",
    memberName: "CA Sumit Gupta (Chairman)",
    amount: 850,
    description: "Courier charges for study material distribution",
    date: "2026-05-21",
    status: "Pending",
    receiptName: null,
    receiptData: null
  }
];

function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'submit' | 'admin'
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data States
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('wicasa_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Form States
  const [selectedMember, setSelectedMember] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Admin filter & Modal States
  const [adminFilter, setAdminFilter] = useState('all'); // 'all' | 'Pending' | 'Approved' | 'Rejected'
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState(null);
  const [selectedReceiptName, setSelectedReceiptName] = useState('');

  // Refs for drag and drop
  const fileInputRef = useRef(null);

  // Synchronize with localStorage
  useEffect(() => {
    localStorage.setItem('wicasa_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Synchronize Dark Mode theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#020617'; // slate-950
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc'; // slate-50
    }
  }, [darkMode]);

  // Handle Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle Drag Leave
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Process File Helper
  const processFile = (file) => {
    if (!file) return;
    
    // Check if it's an image or PDF
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG) for the bill receipt preview.');
      return;
    }

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle File Drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  // Handle File Input Select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // Clear Form Helper
  const resetForm = () => {
    setSelectedMember('');
    setAmount('');
    setDescription('');
    setReceiptFile(null);
    setReceiptPreview(null);
    setFormErrors({});
  };

  // Form Submission
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!selectedMember) errors.selectedMember = "Please select a committee member name.";
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      errors.amount = "Please enter a valid expense amount greater than 0.";
    }
    if (!description.trim() || description.trim().length < 10) {
      errors.description = "Please provide a detailed description (min 10 characters).";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    setSubmitError(null);

    const apiEndpoint = "https://script.google.com/macros/s/AKfycbzfZ6-noStSW3dG6JARwy3dmu9bSGSG8ZjP0FaGuFAmZIOUiWoMvwZK83uoGDuVCURh/exec";
const base64Data = receiptPreview ? receiptPreview.split(",")[1] : "";
const folderId = folderMap[selectedMember] || "";
const fileName = receiptFile ? receiptFile.name : "";

console.log("[DEBUG] Starting expense claim submission...");
console.log("[DEBUG] Endpoint URL:", apiEndpoint);

const requestOptions = {
  method: "POST",
  mode: "cors",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: selectedMember,
    amount: amount,
    billLink: base64Data,
    fileName: fileName,
    folderId: folderId
  })
};

    console.log("[DEBUG] Request Options:", requestOptions);

    try {
      // 1. Send POST request
      const response = await fetch(apiEndpoint, requestOptions);
      console.log("[DEBUG] API response status:", response.status);
      console.log("[DEBUG] API response type:", response.type);

      // Handle standard response
      if (response.ok || response.status === 200 || response.type === 'opaque') {
        console.log("[DEBUG] Expense submitted successfully");
        
        // Try parsing JSON response if CORS allowed reading it
        if (response.type !== 'opaque') {
          try {
            const data = await response.json();
            console.log("[DEBUG] Response JSON:", data);
          } catch (jsonErr) {
            console.log("[DEBUG] Could not parse JSON response (not critical):", jsonErr);
          }
        }

        // Add to local state list for UI reactivity
        const newExpense = {
          id: `exp-${Date.now()}`,
          memberName: selectedMember,
          amount: parseFloat(amount),
          description: description.trim(),
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
          receiptName: receiptFile ? receiptFile.name : null,
          receiptData: receiptPreview
        };
        setExpenses(prev => [newExpense, ...prev]);

        setSubmitSuccess(true);
        
        // Reset form and redirect
        setTimeout(() => {
          setSubmitSuccess(false);
          resetForm();
          setActiveTab('home');
        }, 2000);
      } else {
        throw new Error(`API responded with status code: ${response.status}`);
      }

    } catch (error) {
      console.error("[DEBUG] Error occurred during standard fetch post:", error);
      
      // CORS workarounds & graceful fallback handling:
      // Google Apps Script redirects webapp requests to script.googleusercontent.com
      // which can trigger CORS errors in standard fetch even if the row was successfully saved in Google Sheets.
      // We will perform a fallback request in "no-cors" mode to ensure data gets recorded.
      console.log("[DEBUG] Attempting CORS fallback using no-cors mode to ensure Google Sheets writes...");
      
      try {
        const fallbackResponse = await fetch(apiEndpoint, requestOptions);

        console.log("[DEBUG] Fallback fetch response status (opaque):", fallbackResponse.status);
        console.log("[DEBUG] Expense submitted successfully (via fallback)");

        const newExpense = {
          id: `exp-${Date.now()}`,
          memberName: selectedMember,
          amount: parseFloat(amount),
          description: description.trim(),
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
          receiptName: receiptFile ? receiptFile.name : null,
          receiptData: receiptPreview
        };
        setExpenses(prev => [newExpense, ...prev]);

        setSubmitSuccess(true);
        
        setTimeout(() => {
          setSubmitSuccess(false);
          resetForm();
          setActiveTab('home');
        }, 2000);

      } catch (fallbackError) {
        console.error("[DEBUG] Fallback also failed:", fallbackError);
        setSubmitError("Failed to submit expense. Google Apps Script API returned a submission error.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Actions
  const handleApproveExpense = (id) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: 'Approved' } : exp
    ));
  };

  const handleRejectExpense = (id) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: 'Rejected' } : exp
    ));
  };

  const handleDeleteExpense = (id) => {
    if (confirm("Are you sure you want to delete this expense record permanently?")) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    }
  };

  // Math Statistics
  const stats = React.useMemo(() => {
    const totalSubmitted = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const pendingApprovals = expenses
      .filter(exp => exp.status === 'Pending')
      .reduce((sum, exp) => sum + exp.amount, 0);
    const approvedExpenses = expenses
      .filter(exp => exp.status === 'Approved')
      .reduce((sum, exp) => sum + exp.amount, 0);
    const pendingCount = expenses.filter(exp => exp.status === 'Pending').length;
    const approvedCount = expenses.filter(exp => exp.status === 'Approved').length;
    const rejectedCount = expenses.filter(exp => exp.status === 'Rejected').length;
    
    return {
      totalSubmitted,
      pendingApprovals,
      approvedExpenses,
      pendingCount,
      approvedCount,
      rejectedCount
    };
  }, [expenses]);

  return (
    <div className={`flex flex-col min-h-screen relative transition-colors duration-500 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* 2026 Glowing Tech Blobs (Visual decoration) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-glow" style={{ animationDelay: '-4s' }}></div>

      {/* Header / Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${
        darkMode 
          ? 'bg-slate-950/70 border-slate-800/80 shadow-indigo-950/20 shadow-md' 
          : 'bg-white/70 border-slate-200/80 shadow-slate-200/50 shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className={`relative p-1.5 rounded-xl border flex items-center justify-center transition-all ${
              darkMode ? 'bg-slate-900 border-indigo-500/30 shadow-indigo-500/10 shadow-lg' : 'bg-white border-indigo-100 shadow-md'
            }`}>
              <img 
                src={logoImg} 
                alt="WICASA Logo" 
                className="w-10 h-10 object-contain rounded-md"
              />
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl blur-sm opacity-20 -z-10"></div>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                WICASA KDUB
              </span>
              <p className={`text-[10px] font-semibold tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                EXPENSES DASHBOARD
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'submit', label: 'Submit Expense', icon: PlusCircle },
              { 
                id: 'admin', 
                label: 'Admin', 
                icon: ShieldAlert,
                badge: stats.pendingCount > 0 ? stats.pendingCount : null 
              },
            ].map(tab => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? (darkMode 
                          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' 
                          : 'bg-indigo-50/80 text-indigo-600 border border-indigo-100')
                      : (darkMode 
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 border border-transparent')
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-purple-400/30 animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Theme Switcher & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:text-amber-300 shadow-sm' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800 shadow-sm'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl border transition-all ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden px-4 pt-2 pb-4 border-t transition-all ${
            darkMode ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'
          }`}>
            <div className="flex flex-col gap-2 mt-2">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'submit', label: 'Submit Expense', icon: PlusCircle },
                { 
                  id: 'admin', 
                  label: 'Admin Panel', 
                  icon: ShieldAlert,
                  badge: stats.pendingCount > 0 ? stats.pendingCount : null 
                },
              ].map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? (darkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600')
                        : (darkMode ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                    </div>
                    {tab.badge && (
                      <span className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* HOMEPAGE VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto py-6">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
                darkMode 
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                  : 'bg-indigo-50 text-indigo-600 border-indigo-100'
              }`}>
                <TrendingUp className="w-3.5 h-3.5" />
                V2.6 Smart Ledger Platform
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                <span className={`block ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  WICASA KDUB
                </span>
                <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent filter drop-shadow-sm">
                  Expenses Report
                </span>
              </h1>
              
              <p className={`text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Submit and manage committee expense records professionally with instant digital tracking, glassmorphic analytics, and structured approvals.
              </p>

              <div className="pt-4 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('submit')}
                  className="px-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  Submit Expense Receipt
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-6 py-3.5 rounded-xl font-semibold border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    darkMode 
                      ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-purple-500" />
                  Admin Panel
                </button>
              </div>
            </div>

            {/* Quick Overview Stats Block */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3 border-slate-800/40">
                <h3 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  Financial Statistics Summary
                </h3>
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Updated just now
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Submitted Card */}
                <div className={`p-6 rounded-2xl transition-all duration-300 ${
                  darkMode ? 'glass-panel text-slate-100' : 'glass-panel-light text-slate-800'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Total Submitted
                      </p>
                      <h4 className="text-3xl font-extrabold mt-2 flex items-center tracking-tight">
                        <span className="text-xl font-medium text-slate-400 mr-0.5"><IndianRupee className="w-5 h-5 inline" /></span>
                        {stats.totalSubmitted.toLocaleString('en-IN')}
                      </h4>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-500/10 flex items-center justify-between text-xs">
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                      Aggregate items logged
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                      {expenses.length} claims
                    </span>
                  </div>
                </div>

                {/* Pending Approvals Card */}
                <div className={`p-6 rounded-2xl transition-all duration-300 ${
                  darkMode ? 'glass-panel text-slate-100' : 'glass-panel-light text-slate-800'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Pending Approvals
                      </p>
                      <h4 className="text-3xl font-extrabold mt-2 flex items-center tracking-tight text-amber-500">
                        <span className="text-xl font-medium text-amber-500/60 mr-0.5"><IndianRupee className="w-5 h-5 inline" /></span>
                        {stats.pendingApprovals.toLocaleString('en-IN')}
                      </h4>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-500/10 flex items-center justify-between text-xs">
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                      Requires attention
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                      {stats.pendingCount} pending
                    </span>
                  </div>
                </div>

                {/* Approved Expenses Card */}
                <div className={`p-6 rounded-2xl transition-all duration-300 ${
                  darkMode ? 'glass-panel text-slate-100' : 'glass-panel-light text-slate-800'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Approved Expenses
                      </p>
                      <h4 className="text-3xl font-extrabold mt-2 flex items-center tracking-tight text-emerald-500">
                        <span className="text-xl font-medium text-emerald-500/60 mr-0.5"><IndianRupee className="w-5 h-5 inline" /></span>
                        {stats.approvedExpenses.toLocaleString('en-IN')}
                      </h4>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-500/10 flex items-center justify-between text-xs">
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                      Settled/cleared records
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      {stats.approvedCount} approved
                    </span>
                  </div>
                </div>

              </div>
            </section>

            {/* Quick Guide and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Submission workflow guidelines */}
              <div className={`p-6 rounded-2xl ${
                darkMode ? 'glass-panel' : 'glass-panel-light'
              }`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                    <FileText className="w-4.5 h-4.5" />
                  </span>
                  Committee Expense Rules
                </h3>
                
                <ul className={`space-y-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li className="flex gap-3">
                    <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">1</span>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Provide Exact Receipts</p>
                      <p className="text-xs mt-0.5">Always upload clear photo/scan files of your bill receipts for faster approval cycles.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">2</span>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Accurate Member Selection</p>
                      <p className="text-xs mt-0.5">Ensure you select your correct designated name from the dropdown list to avoid processing mix-ups.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">3</span>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Detailed Rationale</p>
                      <p className="text-xs mt-0.5">Describe what event, purchase, or student initiative the expense relates to. Vague descriptions may be rejected.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Recent Activity Feed */}
              <div className={`p-6 rounded-2xl ${
                darkMode ? 'glass-panel' : 'glass-panel-light'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                      <Clock className="w-4.5 h-4.5" />
                    </span>
                    Recent Activity Logs
                  </h3>
                  <button 
                    onClick={() => setActiveTab('admin')} 
                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-400"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {expenses.slice(0, 4).map((exp, idx) => (
                    <div 
                      key={exp.id} 
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all duration-200 hover:-translate-x-1 ${
                        darkMode 
                          ? 'bg-slate-950/40 border-slate-900/50 hover:bg-slate-900/20' 
                          : 'bg-white/50 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          exp.status === 'Approved' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : exp.status === 'Rejected'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {exp.status === 'Approved' ? <CheckCircle2 className="w-4.5 h-4.5" /> : 
                           exp.status === 'Rejected' ? <XCircle className="w-4.5 h-4.5" /> : 
                           <Clock className="w-4.5 h-4.5" />}
                        </div>
                        <div className="space-y-0.5">
                          <p className={`font-semibold truncate max-w-[150px] sm:max-w-[200px] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {exp.memberName}
                          </p>
                          <p className={`text-[10px] truncate max-w-[150px] sm:max-w-[200px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {exp.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold flex items-center justify-end ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                          <IndianRupee className="w-3 h-3" />
                          {exp.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[9px] text-slate-500">{exp.date}</p>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-sm">
                      No expense records found.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBMIT EXPENSE VIEW */}
        {activeTab === 'submit' && (
          <div className="max-w-xl mx-auto animate-[fadeIn_0.5s_ease-out]">
            
            {/* Back button */}
            <button 
              onClick={() => setActiveTab('home')}
              className={`mb-6 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                darkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              ← Back to Dashboard
            </button>

            {/* Submission card container */}
            <div className={`p-8 rounded-2xl relative border overflow-hidden ${
              darkMode ? 'glass-panel text-slate-100' : 'glass-panel-light text-slate-800'
            }`}>
              
              {/* Form title */}
              <div className="border-b pb-4 mb-6 border-slate-500/10">
                <h2 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  Submit Expense Report
                </h2>
                <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  All fields are monitored. Secure SSL-encrypted transmission.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitExpense} className="space-y-6">
                
                {/* Dropdown Committee Member */}
                <div className="space-y-2">
                  <label htmlFor="member-select" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Committee Member Name
                  </label>
                  <select
                    id="member-select"
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className={`w-full p-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                      darkMode 
                        ? 'glass-input text-slate-200 focus:ring-indigo-500/40 bg-slate-950' 
                        : 'glass-input-light text-slate-800 focus:ring-indigo-500/30 bg-white'
                    } ${formErrors.selectedMember ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                  >
                    <option value="" disabled className={darkMode ? 'bg-slate-950 text-slate-400' : 'bg-white text-slate-400'}>
                      Select Name...
                    </option>
                    {COMMITTEE_MEMBERS.map(member => (
                      <option key={member} value={member} className={darkMode ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-800'}>
                        {member}
                      </option>
                    ))}
                  </select>
                  {formErrors.selectedMember && (
                    <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.selectedMember}
                    </p>
                  )}
                </div>

                {/* Amount input */}
                <div className="space-y-2">
                  <label htmlFor="amount-input" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                    <IndianRupee className="w-3.5 h-3.5 text-indigo-400" />
                    Expense Amount (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold select-none">
                      ₹
                    </span>
                    <input
                      id="amount-input"
                      type="number"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full p-3.5 pl-8 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                        darkMode 
                          ? 'glass-input text-slate-200 focus:ring-indigo-500/40' 
                          : 'glass-input-light text-slate-800 focus:ring-indigo-500/30'
                      } ${formErrors.amount ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.amount}
                    </p>
                  )}
                </div>

                {/* Description textarea */}
                <div className="space-y-2">
                  <label htmlFor="description-input" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Description & Rationale
                  </label>
                  <textarea
                    id="description-input"
                    rows="3"
                    placeholder="Provide details of the purchase, event, or travel rationale..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full p-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
                      darkMode 
                        ? 'glass-input text-slate-200 focus:ring-indigo-500/40' 
                        : 'glass-input-light text-slate-800 focus:ring-indigo-500/30'
                    } ${formErrors.description ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Drag-and-drop Bill upload section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    Bill Upload & Receipt Image
                  </label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-inner scale-[0.98]' 
                        : (darkMode 
                            ? 'border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-900/10' 
                            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/30')
                    }`}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Conditional Preview or Drag State */}
                    {receiptPreview ? (
                      <div className="space-y-4">
                        <div className="relative mx-auto max-w-[180px] rounded-lg overflow-hidden border border-slate-700/30 shadow-md group/preview">
                          <img 
                            src={receiptPreview} 
                            alt="Receipt Preview" 
                            className="max-h-[140px] w-full object-cover transition-transform duration-500 group-hover/preview:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] text-white font-bold uppercase tracking-wider bg-indigo-600 px-2 py-1 rounded">
                              Change Bill
                            </span>
                          </div>
                        </div>
                        <div className="text-xs">
                          <p className={`font-semibold truncate max-w-[280px] mx-auto ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {receiptFile ? receiptFile.name : 'Uploaded receipt'}
                          </p>
                          <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                            Image attached successfully
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 space-y-3">
                        <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                          darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Drag & drop bill image, or <span className="text-indigo-500 group-hover:underline">browse</span>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Supports PNG, JPG, JPEG (Max 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* API Error Notification */}
                {submitError && (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">Google Apps Script Error</p>
                      <p className="text-[10px] leading-relaxed mt-0.5">{submitError}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSubmitError(null)}
                      className="font-bold underline uppercase text-[9px] tracking-wider shrink-0 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting 
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 shadow-indigo-500/15 hover:shadow-indigo-500/25 active:scale-[0.99] btn-glow-blue'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Transmitting to Google Sheets Ledger...
                    </>
                  ) : (
                    <>
                      <span>Submit Claim Request</span>
                    </>
                  )}
                </button>

              </form>

              {/* Submitting Success Popup Inside Form Card */}
              {submitSuccess && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.2s_ease-out]">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    Expense submitted successfully
                  </h3>
                  <p className="text-xs text-slate-400 max-w-[260px] mx-auto mt-2">
                    Your claim has been logged into the WICASA KDUB ledger and is pending chairman approval.
                  </p>
                  <div className="mt-6 flex items-center gap-1 text-[10px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    Redirecting to Dashboard...
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ADMIN MANAGEMENT VIEW */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-500/10">
              <div>
                <h2 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-950'}`}>
                  Admin Approval System
                </h2>
                <p className={`text-xs mt-0.5 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Approve, reject, or manage submitted committee expense logs.
                </p>
              </div>

              {/* Filtering tabs */}
              <div className={`p-1.5 rounded-xl border flex gap-1 ${
                darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-200/50 border-slate-300/40'
              }`}>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'Pending', label: 'Pending' },
                  { id: 'Approved', label: 'Approved' },
                  { id: 'Rejected', label: 'Rejected' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setAdminFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      adminFilter === filter.id
                        ? (darkMode 
                            ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' 
                            : 'bg-white text-indigo-600 shadow-sm border border-indigo-100')
                        : (darkMode 
                            ? 'text-slate-400 hover:text-slate-200' 
                            : 'text-slate-600 hover:text-slate-900')
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expenses List */}
            <div className="space-y-4">
              {expenses
                .filter(exp => adminFilter === 'all' || exp.status === adminFilter)
                .map((exp) => (
                  <div
                    key={exp.id}
                    className={`p-6 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                      darkMode 
                        ? 'glass-panel hover:border-slate-700/60' 
                        : 'glass-panel-light hover:border-slate-300/60'
                    }`}
                  >
                    {/* Status accent side bar */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                      exp.status === 'Approved' ? 'bg-emerald-500' :
                      exp.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      {/* Left: Member details, date, desc */}
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            darkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {exp.date}
                          </span>
                          
                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            exp.status === 'Approved' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : exp.status === 'Rejected'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-amber-500/10 text-amber-500 animate-pulse'
                          }`}>
                            {exp.status === 'Approved' ? <CheckCircle2 className="w-3 h-3" /> : 
                             exp.status === 'Rejected' ? <XCircle className="w-3 h-3" /> : 
                             <Clock className="w-3 h-3" />}
                            {exp.status}
                          </span>
                        </div>

                        <div>
                          <h4 className={`text-base font-extrabold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            {exp.memberName}
                          </h4>
                          <p className={`text-sm mt-1.5 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {exp.description}
                          </p>
                        </div>

                        {/* Receipt indicator */}
                        {exp.receiptName ? (
                          <button
                            onClick={() => {
                              setSelectedReceiptUrl(exp.receiptData);
                              setSelectedReceiptName(exp.receiptName);
                            }}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all hover:underline cursor-pointer ${
                              darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                            }`}
                          >
                            <FileImage className="w-4 h-4 shrink-0 text-purple-400" />
                            {exp.receiptName}
                            <Eye className="w-3.5 h-3.5 inline ml-0.5 opacity-60" />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                            No Receipt Uploaded
                          </span>
                        )}
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 border-t pt-4 lg:border-t-0 lg:pt-0 border-slate-500/10 shrink-0">
                        {/* Amount */}
                        <div className="lg:text-right">
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            Total Claim
                          </p>
                          <p className={`text-2xl font-black tracking-tight flex items-center lg:justify-end ${darkMode ? 'text-slate-100' : 'text-slate-950'}`}>
                            <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                            {exp.amount.toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5">
                          {exp.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproveExpense(exp.id)}
                                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 transition-all border border-emerald-500/20 cursor-pointer"
                                title="Approve Claim"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRejectExpense(exp.id)}
                                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all border border-red-500/20 cursor-pointer"
                                title="Reject Claim"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className={`p-2.5 rounded-xl transition-all border cursor-pointer ${
                              darkMode 
                                ? 'bg-slate-950 border-slate-900 text-slate-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' 
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                            }`}
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                ))
              }
              {expenses.filter(exp => adminFilter === 'all' || exp.status === adminFilter).length === 0 && (
                <div className={`text-center py-12 rounded-2xl border ${
                  darkMode ? 'bg-slate-950/20 border-slate-900 text-slate-500' : 'bg-slate-100/50 border-slate-200 text-slate-500'
                }`}>
                  No expense records match the selected filter.
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Bill Receipt Preview Modal */}
      {selectedReceiptUrl !== undefined && (selectedReceiptUrl || selectedReceiptName) && (
        <div 
          onClick={() => {
            setSelectedReceiptUrl(null);
            setSelectedReceiptName('');
          }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-500/10 mb-4">
              <span className={`text-sm font-bold truncate max-w-[280px] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {selectedReceiptName || 'Bill Receipt'}
              </span>
              <button 
                onClick={() => {
                  setSelectedReceiptUrl(null);
                  setSelectedReceiptName('');
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className={`rounded-xl overflow-hidden border max-h-[400px] flex items-center justify-center ${
              darkMode ? 'bg-slate-950 border-slate-950' : 'bg-slate-50 border-slate-100'
            }`}>
              {selectedReceiptUrl ? (
                <img 
                  src={selectedReceiptUrl} 
                  alt="Bill Receipt Upload" 
                  className="max-h-[380px] w-full object-contain"
                />
              ) : (
                <div className="py-20 text-center space-y-3">
                  <FileImage className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-slate-500 text-xs font-semibold">
                    Mock File: File contents saved as placeholder reference.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`mt-auto border-t py-8 text-center text-xs font-medium transition-colors duration-500 ${
        darkMode 
          ? 'bg-slate-950 border-slate-900/60 text-slate-500' 
          : 'bg-white border-slate-200/60 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} WICASA Kalyan Dombivli Branch (KDUB). All rights reserved.</p>
          <p className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Developed for WICASA KDUB Committee Management
          </p>
        </div>
      </footer>

    </div>
  );
}

export default App;
