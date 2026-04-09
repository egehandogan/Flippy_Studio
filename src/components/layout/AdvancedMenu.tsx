import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Menu as MenuIcon
} from 'lucide-react';
import { useSceneStore } from '../../store/useSceneStore';
import { useEditorStore } from '../../store/useEditorStore';
import SettingsModal from '../modals/SettingsModal';

interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  action?: () => void;
  submenu?: MenuItem[];
}

const AdvancedMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Store access
  const { assets, selectedIds, removeAssets } = useSceneStore();
  const { undo, redo } = useSceneStore.temporal.getState();
  const { zoom, setZoom, resetView } = useEditorStore();

  const handleExportJSON = () => {
    const data = JSON.stringify(assets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Move impure Date.now() here to be safe
    const timestamp = new Date().getTime();
    a.download = `flippy-project-${timestamp}.json`;
    a.click();
    setIsOpen(false);
  };

  const MENU_DATA: MenuItem[] = [
    {
      id: 'file',
      label: 'File',
      submenu: [
        { id: 'f-new', label: 'New Project', shortcut: 'Alt+N', action: () => window.location.reload() },
        { id: 'f-save', label: 'Save Project', shortcut: 'Ctrl+S', action: () => alert('Project saved to local storage!') },
        { id: 'f-export-json', label: 'Export as JSON', action: handleExportJSON },
        { id: 'f-export-png', label: 'Export as PNG', action: () => alert('PNG Export started...') },
        { id: 'f-settings', label: 'Settings', shortcut: 'Ctrl+,', action: () => setIsSettingsOpen(true) },
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      submenu: [
        { id: 'e-undo', label: 'Undo', shortcut: 'Ctrl+Z', action: () => undo() },
        { id: 'e-redo', label: 'Redo', shortcut: 'Ctrl+Y', action: () => redo() },
        { id: 'e-copy', label: 'Copy Selection', shortcut: 'Ctrl+C', action: () => {} },
        { id: 'e-paste', label: 'Paste', shortcut: 'Ctrl+V', action: () => {} },
        { id: 'e-dup', label: 'Duplicate', shortcut: 'Ctrl+D', action: () => {} },
        { id: 'e-del', label: 'Delete', shortcut: 'Del', action: () => removeAssets(selectedIds) },
      ]
    },
    {
      id: 'view',
      label: 'View',
      submenu: [
        { id: 'v-grid', label: 'Show/Hide Grid', shortcut: 'Ctrl+\'', action: () => {} },
        { id: 'v-zoom-in', label: 'Zoom In', shortcut: 'Ctrl++', action: () => setZoom(zoom + 0.1) },
        { id: 'v-zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => setZoom(zoom - 0.1) },
        { id: 'v-zoom-reset', label: 'Zoom to 100%', shortcut: 'Ctrl+0', action: () => resetView() },
      ]
    },
    {
      id: 'object',
      label: 'Object',
      submenu: [
        { id: 'o-group', label: 'Group Selection', shortcut: 'Ctrl+G', action: () => {} },
        { id: 'o-ungroup', label: 'Ungroup', shortcut: 'Ctrl+Shift+G', action: () => {} },
        { id: 'o-lock', label: 'Lock/Unlock', shortcut: 'Ctrl+Shift+L', action: () => {} },
      ]
    },
    {
      id: 'text',
      label: 'Text',
      submenu: [
        { id: 't-bold', label: 'Bold', action: () => {} },
        { id: 't-italic', label: 'Italic', action: () => {} },
        { id: 't-size', label: 'Font Size...', action: () => {} },
      ]
    },
    {
      id: 'arrange',
      label: 'Arrange',
      submenu: [
        { id: 'a-front', label: 'Bring to Front', shortcut: ']', action: () => {} },
        { id: 'a-back', label: 'Send to Back', shortcut: '[', action: () => {} },
        { id: 'a-forward', label: 'Bring Forward', shortcut: 'Ctrl+]', action: () => {} },
        { id: 'a-backward', label: 'Send Backward', shortcut: 'Ctrl+[', action: () => {} },
      ]
    },
    {
      id: 'vector',
      label: 'Vector',
      submenu: [
        { id: 'v-pen', label: 'Pen Tool', shortcut: 'P', action: () => {} },
        { id: 'v-flatten', label: 'Flatten Selection', shortcut: 'Ctrl+E', action: () => {} },
        { id: 'v-outline', label: 'Outline Stroke', shortcut: 'Ctrl+Shift+O', action: () => {} },
      ]
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all ${
          isOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'
        }`}
      >
        <MenuIcon size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="absolute left-0 mt-2 w-56 bg-[#1A1A1A] border border-white/5 rounded-xl shadow-2xl py-1 z-[100] backdrop-blur-xl"
          >
            {MENU_DATA.map((item) => (
              <div 
                key={item.id}
                onMouseEnter={() => setActiveSubmenu(item.id)}
                className="relative group px-1"
              >
                <div 
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    activeSubmenu === item.id ? 'bg-white/5 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-medium transition-transform group-hover:translate-x-0.5">{item.label}</span>
                  <ChevronRight size={10} className="opacity-40" />
                </div>

                {/* Fly-out Submenu */}
                <AnimatePresence>
                  {activeSubmenu === item.id && item.submenu && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute left-full top-[-4px] ml-1 w-56 bg-[#1A1A1A] border border-white/5 rounded-xl shadow-2xl py-1 z-[101]"
                    >
                      {item.submenu.map((sub) => (
                        <div 
                          key={sub.id}
                          onClick={() => {
                            if (sub.action) sub.action();
                            setIsOpen(false);
                            setActiveSubmenu(null);
                          }}
                          className="flex items-center justify-between px-3 py-1.5 mx-1 rounded-lg cursor-pointer text-white/60 hover:text-white hover:bg-white/5 transition-colors group/sub"
                        >
                          <span className="text-[11px] font-medium">{sub.label}</span>
                          {sub.shortcut && (
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{sub.shortcut}</span>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default AdvancedMenu;
