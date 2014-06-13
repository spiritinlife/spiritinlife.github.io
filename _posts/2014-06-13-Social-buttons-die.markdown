---
layout: post
title:  "Social-buttons die.."
date:   2014-06-13 17:52:57
categories: Android
---
This is a small hack i figured when trying to get pass through annoying social buttons to watch a video.
It is specific for this site http://mantarinaki.com .
If i a find time i will try to make it more general.

For now what i did is i located the code that unblocks the video.

{% highlight javascript %}

var videoid = box.attr('data-videoid');
var flashid = ('v'+videoid.replace(/[^0-9a-zA-Z]/g,'')).toLowerCase();
var width = box.width();
var height = box.height();
box.find('> div').not('.video').fadeOut('slow');
jQuery("#"+flashid)
	.html('<iframe width="'+width+'" height="'+height+'" src="//www.youtube.com/embed/'+videoid+'" frameborder="0" allowfullscreen></iframe>');

{% endhighlight %}


So as you see this code uses a box a variable which is the sharing box.
So to get that sharing box in this particular site you use


{% highlight javascript %}

var box = jQuery(".sharing");

{% endhighlight %}


So what now ?

Well it is simple , follow these steps (easy for non programmers also)
1)press ctrl + shift + i (which opens developers tools)
2)you will see a console ,at the bottoms you can type your stuff (non-developers type  : alert("Hello there!") ,and press enter  )
3)There you will have to type copy-paste these :

{% highlight javascript %}
var box = jQuery(".sharing");
var videoid = box.attr('data-videoid');
var flashid = ('v'+videoid.replace(/[^0-9a-zA-Z]/g,'')).toLowerCase();
var width = box.width();
var height = box.height();
box.find('> div').not('.video').fadeOut('slow');
jQuery("#"+flashid)
	.html('<iframe width="'+width+'" height="'+height+'" src="//www.youtube.com/embed/'+videoid+'" frameborder="0" allowfullscreen></iframe>');
{% endhighlight %}

Now press enter and enjoy your video !

