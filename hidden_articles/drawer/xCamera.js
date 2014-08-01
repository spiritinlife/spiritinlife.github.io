


window.Drawer = {};

// game settings: 
Drawer.FPS = 30;
Drawer.INTERVAL = 1000/Drawer.FPS; // milliseconds
Drawer.STEP = Drawer.INTERVAL/1000; // seconds

Drawer.controls = {
  left:false,
  right:false
}

window.addEventListener("keydown", function(e){
  switch(e.keyCode)
  {
    case 37: // left arrow
      Drawer.controls.left = true;
      break;
    case 39: // right arrow
      Drawer.controls.right = true;
      break;
  }
}, false);

window.addEventListener("keyup", function(e){
  switch(e.keyCode)
  {
    case 37: // left arrow
      Drawer.controls.left = false;
      break;
    case 39: // right arrow
      Drawer.controls.right = false;
      break;
  }
}, false);






window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, Drawer.FPS);
          };
})();



(function(){
  function Rectangle(left,top,width,height){
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
  }

  Rectangle.prototype.set = function(left,top){
    this.left = left || this.left;
    this.top = top || this.top;
  }

  Rectangle.prototype.inBounds = function(otherRectangle){
     return ( this.bottom <= otherRectangle.bottom && this.top >= otherRectangle.top && this.left >= otherRectangle.left && this.right <= otherRectangle.right);

  }

  Drawer.Rectangle = Rectangle;
})();








(function(){
  /****************************************
  *			  xCamera.js                *
  * Implementation of a 2d camera on the  *
  * xAxis only                            *
  *****************************************/


  //xCamera constructor
  //xView is the position of the camera on x 
  //yView is the position of the camera on y
  //vWidth is the viewport width
  //vHeight is the viewport height
  //wHeight is the worlds height
  //wHeight is the worlds width
  function xCamera(vWidth,vHeight,wWidth,wHeight,xView,yView){

    //Position of camera (default left-top)
    this.xView = xView || 0;
    this.yView = yView || 0;


    //Viewport size
    this.viewportWidth = vWidth;
    this.viewportHeight = vHeight;

    //World size
    this.worldWidth = wWidth;
    this.worldHeight = wHeight;


    this.viewport = new  Drawer.Rectangle(this.xView,this.yView,this.viewportWidth,this.viewportHeight);
    this.world  = new  Drawer.Rectangle(0,0,this.worldWidth,this.worldHeight);
    //Note this.worldHeight should be the same as  viewportHeight for this example

    this.cameraSpeed = 200;
  }


  xCamera.prototype.updateViewport = function() {

    if (Drawer.controls.left === true){
      //Update the position of Camera
      this.xView += this.cameraSpeed * Drawer.STEP;
    }


    if (Drawer.controls.right === true){
      //Update the position of Camera
      this.xView -= this.cameraSpeed * Drawer.STEP;

    }



    //set the new position of the camera
    this.viewport.set(this.xView,this.yView);

    // don't let camera leaves the world's boundary
    if(!this.viewport.inBounds(this.world))
    {
      if(this.viewport.left < this.world.left)
        this.xView = this.world.left;
      
      if(this.viewport.right > this.world.right)
        this.xView = this.world.right - this.viewportWidth;
    }
  }

   Drawer.xCamera = xCamera;
})();


(function(){
  function Tshirt(x,y,imageSrc){
    this.xWorldPos = x;
    this.yWorldPos = y;
    this.width = 220;
    this.height = 260;
    this.hangerWidth = 50;
    this.hangerHeight = 50;
    this.hanger = new Image()
    this.hanger.src = "hanger.png"
    this.image = new Image();
    this.image.src = imageSrc;
    this.imageLoaded = false;
    var self = this;
    this.image.onload = function() {
        self.imageLoaded = true;
    };

  }


  Tshirt.prototype.draw = function(context,camera){
    //if the shirts world position is within the camera viewport then it should be drawn
    if(this.imageLoaded && this.xWorldPos - this.width <= camera.xView + camera.viewportWidth && this.xWorldPos + this.width >= camera.xView){ 
      
      //convert world x-cords to camera viewports x-cords      
      context.drawImage(this.hanger,(this.xWorldPos-this.hangerWidth/2) - camera.xView, this.yWorldPos,this.hangerWidth,this.hangerHeight);
      context.drawImage(this.image,(this.xWorldPos-this.width/2) - camera.xView, this.yWorldPos+45,this.width,this.height);
    }
  }

  Drawer.Tshirt = Tshirt;

})();

(function(){

  function DrawerWorld(width,height){
    this.width = width;
    this.height = height;
    this.Tshirts = [];
    this.HangerSpotY = 10;
    this.emptyHangerSpot = 1; 
    this.hangerSpotWidth = 250;
    this.canvas = document.getElementById("DrawerCanvas");

    this.image = new Image();
    this.image.src = "drawer.png";

    this.canvas.addEventListener("touchmove", this.touchX, true);
    this.canvas.addEventListener("touchend", this.touchEnd, true);

    this.images = ["shirt.jpg"];
    for (var i = 100; i >= 0; i--) {

      this.Tshirts.push(new Drawer.Tshirt(this.emptyHangerSpot*this.hangerSpotWidth,this.HangerSpotY,this.images[0]) );
      this.emptyHangerSpot += 1
    };

  }

  DrawerWorld.prototype.touchEnd = function(){
      Drawer.controls.left = false;
      Drawer.controls.right = false;
    
  }
  
  DrawerWorld.prototype.touchX = function(e){
    if (!e)
      var e = event;
    
    var tx = e.pageX - this.canvas.offsetLeft;
    alert(tx);
    if(tx<0){
      Drawer.controls.left = true;
    }
    else{
      Drawer.controls.right = true;
    }
  }
  DrawerWorld.prototype.draw = function(context,camera){

      //We draw the Drawer Image all over the camera viewport
      context.drawImage(this.image,0,0,this.canvas.width,100);


      //and then we draw all the tshirts
      for (var i = this.Tshirts.length - 1; i >= 0; i--) {
        this.Tshirts[i].draw(context,camera);
      };
  }




  Drawer.DrawerWorld = DrawerWorld;
})();




(function(){
  // prepaire our game canvas
    
  function GameSetup(){
   
    this.canvas = document.getElementById("DrawerCanvas");
    this.context = this.canvas.getContext("2d");
  
    this.drawer = new Drawer.DrawerWorld(5000,500);
    this.camera = new Drawer.xCamera(this.canvas.width, this.canvas.height, 5000,500,1350,0);
  
  }


  GameSetup.prototype.renderScene = function(){
        // clear the entire canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // redraw all objects
        this.drawer.draw(this.context, this.camera);   
      }
  
  GameSetup.prototype.updateScene = function(){
      this.camera.updateViewport();
    }
  
  GameSetup.prototype.drawerLoop = function(){
      this.updateScene();
      this.renderScene();
    }



  Drawer.GameSetup = GameSetup;
      

})();








//start the game when page is loaded
window.onload = function(){ 
  var canvas = document.getElementById("DrawerCanvas");
  //canvas.height = 500;
  //canvas.width = window.innerWidth;

  var gameSetup = new Drawer.GameSetup();
  function play(){
    requestAnimFrame(play);
    gameSetup.drawerLoop();  
  }
  requestAnimFrame(play);
}









