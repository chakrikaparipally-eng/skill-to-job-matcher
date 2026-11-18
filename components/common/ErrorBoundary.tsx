'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'An unexpected error occurred.' };
  }

  render() {
    if (this.state.hasError) {
      let friendly = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed.error && parsed.operationType) {
          friendly = `Database permission error during ${parsed.operationType} on ${parsed.path || 'record'}: ${parsed.error}`;
        }
      } catch {
        // standard message
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h2 className="text-lg font-semibold">Application Error</h2>
            </div>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{friendly}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
