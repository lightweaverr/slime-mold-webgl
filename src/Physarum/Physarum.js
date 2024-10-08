import * as THREE from "three";
import { EffectComposer, RenderPass, ShaderPass, SobelOperatorShader } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui"

import { rndFloat, rndInt, Vector } from "./utils";
import { PingPongShaderBuilder } from "./PingPongShaderBuilder";
import { ShaderBuilder } from "./ShaderBuilder";

import { PASS_THROUGH_VERTEX } from "./Shaders/PassThroughVertex.js"
import { DIFFUSE_DECAY_FRAGMENT } from "./shaders/DiffuseDecayFragment.js"
import { RENDER_DOTS_VERTEX } from "./shaders/RenderDotsVertex.js"
import { RENDER_DOTS_FRAGMENT } from "./shaders/RenderDotsFragment.js"
import { FINAL_RENDER_FRAGMENT } from "./Shaders/FinalRenderFragment.js"
import { UPDATE_DOTS_FRAGMENT } from "./Shaders/UpdateDotsFragment.js"





var WIDTH = 256

var mouseDown = false
var forShow = false
export class Physarum {

	constructor(options = {}) {
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


		this.width = this.dimensions.width
		this.height = this.dimensions.height
		this.textureLoader = new THREE.TextureLoader()

		this.initScene()
		if (!this.renderer.capabilities.isWebGL2) {
			InfoDialog.create(
				"This page requires WebGL2. Your browser does not currently support it. You can check <a href='https://caniuse.com/webgl2'>https://caniuse.com/webgl2</a> to see which browsers are supported.",
				() => {}
			)
			return
		}

		this.initMouse()

		this.initSettings()

		this.initShaders()

		this.initComposer()

		if (!forShow) {
			this.initGUI()
		}

		this.container.appendChild(this.renderer.domElement);
		// if (this.container) {
    //   // so that there is just one canvas
    //   if (this.container.childElementCount < 1) this.container.appendChild(this.renderer.domElement);
    // } 
    // else document.body.appendChild(this.renderer.domElement);
	}

	initComposer() {
		this.composer = new EffectComposer(this.renderer)
		const renderPass = new RenderPass(this.scene, this.camera)
		this.composer.addPass(renderPass)

		this.sobelPass = new ShaderPass(SobelOperatorShader)
		this.sobelPass.uniforms["resolution"].value.x = this.width
		this.sobelPass.uniforms["resolution"].value.y = this.height
		this.sobelPass.enabled = this.settings.isSobelFilter
		this.composer.addPass(this.sobelPass)
	}

