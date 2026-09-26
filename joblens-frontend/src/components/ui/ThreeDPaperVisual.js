import React, { Component } from 'react';
import * as ThreeUI from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

// Safely resolve ThreeDPaper from @designcodeio/threeui across all environments
const ThreeDPaperComponent = ThreeUI.ThreeDPaper || ThreeUI.WovenCloth;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('ThreeDPaper render notice:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(6, 182, 212, 0.08))',
            borderRadius: '20px',
            border: '1px solid rgba(79, 70, 229, 0.15)',
          }}
        />
      );
    }
    return this.props.children;
  }
}

export default function ThreeDPaperVisual({ variant = 'original', className = '', style = {} }) {
  const ComponentToRender = ThreeDPaperComponent;

  if (!ComponentToRender) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div
        className={`threed-paper-wrapper ${className}`}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          ...style,
        }}
      >
        <ComponentToRender variant={variant} />
      </div>
    </ErrorBoundary>
  );
}
