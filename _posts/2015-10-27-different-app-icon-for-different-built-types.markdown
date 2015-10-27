---
layout: post
title:  "Android : Different app icon for different built types ( flavors )"
date:   2015-10-27 6:40:00
categories: Android,Tips
---

Today i am sharing a small tip for android devs.<br>
It came up today and it is a really helpful pretty unknown trick.<br>
<br>
So for frink ( project i am working on ) we have  three build types release , debug and sales<br>

So in order for me to be able to choose the right app, when i want to test it in my phone, i want to have <br>
different app icons for each built type and i want it to be automated at build time.<br>


It turns out this is really easy in android :) <br>
So what you need to do is create an icon that is slightly different for every build type and put it<br>
in the corresponding folder.<br>

So lets say you have all icons in drawable-xhdpi , in which there is your launcher_icon ( app icon ).<br>
The path to this folder is actually<br>
/pathtoproject/app/src/main/res/drawable-xhdpi<br>
So what you can do is create another path and change "main" to the name of the custom  build type <br>

So if i want an icon for the debug version of the app i create a folder<br>
/pathtoproject/app/src/debug/res/drawable-xhdpi <br>
and put the icon there. <br>

Notice how instead of main i used debug. <br>

Now every flavor of your app has a different icon and you can easily understand which is what. <br>
 <br> <br>

- Keep on Coding <br>
-- Spiritinlife <br>