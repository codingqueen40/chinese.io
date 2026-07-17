export {
  DEFAULT_PLACEMENT_CONFIG,
  type PlacementConfig,
} from "./config";

export {
  createLevelScale,
  type LevelScale,
} from "./scale";

export {
  createInitialState,
  nextLevel,
  isFinished,
  computeDetectedLevel,
  simulatePlacement,
  type PlacementAnswer,
  type PlacementState,
} from "./core";
