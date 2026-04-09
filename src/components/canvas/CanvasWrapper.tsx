import React from 'react';
import KonvaRenderer from './KonvaRenderer';

const CanvasWrapper: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#0A0A0A] overflow-hidden relative">
      <KonvaRenderer />
    </div>
  );
};

export default CanvasWrapper;
