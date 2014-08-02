---
layout: post
title:  "Hanging your clothes, the new way"
date:   2014-08-02 9:48:00
categories: javascript,canvas
---


Ok as always , why did i do this ??
Well i came across <a href="https://www.drippinginfat.com/"> a site which sells clothes</a> and as you see they have made a nice way to showcase their clothes.
But they use flash technology , and i thought they should have done it with html5 and js.
So in between my exams reading breaks i started hacking this "HangingRack" (probably bad name) which should have the same result as the mentioned site but would not use
flash.

So my first attempt was to try and do it with html and css .
I thought i could have a very big div that would have tshirts inside it (as divs also) with margin:50px and overflow:hidden.
Then i could use css animations to move them.
I did come to an almost satiisfying result but it was not perfect and the worst part was that i could not dynamicaly add tshirts.
In order to add a tshirt i would have to change the html and add a div with the proper img src etc and even worse everythign was sitting in the dom
with no purpose,meaning if i have 100 tshirts then i have 100 divs in my dom even though they are not shown in the screen.

So i ruled out this way and started thinking with html5 canvas and javascript.
If you think about it what i tried to implement was a side scroller game so it was not just html5 canvas rendering i had to implement game mechanincs,camera viewport,world coordinates.
Challenge accepted sister!
For the impatient here is   <a href="http://spiritinlife.github.io/hidden_articles/HangingRack/">the end result</a>
+ code is on github under https://github.com/spiritinlife/spiritinlife.github.io/tree/master/hidden_articles/HangingRack

So we start with the html.
Html is simple i just created a simple page with a canvas tag and script link in the body.
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