import * as THREE from "three";
import { rndFloat, rndInt } from "./utils";

interface ConstructorOptions {
  container?: HTMLElement;
  width?: number;
  height?: number;
}

export class Physarum {
  scene?: THREE.Scene;
  camera?: THREE.OrthographicCamera;
  renderer?: THREE.WebGLRenderer;
  mousePos?: { x: number; y: number }; 
  time: number;
  guiGroups: any; // for adding lil-gui later
  settings: any;
  container?: HTMLElement;
  dimensions: {
    width: number;
    height: number;
  };

  constructor(options: ConstructorOptions = {}) {
    this.time = 0;
    const width = options.width || 800;
    const height = options.height || 600;
    this.dimensions = {
      width,
      height,
    };
    if (options.container) {
      this.container = options.container;
      this.dimensions = {
        width: options.container.clientWidth,
        height: options.container.clientHeight,
      };
    }
  }

  init() {
    this.initScene(); 
    
    if (!this.renderer?.capabilities.isWebGL2) {
      alert('WebGL2 is not supported in this browser.');
      return;
    }

    this.initMouse();
  }

  initScene() {
    this.scene = new THREE.Scene()
    const w = this.dimensions.width;
    const h = this.dimensions.height;
		this.camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100)
		this.camera.position.z = 1

		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
		});
		this.renderer.setSize(w, h);
  }

  initMouse() {
    this.mousePos = { x: 0, y: 0 }
    // TODO: add interactions with mouse.
  }

  initSettings() {
		let moveSpeed0 = rndFloat(1, 2.5)
		let moveSpeed1 = rndFloat(1, 2.5)
		let moveSpeed2 = rndFloat(1, 2.5)
		let rotationAngle0 = rndFloat(0.1, 0.3)
		let rotationAngle1 = rndFloat(0.1, 0.3)
		let rotationAngle2 = rndFloat(0.1, 0.3)
		this.settings = {
			mouseRad: 100,
			mousePlaceAmount: 200,
			mousePlaceRadius: 50,
			mousePlaceColor: 0,

			isSobelFilter: false,
			isMonochrome: true,
			dotOpacity: 0,
			trailOpacity: 1,

			isParticleTexture: false,
			particleTexture: "None",
			decay: 0.97,
			isDisplacement: true,
			isRestrictToMiddle: false,

			randChance: [
				rndFloat(0.05, 0.085),
				rndFloat(0.05, 0.085),
				rndFloat(0.05, 0.085)
			],
			moveSpeed: [moveSpeed0, moveSpeed1, moveSpeed2],
			sensorDistance: [
				Math.min(50, rndFloat(1.5, 3) * moveSpeed0),
				Math.min(50, rndFloat(1.5, 3) * moveSpeed1),
				Math.min(50, rndFloat(1.5, 3) * moveSpeed2)
			],
			rotationAngle: [rotationAngle0, rotationAngle1, rotationAngle2],
			sensorAngle: [
				Math.max(1, rndFloat(1, 1.5) * rotationAngle0),
				Math.max(1, rndFloat(1, 1.5) * rotationAngle1),
				Math.max(1, rndFloat(1, 1.5) * rotationAngle2)
			],
			colors: ["rgb(255,250,60)", "rgb(255,0,0)", "rgb(92,255,111)"],
			infectious: [rndInt(0, 1), rndInt(0, 1), rndInt(0, 1)],
			dotSizes: [1, 1, 1],
			attract0: [rndFloat(0.1, 1), rndFloat(-1, 0), rndFloat(-1, 0)],
			attract1: [rndFloat(-1, 0), rndFloat(0.1, 1), rndFloat(-1, 0)],
			attract2: [rndFloat(-1, 0), rndFloat(-1, 0), rndFloat(0.1, 1)]
		}
		this.randomizeSettings(-1)
	}

  randomizeSettings(teamIndex: number) {
		if (teamIndex == -1) {
			this.randomizeSettings(0)
			this.randomizeSettings(1)
			this.randomizeSettings(2)
			return
		}
		this.settings.randChance[teamIndex] = rndFloat(0.05, 0.085)
		this.settings.moveSpeed[teamIndex] = rndFloat(1, 5)
		this.settings.sensorDistance[teamIndex] = Math.min(
			50,
			rndFloat(1.5, 6) * this.settings.moveSpeed[teamIndex]
		)
		this.settings.rotationAngle[teamIndex] = rndFloat(0.3, 1)
		this.settings.sensorAngle[teamIndex] = Math.max(
			1,
			rndFloat(1, 1.5) * this.settings.rotationAngle[teamIndex]
		)
		this.settings.infectious[teamIndex] = 0 
		this.settings.dotSizes[teamIndex] = rndFloat(1, 1)

		for (let i = 0; i < 3; i++) {
			this.settings["attract" + teamIndex][i] = rndFloat(
				i == teamIndex ? 0 : -1,
				1
			)
		}

		if (this.guiGroups) {
			this.guiGroups[teamIndex].controllers.forEach((contr: any) => {
				contr._onChange && contr._name != "Color" ? contr._onChange() : null
				contr.updateDisplay()
			})
		}
	}
}