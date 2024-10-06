
import * as THREE from 'three';

export function rndFloat(min: number, max: number) {
	return min + (max - min) * Math.random()
}
export function rndInt(min: number, max: number) {
	return Math.round(min + (max - min) * Math.random())
}


export const Vector = (arr: number[]) : THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | void => {
	return arr.length == 2
		? new THREE.Vector2(arr[0], arr[1])
		: arr.length == 3
		? new THREE.Vector3(arr[0], arr[1], arr[2])
		: arr.length == 4
		? new THREE.Vector4(arr[0], arr[1], arr[2], arr[3])
		: console.error("Cant create vector with " + arr.length + " elements")
};




