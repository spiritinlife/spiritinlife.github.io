---
layout: post
title:  "A suggestion for organizing your routes in nodeJs express project"
date:   2014-08-06 19:28:57
categories: NodeJs
---


This is a nice way i found for organizing my routes.
I am not sure if it is a good idea or even if it is implemented correctly and for that reason i would like your comments :)

So the problem i noticed when writing express apps was that there were a lot of routes.
A believe that a big application would have over 50 lines of code just to define routes  
app.post<br>
app.post<br>
app.get<br>
.<br>
.<br>
.<br>
app.get<br>

And from my knowledge there is no clear way to organize these.

So i came up with my own .
First of all i like to structure my app with 3 main folders controllers,routes,models.<br>
SO my suggestion is that in folder routes there is only an index file that all it does is iterate through the controllers and define them.
For that to happen i create  controllers with certain structure .

Controllers follow this standard.

{% highlight javascript %}
module.exports = {
	method : "GET",
	url : "/user",
	handler : function(req,res){
	}
};
{% endhighlight%}


SO every controller defines its method,url and handler.<br><br>
Now for the route/index.js .

{% highlight javascript %}
//index.js

var fs = require('fs');
var rootPath = require('path').dirname(module.parent.filename);
/* This module will setup the routes */
module.exports = function(app){		
	fs
	.readdirSync(rootPath+"/controllers")
	.forEach(function(file){
		var controller = require(rootPath+"/controllers/"+file);
		console.log("Route: app."+controller.method+" -> "+controller.url+" -> " + file);
		if (controller.method === "POST")
			app.post( controller.url, controller.handler );
		else if (controller.method === "GET")
			app.get( controller.url , controller.handler );
	});
};
{% endhighlight %}


It also prints out which route goes to which handler from which file.And i find this is usefull just because you now instantly know your routes.
Furthermore by keeping your files properly named in the controllers folder you can identify your routes quickly.

---It would also be a nice feature to add to the route module a function to print the routes anytime you want for debugging purposes.

That is all.
Thank you for reading and please comment :) 



