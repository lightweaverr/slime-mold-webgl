import * as THREE from "three";
import { rndFloat, rndInt, Vector } from "./utils";
import { PingPongShaderBuilder } from "./PingPongShaderBuilder";

import { PASS_THROUGH_VERTEX } from "./Shaders/PassThroughVertex.js"
import { DIFFUSE_DECAY_FRAGMENT } from "./shaders/DiffuseDecayFragment.js"
import { RENDER_DOTS_VERTEX } from "./shaders/RenderDotsVertex.js"
import { RENDER_DOTS_FRAGMENT } from "./shaders/RenderDotsFragment.js"
import { FINAL_RENDER_FRAGMENT } from "./Shaders/FinalRenderFragment.js"
import { UPDATE_DOTS_FRAGMENT } from "./Shaders/UpdateDotsFragment.js"


import { PingPongShader } from "./PingPongShader";
import { ShaderBuilder } from "./ShaderBuilder";
import { Shader } from "./Shader";


interface ConstructorOptions {
  container?: HTMLElement;
  width?: number;
  height?: number;
}

export class Physarum {
  scene?: THREE.Scene;
  camera?: THREE.OrthographicCamera;
  renderer?: THREE.WebGLRenderer;
  finalMaterial?: THREE.ShaderMaterial;
  finalMesh?: THREE.Mesh;
  mousePos?: { x: number; y: number };
  time: number;
  guiGroups: any; // for adding lil-gui later
  settings: any;
  container?: HTMLElement;
  dimensions: {
    width: number;
    height: number;
  };
  diffuseShader?: PingPongShader;
  renderDotsShader?: Shader;
  updateDotsShader?: PingPongShader | null;

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
    this.initSettings();
    this.initShaders();

    if (this.container) this.container.appendChild(this.renderer.domElement);
    else document.body.appendChild(this.renderer.domElement);
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

      spawnWidth: 256,

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

  initShaders() {
    const dotAmount = this.settings.spawnWidth * this.settings.spawnWidth;
    const arrays = this.getDataArrays(dotAmount);

    this.diffuseShader = new PingPongShaderBuilder()
    .withDimensions(this.dimensions.width, this.dimensions.height)
    .withVertex(PASS_THROUGH_VERTEX)
    .withFragment(DIFFUSE_DECAY_FRAGMENT)
    .withUniform("points", null)
    .withUniform("decay", this.settings.decay)
    .withUniform("resolution", new THREE.Vector2(this.dimensions.width, this.dimensions.height))
    .create()

		this.getRenderDotsShader(arrays.pos, arrays.uvs)

    this.initFinalMaterial();

  }

  initFinalMaterial() {
    this.finalMaterial = new THREE.ShaderMaterial({
			uniforms: {
				diffuseTexture: {
					value: null
				},
				pointsTexture: {
					value: null
				},
				col0: {
					value: new THREE.Color(this.settings.colors[0])
				},
				col1: {
					value: new THREE.Color(this.settings.colors[1])
				},
				col2: {
					value: new THREE.Color(this.settings.colors[2])
				},
				isFlatShading: { value: false },
				colorThreshold: { value: 0.5 },
				dotOpacity: { value: this.settings.dotOpacity },
				trailOpacity: { value: this.settings.trailOpacity },
				isMonochrome: { value: this.settings.isMonochrome }
			},
			transparent: true,
			blending: THREE.AdditiveBlending,
			vertexShader: PASS_THROUGH_VERTEX,
			fragmentShader: FINAL_RENDER_FRAGMENT
		})

		this.finalMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(),
			this.finalMaterial
		)
		this.finalMesh.position.set(0, 0, 0)
		this.finalMesh.scale.set(this.settings.width, this.settings.height, 1)

