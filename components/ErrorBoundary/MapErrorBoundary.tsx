'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.log('🛡️ MapErrorBoundary: Error caught:', error.message);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error);
    console.log('📋 Error name:', error.name);
    console.log('📝 Error message:', error.message);
    console.log('📍 Error stack:', error.stack);
    console.log('🔧 Component stack:', errorInfo.componentStack);
    
    this.setState({ error, errorInfo });
    
    // Enhanced error analysis
    const errorMessage = error.message?.toLowerCase() || '';
    const isReactRenderError = errorMessage.includes('b is not a function') ||
                               errorMessage.includes('cannot read prop') ||
                               errorMessage.includes('undefined is not a function') ||
                               errorMessage.includes('null is not a function');
    
    const isStateUpdateError = errorMessage.includes('setstate') ||
                              errorMessage.includes('usestate') ||
                              errorMessage.includes('state');
    
    const isFunctionReferenceError = errorMessage.includes('is not a function');
    
    console.log('🔍 Error Analysis:', {
      isReactRenderError,
      isStateUpdateError,
      isFunctionReferenceError,
      errorType: error.name
    });
    
    // Adaptive recovery based on error type
    let recoveryTime = 2000; // Default
    
    if (isReactRenderError && isFunctionReferenceError) {
      recoveryTime = 200; // Ultra-fast for function reference errors
      console.log('⚡ Ultra-fast recovery for function reference error');
    } else if (isStateUpdateError) {
      recoveryTime = 600; // Fast for state update errors
      console.log('🚀 Fast recovery for state update error');
    } else if (isReactRenderError) {
      recoveryTime = 500; // Quick for general React render errors
      console.log('🏃 Quick recovery for React render error');
    } else {
      console.log('🐌 Standard recovery for other errors');
    }
    
    // Immediate recovery attempt for critical function reference errors
    if (isFunctionReferenceError && recoveryTime <= 200) {
      setTimeout(() => {
        console.log('⚡ Immediate recovery attempt...');
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }, 25);
    }
    
    // Main recovery
    setTimeout(() => {
      console.log(`🔄 MapErrorBoundary auto-recovery (${recoveryTime}ms)...`);
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }, recoveryTime);
    
    // Backup recovery for persistent errors
    setTimeout(() => {
      if (this.state.hasError) {
        console.log('🔄 Backup recovery attempt...');
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }
    }, recoveryTime + 500);
  }

  public render() {
    if (this.state.hasError) {
      // Fallback UI
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Map Temporarily Unavailable
            </h3>
            <p className="text-gray-600 mb-4">
              The map encountered an error but is recovering...
            </p>
            <div className="text-sm text-gray-500">
              Refreshing automatically...
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}