---
layout: post
title:  "Hanging your clothes, the new javascript way"
date:   2014-08-02 9:48:00
categories: javascript,canvas
---


Ok as always , why did i do this ??<br>
Well i came across <a href="https://www.drippinginfat.com/"> a site which sells clothes</a> and as you see they have made a nice way to showcase their clothes.<br>
But they use flash technology , and i thought hey that can  be done  with html5 and js and be ten times faster.<br>
So in between my exams reading breaks i started hacking this "HangingRack" (probably bad name) which should have the same result as the mentioned site but would not use
flash.<br>

So my first attempt was to try and do it with html and css .<br>
I thought i could have a very big div that would have tshirts inside it (as divs also) with margin:50px and overflow:hidden.<br>
Then i could use css animations to move them.<br>
I did come to an almost satiisfying result but it was not perfect and the worst part was that i could not dynamicaly add tshirts.<br>
In order to add a tshirt i would have to change the html and add a div with the proper img src  and even worse everythign was sitting in the dom<br>
with no purpose,meaning if i have 100 tshirts then i have 100 divs in my dom even though they are not shown in the screen.<br>

So i ruled out this way and started thinking with html5 canvas and javascript.<br>
If you think about it what i tried to implement was a side scroller game but it was not just html5 canvas rendering i had to implement game mechanincs,camera viewport,world coordinates.<br>
Challenge accepted sister!<br>
For the impatient here is   <a href="http://spiritinlife.github.io/hidden_articles/HangingRack/">the end result</a> ( left/right arrow keys for moving )<br>
+ code is on github <a href="https://github.com/spiritinlife/spiritinlife.github.io/tree/master/hidden_articles/HangingRack">Here</a><br>

So we start with the html.<br>
Html is simple i just created a simple page with a canvas tag and script link in the body.<br>

{% highlight html %}

<!DOCTYPE html>
<html>
	<head>
		 <link rel="stylesheet" type="text/css" href="main.css">
		 <title>
		 	HangingRack v1.0.0
		 </title>
	</head>
	<body>

		<header>
		</header>
		
		<canvas id="HangingRackCanvas" width=2000 height=600></canvas>

		<script type="text/javascript" src="xCamera.js"></script>

	</body>

</html>

{% endhighlight %}

Notice the id of the canvas "HangingRackCanvas" i will use this later to find the canvas from javascript.


So now for the fun part.

First lets define some global variables.

{% highlight javascript %}


//Define global variable
window.HangingRack = {};

// game loop settings: 
HangingRack.FPS = 30;
HangingRack.INTERVAL = 1000/HangingRack.FPS; // milliseconds
HangingRack.STEP = HangingRack.INTERVAL/1000; // seconds
{% endhighlight %}

After that i define my controls which are keyboards left/right to move on the x-axis

{% highlight javascript %}
HangingRack.controls = {
  left:false,
  right:false
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
  }
}, false);

{% endhighlight %}




This code just says that when you press left arrow set the HangingRack.controls.left to true and when you release set it to false (the same for right arrow)

After that i define a function which handles the game loop .There are numerous articles on the web saying that you should use this requestAnimFrame and not plain old setInterval.

{% highlight javascript %}
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, HangingRack.FPS);
          };
})();
{% endhighlight %}

-Extra tip: Watch out for javascript's fricking semicolon insertion 


Ok now we need to define some helpful stuff.
Lets see what we try to do

We will have a big world in our mind in which we can only see a certain amount of space so in poor graphics it looks like this<br>

<img src="/images/camera_world_cords_explained.png">




The viewport/Camera is actually the size of the canvas and the world's size is in this example(as you will see later) set to 6000 but that could change dynamicaly.

So this is usefull because now we can say that if we 200 tshirts to show that each have 250 width we can start assigning (x,y) coordinates from the (0,0) point of the world until the end
So first shirt is (0,0) ,second is (300,0) ,third is (600,0) (we give a 50px margin between them).
So as we dynamically load these icons we put them in our world coordinate system.
But this is where it gets awesome , we do not actually put them, meaning that we do not actually draw them we just say where they belong in our world.In that way we do not use any computational power to actually draw them.We will only draw what we can see (this is actually how all games work).

So our camera also has a coordinate system in the world.<br>
It could start from the (0,0) and expand to (0+camera.width,0+camera.height).That defines the space in which we pick shirts(icons )
from the world and draw them on the canvas.
Furthermore we can now scroll by moving the camera inside our world .We can say that when you press left arrow ,camera moves from (0,0) to (10,0) and expands to (10+camera.width,0+camera.height).In that way we start drawing new icons and stop drawing old ones(everything that has x world coordinate less than 10 in this example)




So now how we implement this..

