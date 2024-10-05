

function rndFloat(min: number, max: number) {
	return min + (max - min) * Math.random()
}
function rndInt(min: number, max: number) {
	return Math.round(min + (max - min) * Math.random())
}

export { rndFloat, rndInt }
