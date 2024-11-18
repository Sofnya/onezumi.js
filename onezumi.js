//oneko.js:https://github.com/adryd325/oneko.js

function oneko(posX, posY){
	const isReducedMotion =
	window.matchMedia(`(prefers-reduced-motion:reduce)`) === true||
	window.matchMedia(`(prefers-reduced-motion:reduce)`).matches === true;

	if(isReducedMotion) return;

	let nekoEl = document.createElement("div");

	let nekoPosX = posX;
	let nekoPosY = posY;

	let destX = nekoPosX;
	let destY = nekoPosY;

	let mousePosX = nekoPosX;
	let mousePosY = nekoPosY;

	let facing = "E";
	let frameCount = 0;
	let state = "idle";
	let stateTime = 0;
	let reactionTime = Math.ceil(Math.random() * 14) + 7;

	const nekoSpeed = 10;
	const destRange = 160;

	let animationInfo = {}

	let dynamicStyles = null;

	function addAnimation(body) {
		if (!dynamicStyles) {
			dynamicStyles = document.createElement('style');
			dynamicStyles.type = 'text/css';
			document.head.appendChild(dynamicStyles);
		}

		dynamicStyles.sheet.insertRule(body, dynamicStyles.length);
	}

	function initAnimations(){

		addAnimation(`
		@keyframes moving { 
			from {
				background-position: 0px 0px;
			}
			to {
				background-position: -160px 0px;
			}
		}
		`);
		animationInfo["moving"] = [6, 0];

		addAnimation(`
		@keyframes alert { 
			from {
				background-position: 0px -32px;
			}
			to {
				background-position: -32px -32px;
			}
		}
		`);
		animationInfo["alert"] = [2, Math.floor(reactionTime)-7];

		addAnimation(`
		@keyframes tired { 
			from {
				background-position: -64px -32px;
			}
			to {
				background-position: -96px -32px;
			}
		}
		`);
		animationInfo["tired"] = [2, 0];

		addAnimation(`
		@keyframes sleeping { 
			from {
				background-position: -128px -32px;
			}
			to {
				background-position: -160px -32px;
			}
		}
		`);
		animationInfo["sleeping"] = [2, 0];

		addAnimation(`
		@keyframes stopped { 
			from {
				background-position: 0px -64px;
			}
			to {
				background-position: -32px -64px;
			}
		}
		`);
		animationInfo["stopped"] = [2, 0];

		addAnimation(`
		@keyframes idle { 
			from {
				background-position: -64px -64px;
			}
			to {
				background-position: -96px -64px;
			}
		}
		`);
		animationInfo["idle"] = [2, 0];


	}

	function init(){
		nekoEl.id = "onezumi";
		nekoEl.ariaHidden = true;
		nekoEl.style.width = "32px";
		nekoEl.style.height = "32px";
		nekoEl.style.position = "fixed";
		nekoEl.style.pointerEvents = "none";
		nekoEl.style.imageRendering = "pixelated";
		nekoEl.style.left = `${nekoPosX-16}px`;
		nekoEl.style.top = `${nekoPosY-16}px`;
		nekoEl.style.zIndex = 1000;

		const colors = ["1a","1b","2a","2b","3a","3b","4a","4b","5a","5b","6a","6b"]
		const color = colors[Math.floor(Math.random() * colors.length)];
		let nekoFile = `./pixel_rats/colors/smol_rats_color${color}.gif`

		const curScript = document.currentScript
		if(curScript && curScript.dataset.cat){
			nekoFile = curScript.dataset.cat
		}
		nekoEl.style.backgroundImage = `url(${nekoFile})`;

		initAnimations();

		document.body.appendChild(nekoEl);

		document.addEventListener("mousemove",function (event){
			mousePosX = Math.max(event.clientX, 0);
			mousePosX = Math.min(mousePosX, window.innerWidth);
			mousePosY = Math.max(event.clientY, 0);
			mousePosY = Math.min(mousePosY, window.innerHeight);
		});

		setAnimation(state);

		window.requestAnimationFrame(onAnimationFrame);
	}

	let lastFrameTimestamp;

	function onAnimationFrame(timestamp){
		//Stops execution if the neko element is removed from DOM
		if(!nekoEl.isConnected){
			return;
		}
		if(!lastFrameTimestamp){
			lastFrameTimestamp = timestamp;
		}
		if(timestamp - lastFrameTimestamp > 100){
			lastFrameTimestamp = timestamp
			frame()
		}
		window.requestAnimationFrame(onAnimationFrame);
	}


	function setAnimation(name){
		nekoEl.style.animation = `${name} 600ms steps(${animationInfo[name][0]}, jump-none) infinite`;
	}


	function updateFacing(facing){
		nekoEl.style.transform = facing == "E" ? "scaleX(1)" : "scaleX(-1)"
	}

	function frame(){
		frameCount += 1;
		switchState();
		if (state == "moving") moving();
	}

	function newDest(){
		destX = mousePosX + (Math.random() * destRange* 2) - destRange
		destY = mousePosY + (Math.random() * destRange* 2) - destRange
		destX = Math.max(destX, 0);
		destY = Math.max(destY, 0);
		destX = Math.min(destX, window.innerWidth);
		destY = Math.min(destY, window.innerHeight);
		
	}

	function switchState() {
		stateTime +=1;
		const oldState = state;
		switch(state){
			case("tired"):
				if (stateTime >= 10 && Math.random() <= 0.3)
				{
					state = "sleeping";
					stateTime = 0;
				}
			case("sleeping"):
				if (state == "sleeping" && stateTime >= 10 && Math.random() <= 0.005)
				{
					state = "idle";
					stateTime = 0;
				}
			case("stopped"):
				if (state == "stopped" && stateTime > 4 && Math.random() <= 0.1) {
					state = "idle";
					stateTime = 0;
				}
			case("idle"):
				const mouseDiffX = destX - mousePosX;
				const mouseDiffY = destY - mousePosY;
				const mouseDistance = Math.sqrt(mouseDiffX**2 + mouseDiffY**2);
				if (mouseDistance >= destRange) {
					updateFacing((nekoPosX - destX < 0) ? "E" : "W");
					state = "alert";
					stateTime = 0;
				} else if (state == "idle" && stateTime >= 10 && Math.random() <= 0.1) {
					state = "tired";
					stateTime = 0;
				} else if (state == "idle" && stateTime >= 10 && Math.random() <= 0.03) {
					newDest();
					state = "moving";
					stateTime = 0;
				}
			break;
			case("alert"):
				if (stateTime > reactionTime) {
					state = "moving";
					stateTime = 0;
				}
			break;
			case("moving"):
				const destDiffX = nekoPosX - destX;
				const destDiffY = nekoPosY - destY;
				const destDistance = Math.sqrt(destDiffX**2 + destDiffY**2);
				if(destDistance < nekoSpeed || destDistance < destRange){
					state = "stopped";
					stateTime = 0;
				}
			break;
		}

		if(stateTime == animationInfo[state][1]) {
			setAnimation(state);
		}
	}



	function moving() {
		const mouseDiffX = destX - mousePosX;
		const mouseDiffY = destY - mousePosY;
		const mouseDistance = Math.sqrt(mouseDiffX**2 + mouseDiffY**2);
		if (mouseDistance >= destRange) {
			newDest();
			updateFacing((nekoPosX - destX < 0) ? "E" : "W");
		}
		const destDiffX = nekoPosX - destX;
		const destDiffY = nekoPosY - destY;
		const destDistance = Math.sqrt(destDiffX**2 + destDiffY**2);

		if (destDistance != 0) {
			nekoPosX -= (destDiffX / destDistance) * nekoSpeed;
			nekoPosY -= (destDiffY / destDistance) * nekoSpeed;
		}

		nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
		nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

		nekoEl.style.left = `${nekoPosX - 16}px`;
		nekoEl.style.top = `${nekoPosY - 16}px`;
		nekoEl.style.zIndex = Math.floor(200000 + nekoPosY);
	

	}

	init();
};
for(let i = 0; i < 99; i++)
{
	const x = Math.random() * (window.innerWidth - 64) + 32;
	const y = Math.random() * (window.innerHeight - 64) + 32;
	oneko(x, y);
}
