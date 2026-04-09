import React, { useState } from 'react';
import { useSceneStore } from '../../store/useSceneStore';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import CanvasWrapper from '../canvas/CanvasWrapper';
import FloatingToolbar from './Toolbar';

// Modals
import BridgeModal from '../modals/BridgeModal';
import TemplatePickerModal from '../modals/TemplatePickerModal';
import PushModal from '../modals/PushModal';
import AIStudioModal from '../modals/AIStudioModal';

const MainLayout: React.FC = () => {
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans select-none">
      {/* Fixed Top Bar */}
      <TopBar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Engine Picker & Layers */}
        <LeftSidebar onOpenPush={() => setIsPushModalOpen(true)} />

        {/* Main Workspace / Canvas */}
        <main className="flex-1 relative overflow-hidden bg-black flex flex-col items-center justify-center">
          <CanvasWrapper />
          
          {/* Floating Toolbar - Matches Image 1 (Bottom Center) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
            <FloatingToolbar />
          </div>
        </main>

        {/* Right Sidebar: Properties Panel */}
        <RightSidebar />
      </div>

      {/* Modals Container */}
      <BridgeModal />
      <TemplatePickerModal />
      <PushModal isOpen={isPushModalOpen} onClose={() => setIsPushModalOpen(false)} />
      <AIStudioModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

      {/* Overlay Layer for Portals */}
      <div id="overlay-root"></div>
    </div>
  );
};

export default MainLayout;
