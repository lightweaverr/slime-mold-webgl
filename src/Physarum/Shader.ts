import * as THREE from "three"

/**
 * Adapted from https://github.com/nicoptere/physarum/blob/master/src/RenderTarget.js
 */
export class Shader {
	private width: number
	private height: number
	private uniforms: Record<string, { value: any }>
	private material: THREE.ShaderMaterial
	private renderTarget: THREE.WebGLRenderTarget
	private mesh: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
	private scene?: THREE.Scene
	private camera?: THREE.OrthographicCamera

	constructor(
		width: number,
		height: number,
		vertex: string,
		fragment: string,
		uniforms: Record<string, any>,
		attributes: Record<string, THREE.BufferAttribute>,
		options: Record<string, any> = {}
	) {
		this.width = width
		this.height = height

		this.uniforms = {}
		for (let key in uniforms) {
			this.uniforms[key] = { value: uniforms[key] }
		}

		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			blending: THREE.NoBlending,
			transparent: true,
			vertexShader: vertex,
			fragmentShader: fragment
		})

		const opts = {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			blending: THREE.NoBlending,
			...options
		}

		this.renderTarget = new THREE.WebGLRenderTarget(width, height, opts)

		const bufferGeometry = new THREE.BufferGeometry()
		for (let key in attributes) {
			bufferGeometry.setAttribute(key, attributes[key])
		}

		this.mesh = new THREE.Points(bufferGeometry, this.material)
		this.getScene().add(this.mesh)
	}

	setUniform(key: string, value: any): void {
		if (!this.material.uniforms.hasOwnProperty(key)) {
			this.material.uniforms[key] = {value}
		}
		this.material.uniforms[key].value = value
	}

	getTexture(): THREE.Texture {
		return this.renderTarget.texture
	}

	render(
		renderer: THREE.WebGLRenderer,
		updatedUniforms: Record<string, any>
	): void {
		this.mesh.visible = true

		for (let key in updatedUniforms) {
			this.material.uniforms[key].value = updatedUniforms[key]
		}

		renderer.setSize(this.width, this.height)
		renderer.setRenderTarget(this.renderTarget)
		renderer.render(this.getScene(), this.getCamera())
		renderer.setRenderTarget(null)
		this.mesh.visible = false
	}

	getScene(): THREE.Scene {
		if (!this.scene) {
			this.scene = new THREE.Scene()
		}
		return this.scene
	}

	getCamera(): THREE.OrthographicCamera {
		if (!this.camera) {
			this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 0.1, 1000)
			this.camera.position.z = 1
		}
		return this.camera
	}

	dispose(): void {
		this.getScene().remove(this.mesh)
		this.mesh.geometry.dispose()
		this.mesh = null as unknown as THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
		this.camera = null as unknown as THREE.OrthographicCamera
		this.material.dispose()
		this.renderTarget.texture.dispose()
		this.renderTarget = null as unknown as THREE.WebGLRenderTarget
		this.scene = null as unknown as THREE.Scene
	}
}
