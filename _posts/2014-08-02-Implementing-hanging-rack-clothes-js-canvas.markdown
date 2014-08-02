---
layout: post
title:  "Hanging your clothes, the new way"
date:   2014-08-02 9:48:00
categories: javascript,canvas
---


Ok as always , why did i do this ??<br>
Well i came across <a href="https://www.drippinginfat.com/"> a site which sells clothes</a> and as you see they have made a nice way to showcase their clothes.<br>
But they use flash technology , and i thought they should have done it with html5 and js.<br>
So in between my exams reading breaks i started hacking this "HangingRack" (probably bad name) which should have the same result as the mentioned site but would not use
flash.<br>

So my first attempt was to try and do it with html and css .<br>
I thought i could have a very big div that would have tshirts inside it (as divs also) with margin:50px and overflow:hidden.<br>
Then i could use css animations to move them.<br>
I did come to an almost satiisfying result but it was not perfect and the worst part was that i could not dynamicaly add tshirts.<br>
In order to add a tshirt i would have to change the html and add a div with the proper img src etc and even worse everythign was sitting in the dom<br>
with no purpose,meaning if i have 100 tshirts then i have 100 divs in my dom even though they are not shown in the screen.<br>

So i ruled out this way and started thinking with html5 canvas and javascript.<br>
If you think about it what i tried to implement was a side scroller game so it was not just html5 canvas rendering i had to implement game mechanincs,camera viewport,world coordinates.<br>
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

After that i define a function which handles the game loop .There are numerous articles on the web saying that you should use this and not plain old setInterval.

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