We first identify that world and camera are actually rectangles that have a left,right,width,height properties.
So the next code creates a rectangle class with those properties and a function called inBounds which only purpose is to tell us if one rectangle is inside another.
This function is usefull because we do not want the camera viewport to go out of world's coordinates.

{% highlight javascript %}
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


{% endhighlight %}


So now we can implement our camera  as rectangle.
Next we define our camera class.
Camera has its own world coordinates xView,yView , viewport width and height and world width and height
So we create two rectangles one that has the camera viewport and one that has the camera's world(actually the whole world-there is no other world just the camera's).
We also define one function :
-updateViewport: which uses the HangingRack.controls left and right to interpolate the xView and yView by a speed of 200/FPS when they are pressed.It also performs a trick that will be  explained  later so that we can identify touches (for mobile compatibility).It also checks if the the viewport is in the world after the change and if it is not it forces it to be.

{% highlight javascript %}


(function(){
  /****************************************
  *       xCamera.js                *
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

    if (HangingRack.controls.left === true){
      //Update the position of Camera 
      //Left means that we need to see more to the  right so we add
      this.xView += this.cameraSpeed * HangingRack.STEP;
    }


    if (HangingRack.controls.right === true){
      //Update the position of Camera
      //Right means that we need to see more to the left so we subtract
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

{% endhighlight %}






Next we define our tshirt.
It has its own world coords,width and height.
It also has a hanger icon  (which is used to have a better visual effect).
And a function which is called 'draw' , which gets the canvas context and draws the hanger and the tshirt in the viewports coords.
Notice that i say viewports coords.That is because as we said tshirts have world coords but when we want to draw them(which means that they fall in the viewport's space) 
we need to think where they belong and since we only move camera on the x-axis we only need to do this on the x-axis.
So what we say is , that the tshirt's initial drawing x-position is the position that it has in the world minus its width/2(because we want half of the tshirt left of x-position 
and half of it to the right) minus camera.xView.
This is  (this.xWorldPos-this.hangerWidth/2) - camera.xView.
We need this because lets say a shirt has x-cord of 200 in the world and the camera has x-cord of 20 in the world and the camera's width is 400(Which means shirt is in vieport's space),then if we did not do this the shirt would be drawn on the
200 x-cord of the viewports coordinates but we want it to be drawn on the 200-20=180 x-cord.I dont know if that makes sense :/

{% highlight javascript %}

(function(){
  function Tshirt(x,y,imageSrc){
    this.xWorldPos = x;
    this.yWorldPos = y;
    this.width = 270;
    this.height = 320;
    this.hangerWidth = 55;
    this.hangerHeight = 55;
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
      context.drawImage(this.image,(this.xWorldPos-this.width/2) - camera.xView, this.yWorldPos+51,this.width,this.height);
    }
  }

  HangingRack.Tshirt = Tshirt;

})();



{% endhighlight %}


After that we define the code that glues all these together.
It is responsible for the drawing of stuff,plus it draws the hanger rack on the canvas .
It creates all tshirts and iterates through them in the draw function in order to draw them..
It also defines some functions that handle the touch events inside the canvas ( i may talk about them in another article )
-Note for the creation of the tshirts in a real world example we would use an asychronous function to download the icons and assign them in the world as they get downloaded.For now lets say we have 100 tshirts with the same icon.




{% highlight javascript %}


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

{% endhighlight %}




After that we have a class that defines the game loop.
It first creates the HangingRackWorld we defined above with the worlds width and height.
And then creates the camera with canvas width height ,worlds size and x,y coords .
After that we have our gameloop, which first updates the camera viewports(if right or left has been pressed) and then renders the scence calling our hangingRackWorld draw function

{% highlight javascript %}


(function(){
  // prepaire our game canvas
    
  function GameSetup(){
   
    this.canvas = document.getElementById("HangingRackCanvas");
    this.context = this.canvas.getContext("2d");
  
    this.hangingRack = new HangingRack.HangingRackWorld(6000,500);
    this.camera = new HangingRack.xCamera(this.canvas.width, this.canvas.height, 6000,500,1350,0);
  
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


{% endhighlight %}


Last but not least we need to start all these when page loads.<br>
We instatiate our GameSetup object and define the play function which  starts the game loop ( loop because it calls itself).If you wonder about requestAnimFrame(instead of setTinterval), it is the best way to create animations, suported i think from all browsers  check the web for more info.



{% highlight javascript %}

//start the game when page is loaded
window.onload = function(){ 

  var gameSetup = new HangingRack.GameSetup();
  function play(){
    requestAnimFrame(play);
    gameSetup.gameLoop();  
  }
  requestAnimFrame(play);
}

{% endhighlight %}


That is all folks!!