		this.scene!.add(this.finalMesh)
  }

  getDataArrays(dotAmount: number) {
    // these control the rendering of the particle to the screen
    const pos = new Float32Array(dotAmount * 3);
    const uvs = new Float32Array(dotAmount * 2);
    // initial values, will be changed later
    for (let i = 0; i < dotAmount; i++) {
      pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 0

      uvs[i * 2] = (i % this.settings.spawnWidth) / this.settings.spawnWidth;
      uvs[i * 2 + 1] = ~~(i / this.settings.spawnWidth) / this.settings.spawnWidth;
    }
    this.resetPosition();
    return { pos, uvs };
  }

  getRenderDotsShader(pos: Float32Array<ArrayBuffer>, uvs: Float32Array<ArrayBuffer>) {
		if (!this.renderDotsShader) {
			this.renderDotsShader = new ShaderBuilder()
				.withDimensions(this.settings.width, this.settings.height)
				.withVertex(RENDER_DOTS_VERTEX)
				.withFragment(RENDER_DOTS_FRAGMENT)
				.withUniform("isParticleTexture", this.settings.isParticleTexture)
				.withUniform("particleTexture", null)
				.withUniform("positionTexture", null)
				.withUniform("dotSizes", Vector(this.settings.dotSizes))
				.withUniform("resolution", Vector([this.settings.width, this.settings.height]))
				.withAttribute("position", new THREE.BufferAttribute(pos, 3, false))
				.withAttribute("uv", new THREE.BufferAttribute(uvs, 2, false))
				.create()
		}
		return this.renderDotsShader
	}

  getUpdateDotsShader(positionsAndDirections? : Float32Array<ArrayBuffer>) {
		if (!this.updateDotsShader) {
      if (!positionsAndDirections) return;
			this.updateDotsShader = new PingPongShaderBuilder()
				.withDimensions(this.settings.spawnWidth, this.settings.spawnWidth)
				.withVertex(PASS_THROUGH_VERTEX)
				.withFragment(UPDATE_DOTS_FRAGMENT)
				.withTextureData(positionsAndDirections)
				.withUniform("diffuseTexture", null)
				.withUniform("pointsTexture", null)
				.withUniform("mouseSpawnTexture", null)
				.withUniform("isRestrictToMiddle", this.settings.isRestrictToMiddle)
				.withUniform("time", 0)
				.withUniform("resolution", Vector([this.settings.width, this.settings.height]))
				.withUniform("textureDimensions", Vector([this.settings.spawnWidth, this.settings.spawnWidth]))
				.withUniform("mouseRad", this.settings.mouseRad)
				.withUniform("mousePos", Vector([this.mousePos!.x, this.mousePos!.y]))
				.withUniform("isDisplacement", this.settings.isDisplacement)
				.withUniform("sensorAngle", Vector(this.settings.sensorAngle))
				.withUniform("rotationAngle", Vector(this.settings.rotationAngle))
				.withUniform("sensorDistance", Vector(this.settings.sensorDistance))
				.withUniform("randChance", Vector(this.settings.randChance))
				.withUniform("attract0", Vector(this.settings.attract0))
				.withUniform("attract1", Vector(this.settings.attract1))
				.withUniform("attract2", Vector(this.settings.attract2))
				.withUniform("moveSpeed", Vector(this.settings.moveSpeed))
				.withUniform("infectious", Vector(this.settings.infectious))
				.create()
		}
		return this.updateDotsShader
	}

  resetPosition() {
    let dotAmount = this.settings.spawnWidth * this.settings.spawnWidth;
		let positionsAndDirections = new Float32Array(dotAmount * 4)
		let rndSetup = rndInt(0, 1)
		let marg = Math.min(this.dimensions.width, this.dimensions.height) * 0.2
		let p0 = {
			x: rndInt(marg, this.dimensions.width - marg),
			y: rndInt(marg, this.dimensions.height - marg)
		}
		let p1 = {
			x: rndInt(marg, this.dimensions.width - marg),
			y: rndInt(marg, this.dimensions.height - marg)
		}
		let p2 = {
			x: rndInt(marg, this.dimensions.width - marg),
			y: rndInt(marg, this.dimensions.height - marg)
		}

		for (let i = 0; i < dotAmount; i++) {
			let id = i * 4
			let rnd = i / dotAmount
			let x = 0
			let y = 0
			let startInd = 0
			let rndAng = rndFloat(0, Math.PI * 2)

			if (rndSetup == 0) {
				let team = 0
				if (rnd < 1 / 3) {
					x = p0.x
					y = p0.y
					team = Math.floor(rnd * 3 * 3)
				} else if (rnd < 2 / 3) {
					x = p1.x
					y = p1.y
					team = Math.floor((rnd - 1 / 3) * 3 * 3)
					startInd = Math.floor((dotAmount * 1) / 3)
				} else {
					x = p2.x
					y = p2.y
					team = Math.floor((rnd - 2 / 3) * 3 * 3)
					startInd = Math.floor((dotAmount * 2) / 3)
				}
				y -= this.dimensions.height * 0.5
				x -= this.dimensions.width * 0.5

				let rndDis = rndFloat(10, 50) * team
				x += rndDis * Math.cos(rndAng)
				y += rndDis * Math.sin(rndAng)
				//x
				positionsAndDirections[id++] = x + rndDis * Math.cos(rndAng)
				//y
				positionsAndDirections[id++] = y + rndDis * Math.sin(rndAng)
				//direction
				positionsAndDirections[id++] = rndAng

				//team (0-> red, 1-> green, 2-> blue)
				positionsAndDirections[id] = team
			} else {
				positionsAndDirections[id++] = ((i % this.settings.spawnWidth) * this.dimensions.width) / this.settings.spawnWidth
				//y
				positionsAndDirections[id++] =
					(Math.floor(i / this.settings.spawnWidth) * this.dimensions.height) / this.settings.spawnWidth
				//direction
				positionsAndDirections[id++] = rndAng

				//team (0-> red, 1-> green, 2-> blue)
				positionsAndDirections[id] = rndInt(0, 2)
			}
		}
		this.getUpdateDotsShader()!.dispose()
		this.updateDotsShader = null;
		this.getUpdateDotsShader(positionsAndDirections)
  }
}