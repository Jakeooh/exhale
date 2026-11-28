import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { clearAllExhaleData } from '@/shared/lib/storage';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enterprise-grade Error Boundary that catches runtime render errors,
 * prevents white-screen crashes, and provides accessible recovery options.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // In production, telemetry/logging service would receive this error
    console.error('Exhale ErrorBoundary caught an unhandled render error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleResetAndReload = (): void => {
    clearAllExhaleData();
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[300px] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-surface border border-red-200 dark:border-red-900/40 rounded-2xl p-6 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ink">
                Something went wrong
              </h2>
              <p className="text-sm text-muted">
                An unexpected interface error occurred. You can reload this view or reset cached data.
              </p>
            </div>

            {this.state.error?.message && (
              <p className="text-xs font-mono bg-canvas p-2.5 rounded-lg text-muted break-words text-left">
                {this.state.error.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-surface text-ink text-sm font-medium hover:bg-canvas transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                Reset &amp; Clear Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
