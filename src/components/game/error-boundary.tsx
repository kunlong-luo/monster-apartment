'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ((error: Error, reset: () => void) => ReactNode) | ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 全局 React 错误边界。
 * 任何客户端组件抛出的未捕获异常都会被这里拦截，
 * 避免整页 React 卸载导致用户看到白屏。
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Game Error Boundary]', error, errorInfo.componentStack);
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!, this.reset);
      }
      return (
        <div
          role="alert"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a050b] p-6 text-gothic-ivory"
        >
          <h2 className="text-xl font-semibold text-gothic-glow mb-4">
            游戏出现异常
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-gothic-muted text-center">
            {this.state.error?.message ?? '未知错误'}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="rounded border border-gothic-brass px-4 py-2 text-sm hover:brightness-110"
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