	initScene() {
		this.scene = new THREE.Scene()

		this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 0.1, 1000)
		this.camera.position.z = 1

		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			blending: THREE.NoBlending
		})

		this.renderer.setSize(this.width, this.height)
	}

	initMouse() {
		this.mousePos = { x: 0, y: 0 }

		// this.mouseSpawnTexture = new MouseSpawnTexture(WIDTH, WIDTH)
		// if (!forShow) {
		// 	this.renderer.domElement.addEventListener("mousemove", ev => {
		// 		ev.preventDefault()
		// 		this.mousePos = {
		// 			x: ev.clientX - this.width * 0.5,
		// 			y: this.height * 0.5 - ev.clientY
		// 		}
		// 	})
		// 	this.renderer.domElement.addEventListener("touchmove", ev => {
		// 		ev.preventDefault()
		// 		if (ev.touches) {
		// 			this.mousePos = {
		// 				x: ev.touches[0].clientX - this.width * 0.5,
		// 				y: this.height * 0.5 - ev.touches[0].clientY
		// 			}
		// 		}
		// 	})
		// 	this.renderer.domElement.addEventListener("mousedown", ev => {
		// 		this.mousePos = {
		// 			x: ev.clientX - this.width * 0.5,
		// 			y: this.height * 0.5 - ev.clientY
		// 		}
		// 		mouseDown = true
		// 	})
		// 	this.renderer.domElement.addEventListener("touchstart", ev => {
		// 		ev.preventDefault()
		// 		if (ev.touches) {
		// 			this.mousePos = {
		// 				x: ev.touches[0].clientX - this.width * 0.5,
		// 				y: this.height * 0.5 - ev.touches[0].clientY
		// 			}
		// 		}
		// 		mouseDown = true
		// 	})
		// 	document.addEventListener("mouseup", ev => (mouseDown = false))
		// 	document.addEventListener("touchend", ev => (mouseDown = false))
		// }
	}

	initSettings() {
		let moveSpeed0 = rndFloat(1, 2.5)
		let moveSpeed1 = rndFloat(1, 2.5)
		let moveSpeed2 = rndFloat(1, 2.5)
		let rotationAngle0 = rndFloat(0.1, 0.3)
		let rotationAngle1 = rndFloat(0.1, 0.3)
		let rotationAngle2 = rndFloat(0.1, 0.3)
		this.settings = {
			mouseRad: 0,
			mousePlaceAmount: 200,
			mousePlaceRadius: 50,
			mousePlaceColor: 0,

			isSobelFilter: false,
			isMonochrome: false,
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

	initShaders() {
		let dotAmount = WIDTH * WIDTH

		let arrays = this.getDataArrays(dotAmount)

	
		this.diffuseShader = new PingPongShaderBuilder()
			.withDimensions(this.width, this.height)
			.withVertex(PASS_THROUGH_VERTEX)
			.withFragment(DIFFUSE_DECAY_FRAGMENT)
			.withUniform("points", null)
			.withUniform("decay", this.settings.decay)
			.withUniform("resolution", new THREE.Vector2(this.width, this.height))
			.create()

		this.getRenderDotsShader(arrays.pos, arrays.uvs)

		if (this.settings.particleTexture != "None") {
			this.textureLoader.load(
				"src/images/particles/" + this.settings.particleTexture + ".png",
				tex => {
					this.getRenderDotsShader().setUniform(
						"isParticleTexture",
						this.settings.particleTexture != "None"
					)
					console.log("loaded" + this.settings.particleTexture)
					this.renderDotsShader.setUniform("particleTexture", tex)
				}
			)
		}
		this.initFinalMat()
	}


	initFinalMat() {
		this.finalMat = new THREE.ShaderMaterial({
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
			this.finalMat
		)
		this.finalMesh.position.set(0, 0, 0)
		this.finalMesh.scale.set(this.width, this.height, 1)

		this.scene.add(this.finalMesh)
	}

	getDataArrays(dotAmount) {
		let pos = new Float32Array(dotAmount * 3)
		let uvs = new Float32Array(dotAmount * 2)
		let positionsAndDirections = new Float32Array(dotAmount * 4)
		let teamAmount = rndInt(1, 3)
		for (let i = 0; i < dotAmount; i++) {
			pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 0

			uvs[i * 2] = (i % WIDTH) / WIDTH
			uvs[i * 2 + 1] = ~~(i / WIDTH) / WIDTH
		}
		this.resetPositions()
		return { pos, uvs }
	}

	resetPositions() {
		let teamAmount = rndInt(3, 3)
		let dotAmount = WIDTH * WIDTH
		let positionsAndDirections = new Float32Array(dotAmount * 4)
		let rndSetup = rndInt(0, 1)
		let marg = Math.min(this.width, this.height) * 0.2
		let p0 = {
			x: rndInt(marg, this.width - marg),
			y: rndInt(marg, this.height - marg)
		}
		let p1 = {
			x: rndInt(marg, this.width - marg),
			y: rndInt(marg, this.height - marg)
		}
		let p2 = {
			x: rndInt(marg, this.width - marg),
			y: rndInt(marg, this.height - marg)
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
				y -= this.height * 0.5
				x -= this.width * 0.5

				let radius = rndInt(0, 500)
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
				positionsAndDirections[id++] = ((i % WIDTH) * this.width) / WIDTH
				//y
				positionsAndDirections[id++] =
					(Math.floor(i / WIDTH) * this.height) / WIDTH
				//direction
				positionsAndDirections[id++] = rndAng

				//team (0-> red, 1-> green, 2-> blue)
				positionsAndDirections[id] = rndInt(0, 2)
			}
		}
		this.getUpdateDotsShader().dispose()
		this.updateDotsShader = null
		this.getUpdateDotsShader(positionsAndDirections)
	}

	changeParticleAmount(newAmount) {
		WIDTH = Math.sqrt(newAmount)
		let arrays = this.getDataArrays(newAmount)
		this.updateDotsShader.dispose()
		this.renderDotsShader.dispose()
		this.renderDotsShader = null
		this.getRenderDotsShader(arrays.pos, arrays.uvs)
		this.updateDotsShader = null
		this.getUpdateDotsShader(arrays.positionsAndDirections)
		this.mouseSpawnTexture.dispose()
		this.mouseSpawnTexture = new MouseSpawnTexture(WIDTH, WIDTH)
	}

	getUpdateDotsShader(positionsAndDirections) {
		if (!this.updateDotsShader) {
			this.updateDotsShader = new PingPongShaderBuilder()
				.withDimensions(WIDTH, WIDTH)
				.withVertex(PASS_THROUGH_VERTEX)
				.withFragment(UPDATE_DOTS_FRAGMENT)
				.withTextureData(positionsAndDirections)
				.withUniform("diffuseTexture", null)
				.withUniform("pointsTexture", null)
				.withUniform("mouseSpawnTexture", null)
				.withUniform("isRestrictToMiddle", this.settings.isRestrictToMiddle)
				.withUniform("time", 0)
				.withUniform("resolution", Vector([this.width, this.height]))
				.withUniform("textureDimensions", Vector([WIDTH, WIDTH]))
				.withUniform("mouseRad", this.settings.mouseRad)
				.withUniform("mousePos", Vector([this.mousePos.x, this.mousePos.y]))
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

	getRenderDotsShader(pos, uvs) {
		if (!this.renderDotsShader) {
			this.renderDotsShader = new ShaderBuilder()
				.withDimensions(this.width, this.height)
				.withVertex(RENDER_DOTS_VERTEX)
				.withFragment(RENDER_DOTS_FRAGMENT)
				.withUniform("isParticleTexture", this.settings.isParticleTexture)
				.withUniform("particleTexture", null)
				.withUniform("positionTexture", null)
				.withUniform("dotSizes", Vector(this.settings.dotSizes))
				.withUniform("resolution", Vector([this.width, this.height]))
				.withAttribute("position", new THREE.BufferAttribute(pos, 3, false))
				.withAttribute("uv", new THREE.BufferAttribute(uvs, 2, false))
				.create()
		}
		return this.renderDotsShader
	}

	render() {
		this.time++
		// if (mouseDown) {
		// 	this.mouseSpawnTexture.drawMouse(
		// 		this.mousePos,
		// 		this.settings.mousePlaceRadius,
		// 		this.settings.mousePlaceAmount,
		// 		this.settings.mousePlaceColor
		// 	)

		// 	this.updateDotsShader.setUniform(
		// 		"mouseSpawnTexture",
		// 		this.mouseSpawnTexture.getTexture()
		// 	)
		// }

		this.getUpdateDotsShader().setUniform("time", this.time)
		this.diffuseShader.setUniform("points", this.renderDotsShader.getTexture())
		this.diffuseShader.render(this.renderer)

		this.getUpdateDotsShader().setUniform(
			"mousePos",
			new THREE.Vector2(this.mousePos.x, this.mousePos.y)
		)

		this.getUpdateDotsShader().setUniform(
			"pointsTexture",
			this.renderDotsShader.getTexture()
		)
		this.getUpdateDotsShader().setUniform(
			"diffuseTexture",
			this.diffuseShader.getTexture()
		)

		this.getUpdateDotsShader().render(this.renderer, {})

		this.getRenderDotsShader().setUniform(
			"positionTexture",
			this.updateDotsShader.getTexture()
		)
		this.renderDotsShader.render(this.renderer)

		this.finalMesh.material.uniforms.pointsTexture.value =
			this.renderDotsShader.getTexture()
		this.finalMesh.material.uniforms.diffuseTexture.value =
			this.diffuseShader.getTexture()

		this.renderer.setSize(this.width, this.height)
		this.renderer.clear()

		// this.mouseSpawnTexture.clear()
		// this.updateDotsShader.setUniform(
		// 	"mouseSpawnTexture",
		// 	this.mouseSpawnTexture.getTexture()
		// )

		this.composer.render()
	}
	
	initGUI() {

		let gui = new GUI()
		this.gui = gui
		gui.close()
		this.particleAmount = WIDTH * WIDTH

		let amountFolder = this.gui.addFolder("Particle amount")
		for (let i = 0; i < 6; i++) {
			let amnt = Math.pow(Math.pow(2, 6 + 1 * i), 2)
			amountFolder
				.add(
					{
						changeParticleAmount: this.changeParticleAmount.bind(this, amnt)
					},
					"changeParticleAmount"
				)
				.name(amnt)
		}
		amountFolder.close()

		let placing = {
			Slime0: true,
			Slime1: false,
			Slime2: false,
			Random: false
		}

		gui
			.add(this.diffuseShader.getUniforms().decay, "value", 0.01, 0.99, 0.01)
			.name("Decay")
		gui
			.add(this.settings, "isDisplacement")
			.name("One particle per pixel")
			.onChange(() => {
				this.getUpdateDotsShader().setUniform(
					"isDisplacement",
					this.settings.isDisplacement
				)
			})
		gui
			.add(this.settings, "isRestrictToMiddle")
			.name("Restrict to middle")
			.onChange(() => {
				this.getUpdateDotsShader().setUniform(
					"isRestrictToMiddle",
					this.settings.isRestrictToMiddle
				)
			})

		let renderingFolder = gui.addFolder("Rendering")
		renderingFolder.close()
		renderingFolder
			.add(this.settings, "isSobelFilter")
			.name("Sobel filter")
			.onChange(t => (this.sobelPass.enabled = t))
		renderingFolder
			.add(this.finalMat.uniforms.isMonochrome, "value", 0, 1, 1)
			.name("Monochrome")
		renderingFolder
			.add(this.finalMat.uniforms.isFlatShading, "value")
			.name("Flat shading")
		renderingFolder
			.add(this.finalMat.uniforms.colorThreshold, "value", 0, 1, 0.0001)
			.name("Color threshold")

		renderingFolder
			.add(this.finalMat.uniforms.dotOpacity, "value", 0, 1, 0.01)
			.name("Dots opacity")

		renderingFolder
			.add(this.finalMat.uniforms.trailOpacity, "value", 0, 1, 0.01)
			.name("Trails opacity")

		let teamNames = ["Slime0", "Slime1", "Slime2"]
		this.guiGroups = []
		for (let i = 0; i < 3; i++) {
			let group = gui.addFolder(teamNames[i])
			group.close()
			this.guiGroups.push(group)

			group
				.addColor(this.settings.colors, i)
				.name("Color")
				.onChange(
					t => (this.finalMat.uniforms["col" + i].value = new THREE.Color(t))
				)
			// group
			// 	.add(this.settings.randChance, i, 0.0, 1, 0.01)
			// 	.name("Random turn chance")
			// 	.onChange(() =>
			// 		this.getUpdateDotsShader().setUniform(
			// 			"randChance",
			// 			Vector(this.settings.randChance)
			// 		)
			// 	)
			group
				.add(this.settings.sensorAngle, i, 0.01, 2, 0.01)
				.name("Sensor Angle")
				.onChange(() =>
					this.getUpdateDotsShader().setUniform(
						"sensorAngle",
						Vector(this.settings.sensorAngle)
					)
				)

			group
				.add(this.settings.rotationAngle, i, 0.01, 2, 0.01)
				.name("Rotation Angle")
				.onChange(() =>
					this.getUpdateDotsShader().setUniform(
						"rotationAngle",
						Vector(this.settings.rotationAngle)
					)
				)

			group
				.add(this.settings.sensorDistance, i, 0.1, 50, 0.1)
				.name("Sensor Distance")
				.onChange(() =>
					this.getUpdateDotsShader().setUniform(
						"sensorDistance",
						Vector(this.settings.sensorDistance)
					)
				)

			group
				.add(this.settings.moveSpeed, i, 0.1, 20, 0.1)
				.name("Move Distance")
				.onChange(() =>
					this.getUpdateDotsShader().setUniform(
						"moveSpeed",
						Vector(this.settings.moveSpeed)
					)
				)

			group
				.add(this.settings.dotSizes, i, 1, 5, 1)
				.name("Dot Size")
				.onChange(() =>
					this.getRenderDotsShader().setUniform(
						"dotSizes",
						Vector(this.settings.dotSizes)
					)
				)

			group
				.add(this.settings.infectious, i, 0, 1, 1)
				.name("Infectious to  " + teamNames[(i + 1) % 3])
				.onChange(() =>
					this.getUpdateDotsShader().setUniform(
						"infectious",
						Vector(this.settings.infectious)
					)
				)

			for (let j = 0; j < 3; j++) {
				group
					.add(this.settings["attract" + i], j, -1, 1, 0.05)
					.name("Attraction to " + teamNames[j])
					.onChange(() =>
						this.getUpdateDotsShader().setUniform(
							"attract" + i,
							Vector(this.settings["attract" + i])
						)
					)
			}

			group
				.add(
					{ randomizeSettings: this.randomizeSettings.bind(this, i) },
					"randomizeSettings"
				)
				.name("Randomize " + teamNames[i] + " Settings")
		}
		gui
			.add(
				{ randomizeSettings: this.randomizeSettings.bind(this, -1) },
				"randomizeSettings"
			)
			.name("Randomize All Settings")
		gui
			.add(
				{ resetPositions: this.resetPositions.bind(this, -1) },
				"resetPositions"
			)
			.name("Reset Positions")
	}
	randomizeSettings(teamIndex) {
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
		this.settings.infectious[teamIndex] = 0 //rndInt(0, 1)
		this.settings.dotSizes[teamIndex] = rndFloat(1, 1)

		for (let i = 0; i < 3; i++) {
			this.settings["attract" + teamIndex][i] = rndFloat(
				i == teamIndex ? 0 : -1,
				1
			)
		}

		if (this.guiGroups) {
			this.guiGroups[teamIndex].controllers.forEach(contr => {
				contr._onChange && contr._name != "Color" ? contr._onChange() : null
				contr.updateDisplay()
			})
		}
	}

	dispose() {
		this.scene.remove(this.finalMesh)
		this.scene.remove(this.updateDotsShader)
		this.scene.remove(this.renderDotsShader)
		this.scene.remove(this.sobelPass)
		this.scene.remove(this.composer)
		this.scene.remove(this.camera)
		this.scene.remove(this.renderer.domElement)
		this.container.removeChild(this.renderer.domElement);
		this.renderer.dispose()
	}
}
