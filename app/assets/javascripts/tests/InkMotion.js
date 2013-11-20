
function storeCoordinate(xVal, yVal, tVal, array) {
    array.push({x: xVal, y: yVal, t: tVal});
}

function getCoordinateCSVString(array) {
   var result = '';
   for(var index = 0; index < array.length; index++){
      result = result+array[index].t.toString()+","+array[index].x.toString()+","+array[index].y.toString()+"\n";
   }
   return result;
}

var Anchor = function(project, pointable){
	
	this.x = Math.round(project.position.x);
	this.y = Math.round(project.position.y);
	this.distance = project.distance;
	this.direction = pointable.direction();
	this.velocity = pointable.tipVelocity();
}
var Boundary = function(b, w, h){
	
	this.width = w;
	this.height = h;
	
	if(b[0] < 0) this.left = 0;
	else if(b[0] > this.width) this.left = this.width;
	else this.left = b[0];
	
	if(b[1] < 0) this.right = 0;
	else if(b[1] > this.width) this.right = this.width;
	else this.right = b[1];
	
	if(b[2] < 0) this.top = 0;
	else if(b[2] > this.height) this.top = this.height;
	else this.top = b[2];
	
	if(b[3] < 0) this.bottom = 0;
	else if(b[3] > this.height) this.bottom = this.height;
	else this.bottom = b[3];
}

Boundary.prototype.update = function(b){
	
	var change = false;
	
	if(b[0] < this.left){
		if(b[0] < 0) this.left = 0;
		else if(b[0] > this.width) this.left = this.width;
		else this.left = b[0];
		change = true;
	}
	if(b[1] > this.right){
		if(b[1] < 0) this.right = 0;
		else if(b[1] > this.width) this.right = this.width;
		else this.right = b[1];
		change = true;
	}
	if(b[2] < this.top){
		if(b[2] < 0) this.top = 0;
		else if(b[2] > this.height) this.top = this.height;
		else this.top = b[2];
		change = true;
	}
	if(b[3] > this.bottom){
		if(b[3] < 0) this.bottom = 0;
		else if(b[3] > this.height) this.bottom = this.height;
		else this.bottom = b[3];
		change = true;
	}
	
	return change;
}

Boundary.prototype.toString = function(){
	return JSON.stringify([this.left, this.right, this.top, this.bottom]);
}

var InkMotion = function(){
	
	var me = this;
	this.div = document.getElementById("InkMotion");
	this.div.oncontextmenu = function(){ me._contextMenu(); return false; };
	
	this.page = new Page(window.innerWidth, window.innerHeight, this);
	this.pageDiv = document.createElement("div");
	this.pageDiv.appendChild(this.page.div);
	this.div.appendChild(this.pageDiv);
	
	this.foreground = new Layer(window.innerWidth, window.innerHeight);
	this.div.appendChild(this.foreground.canvas);
	
   this.stimTarget = new Image();
   this.stimTarget.src = 'ball_icon.png';
   this.start_time = (new Date()).getTime(); 
   this.cycles = 0;
   this.testing = false;
	
	this._buildMenu();
	this.div.appendChild(this.menu.ul);
	this.cursorPos = document.createElement("ul");
	this.cursorPos.id = "cursorPos";
	this.div.appendChild(this.cursorPos)
	
	this.listener = new Leap.Listener();
	this.listener.onConnect = function(controller){ me._onConnect(controller); };
	
	this.controller = new Leap.Controller("ws://localhost:6437/");
	this.controller.addListener(this.listener);
	
	this.activeDistance = 40;
	
	this.projection = function(pointable){ return this.screen.intersect(pointable, true); };
	
   this.targetPos = [];
   this.userPos = [];
   this.targX = 0;
   this.targY = 0;
	
};

