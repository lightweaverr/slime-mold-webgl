import { PingPongShader } from "./PingPongShader"

export class PingPongShaderBuilder {
	private vertexString?: string;
	private fragmentString?: string;
	private width?: number;
	private height?: number;
	private data?: Float32Array;
	private uniforms?: { [key: string]: any };
	private attributes?: { [key: string]: any };

	constructor() {}

	withVertex(vertexString: string): this {
		this.vertexString = vertexString;
		return this;
	}

	withFragment(fragmentString: string): this {
		this.fragmentString = fragmentString;
		return this;
	}

	withDimensions(width: number, height: number): this {
		this.width = width;
		this.height = height;
		return this;
	}

	withTextureData(data: Float32Array): this {
		this.data = data;
		return this;
	}

	withUniform(key: string, val: any): this {
		if (!this.uniforms) {
			this.uniforms = {};
		}
		this.uniforms[key] = val;
		return this;
	}

	withUniforms(obj: { [key: string]: any }): this {
		if (!this.uniforms) {
			this.uniforms = {};
		}
		Object.entries(obj).forEach(([key, value]) => {
			this.uniforms![key] = value; 
		});
		return this;
	}

	withAttribute(key: string, val: any): this {
		if (!this.attributes) {
			this.attributes = {};
		}
		this.attributes[key] = val;
		return this;
	}

	withAttributes(obj: { [key: string]: any }): this {
		if (!this.attributes) {
			this.attributes = {};
		}
		Object.entries(obj).forEach(([key, value]) => {
			this.attributes![key] = value; 
		});
		return this;
	}

	create(): PingPongShader {
		if (!this.width || !this.height || !this.vertexString || !this.fragmentString) {
			throw new Error("Missing required parameters to create PingPongShader.");
		}

		return new PingPongShader(
			this.width,
			this.height,
			this.vertexString,
			this.fragmentString,
			this.uniforms || {},   
			this.data || null,     
			this.attributes || {}  
		);
	}
}
