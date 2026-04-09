import { useState, useEffect } from 'react';
import type { BridgeState } from '../services/BridgeService';
import { bridgeService } from '../services/BridgeService';

export function useBridge() {
  const [state, setState] = useState<BridgeState>(bridgeService.state);

  useEffect(() => {
    const unsubscribe = bridgeService.subscribe(() => {
      setState({ ...bridgeService.state });
    });
    return () => unsubscribe();
  }, []);

  return {
    ...state,
    templates: bridgeService.templates,
    connect: (link: string) => bridgeService.connect(link),
    push: () => bridgeService.push(),
    setPendingEngine: (engine: 'unity' | 'unreal' | 'godot' | null) => bridgeService.setPendingEngine(engine),
    getLocalizedText: (engine: string, key: string) => bridgeService.getLocalizedText(engine, key)
  };
}
