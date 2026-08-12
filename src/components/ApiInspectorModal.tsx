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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-xl text-slate-900 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-card-title font-jakarta font-semibold text-slate-900 flex items-center gap-2">
                FlowDesk REST API Inspector
                <span className="text-data font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  Live Interceptor
                </span>
              </h2>
              <p className="text-caption text-slate-500">
                Inspect JSON DTO payloads, HTTP Status Codes, and JWT Auth Headers in real time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Log List (Left) */}
          <div className="w-2/5 border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50">
            <div className="text-label font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 flex justify-between">
              <span>Captured Requests ({logs.length})</span>
              <span>Latency</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-data font-mono">
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
                    className={`w-full text-left p-3 rounded-xl transition-all border text-data cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-caption ${
                          log.method === 'GET'
                            ? 'bg-indigo-100 text-indigo-700'
                            : log.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.method === 'PUT' || log.method === 'PATCH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {log.method}
                      </span>
                      <div className="flex items-center gap-2 text-data">
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            isSuccess ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {log.status}
                        </span>
                        <span className="text-slate-400 text-caption">{log.durationMs}ms</span>
                      </div>
                    </div>
                    <div className="truncate font-sans font-medium text-slate-900">{log.url}</div>
                    <div className="text-caption text-slate-400 mt-1 flex justify-between">
                      <span>{log.timestamp}</span>
                      <span className="text-indigo-600 font-mono">DTO Mapped</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Details Inspector (Right) */}
          <div className="flex-1 overflow-y-auto p-6 bg-white font-mono text-data space-y-5">
            {selectedLog ? (
              <>
                {/* Method & URL header */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-caption font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {selectedLog.method}
                      </span>
                      <span className="text-slate-900 font-semibold text-body">{selectedLog.url}</span>
                    </div>
                    <div className="text-slate-500 text-caption font-sans">
                      Endpoint mapped to Spring Boot Controller method
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-body font-bold flex items-center gap-1 justify-end ${
                        selectedLog.status < 300 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {selectedLog.status} {selectedLog.statusText}
                    </div>
                    <div className="text-slate-400 text-caption flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-indigo-600" /> {selectedLog.durationMs}ms latency
                    </div>
                  </div>
                </div>

                {/* Headers */}
                <div className="space-y-2">
                  <div className="text-slate-500 text-label font-sans font-semibold uppercase tracking-wider flex items-center gap-1.5 font-jakarta">
                    <Server className="w-3.5 h-3.5 text-indigo-600" />
                    Request Headers & Spring Security JWT Token
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 space-y-1 text-data">
                    {Object.entries(selectedLog.headers || {}).map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-indigo-600 font-semibold">{key}:</span>
                        <span className="text-slate-700 truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Request Payload */}
                {selectedLog.requestBody && (
                  <div className="space-y-2">
                    <div className="text-slate-500 text-label font-sans font-semibold uppercase tracking-wider flex items-center gap-1.5 font-jakarta">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      Request Body (Jackson Serialized DTO)
                    </div>
                    <pre className="bg-slate-900 text-indigo-300 p-3.5 rounded-xl border border-slate-800 overflow-x-auto text-data">
                      {JSON.stringify(selectedLog.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Response Data */}
                <div className="space-y-2">
                  <div className="text-slate-500 text-label font-sans font-semibold uppercase tracking-wider flex items-center gap-1.5 font-jakarta">
                    <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                    Response Body (Spring ResponseEntity JSON DTO)
                  </div>
                  <pre className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl border border-slate-800 overflow-x-auto text-data">
                    {JSON.stringify(selectedLog.responseData, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans text-center space-y-2">
                <Terminal className="w-12 h-12 text-slate-300" />
                <p className="font-semibold text-slate-700 font-jakarta text-card-title">Select an API Request from the left panel</p>
                <p className="text-body text-slate-500 max-w-sm">
                  Click any endpoint invocation to inspect Jackson JSON payload mappings, authorization headers, and status codes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-data text-slate-500 font-sans">
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
