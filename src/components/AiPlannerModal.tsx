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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h2 className="text-card-title font-jakarta font-semibold text-slate-900">
                Gemini AI Smart Daily Planner
              </h2>
              <p className="text-caption text-slate-500">
                Analyzes open tasks, deadlines, and priorities to construct the optimal work sequence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!plan && !loading && (
            <div className="text-center py-8 space-y-4">
              <Brain className="w-12 h-12 text-indigo-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-card-title font-jakarta font-semibold text-slate-900">Generate Your Personalized Schedule</h3>
                <p className="text-body text-slate-500 max-w-md mx-auto">
                  Gemini AI evaluates active task entities and priorities to eliminate decision fatigue.
                </p>
              </div>
              <button
                onClick={fetchAiPlan}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-label font-semibold shadow-xs transition-all flex items-center gap-2 mx-auto cursor-pointer font-sans"
              >
                <Sparkles className="w-4 h-4 text-white" />
                Analyze Open Tasks & Generate Schedule
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-body text-slate-600 font-medium">Gemini AI analyzing task graph...</p>
            </div>
          )}

          {plan && !loading && (
            <div className="space-y-4 text-body">
              {/* Executive summary */}
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-1">
                <div className="font-semibold text-indigo-700 flex items-center gap-1.5 font-jakarta text-label">
                  <Brain className="w-4 h-4 text-indigo-600" /> Executive AI Priority Summary
                </div>
                <p className="text-slate-700 leading-relaxed text-body">{plan.planSummary}</p>
              </div>

              {/* Recommended focus tasks */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2">
                <div className="font-semibold text-indigo-700 flex items-center gap-1.5 font-jakarta text-label">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Top Focus Items Today
                </div>
                <ul className="space-y-1.5 pl-2">
                  {plan.focusTasks.map((task, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      <span className="font-medium text-body">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Order */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2">
                <div className="font-semibold text-amber-700 flex items-center gap-1.5 font-jakarta text-label">
                  <Clock className="w-4 h-4 text-amber-500" /> Recommended Execution Sequence
                </div>
                <div className="space-y-1 text-slate-700">
                  {plan.recommendedOrder.map((step, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-body">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Allocation */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-slate-700">
                <span className="text-slate-500 font-medium text-label">Recommended Focus Budget:</span>
                <span className="text-data text-indigo-700 font-semibold">{plan.timeAllocation}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={fetchAiPlan}
            disabled={loading}
            className="text-label text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Re-generate
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-label font-semibold cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
