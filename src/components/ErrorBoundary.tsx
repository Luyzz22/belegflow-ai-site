"use client";

import React from "react";

interface State {
  hasError: boolean;
  errorId: string;
}

/** Fängt React-Render-Fehler ab und zeigt einen Fallback statt eines weißen Screens. */
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, errorId: "" };

  static getDerivedStateFromError(): State {
    return { hasError: true, errorId: String(Date.now()) };
  }

  componentDidCatch(error: Error) {
    if (typeof console !== "undefined") console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f6f3] px-6 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#1a1a2e]">Etwas ist schiefgelaufen.</h1>
          <p className="mt-2 max-w-md text-sm text-[#64748b]">Bitte laden Sie die Seite neu.</p>
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.location.reload();
            }}
            className="mt-6 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] focus:outline-none focus:ring-2 focus:ring-[#003856]/30 active:scale-95"
          >
            Seite neu laden
          </button>
          <p className="mt-4 font-mono text-xs text-[#94a3b8]">Fehler-ID: {this.state.errorId}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
