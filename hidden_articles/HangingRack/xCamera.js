

//Define global variable
window.HangingRack = {};

// game loop settings: 
HangingRack.FPS = 30;
HangingRack.INTERVAL = 1000/HangingRack.FPS; // milliseconds
HangingRack.STEP = HangingRack.INTERVAL/1000; // seconds

HangingRack.controls = {
  left:false,
  right:false,
  autoPlay:false
}

window.addEventListener("keydown", function(e){
  switch(e.keyCode)
  {
    case 37: // left arrow
      HangingRack.controls.left = true;
      break;
    case 39: // right arrow
      HangingRack.controls.right = true;
      break;
  }
}, false);

window.addEventListener("keyup", function(e){
  switch(e.keyCode)
  {
    case 37: // left arrow
      HangingRack.controls.left = false;
      break;
    case 39: // right arrow
      HangingRack.controls.right = false;
      break;
    case 65: // KEY CODE for letter a
      HangingRack.controls.autoPlay = !HangingRack.controls.autoPlay;
      break;
      
  }
}, false);






window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, HangingRack.FPS);
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

  HangingRack.Rectangle = Rectangle;
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


    this.viewport = new  HangingRack.Rectangle(this.xView,this.yView,this.viewportWidth,this.viewportHeight);
    this.world  = new  HangingRack.Rectangle(0,0,this.worldWidth,this.worldHeight);
    //Note this.worldHeight should be the same as  viewportHeight for this example

    this.cameraSpeed = 200;
  }


  xCamera.prototype.updateViewport = function() {

    if (HangingRack.controls.autoPlay === true)
    {
      this.xView += this.cameraSpeed/2 * HangingRack.STEP;
    }
    else
    {
      if (HangingRack.controls.left === true){
        //Update the position of Camera
        this.xView += this.cameraSpeed * HangingRack.STEP;
      }


      if (HangingRack.controls.right === true){
        //Update the position of Camera
        this.xView -= this.cameraSpeed * HangingRack.STEP;

      }




      if (HangingRack.controls.touch > 0)
      {
        this.xView -= HangingRack.controls.touch  * HangingRack.STEP;
        HangingRack.controls.touch -= 1;
        if (HangingRack.controls.touch < 0 ){
          HangingRack.controls.touch = 0;
        }
      }

      if (HangingRack.controls.touch < 0)
      {
        this.xView -= HangingRack.controls.touch  * HangingRack.STEP;
        HangingRack.controls.touch += 1;
        if (HangingRack.controls.touch > 0 ){
            HangingRack.controls.touch = 0;
          }
      }
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

   HangingRack.xCamera = xCamera;
})();


(function(){
  function Tshirt(x,y,imageSrc){
    this.xWorldPos = x;
    this.yWorldPos = y;
    this.width = 270;
    this.height = 320;
    this.hangerWidth = 97;
    this.hangerHeight = 117;
    this.hangerDestWidth = 55;
    this.hangerDestHeight = 55;
    this.hanger = new Image()
    this.hanger.src = "hanger.png"
    this.image = new Image();
    this.image.src = imageSrc;
    this.imageLoaded = false;
    var self = this;
    this.image.onload = function() {
        self.imageLoaded = true;
    };
    this.to_radians = Math.PI/180;
    this.rotateAnglesAnim = 0.0;
    this.rotateDirection = 1;
    this.hangerSlice = 0.60;

  }


  Tshirt.prototype.draw = function(context,camera){
    //if the shirts world position is within the camera viewport then it should be drawn
    if(this.imageLoaded && this.xWorldPos - this.width <= camera.xView + camera.viewportWidth && this.xWorldPos + this.width >= camera.xView){ 
      

      //convert world x-cords to camera viewports x-cords      
      context.drawImage(this.hanger,0,0,this.hangerWidth,this.hangerHeight*this.hangerSlice,
                        (this.xWorldPos-this.hangerDestWidth/2) - camera.xView,
                        this.yWorldPos,this.hangerDestWidth,this.hangerDestHeight*this.hangerSlice);
      
      
      
      context.drawImage(this.hanger,0,this.hangerHeight*this.hangerSlice,this.hangerWidth,this.hangerHeight*(1-this.hangerSlice),
                        (this.xWorldPos-(this.rotateAnglesAnim * this.hangerDestWidth/2)) - camera.xView,
                        this.yWorldPos+(this.hangerDestHeight*this.hangerSlice),
                        this.rotateAnglesAnim*this.hangerDestWidth,this.hangerDestHeight*(1-this.hangerSlice));
      
     

      context.save();
      
   //   context.translate(this.width/2 + this.rotateAnglesAnim*this.width/2,0);
      
      context.drawImage(this.image,(this.xWorldPos- (this.rotateAnglesAnim * this.width/2)) - camera.xView, this.yWorldPos+52,this.rotateAnglesAnim*this.width,this.height);
      

      this.rotateAnglesAnim = ( this.rotateAnglesAnim + (this.rotateDirection * 0.01) )%1.0;
      if (this.rotateAnglesAnim >= 0.90 && this.rotateDirection == 1)
        this.rotateDirection = -1;
      else if ( this.rotateAnglesAnim <= -0.90 && this.rotateDirection == -1)
        this.rotateDirection = 1;
 
      context.restore();
    }
  }

  HangingRack.Tshirt = Tshirt;

})();

