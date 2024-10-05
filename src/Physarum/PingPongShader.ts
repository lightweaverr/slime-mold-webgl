import * as THREE from "three"

interface PingPongShaderOptions {
	minFilter?: THREE.TextureFilter;
	magFilter?: THREE.TextureFilter;
	format?: THREE.PixelFormat;
	type?: THREE.TextureDataType;
	alpha?: boolean;
	blending?: THREE.Blending;
	depthText?: boolean;
}

interface Uniforms {
	[key: string]: { value: any };
}

export class PingPongShader {
	width: number;
	height: number;
	uniforms: Uniforms;
	material: THREE.ShaderMaterial;
	mesh: THREE.Mesh;
	renderTarget0: THREE.WebGLRenderTarget;
	renderTarget1: THREE.WebGLRenderTarget;
	currentRenderTarget: THREE.WebGLRenderTarget;
	nextRenderTarget: THREE.WebGLRenderTarget;
	scene?: THREE.Scene;
	camera?: THREE.OrthographicCamera;

	constructor(
		width: number,
		height: number,
		vertex: string,
		fragment: string,
		uniforms: { [key: string]: any },
		data: Float32Array | null = null,
		attributes?: any,
		options?: PingPongShaderOptions
	) {
		this.width = width;
		this.height = height;

		let opts: PingPongShaderOptions = {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			alpha: true,
			blending: THREE.NoBlending,
			depthText: false,
			...options
		};

		if (data == null) {
			data = new Float32Array(width * height * 4);
		}

		let texture = new THREE.DataTexture(
			data,
			width,
			height,
			THREE.RGBAFormat,
			THREE.FloatType
		);
		texture.needsUpdate = true;

		this.renderTarget0 = new THREE.WebGLRenderTarget(width, height, opts as THREE.RenderTargetOptions);
		this.renderTarget1 = new THREE.WebGLRenderTarget(width, height, opts as THREE.RenderTargetOptions);

		this.renderTarget0.texture = texture.clone();
		this.renderTarget1.texture = texture;

		this.currentRenderTarget = this.renderTarget0;
		this.nextRenderTarget = this.renderTarget1;

		this.uniforms = {
			input_texture: { value: this.getTexture() }
		};

		for (let key in uniforms) {
			this.uniforms[key] = { value: uniforms[key] };
		}

		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			blending: THREE.NoBlending,
			vertexShader: vertex,
			fragmentShader: fragment,
			transparent: true
		});

		this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(), this.material);
		this.mesh.scale.set(width, height, 1);

		this.getScene().add(this.mesh);
	}

	setUniform(key: string, value: any) {
		if (!this.material.uniforms.hasOwnProperty(key)) {
			console.log("Adding " + key);
			this.material.uniforms[key] = {value: null};
		}
		this.material.uniforms[key].value = value;
	}

	getUniforms() {
		return this.material.uniforms;
	}

	getTexture() {
		return this.currentRenderTarget.texture;
	}

	switchRenderTargets() {
		this.currentRenderTarget =
			this.currentRenderTarget === this.renderTarget0
				? this.renderTarget1
				: this.renderTarget0;
		this.nextRenderTarget =
			this.currentRenderTarget === this.renderTarget0
				? this.renderTarget1
				: this.renderTarget0;
	}

	render(renderer: THREE.WebGLRenderer, updatedUniforms: { [key: string]: any }) {
		this.switchRenderTargets();

		this.mesh.visible = true;
		this.material.uniforms.input_texture.value = this.getTexture();

		for (let key in updatedUniforms) {
			this.material.uniforms[key].value = updatedUniforms[key];
		}

		renderer.setSize(this.width, this.height);
		renderer.setRenderTarget(this.nextRenderTarget);
		renderer.render(this.getScene(), this.getCamera());

		renderer.setRenderTarget(null);
		this.mesh.visible = false;
	}

	getScene(): THREE.Scene {
		if (!this.scene) {
			this.scene = new THREE.Scene();
		}
		return this.scene;
	}

	getCamera(): THREE.OrthographicCamera {
		if (!this.camera) {
			const w = this.width;
			const h = this.height;
			this.camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100);
			this.camera.position.z = 1;
		}
		return this.camera;
	}

	dispose() {
		this.getScene().remove(this.mesh);
		this.mesh.geometry.dispose();
		this.mesh = null!;
		this.camera = null!;
		this.material.dispose();
		this.currentRenderTarget.texture.dispose();
		this.nextRenderTarget.texture.dispose();
		this.renderTarget0 = null!;
		this.renderTarget1 = null!;
		this.currentRenderTarget = null!;
		this.nextRenderTarget = null!;
		this.scene = null!;
	}
}
