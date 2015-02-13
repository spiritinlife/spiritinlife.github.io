---
layout: post
title:  "Retrofit with eventbus , a cool way "
date:   2015-02-13 6:40:00
categories: Android,Retrofit,Eventbus
---

Hello again from the android wonderland.<br>
The following post is about Retrofit combined with Eventbus.<br>
If you have ever used Retrofit , i am sure you know about the problems with securing it.<br>
If not take a look here <a href="http://www.mdswanson.com/blog/2014/04/07/durable-android-rest-clients.html">http://www.mdswanson.com/blog/2014/04/07/durable-android-rest-clients.html</a>.<br>
If you are bored to read it , it explains a way to secure your api calls without defensive programming ( error checking , nulls etc).<br>
It does that by combing otto and retrofit.<br>

-------------------For the Begginers----------------------<br>
Otto just like Eventbus are actually a bus that delivers messages throughout your application.<br>
The hard core history is important way , this was done by using the android Handler.<br>
Activities and Fragments register and broadcast intents with messages as extras and in that way messages get passed.<br>
This way is error prone and has a lot of boilercode.<br>
Otto and EventBus came in and did the heavy  work, so we can write now less code and get the job done :)<br>
----------------------------------------------------------<br>

As every developer , i also did my research on how to make my api calls not crash my app when a phone call happens or on orientation change or whatever.<br>
Ofcourse retrofit was the best solution for me . It is clean, fast and dry.<br>
But after a lot of research i encountered some problems with retrofit , that people told me about but i did not believe .<br>
Retrofit does not guarantee that if something happens with the api call( and many things can happen with an api call ) that your app will not crash.<br>
There are a lot of debates about how to protect your app, some say use services , some say use otto , i say lets use eventbus.<br>

So why eventbus and not otto?<br>
First eventbus is way faster because it does not rely on annotations<br>
Second eventbus allows more control and configuration.<br>

<h1> So lets get real </h1><br>
What is my goal here ?
My goal was to write retrofit calls in way that is secure and beautifull.<br>
And when i say beautifull i mean like plain retrofit.<br>
So how can i take this call<br>
{% highlight java %}
API.getApi().doAPiCall( new Callback() {
    @Override
    public void success(Resonse postListResponse) {
    }
    @Override
    public void failure(RetrofitError error) {
  });

{% endhighlight %}

and not change it at all but make it secure ?<br>
Well i did it but it is up to you to check it out and tell me how wrong i may be ( which in this case i may be :) )
So in my way i would write this

{% highlight java %}
API.getApi().doAPiCall( new BusNetCallback<Response>() {
    @Override
    public void apiSuccess(Resonse postListResponse) {
    }
    @Override
    public void apiFailure(RetrofitError error) {
  });
{% endhighlight %}

So how did i do that ?<br>
As you see the only thing i changes is that i changed Callback to BusNetCallback and rename success and failure.<br>
And i say to you that this is a secure way and as you see mostly nothing has changed from the retrofit way.<br>

<h1>SO Lets see what i did to achieve this</h1><br>
All i did is extend the Callback class in way that by default uses the eventbus to pass all api calls through the bus.<br>
In that way we can rest assure that if something goes wrong it will not go wrong in our main thread.<br>
So i will just through some code  and i will try to explain after.<br>


{% highlight java %}

import de.greenrobot.event.EventBus;
import retrofit.Callback;
import retrofit.RetrofitError;
import retrofit.client.Response;

/**
 * Override "onSuccess" to get Results instead the success of interface.
 * Correspondingly when need to handle error override "onFailure".
 **/
public abstract class BusNetCallback<T> implements Callback<T> {


    private EventBus mBus;

    /**
     *  Default constructor
     *  uses the bus from API.netBus or it could be EventBus.getDefault()
     */
    public BusNetCallback()
    {
       this(new EventBus());
    }

    /**
     * Call this if you want to have a reference to the eventbus
     * @param _bus
     */
    public BusNetCallback(EventBus _bus)
    {

        mBus = _bus;
        mBus.register(this);
    }


    /** must override */
    abstract public void onSuccess(T obj);

    /** override in case we want to handle a api failure */
    public void onFailure(RetrofitError error){};


    /**
     * The event that gets called on success
     * @param obj
     */
    public void onEvent (T obj){
        onSuccess(obj);
        // And we unregister
        mBus.unregister(this);
        mBus = null;
    };

    /**
     * The event that gets called on failure
     * @param error
     */
    public void onEvent (RetrofitError error) {
        onFailure(error);
        // And we unregister
        mBus.unregister(this);
        mBus = null;
    }


    /** execute common functionality for all api calls */
	@Override
	final public void success(T obj, Response response) {
        /**
         * You can do here whatever you want with the response object
         */

        // Here we send the event
        mBus.post(obj);
    }
	
	/** execute common functionality for handling error from a api call */
	@Override
	final public void failure(RetrofitError error) {
        /**
         * You can do here whatever you want with the Retrofit error
         */

        // Here we send the event
        mBus.post(error);
	}

}
{% endhighlight %}

So i think the code is pretty well commented and understandable.<br>
I declare two onEvent methods that are the api calls subscribers <br>
and when the api call returns it posts an event to the corresponding event handler.<br>
Them the event handler calls the method that holds your code .This method could be either the<br> 
apiSuccess or the apiFailure which you implement as you saw above.<br>

Some notes this code is not heavilly tested  and i beleive many things could go wrong, but it is the<br>
cleanest solution so far and for that reason i am pretty proud for it.<br>
I really hope you like it and use it in your projects but must of all i hope you criticize it and make it better.<br>

<h3>Important</h3><br>
I believe that this code can become a lot better and i hope you can give your expertize .<br>
So do not hesitate, write me a comment.



