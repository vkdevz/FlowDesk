import React, { useState, useEffect } from 'react';
import { subscribeApiLogs } from '../services/api';
import { ApiLog } from '../types';
import { Terminal, CheckCircle2, AlertCircle, Clock, Server, Code2, X } from 'lucide-react';

interface ApiInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiInspectorModal: React.FC<ApiInspectorProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeApiLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep last 50
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                FlowDesk Spring Boot REST API Inspector
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Live Network Interceptor
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect JSON DTO payloads, HTTP Status Codes, and JWT Auth Headers in real time
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

        {/* Content Split Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Log List (Left) */}
          <div className="w-2/5 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-950/30">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex justify-between">
              <span>Captured Requests ({logs.length})</span>
              <span>Latency</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                No API calls captured yet. Perform actions on FlowDesk to inspect Spring Boot endpoints.
              </div>
            ) : (
              logs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                const isSuccess = log.status >= 200 && log.status < 300;
                return (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left p-3 rounded-xl transition-all border text-xs font-mono ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.method === 'GET'
                            ? 'bg-blue-500/20 text-blue-400'
                            : log.method === 'POST'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.method === 'PUT' || log.method === 'PATCH'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {log.method}
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            isSuccess ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {log.status}
                        </span>
                        <span className="text-slate-500 text-[10px]">{log.durationMs}ms</span>
                      </div>
                    </div>
                    <div className="truncate font-sans font-medium text-slate-200">{log.url}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>{log.timestamp}</span>
                      <span className="text-slate-400 font-mono">DTO Mapped</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Details Inspector (Right) */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-900 font-mono text-xs space-y-5">
            {selectedLog ? (
              <>
                {/* Method & URL header */}
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300">
                        {selectedLog.method}
                      </span>
                      <span className="text-slate-100 font-semibold text-sm">{selectedLog.url}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] font-sans">
                      Endpoint mapped to Spring Boot Controller method
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-base font-bold flex items-center gap-1 justify-end ${
                        selectedLog.status < 300 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {selectedLog.status} {selectedLog.statusText}
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> {selectedLog.durationMs}ms latency
                    </div>
                  </div>
                </div>

                {/* Headers */}
                <div className="space-y-2">
                  <div className="text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    Request Headers & Spring Security JWT Token
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-300 space-y-1">
                    {Object.entries(selectedLog.headers || {}).map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-indigo-400 font-semibold">{key}:</span>
                        <span className="text-slate-300 truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Request Payload */}
                {selectedLog.requestBody && (
                  <div className="space-y-2">
                    <div className="text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-amber-400" />
                      Request Body (Jackson Serialized DTO)
                    </div>
                    <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-amber-300 overflow-x-auto text-[11px]">
                      {JSON.stringify(selectedLog.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Response Data */}
                <div className="space-y-2">
                  <div className="text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    Response Body (Spring ResponseEntity JSON DTO)
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-emerald-300 overflow-x-auto text-[11px]">
                    {JSON.stringify(selectedLog.responseData, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 font-sans text-center space-y-2">
                <Terminal className="w-12 h-12 text-slate-700" />
                <p className="font-semibold text-slate-400">Select an API Request from the left panel</p>
                <p className="text-xs text-slate-600 max-w-sm">
                  Click any endpoint invocation to inspect Jackson JSON payload mappings, authorization headers, and status codes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>FlowDesk REST Interceptor Active</span>
          </div>
          <div>Spring Boot 3.2 • Java 21 • Hibernate JPA • JWT Security</div>
        </div>
      </div>
    </div>
  );
};
