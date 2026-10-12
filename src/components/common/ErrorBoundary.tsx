import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-lg w-full">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Oops! Something went wrong
                </h1>
                
                <p className="text-gray-600 mb-6">
                  We're sorry, but something unexpected happened. Please try refreshing the page or return to the homepage.
                </p>

                {import.meta.env.DEV && this.state.error && (
                  <details className="mb-6 text-left bg-gray-100 p-4 rounded-lg">
                    <summary className="cursor-pointer font-medium text-sm text-gray-700 mb-2">
                      Error Details (Development Only)
                    </summary>
                    <pre className="text-xs text-red-600 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={this.handleReset} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                    <Home className="h-4 w-4" />
                    Go to Homepage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
