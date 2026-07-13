import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/LandingPage';
import ExamSelector from './components/ExamSelector';
import ProfileForm from './components/ProfileForm';
import OptionEntry from './components/OptionEntry';
import ChoiceRefinement from './components/ChoiceRefinement';
import FinalReview from './components/FinalReview';
import SuccessScreen from './components/SuccessScreen';
import AdminModal from './components/AdminModal';
import { StudentProfile, WebOption, ExamType } from './types';
import { Compass, Sparkles, CheckCircle, GraduationCap, Database, Save } from 'lucide-react';
import { loadRealColleges } from './data/colleges';

type StepType = 'LANDING' | 'SELECT_EXAM' | 'ENTER_DETAILS' | 'ENTRY_WORKFLOW' | 'REFINEMENT' | 'FINAL_REVIEW' | 'SUCCESS';

export default function App() {
  // Administrative DB setup modal state
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Dynamic DB Status state
  const [dbStatus, setDbStatus] = useState<{ loaded: boolean; count: number; source: string }>({
    loaded: false,
    count: 0,
    source: 'Initializing...'
  });

  // 1. Wizard & Data Persistence state loaded from localStorage
  const [step, setStep] = useState<StepType>(() => {
    const saved = localStorage.getItem('counselor_step');
    if (saved === 'REFINEMENT') return 'ENTRY_WORKFLOW';
    return (saved as StepType) || 'LANDING';
  });
  
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('counselor_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.stream) parsed.stream = 'MPC';
        return parsed;
      } catch (e) {
        // Fallback below
      }
    }
    return {
      exam: null,
      stream: 'MPC',
      rank: 15000,
      gender: 'Male',
      category: 'OC',
      region: 'OU',
      hallTicket: '',
    };
  });

  const [selectedOptions, setSelectedOptions] = useState<WebOption[]>(() => {
    const saved = localStorage.getItem('counselor_selectedOptions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return [];
  });

  // Ensure we are strictly in light mode by removing the dark class and cleaning up theme storage
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('counselor_theme');
  }, []);

  // Fetch the real colleges database from the dynamic API/Firestore on boot
  useEffect(() => {
    loadRealColleges().then(count => {
      if (count > 0) {
        setDbStatus({
          loaded: true,
          count,
          source: 'Live Database'
        });
      } else {
        setDbStatus({
          loaded: false,
          count: 0,
          source: 'Simulator Fallback'
        });
      }
    }).catch(err => {
      console.error('Error fetching colleges database:', err);
      setDbStatus({
        loaded: false,
        count: 0,
        source: 'Error loading database'
      });
    });
  }, []);

  // Form State and Wizard Step change sync
  useEffect(() => {
    localStorage.setItem('counselor_step', step);
  }, [step]);

  useEffect(() => {
    localStorage.setItem('counselor_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('counselor_selectedOptions', JSON.stringify(selectedOptions));
  }, [selectedOptions]);

  // Save Draft state and handler
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleSaveDraft = () => {
    localStorage.setItem('counselor_step', step);
    localStorage.setItem('counselor_profile', JSON.stringify(profile));
    localStorage.setItem('counselor_selectedOptions', JSON.stringify(selectedOptions));
    setShowSaveToast(true);
  };

  useEffect(() => {
    if (showSaveToast) {
      const timer = setTimeout(() => {
        setShowSaveToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSaveToast]);

  // Swipe navigation gesture handlers for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleSwipeNext = () => {
    if (step === 'SELECT_EXAM' && profile.exam) {
      setStep('ENTER_DETAILS');
    } else if (step === 'ENTER_DETAILS') {
      setStep('ENTRY_WORKFLOW');
    } else if (step === 'ENTRY_WORKFLOW') {
      setStep('FINAL_REVIEW');
    }
  };

  const handleSwipePrev = () => {
    if (step === 'SELECT_EXAM') {
      setStep('LANDING');
    } else if (step === 'ENTER_DETAILS') {
      setStep('SELECT_EXAM');
    } else if (step === 'ENTRY_WORKFLOW') {
      setStep('ENTER_DETAILS');
    } else if (step === 'FINAL_REVIEW') {
      setStep('ENTRY_WORKFLOW');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const diffX = touchStartRef.current.x - touch.clientX;
    const diffY = touchStartRef.current.y - touch.clientY;

    // Must be a predominantly horizontal swipe, minimum 80px difference
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 80) {
      if (diffX > 0) {
        handleSwipeNext();
      } else {
        handleSwipePrev();
      }
    }
    touchStartRef.current = null;
  };

  // Step indicator details
  const getStepNumber = (currentStep: StepType): number => {
    switch(currentStep) {
      case 'SELECT_EXAM': return 1;
      case 'ENTER_DETAILS': return 2;
      case 'ENTRY_WORKFLOW': return 3;
      case 'FINAL_REVIEW': return 4;
      default: return 0;
    }
  };

  const totalSteps = 4;
  const currentStepNum = getStepNumber(step);

  const resetSimulation = () => {
    localStorage.removeItem('counselor_step');
    localStorage.removeItem('counselor_profile');
    localStorage.removeItem('counselor_selectedOptions');
    setProfile({
      exam: null,
      stream: 'MPC',
      rank: 15000,
      gender: 'Male',
      category: 'OC',
      region: 'OU',
      hallTicket: '',
    });
    setSelectedOptions([]);
    setStep('LANDING');
  };

  // Safe callback updates
  const handleSelectExam = (exam: ExamType) => {
    setProfile(prev => ({
      ...prev,
      exam,
      // Default local region to OU if Telangana, or AU if Andhra Pradesh
      region: exam === 'TS_EAMCET' ? 'OU' : 'AU'
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" id="app-root">
      
      {/* Dynamic Header when inside active counselling wizard or completion screen */}
      {step !== 'LANDING' && (
        <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-4 sm:px-6 py-2.5 sm:py-3.5 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 cursor-pointer min-w-0 shrink-0" onClick={resetSimulation}>
              <div className="p-1.5 bg-emerald-600 text-white rounded-md shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-sans font-extrabold text-slate-900 tracking-tight text-base sm:text-lg truncate">CounselorPro</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Wizard Progress bar */}
              {currentStepNum > 0 && (
                <div className="hidden md:flex items-center gap-4 w-full sm:w-auto max-w-md">
                  <span className="text-xs font-mono font-bold text-slate-500 whitespace-nowrap">
                    STEP {currentStepNum} OF {totalSteps}
                  </span>
                  <div className="relative w-full sm:w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(currentStepNum / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 font-mono">
                    {Math.round((currentStepNum / totalSteps) * 100)}%
                  </span>
                </div>
              )}

              {dbStatus.loaded ? (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold font-mono border border-emerald-100 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  REAL DATA: {dbStatus.count.toLocaleString()} CODES
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold font-mono border border-amber-100">
                  SIMULATION DATA
                </div>
              )}

              <button 
                onClick={() => setIsAdminOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] sm:text-xs font-semibold font-mono transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DATABASE </span>ADMIN
              </button>

              {step !== 'LANDING' && step !== 'SUCCESS' && (
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] sm:text-xs font-semibold font-mono hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-2xs shrink-0"
                  title="Save Current Draft"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>SAVE DRAFT</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main content viewport */}
      <div 
        className="flex-grow flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-grow flex flex-col"
          >
            {step === 'LANDING' && (
              <LandingPage 
                onStart={() => setStep('SELECT_EXAM')} 
                onAdminClick={() => setIsAdminOpen(true)}
              />
            )}

            {step === 'SELECT_EXAM' && (
              <ExamSelector
                selectedExam={profile.exam}
                selectedStream={profile.stream || 'MPC'}
                onSelect={handleSelectExam}
                onSelectStream={(stream) => setProfile(prev => ({ ...prev, stream }))}
                onNext={() => setStep('ENTER_DETAILS')}
                onBack={() => setStep('LANDING')}
              />
            )}

            {step === 'ENTER_DETAILS' && (
              <ProfileForm
                exam={profile.exam || 'TS_EAMCET'}
                profile={profile}
                onChange={setProfile}
                onNext={() => setStep('ENTRY_WORKFLOW')}
                onBack={() => setStep('SELECT_EXAM')}
              />
            )}

            {step === 'ENTRY_WORKFLOW' && (
              <OptionEntry
                profile={profile}
                selectedOptions={selectedOptions}
                onUpdateOptions={setSelectedOptions}
                onNext={() => setStep('FINAL_REVIEW')}
                onBack={() => setStep('ENTER_DETAILS')}
              />
            )}

            {step === 'FINAL_REVIEW' && (
              <FinalReview
                profile={profile}
                selectedOptions={selectedOptions}
                onBack={() => setStep('ENTRY_WORKFLOW')}
                onFinish={() => setStep('SUCCESS')}
              />
            )}

            {step === 'SUCCESS' && (
              <SuccessScreen
                profile={profile}
                selectedOptions={selectedOptions}
                optionsLength={selectedOptions.length}
                onReset={resetSimulation}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Save Draft Toast Notification */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 z-50"
          >
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-sans font-bold text-sm text-white">Draft Saved Successfully!</p>
              <p className="text-xs text-slate-400">Your profile, preferences, and selected web options are preserved.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      
      <AdminModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onUploadSuccess={() => {
          loadRealColleges().then(count => {
            if (count > 0) {
              setDbStatus({
                loaded: true,
                count,
                source: 'Live Database'
              });
            }
          });
        }}
      />
    </div>
  );
}
