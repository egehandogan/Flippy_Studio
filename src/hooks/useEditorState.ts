import { useState, useEffect } from 'react';
import type { ToolType } from '../services/EditorService';
import { editorService } from '../services/EditorService';

export function useEditorState() {
  const [activeTool, setActiveTool] = useState<ToolType>(editorService.activeTool);
  const [zoom, setZoom] = useState<number>(editorService.zoom);

  useEffect(() => {
    const unsubscribe = editorService.subscribe(() => {
      setActiveTool(editorService.activeTool);
      setZoom(editorService.zoom);
    });
    return () => { unsubscribe(); };
  }, []);

  return {
    activeTool,
    zoom,
    setTool: (tool: ToolType) => editorService.setTool(tool),
    setZoom: (v: number) => editorService.setZoom(v),
    autoZoom: () => editorService.autoZoom()
  };
}
