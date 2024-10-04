export interface PhysarumSettings {
  mouseRad: number;
  mousePlaceAmount: number;
  mousePlaceRadius: number;
  mousePlaceColor: number;
  isSobelFilter: boolean;
  isMonochrome: boolean;
  dotOpacity: number;
  trailOpacity: number;
  isParticleTexture: boolean;
  particleTexture: string;
  decay: number;
  isDisplacement: boolean;
  isRestrictToMiddle: boolean;
  randChance: number[];
  moveSpeed: number[];
  sensorDistance: number[];
  rotationAngle: number[];
  sensorAngle: number[];
  colors: string[];
  infectious: number[];
  dotSizes: number[];
  attract0: number[];
  attract1: number[];
  attract2: number[];
}