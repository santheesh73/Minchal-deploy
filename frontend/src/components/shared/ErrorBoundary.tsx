import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MINCHAL ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card variant="flat" className="p-4 sm:p-5 border-amber-200 bg-amber-50/50 space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h4 className="font-bold text-sm">
              {this.props.fallbackTitle || 'Component Unavailable'}
            </h4>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {this.props.fallbackMessage ||
              'This section could not be rendered due to an unexpected format issue. The rest of your audit remains active.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs font-semibold bg-white border-amber-300"
          >
            Retry Section
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
