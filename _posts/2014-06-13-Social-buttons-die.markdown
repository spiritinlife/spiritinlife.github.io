---
layout: post
title:  "Social-buttons die.."
date:   2014-06-13 17:52:57
categories: Hacks
---
This is a small hack i figured when trying to get pass through annoying social buttons to watch a video.
It is specific for these sites http://flogit.gr,http://mantarinaki.com .(It probably works for many other also but i am not yet sure).
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

1)You need to first click on the video so that the site prompts you to share , like or whatever the video.

2)Press ctrl + shift + i (which opens developers tools) 

3)You will see a console ,at the bottoms you can type your stuff (non-developers type  : alert("Hello there!") ,and press enter  )

4)There you will have to type copy-paste these :

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

