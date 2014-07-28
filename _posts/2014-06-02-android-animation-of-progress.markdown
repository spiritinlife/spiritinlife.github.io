---
layout: post
title:  "Custom Android Animation for illusion of filling something or progressing"
date:   2014-06-02 19:28:57
categories: Android
comments: False
---
The concept of this Animation is to make an illusion of something getting filled or progressed.In this example i use two images,
one is a black box and the other is a red one.The goal is to reveal the red box my animating the
dissapearance of the black one.This custom view can be used in any layout with no configuration.

{% highlight java %}
package gr.spiritinlife.AnimationBlackToRedBox;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;

import gr.spiritinlife.AnimationBlackToRedBox.R;

public class MyImage extends View implements Runnable {

static int frame = 16; // 16ms is around 60fps
//you can increase the frame so that it slows the animation down
//or you can decrease the removaleCounter to achieve the same thing

Resources resources;
Bitmap blackBox, redBox;
int removaleCounter = 0;

public MyImage(Context context, AttributeSet attrs) {
super(context, attrs);
resources = getResources();

blackBox = BitmapFactory
.decodeResource(resources, R.drawable.black_box);
redBox = BitmapFactory.decodeResource(resources, R.drawable.red_box);
}

@Override
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
//our view is just the box so we set the width,height of the blackBox to be our view's width and height
setMeasuredDimension(blackBox.getWidth(), blackBox.getHeight());
}

@Override
protected void onDraw(Canvas canvas) {
super.onDraw(canvas);
if (removaleCounter >= blackBox.getHeight())
removaleCounter = 0; //start Over
else
removaleCounter += 1; // remove 1 px every frame

canvas.drawBitmap(redBox, 0, 0, null); // draw the redBox first
canvas.drawBitmap(blackBox, new Rect(0, 0, blackBox.getWidth(),
blackBox.getHeight() - removaleCounter), new Rect(0, 0,
blackBox.getWidth(), blackBox.getHeight()
- removaleCounter), null); // draw the blackBox
// second at the
// same spot,so that
// it overlays the
// redBox

postDelayed(this, frame); // postDelayed that calls run method
}

@Override
public void run() {
invalidate(); // invalidate calls onDraw()
}
}
{% endhighlight %}

Now you can use this view inside your layout and it works!
