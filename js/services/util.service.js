'use strict'

function makeid(length = 5) {
	var id = ''
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (var i = 0; i < length; i++) {
		id += chars.charAt(getRandomInt(0, chars.length))
	}
	return id
}

function getRandomInt(min, max) {
	const minCeiled = Math.ceil(min)
	const maxFloored = Math.floor(max)
	return Math.floor(Math.random() * (maxFloored - minCeiled)) + minCeiled // The maximum is exclusive and the minimum is inclusive
}
