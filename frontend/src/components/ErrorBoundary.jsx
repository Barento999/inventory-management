import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState(prev => ({
      errorInfo,
      errorCount: prev.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <Card className="max-w-2xl w-full">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Something went wrong
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    The application encountered an unexpected error
                  </p>
                </div>
              </div>

              {/* Error Message */}
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-mono text-red-700 dark:text-red-300 break-all">
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>

              {/* Dev Error Details */}
              {isDev && this.state.errorInfo && (
                <details className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-sm text-gray-700 dark:text-gray-300">
                    Error Stack (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Error Count */}
              {this.state.errorCount > 1 && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    ⚠️ Multiple errors detected ({this.state.errorCount}). Please reload the page.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="primary"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleReload}
                  className="flex-1"
                  variant="secondary"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button 
                  onClick={this.handleHome}
                  className="flex-1"
                  variant="secondary"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Support Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  If the problem persists, try clearing your browser cache or contact support.
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
