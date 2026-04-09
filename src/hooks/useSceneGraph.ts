import { useState, useEffect } from 'react';
import { sceneGraph } from '../core/SceneGraph';

export function useSceneGraph() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = sceneGraph.subscribe(() => {
      setTick(tick => tick + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return sceneGraph;
}
