import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { Sparkles, Brain, CheckCircle2, Clock, X, Loader2 } from 'lucide-react';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<{
    planSummary: string;
    focusTasks: string[];
    recommendedOrder: string[];
    timeAllocation: string;
  } | null>(null);

  const fetchAiPlan = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/ai/daily-plan');
      setPlan(res.data);
    } catch (err) {
      console.error('Failed to generate AI plan', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Gemini 3.6 Flash Smart Daily Plan
              </h2>
              <p className="text-xs text-slate-400">
                AI analyzes your deadlines, overdue tasks, and priorities to construct the optimal work sequence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!plan && !loading && (
            <div className="text-center py-8 space-y-4">
              <Brain className="w-12 h-12 text-indigo-400 mx-auto opacity-80" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">Generate Your Personalized Schedule</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Gemini AI evaluates active Spring Boot task entities and priorities to eliminate decision fatigue.
                </p>
              </div>
              <button
                onClick={fetchAiPlan}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Open Tasks & Generate Schedule
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">Gemini 3.6 Flash analyzing task graph...</p>
            </div>
          )}

          {plan && !loading && (
            <div className="space-y-4 text-xs">
              {/* Executive summary */}
              <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-400" /> Executive AI Priority Summary
                </div>
                <p className="text-slate-200 leading-relaxed text-xs">{plan.planSummary}</p>
              </div>

              {/* Recommended focus tasks */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Top Focus Items Today
                </div>
                <ul className="space-y-1.5 pl-2">
                  {plan.focusTasks.map((task, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="font-medium">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Order */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Recommended Execution Sequence
                </div>
                <div className="space-y-1 text-slate-300">
                  {plan.recommendedOrder.map((step, i) => (
                    <div key={i} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Allocation */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-semibold">Recommended Focus Budget:</span>
                <span className="font-mono text-indigo-300 font-bold">{plan.timeAllocation}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={fetchAiPlan}
            disabled={loading}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Re-generate
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
