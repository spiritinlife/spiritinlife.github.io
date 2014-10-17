---
layout: post
title:  "A Simple yet nice slide show for android"
date:   2014-10-17 21:00:00
categories: Android,java
---

Finally today i had the time to code something fun and usefull !

So in my uber secret project :) i need to have a slide show that downloads the images given some urls.
I need it to display some dots indicating which image is now shown and i need it to handle gestures( right to left and left to right) as a default mechanism for changing images.

So that must be fun!

Well at first i checked out a super awesome project by these guys marvinlabs/android-slideshow-widget , which is one of the most wonderfully written libraries for android in my opinion.The way they abstract things and api is just pro !!.You should check it out if you need to make your slide show dance :)

Anyway my implementation was inspired by those guys.
SO why did i not go with the library that i praise above ?
Well first of all i wanted something simpler and something that they did not offer which is the gesture control ( They are doing something with clicks but who clicks to change images nowadays :/ ). 

So here is my implementation on github <a href="https://github.com/spiritinlife/EasySlideShow4Android">EasySlideShow4Android</a>.
<a href="http://tinypic.com?ref=15zfm8j" target="_blank"><img src="http://i61.tinypic.com/15zfm8j.png" border="0" alt="Image and video hosting by TinyPic"></a>

<br><br>
Right now the project looks like a sample for picasso with a custom view but i plan to make it more generic ,specially for animations .



How-To<br>
First of all you need picasso in your project <br>
   -> you can get picasso here <a href="https://github.com/square/picasso">picasso</a><br>
Then :<br>
1) Add it in your layout 

{% highlight java %}
    <gr.spiritinlife.EasySlideShow.SlideShowView
        android:id="@+id/slideShow"
        android:layout_width="match_parent"
        android:clickable="true"
        android:layout_height="170dp"
        android:layout_marginBottom="7dp"
        android:minHeight="200dp"/>
{% endhighlight %}

        
2) Get it from code

{% highlight java %}
    slideShow = (SlideShowView) view.findViewById(R.id.slideShow);
{% endhighlight %}


3) Start  it passing it an array of urls

{% highlight java %}
    slideShow.start(urls);
{% endhighlight %}


To-Do <br>
1) Add examples <br>
2) Add a generic way to make animation between imageview trasnistion and remove the current one which depeneds on canvas <br>
3) Give a public function for changing the MAX_IMAGES which is now 3 ( it can be changed by code if you like )<br> 
4) Make it possible to add custom colors on dots without changing the library. <br>



Keep on Coding
-Spiritinlife