InkMotion.prototype = {
   	
	_onFrame : function(controller) {
		
		var layer = this.page.activeLayer();
		
		var frame = controller.frame();
		var pointables = frame.pointables();
		var count = pointables.count();
				
		for(var id in layer.progress){
			if(!frame.pointable(id).isValid()) layer.finalizeStroke(id);
		}
		
		this.screen.offset();
		
		for(var index = 0; index < count; index++){
			var pointable = pointables[index];
			var project = this.projection(pointable, true);
			
			if(project){
				project.distance /= this.activeDistance;
				var anchor = new Anchor(project, pointable);
            // layer.processAnchor(pointable.id(), anchor, this.brush);
			}
		}
	},
	
	_renderCursors : function(){
		
		var frame = this.controller.frame();
		var pointables = frame.pointables();
		var count = pointables.count();
		this.needsRender = true;
		
		this.foreground.context.clearRect(0, 0, this.foreground.width, this.foreground.height);
		
		if (this.testing) {
		   this.foreground.context.rect(0, 0, this.foreground.canvas.width, this.foreground.canvas.height);
         this.foreground.context.fillStyle = 'black';
         this.foreground.context.fill();
		   var elapsed_time = ((new Date()).getTime() - this.start_time) / 1000.0;
		   if(this.cycles < 2) {
            if (elapsed_time < 2) {
               this.targX = 0;
               this.targY = 0;
            } else if(elapsed_time < 17) {
               var radius = Math.min(this.foreground.canvas.height,this.foreground.canvas.width)/2-50;
               var radians_per_second = 2 * Math.PI * 0.4; // 0.4 Hz   
               var theta = (elapsed_time - 2) * radians_per_second - (Math.PI / 2);
               this.targX = Math.floor(radius * Math.cos(theta));
               this.targY = Math.floor(radius * Math.sin(theta));
            } else {
               this.start_time = (new Date()).getTime();
               this.cycles = this.cycles + 1;
               this.targX = 0;
               this.targY = 0;
            } 
            this.foreground.context.drawImage(this.stimTarget, this.targX + this.foreground.canvas.width / 2 - this.stimTarget.width / 2, 
               this.targY + this.foreground.canvas.height / 2 - this.stimTarget.height / 2); 
         } else {
            if (elapsed_time < 2) {
               this.targX = 0;
               this.targY = 0;
               this.foreground.context.drawImage(this.stimTarget, this.targX + this.foreground.canvas.width / 2 - this.stimTarget.width / 2, 
                  this.targY + this.foreground.canvas.height / 2 - this.stimTarget.height / 2); 
            } else {
               this.foreground.context.rect(0, 0, this.foreground.canvas.width, this.foreground.canvas.height);
               this.foreground.context.fillStyle = 'white';
               this.foreground.context.fill();
               this.testing = false;
               writeLogFile(getCoordinateCSVString(this.targetPos),"spem_"+(new Date()).toISOString()+"_target.csv");
               writeLogFile(getCoordinateCSVString(this.userPos),"spem_"+(new Date()).toISOString()+"_user.csv");
               this.userPos = [];
               this.targetPos = [];
            }
         }
	      if (count >=1 && pointables[0]) {
	         storeCoordinate(  this.projection(pointables[0], true).position.x, 
	                           this.projection(pointables[0], true).position.y, 
	                           elapsed_time, this.userPos);
				storeCoordinate(this.targX, this.targY, elapsed_time, this.targetPos);
	      }
	   }
		
		
//		for(var index = 0; index < count; index++){
      for(var index = 0; index < 1; index++){
			var pointable = pointables[index];
			var project = this.projection(pointable, true);
			
			if(project){
				
            // this.menu.items[this.menu.items.length-1].link.innerHTML = "("+project.position.x+","+project.position.y+")";  
				
				var fade = (200 - project.distance + this.activeDistance)/200;
				if(fade>1) fade = 1;
				else if(fade<0) fade = 0;
				
				this.foreground.context.beginPath();
				this.foreground.context.arc(project.position.x, project.position.y, 4+10*(1-fade), 0, 2 * Math.PI, false);
				this.foreground.context.fillStyle = 'rgba(255,255,255,'+fade+')';
				this.foreground.context.fill();
				this.foreground.context.beginPath();
				this.foreground.context.arc(project.position.x, project.position.y, 3+4*(1-fade), 0, 2 * Math.PI, false);
				this.foreground.context.fillStyle = 'rgb(0,0,0)';
				this.foreground.context.fill();
				
				
			}
		}
	},
	
	_onConnect : function(controller){
				
		if(this.calibrate || this.screen) return;
		var me = this;
		
		if(this.controller.calibratedScreens().empty()){
			this.calibrate = new Leap.Calibrate(this.controller);
			this.calibrate.onComplete = function(screen){
				me.screen = screen;
				delete me.calibrate;
				setTimeout(function(){ me.listener.onFrame = function(controller){ me._onFrame(controller); }; }, 1500);
				me.renderLoop = function(){
					requestAnimFrame(me.renderLoop);
					me.page.activeLayer().renderProgress();
					me._renderCursors();
				};
				me.renderLoop();
			}
		}
		else{
			this.screen = this.controller.calibratedScreens()[0];
			this.listener.onFrame = function(controller){ me._onFrame(controller); };
			this.renderLoop = function(){
				requestAnimFrame(me.renderLoop);
				me.page.activeLayer().renderProgress();
				me._renderCursors();
			};
			this.renderLoop();
			
			var mainMenu = this.menu.items[0];
			mainMenu.show();
			setTimeout(function(){ mainMenu.hide(); }, 3000);
		}
	},
	
	_recalibrate : function(){
		if(this.calibrate || !this.controller.isConnected()) return;
		if(!confirm("Are you sure?\nRecalibration takes a few seconds.")) return;
		this.listener.onFrame = function(controller){ };
		this.renderLoop = function(){ };
		this.foreground.context.clearRect(0, 0, this.foreground.width, this.foreground.height);
		delete this.screen;
		this.controller.calibratedScreens().clear();
		this._onConnect(this.controller);
	},
	
	_newPage : function(){
      this.pageDiv.removeChild(this.page.div);
      delete this.page;
      this.page = new Page(window.innerWidth, window.innerHeight, this);
      this.pageDiv.appendChild(this.page.div);
      
      this.testing = true;
      this.start_time = (new Date()).getTime();
      this.cycles = 0;
	},
	
	_buildMenu : function(){
		var me = this;
		this.menu = new Menu();
		
		var logo = this.menu.addItem("Blink");
		logo.addItem("Recalibrate").link.onclick = function(){ me._recalibrate(); };
		
      // var file = this.menu.addItem("Test");
		logo.addItem("New").link.onclick = function(){ me._newPage(); };
		
      // var output = this.menu.addItem("Ouput");
      // output.addItem("").link.onclick = function(){ me._saveOutput(); };
      
	},
	
	_saveOutput : function(){
	   
	}
	
}
var Layer = function(w,h){
	
	this.width = w;
	this.height = h;
	
	this.canvas = document.createElement("canvas");
	this.canvas.classList.add("layer");
	this.canvas.width = w;
	this.canvas.height = h;
	this.context = this.canvas.getContext("2d");
	
	this.staticCanvas = document.createElement("canvas");
	this.staticCanvas.classList.add("layer");
	this.staticCanvas.width = w;
	this.staticCanvas.height = h;
	this.staticContext = this.staticCanvas.getContext("2d");
	
	this.globalCompositeOperation = "source-over";
	this.fillStyle = "#FFFFFF";
	
	this.needsRender = false;
};

