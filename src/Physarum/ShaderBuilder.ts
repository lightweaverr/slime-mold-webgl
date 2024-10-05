import { Shader } from "./Shader"

export class ShaderBuilder {
	private vertexString?: string
	private fragmentString?: string
	private width?: number
	private height?: number
	private uniforms?: Record<string, any>
	private attributes?: Record<string, any>

	constructor() {}

	withVertex(vertexString: string): this {
		this.vertexString = vertexString
		return this
	}

	withFragment(fragmentString: string): this {
		this.fragmentString = fragmentString
		return this
	}

	withDimensions(width: number, height: number): this {
		this.width = width
		this.height = height
		return this
	}

	withUniform(key: string, val: any): this {
		if (!this.uniforms) {
			this.uniforms = {}
		}
		this.uniforms[key] = val
		return this
	}

	withUniforms(obj: Record<string, any>): this {
		if (!this.uniforms) {
			this.uniforms = {}
		}
		Object.entries(obj).forEach(([key, value]) => {
			this.uniforms![key] = value
		})
		return this
	}

	withAttribute(key: string, val: any): this {
		if (!this.attributes) {
			this.attributes = {}
		}
		this.attributes[key] = val
		return this
	}

	withAttributes(obj: Record<string, any>): this {
		if (!this.attributes) {
			this.attributes = {}
		}
		Object.entries(obj).forEach(([key, value]) => {
			this.attributes![key] = value
		})
		return this
	}

	create(): Shader {
		return new Shader(
			this.width!,
			this.height!,
			this.vertexString!,
			this.fragmentString!,
			this.uniforms || {},
			this.attributes || {}
		)
	}
}
