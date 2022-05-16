// >=test1
// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;

// >=test1
// GAME FRAMEWORK
var GF = function(){

	// >=test2
	// variables para contar frames/s, usadas por measureFPS
	var frameCount = 0;
	var lastTime;
	var fpsContainer;
	var fps;

	// >=test4
	//  variable global temporalmente para poder testear el ejercicio
	inputStates = {space: false,
		left: false,
		up: false,
		right: false,
		down: false};

	// >=test10
	const TILE_WIDTH=24, TILE_HEIGHT=24;
	var numGhosts = 4;
	var ghostcolor = {};
	ghostcolor[0] = "rgba(255, 0, 0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128, 0,   255)";
	ghostcolor[4] = "rgba(50, 50, 255,   255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost

	// >=test10
	// hold ghost objects
	var ghosts = {};

	// >=test10
	var Ghost = function(id, ctx){

		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.speed = 1;

		this.nearestRow = 0;
		this.nearestCol = 0;

		this.ctx = ctx;

		this.id = id;
		this.homeX = 0;
		this.homeY = 0;

		this.draw = function(){

			// test13
			// Tu código aquí
			// El cuerpo del fantasma sólo debe dibujarse cuando el estado del mismo es distinto a Ghost.SPECTACLES

			if(this.state != Ghost.SPECTACLES) {

				// test10
				// Tu código aquí
				// Pintar cuerpo de fantasma
				this.ctx.beginPath();
				this.ctx.moveTo(this.x,this.y+TILE_HEIGHT);
				this.ctx.quadraticCurveTo(this.x+(TILE_WIDTH/2),this.y/1.05,this.x+TILE_WIDTH,this.y+TILE_HEIGHT);
				// test12
				// Tu código aquí
				// Asegúrate de pintar el fantasma de un color u otro dependiendo del estado del fantasma y de thisGame.ghostTimer
				// siguiendo el enunciado
				if(this.state == Ghost.NORMAL) this.ctx.fillStyle = ghostcolor[this.id];

				else if(this.state == Ghost.VULNERABLE) {
					if(thisGame.ghostTimer > 100) this.ctx.fillStyle = ghostcolor[4];
					else {
						if(this.stateBlinkTimer == 20) this.stateBlinkTimer = 0;
						if(this.stateBlinkTimer < 10) this.ctx.fillStyle = ghostcolor[5];
						else this.ctx.fillStyle = ghostcolor[4];
						this.stateBlinkTimer++;
					}
				}
				this.ctx.closePath();
				this.ctx.fill();
			}


			// Pintar ojos

			ctx.beginPath();
			ctx.arc(this.x+thisGame.TILE_WIDTH/2-thisGame.TILE_WIDTH/6,this.y+thisGame.TILE_HEIGHT/2,1,0,Math.PI*2,true);
			ctx.closePath();
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.fillStyle = 'white';
			ctx.fill();
			ctx.beginPath();
			ctx.arc(this.x+thisGame.TILE_WIDTH/2+thisGame.TILE_WIDTH/6,this.y+thisGame.TILE_HEIGHT/2,1,0,Math.PI*2,true);
			ctx.closePath();
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.fillStyle = 'white';
			ctx.fill();




		}; // draw

		this.move = function() {
			// test10
			// Tu código aquí
			//this.nearestRow = parseInt((this.y + thisGame.TILE_HEIGHT/2)/thisGame.TILE_HEIGHT);
			//this.nearestCol = parseInt((this.x + thisGame.TILE_WIDTH/2)/thisGame.TILE_WIDTH);
			//const posiblesMovimientos = [[0,-1],[1,0],[0,1],[-1,0]];
			const posiblesMovimientos = [[0,1],[0,-1],[1,0],[-1,0]];
			const soluciones = [];
			const rowAct=Math.floor((this.y+5)/thisGame.TILE_HEIGHT);
			const colAct=Math.floor((this.x)/thisGame.TILE_WIDTH)
			//console.log(rowAct,colAct)
			if((this.x)%thisGame.TILE_WIDTH==0 &&(this.y+5)%thisGame.TILE_HEIGHT==0){
				posiblesMovimientos.map((mov)=>{
					const row=rowAct+mov[0];
					const col=colAct+mov[1];
					//console.log(row,col)
					var tile=thisLevel.getMapTile(row,col);
					//console.log(tile)
					//console.log(row,col)
					//console.log(rowAct,colAct,row,col,tile,mov)
					if(tile<100  && tile!=11 && tile!=12 && tile!=13){
						//console.log("Acep",rowAct,colAct,row,col,tile,mov)
						soluciones.push(mov);
					}
					else {
						//console.log("Pared")
					}
				})
				//console.log(soluciones.length);
				//const random = soluciones[Math.floor(Math.random() * soluciones.length)];
				//console.log(soluciones.length)

				if (soluciones.length>0){
					//console.log(soluciones.length)
					var solRand = soluciones[Math.floor(Math.random()*soluciones.length)]
					this.velX=this.speed*solRand[1];
					this.velY=this.speed*solRand[0];
					//console.log(soluciones,this.velX)
				}

				//this.velY=random[1]*-1;
			}
			//console.log(this.velX,this.velY)
			this.x+=this.velX;
			this.y+=this.velY;


			// test13
			// Tu código aquí
			// Si el estado del fantasma es Ghost.SPECTACLES
			// Mover el fantasma lo más recto posible hacia la casilla de salida
		};

	}; // fin clase Ghost

	// >=test12
	// static variables
	Ghost.NORMAL = 1;
	Ghost.VULNERABLE = 2;
	Ghost.SPECTACLES = 3;

	// >=test5
	var Level = function(ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;

		this.map = [];

		this.points=0;
		this.lifes=3;
		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

		this.displayScore = function(){
			ctx.font = thisGame.TILE_HEIGHT+"px Arial";
			ctx.fillStyle = "white";

			ctx.fillText("Points: "+this.points,0,thisGame.TILE_HEIGHT);
			ctx.fillText("Highscore: "+this.points,14*thisGame.TILE_HEIGHT,thisGame.TILE_HEIGHT);

			ctx.fillText("Lifes: "+this.lifes,0,(thisLevel.lvlHeight)*thisGame.TILE_HEIGHT);
			ctx.save();

			ctx.restore();
		}

		this.setMapTile = function(row, col, newValue){
			// test5
			// Tu código aquí
			this.map[row*thisLevel.lvlWidth+col]=newValue;
		};

		this.getMapTile = function(row, col){
			// test5
			// Tu código aquí
			return thisLevel.map[row*thisLevel.lvlWidth+col];
		};

		this.printMap = function(){
			// test5
			// Tu código aquí

			for (var i = 0; i < thisLevel.lvlHeight; i++) {
				var aux=thisLevel.map.slice(i*thisLevel.lvlWidth,i*thisLevel.lvlWidth+thisLevel.lvlWidth);
				console.log(aux.join(" "));
			}
		};

		this.loadLevel = function(){
			// test5
			// Tu código aquí
			// leer res/levels/1.txt y guardarlo en el atributo map
			// haciendo uso de setMapTile

			$.get('https://raw.githubusercontent.com/AinhoY/froga/main/1.txt', function(data) {
				var auxData=data.split("\n");
				thisLevel.lvlWidth=parseInt(auxData[0].split("# lvlwidth ")[1]);
				thisLevel.lvlHeight=parseInt(auxData[1].split("# lvlheight ")[1]);
				var inic =4; //indice donde empiezan los datos


				for (var i = inic; i < (thisLevel.lvlHeight+inic); i++) {
					var fila = auxData[i].split(" ");
					for (var j = 0; j < thisLevel.lvlWidth; j++) {
						thisLevel.setMapTile((i-4),j,fila[j]);
					}
				}
				reset();
			}, 'text');

			this.printMap();
			// test10
			// Tu código aquí
		};

		// >=test6
		this.drawMap = function(){

			var TILE_WIDTH = thisGame.TILE_WIDTH;
			var TILE_HEIGHT = thisGame.TILE_HEIGHT;

			var tileID = {
				'door-h' : 20,
				'door-v' : 21,
				'pellet-power' : 3
			};

			// test6
			// Tu código aquí
			for (var i = 0; i < thisLevel.lvlHeight; i++) {
				for (var j = 0; j < thisLevel.lvlWidth; j++) {
					var tile = thisLevel.getMapTile(i,j);

					if(tile>=100 && tile<=199){
						//pintamos paredes
						ctx.fillStyle="blue"
						ctx.fillRect(j*TILE_HEIGHT,i*TILE_WIDTH,TILE_WIDTH,TILE_HEIGHT);

					}else if (tile==2) {
						//pintamos pildoras
						ctx.beginPath();
						ctx.fillStyle="white"
						ctx.arc(j*TILE_HEIGHT+TILE_HEIGHT/2,i*TILE_WIDTH+TILE_WIDTH/2,5,0,2*Math.PI);
						ctx.fill();
						ctx.stroke();
					}else if (tile==3) {
						//pintamos pildoras de poder
						if(thisLevel.powerPelletBlinkTimer<30){
							ctx.beginPath();
							ctx.fillStyle="red"
							ctx.arc(j*TILE_HEIGHT+TILE_HEIGHT/2,i*TILE_WIDTH+TILE_WIDTH/2,5,0,2*Math.PI);
							ctx.fill();
							ctx.stroke();
						}
						if(thisLevel.powerPelletBlinkTimer==0){
							thisLevel.powerPelletBlinkTimer=60;
						}
						thisLevel.powerPelletBlinkTimer--;
					}
					else if(tile >=10 && tile <=13) {
						ghosts[tile-10].homeX = i*TILE_WIDTH;
						ghosts[tile-10].homeY = j*TILE_HEIGHT;
					}
				}
			}
		};

		// >=test7
		this.isWall = function(row, col) {
			// test7
			// Tu código aquí
			var tipoCasilla = thisLevel.getMapTile(row,col);
			return(tipoCasilla>=100 && tipoCasilla<=199);
		};

		// >=test7
		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
			// test7
			// Tu código aquí
			// Determinar si el jugador va a moverse a una fila,columna que tiene pared
			// Hacer uso de isWall
			//console.log(possiblePlayerX,possiblePlayerY)
			var my=1;
			var mx=1;
			var hit=true;
			if(player.velY<0){
				my=-1;
				//console.log("Moviendose hacia arriba");
				if (inputStates.left ||inputStates.right){
					mx=-1;
					//console.log("Esquina izquierda");
				}
			}
			else if (player.velY>0){
				my=1;
				//console.log("Moviendose hacia abajo");
				if (inputStates.left ||inputStates.right){
					mx=-1;
					//console.log("Esquina izquierda");
				}

			}

			if(player.velX<0){
				mx=-1;
				//console.log("Moviendose hacia la izquierda");
				if (inputStates.left ||inputStates.right){
					my=-1;
				}
			}
			else if (player.velX>0){
				mx=1;
				//console.log("Moviendose hacia la derecha");
			}

			var newCol = Math.floor((possiblePlayerX+(player.radius)*mx)/thisGame.TILE_WIDTH);
			var newRow = Math.floor((possiblePlayerY+player.radius*my)/thisGame.TILE_HEIGHT);
			/*
			if(this.isWall(row+1,col) && this.isWall(row-1,col) && player.velY>0){
				hit=true;
			}
			else if(this.isWall(row,col+1)&& this.isWall(row,col-1) && player.velX>0){
				hit=true;
			}
			else if(this.isWall(row,newCol) && this.isWall()){

			}
			*/
			if (!this.isWall(row,col)&&!this.isWall(newRow,newCol)){
				//if(!this.isWall(row,newCol)&&!this.isWall(newRow,col)){
				hit=false;
				//}
			}
			return hit;
		};

		// >=test11
		this.checkIfHit = function(playerX, playerY, x, y, holgura){
			// Test11
			// Tu código aquí
			return (Math.abs(playerX-x)<holgura && Math.abs(playerY-y)<holgura);

		};

		// >=test8
		this.checkIfHitSomething = function(playerX, playerY, row, col){
			var tileID = {
				'doorH' : 20,
				'doorV' : 21,
				'pellet-power' : 3,
				'pellet': 2
			};

			// test8
			// Tu código aquí
			// Gestiona la recogida de píldoras

			pos = thisLevel.getMapTile(row, col);
			if (pos == tileID.pellet) {
				this.points+=10;
				thisLevel.setMapTile(row, col, 0);
				thisLevel.pellets--;
				if(thisLevel.pellets == 0) console.log("NIVEL SUPERADO");
			}


			// test9
			// Tu código aquí
			// Gestiona las puertas teletransportadoras


			//puerta horizontal

			if(pos == tileID.doorH){

				if(col==0){
					console.log("ENTRA PUERTA HORIZONTAL IZQUIERDA");
					player.x=(thisLevel.lvlWidth-2)*thisGame.TILE_WIDTH;
				}else if(col==(thisLevel.lvlWidth-1)){

					player.x=thisGame.TILE_WIDTH;
				}
			}

			//puerta vertical

			else if(thisLevel.getMapTile(row,col)=="21"){

				if(row==0){
					player.y=(thisLevel.lvlHeight-2)*thisGame.TILE_HEIGHT;

				}
				else if(row==(thisLevel.lvlHeight-1)){

					player.y=thisGame.TILE_HEIGHT;
				}

			}

			// test12
			// Tu código aquí
			// Gestiona la recogida de píldoras de poder
			// (cambia el estado de los fantasmas)

			pos = thisLevel.getMapTile(row, col);
			if (pos == 3) {
				this.points+=30;
				thisLevel.setMapTile(row, col, 0);
				thisLevel.powerPelletBlinkTimer--;

				thisGame.ghostTimer=fps*6;

				for (var i=0; i< numGhosts; i++){
					if(ghosts[i].state!= Ghost.SPECTACLES){
						ghosts[i].state = Ghost.VULNERABLE;
					}
				}

			}



		};

	}; // end Level

	// >=test2
	var Pacman = function() {
		this.radius = 10;
		this.x = 10;
		this.y = 17;
		this.speed = 2;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
		this.velY=0;
		this.velX=0;
	};

	// >=test3
	var check=function (){

	}
	Pacman.prototype.move = function() {

		// test3 / test4 / test7
		// Tu código aquí


		var newX = this.x+this.velX;
		var newY = this.y+this.velY;
		//check if positions are integers
		if(parseInt(newX, 10) && parseInt(newY, 10)){

			var col = Math.floor(this.x/thisGame.TILE_WIDTH);
			var row = Math.floor(this.y/thisGame.TILE_HEIGHT);
			//check if hit wall

			if(!thisLevel.checkIfHitWall(newX,newY,row,col)){



				// >=test8: introduce esta instrucción
				// dentro del código implementado en el test7:
				// tras actualizar this.x  y  this.y...


				if(newX>=0 && (2*this.radius+newX)<=w){
					this.x = newX;
				}
				if(newY>=0 && (2*this.radius+newY)<=h){
					this.y = newY;
				}

				thisLevel.checkIfHitSomething(this.x, this.y, row, col);


			}


		}

		for (var i=0; i< numGhosts; i++){
			if(thisLevel.checkIfHit(this.x, this.y, ghosts[i].x, ghosts[i].y, thisGame.TILE_WIDTH)){
				if(ghosts[i].state == Ghost.NORMAL) {thisGame.setMode(thisGame.HIT_GHOST);}

				if(ghosts[i].state == Ghost.VULNERABLE) {
					ghosts[i].state == Ghost.SPECTACLES;
					ghosts[i].state== Ghost.NORMAL;
					ghosts[i].x = 235;
					ghosts[i].y = 235;
				}
			}
		}
	}

	// >=test2
	// Función para pintar el Pacman
	// En el test2 se llama drawPacman(x, y) {
	Pacman.prototype.draw = function(x, y) {

		// Pac Man
		// test2
		// Tu código aquí
		// ojo: en el test2 esta función se llama drawPacman(x,y))
		var r=10;
		ctx.beginPath();
		ctx.arc(this.x, this.y, r, this.angle1 * Math.PI, 1.25 * Math.PI, false);
		ctx.fillStyle = "#FFFF00";
		ctx.fill();
		ctx.beginPath();
		ctx.arc(this.x, this.y, r, 0.75 * Math.PI, this.angle2 * Math.PI, false);
		ctx.fill();

	};

	// >=test5
	var player = new Pacman();

	// >=test10
	for (var i=0; i< numGhosts; i++){
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}

	// >=test5
	var thisGame = {
		getLevelNum : function(){
			return 0;
		},

		// >=test14
		setMode : function(mode) {
			this.mode = mode;
			this.modeTimer = 0;
		},

		// >=test6
		screenTileSize: [24, 21],

		// >=test5
		TILE_WIDTH: 24,
		TILE_HEIGHT: 24,

		// >=test12
		ghostTimer: 0,

		// >=test14
		NORMAL : 1,
		HIT_GHOST : 2,
		GAME_OVER : 3,
		WAIT_TO_START: 4,
		modeTimer: 0
	};

	// >=test5
	var thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	// thisLevel.printMap();

	// >=test2
	var measureFPS = function(newTime){
		// la primera ejecución tiene una condición especial

		if(lastTime === undefined) {
			lastTime = newTime;
			return;
		}

		// calcular el delta entre el frame actual y el anterior
		var diffTime = newTime - lastTime;

		if (diffTime >= 1000) {

			fps = frameCount;
			frameCount = 0;
			lastTime = newTime;
		}

		// mostrar los FPS en una capa del documento
		// que hemos construído en la función start()
		fpsContainer.innerHTML = 'FPS: ' + fps;
		frameCount++;
	};

	// >=test3
	// clears the canvas content
	var clearCanvas = function() {
		ctx.clearRect(0, 0, w, h);
	};

	// >=test4
	function inputValido(x,y) {
		var newCol = Math.floor(x/thisGame.TILE_WIDTH);
		var newRow = Math.floor(y/thisGame.TILE_HEIGHT);
		return !thisLevel.checkIfHitWall(x,y,newRow,newCol);
	}
	var checkInputs = function(){
		// test4
		// Tu código aquí (reestructúralo para el test7)

		if(inputStates.right){
			if(inputValido(player.x+player.speed,player.y)){
				player.velX=player.speed;
				player.velY=0;
			}
		}else if (inputStates.left) {
			if(inputValido(player.x-player.speed,player.y)){
				player.velX=-player.speed;
				player.velY=0;
			}
		}else if(inputStates.up){
			if(inputValido(player.x,player.y-player.speed)){
				player.velX=0;
				player.velY=-player.speed;
			}
		}else if (inputStates.down) {
			if(inputValido(player.x,player.y+player.speed)){
				player.velX=0;
				player.velY=player.speed;
			}
		}
		// test7
		// Tu código aquí
		// LEE bien el enunciado, especialmente la nota de ATENCION que
		// se muestra tras el test 7
	};

	// >=test12
	var updateTimers = function(){
		// test12
		// Tu código aquí
		// Actualizar thisGame.ghostTimer (y el estado de los fantasmas, tal y como se especifica en el enunciado)

		if (thisGame.ghostTimer==0) {
			for (var i=0; i< numGhosts; i++){
				if(ghosts[i].state!=Ghost.SPECTACLES){
					ghosts[i].state = Ghost.NORMAL;
				}
			}
		}
		else {
			thisGame.ghostTimer--;

		}
		// test14
		// Tu código aquí
		// actualiza modeTimer...

		if(thisGame.mode == thisGame.WAIT_TO_START) {
			thisGame.modeTimer++;
			if(thisGame.modeTimer >= fps*0.5) {
				thisGame.setMode(thisGame.NORMAL);
				reset();
			}
		}

		if(thisGame.mode==thisGame.HIT_GHOST){
			thisGame.modeTimer++;
			if(thisGame.modeTimer>=fps*1.5){
				thisLevel.lifes--;
				if (thisLevel.lifes==0){
					thisGame.setMode(thisGame.GAME_OVER);
				}
				else{
					thisGame.setMode(thisGame.WAIT_TO_START);
				}

			}
		}


	};

	// >=test1

	var mainLoop = function(time){


		// >=test2
		// main function, called each frame
		if (thisGame.mode!=thisGame.GAME_OVER){
			measureFPS(time);
			// test14
			// Tu código aquí
			// sólo en modo NORMAL
			if(thisGame.mode == thisGame.NORMAL) {
				// >=test4
				checkInputs();

				// test10
				// Tu código aquí
				// Mover fantasmas

				for (var i = 0; i < numGhosts; i++) {
					ghosts[i].move();
				}

				// >=test3
				//ojo: en el test3 esta instrucción es pacman.move()
				player.move();
			}


			// >=test2
			// Clear the canvas
			clearCanvas();

			// >=test6
			thisLevel.drawMap();


			thisLevel.displayScore();


			// test10
			// Tu código aquí
			// Pintar fantasmas

			for (var i=0; i< numGhosts; i++){
				ghosts[i].draw();
			}

			// >=test3
			//ojo: en el test3 esta instrucción es pacman.draw()
			player.draw();

			// >=test12
			updateTimers();


			// call the animation loop every 1/60th of second
			// comentar esta instrucción en el test3
			requestAnimationFrame(mainLoop);
		}
		else {
			ctx.font = '60px Arial bold'
			ctx.fillText("GAME OVER ",80,thisLevel.lvlHeight*thisGame.TILE_HEIGHT/2+20);
			ctx.save();
		}

	};

	// >=test4
	var addListeners = function(){

		// add the listener to the main, window object, and update the states
		// test4
		// Tu código aquí

		document.addEventListener('keydown', (event) => {
			var name = event.key;
			var code = event.code;
			if (name === 'Control') {
				// Do nothing.
				return;
			}
			if (event.ctrlKey) {
				//alert(`Combination of ctrlKey + ${name} \n Key code Value: ${code}`);
			}
			else {
				if (name == "Space"){
					inputStates.space = true;
					inputStates.left = false;
					inputStates.up = false;
					inputStates.right = false;
					inputStates.down = false;
				}
				else if (name == "ArrowLeft"){
					inputStates.space = false;
					inputStates.left = true;
					inputStates.up = false;
					inputStates.right = false;
					inputStates.down = false;
				}
				else if (name == "ArrowUp"){
					inputStates.space = false;
					inputStates.left = false;
					inputStates.up = true;
					inputStates.right = false;
					inputStates.down = false;
				}
				else if (name == "ArrowRight"){
					inputStates.space = false;
					inputStates.left = false;
					inputStates.up = false;
					inputStates.right = true;
					inputStates.down = false;
				}
				else if (name == "ArrowDown"){
					inputStates.space = false;
					inputStates.left = false;
					inputStates.up = false;
					inputStates.right = false;
					inputStates.down = true;
				}
				//alert(`Key pressed ${name} \n Key code Value: ${code}`);
			}
		}, false);

	};


	//>=test7
	var reset = function(){

		// test12
		// Tu código aquí
		// probablemente necesites inicializar los atributos de los fantasmas
		// (x,y,velX,velY,state, speed)

		// test7
		// Tu código aquí
		// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
		// inicializa la posición inicial de Pacman tal y como indica el enunciado
		var casillaPacman = thisLevel.map.indexOf("4");
		player.x = casillaPacman%thisLevel.lvlWidth*thisGame.TILE_HEIGHT+player.radius;
		player.y = Math.floor(casillaPacman/thisLevel.lvlWidth)*thisGame.TILE_HEIGHT+player.radius;
		//inputStates.right=true;
		// test10
		// Tu código aquí
		// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente

		var posx = 200;
		var posy = 235;
		for (var i=0; i< numGhosts; i++){
			ghosts[i].x = posx+(i*30);
			ghosts[i].y = posy;
			ghosts[i].velY = 0;
			ghosts[i].velX = -ghosts[i].speed;
		}
		// >=test14
		thisGame.setMode( thisGame.NORMAL);
	};

	// >=test1
	var start = function(){

		// >=test2
		// adds a div for displaying the fps value
		fpsContainer = document.createElement('div');
		document.body.appendChild(fpsContainer);

		// >=test4
		addListeners();

		// >=test7
		reset();

		// start the animation
		requestAnimationFrame(mainLoop);
	};

	// >=test1
	//our GameFramework returns a public API visible from outside its scope
	return {
		start: start,

		// solo para el test 10
		ghost: Ghost,  // exportando Ghost para poder probarla

		// solo para estos test: test12 y test13
		ghosts: ghosts,

		// solo para el test12
		thisLevel: thisLevel,

		// solo para el test 13
		Ghost: Ghost,

		// solo para el test14
		thisGame: thisGame
	};
};

// >=test1
var game = new GF();
game.start();