Layer.prototype = {
		
	renderProgress : function(){
		
		if(this.needsRender){
			this.context.clearRect(0, 0, this.width, this.height);
			this.context.globalCompositeOperation = "source-over";
			this.context.drawImage(this.staticCanvas, 0, 0);
			this.needsRender = false;
		}
	},
	
}
var Menu = function(){
	
	this.items = [];
	this.ul = document.createElement("ul");
	this.ul.classList.add("dropdown");
};

Menu.prototype = {
	
	addItem: function(title){
		var item = new Item(title);
		this.items.push(item);
		this.ul.appendChild(item.li);
		
		return item;
	}
};

var Item = function(title){
	
	this.items = [];
	this.title = title;
	this.li = document.createElement("li");
	this.link = document.createElement("a");
	this.link.href = "#";
	this.link.innerHTML = title;
	this.li.appendChild(this.link);
	this.ul = document.createElement("ul");
	this.li.appendChild(this.ul);
	
	var me = this;
	this.li.onmouseover = function(){ me.show(); };
	this.li.onmouseout = this.ul.onclick = function(){ me.hide(); };
};

Item.prototype = {
	
	addItem: function(title){
	
		var item = new Item(title);
		this.items.push(item);
		this.ul.appendChild(item.li);
		
		return item;
	},
	
	show : function(){
		this.li.classList.add("hover");
		this.ul.style.visibility = "visible";
	},
	
	hide : function(){
		this.li.classList.remove("hover");
		this.ul.style.visibility = "hidden";
	}
}
var Page = function(w,h){
	
	this.width = w;
	this.height = h;
	this.background = new Layer(w,h);
	this.layers = [new Layer(w,h)];
	this.composite = new Layer(w,h);
	
	this.activeIndex = 0;
	
	this.div = document.createElement("div");
	this.div.appendChild(this.background.canvas);
	this.div.appendChild(this.layers[0].canvas);
};

Page.prototype = {
	
	activeLayer : function(){
		return this.layers[this.activeIndex];
	}
	
};
