'use strict';
import { CodeJar } from 'codejar';
// import { withLineNumbers } from 'codejar/linenumbers';

import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import './style/prism-dracula.css';
// import './style/prism-material-oceanic.css';

import './style.css'

console.log('Pac-Fish');

const GAME_SIZE = { x: 500, y: 500 }

const _animation = {
	handler: null,
	lastTimestamp: 0,
};

const _pacman = {
	SIZE: 85,
	domElement: null,
	position: { x: 0, y: 0 },
	velocity: { x: 0, y: 0 },
	defaultSpeed: 5,

	setSpeed(v) {
		this.velocity.x = v[0] * this.defaultSpeed;
		this.velocity.y = v[1] * this.defaultSpeed;

		if (v[0] != 0)
			if (v[0] < 0)
				this.domElement.children[0].style.transform = 'scale(-0.5, 0.5)';
			else
				this.domElement.children[0].style.transform = 'scale(0.5, 0.5)';
	}

};

const _predator = {
	SIZE: 85,
	domElement: null,
	position: { x: 0, y: 0 },
	velocity: { x: 0, y: 0 },
	defaultSpeed: 2,
	code: '',

	setSpeed(v) {
		this.velocity.x = v[0] * this.defaultSpeed;
		this.velocity.y = v[1] * this.defaultSpeed;
	},

	getPacman() {
		return {
			x: _pacman.position.x,
			y: _pacman.position.y,
			vx: _pacman.velocity.x,
			vy: _pacman.velocity.y,
		}
	},
};

function checkBoundaryHit(gameObject) {
	if (gameObject.position.x <= 0 || gameObject.position.x + gameObject.SIZE > GAME_SIZE.x)
		return 'x'
	if (gameObject.position.y <= 0 || gameObject.position.y + gameObject.SIZE > GAME_SIZE.y)
		return 'y'
	return false
}

function move(gameObject,moveFactor) {
	gameObject.position.x += gameObject.velocity.x * moveFactor
	gameObject.position.y += gameObject.velocity.y * moveFactor

	let boundary
	if (boundary = checkBoundaryHit(gameObject)) {
		gameObject.velocity = { x: 0, y: 0 }
	}
	gameObject.domElement.style.transform = `translate(${gameObject.position.x}px, ${gameObject.position.y}px)`

}

function animate(timestamp) {	
	const timeDelta = timestamp - _animation.lastTimestamp
	const moveFactor = (timeDelta / 16/*ms*/) // requestanimationframe is 60 FPS

	// predator code
	eval(`(function(predator){
		${_predator.code}
	})(_predator, _pacman)`)

	// movement
	move(_pacman, moveFactor)
	move(_predator, moveFactor)
	
	_animation.lastTimestamp = timestamp
	_animation.handler = requestAnimationFrame(animate)
}

function reset(obj) {
	obj.velocity = { x: 0, y: 0 };
	obj.position = { x: 0, y: 1 };
}

let jar;
function runCode(event) {
	reset(_pacman);
	reset(_predator);
	const code = jar.toString();
	_predator.code = code;
	console.log(code);
}


// Main
document.addEventListener("DOMContentLoaded", function (event) {
	const editor = document.getElementById('editor');
	jar = CodeJar(
		editor as any,
		Prism.highlightElement,
		{ tab: '\t' }
	);
	
	// Update code
	jar.updateCode(`
const pacman = predator.getPacman();
predator.setSpeed([1,1])
console.log(pacman.x, predator.position.x)
if (pacman.x > predator.position.x)
	predator.setSpeed([1,0])
else
	predator.setSpeed([-1,0])
`);
	
	// Listen to updates
	jar.onUpdate(code => {
		console.log(code);
	});

	document.getElementById('run-code-button').addEventListener('click', (event) => runCode(event));
	
	
	///////////////////
	_pacman.domElement = document.getElementById("pac-fish");
	_predator.domElement = document.getElementById("predator");

	document.addEventListener('keydown', (event) => {
		if (event.repeat)
			return false;

		const keyToSpeed = {
			"ArrowLeft": [-1, 0],
			"ArrowRight": [1, 0],
			"ArrowUp": [0, -1],
			"ArrowDown": [0, 1],
			"z": [0, 0],
		}
		_pacman.setSpeed(keyToSpeed[event.key]);
	});

	_animation.handler = requestAnimationFrame(animate);
});