(function(){

  function HangingRackWorld(width,height){
    this.width = width;
    this.height = height;
    this.Tshirts = [];
    this.HangerSpotY = 10;
    this.emptyHangerSpot = 1; 
    this.hangerSpotWidth = 300;
    this.canvas = document.getElementById("HangingRackCanvas");

    this.image = new Image();
    this.image.src =  "hangingRack.png";

    this.canvas.addEventListener("touchstart", this.touchStart, false);
    this.canvas.addEventListener("touchend", this.touchEnd, false);
    this.canvas.addEventListener("touchmove", this.touchX, false);


    this.touch_x = 0;
    this.dist_touch_x = 0;

    this.images = ["shirt.jpg"];
    for (var i = 100; i >= 0; i--) {

      this.Tshirts.push(new HangingRack.Tshirt(this.emptyHangerSpot*this.hangerSpotWidth,this.HangerSpotY,this.images[0]) );
      this.emptyHangerSpot += 1
    };

    
  }


  HangingRackWorld.prototype.touchStart = function(e){
      this.touch_x = e.changedTouches[0].clientX;
      this.dist_touch_x = 0;
    
  }
  
  HangingRackWorld.prototype.touchEnd = function(e){
      var end_touch = e.changedTouches[0].clientX; 
      HangingRack.controls.touch = end_touch - this.touch_x;
      if ( HangingRack.controls.touch > 150  ){
        HangingRack.controls.touch = 150;
      }
      
      if ( HangingRack.controls.touch < -150  ){
        HangingRack.controls.touch = -150;
      }     
  }
  
  HangingRackWorld.prototype.touchX = function(e){
    this.dist_touch_x += this.touch_x - e.changedTouches[0].clientX;
  }

  HangingRackWorld.prototype.draw = function(context,camera){

      //We draw the HangingRack Image all over the camera viewport
      context.drawImage(this.image,0,0,this.canvas.width,100);


      //and then we draw all the tshirts
      for (var i = this.Tshirts.length - 1; i >= 0; i--) {
        this.Tshirts[i].draw(context,camera);
      };
  }




  HangingRack.HangingRackWorld = HangingRackWorld;
})();




(function(){
  // prepaire our game canvas
    
  function GameSetup(){
   
    this.canvas = document.getElementById("HangingRackCanvas");
    this.context = this.canvas.getContext("2d");
  
    this.hangingRack = new HangingRack.HangingRackWorld(5000,500);
   //creates the camera,1350 is where the camera's x-cord is in te world
    this.camera = new HangingRack.xCamera(this.canvas.width, this.canvas.height, this.width,this.height,1350,0);

  }


  GameSetup.prototype.renderScene = function(){
        // clear the entire canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // redraw all objects
        this.hangingRack.draw(this.context, this.camera);   
      }
  
  GameSetup.prototype.updateScene = function(){
      this.camera.updateViewport();
    }
  
  GameSetup.prototype.gameLoop = function(){
      this.updateScene();
      this.renderScene();
    }



  HangingRack.GameSetup = GameSetup;
      

})();








//start the game when page is loaded
window.onload = function(){ 
  //var canvas = document.getElementById("HangingRackCanvas");
  //canvas.height = 500;
  //canvas.width = window.innerWidth;

  var gameSetup = new HangingRack.GameSetup();
  function play(){
    requestAnimFrame(play);
    gameSetup.gameLoop();  
  }
  requestAnimFrame(play);
}









