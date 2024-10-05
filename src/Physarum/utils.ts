
import * as THREE from 'three';

export function rndFloat(min: number, max: number) {
	return min + (max - min) * Math.random()
}
export function rndInt(min: number, max: number) {
	return Math.round(min + (max - min) * Math.random())
}


export const Vector = (arr: number[]) : THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | void => {
	const constructors: any = {
		2: THREE.Vector2,
		3: THREE.Vector3,
		4: THREE.Vector4,
	};

	const Constructor = constructors[arr.length];

	if (Constructor) {
		return new Constructor(...arr);
	} else {
		console.error(`Cannot create vector with ${arr.length} elements`);
	}
};




