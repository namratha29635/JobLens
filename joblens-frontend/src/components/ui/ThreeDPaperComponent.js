import React from 'react';
import { ThreeDPaper } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export default function ThreeDPaperShowcase({ variant = 'original', className = '', style = {} }) {
  return (
    <div
      className={`threed-paper-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '240px',
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        ...style,
      }}
    >
      <ThreeDPaper variant={variant} />
    </div>
  );
}
