---
layout: post
title:  "A playing around with node story: Find all pdfs in a url and automagically download them "
date:   2014-07-25 02:01:57
categories: NodeJs
---


Well first i should say why i did this.
I was studying for my discrete Mathematics exams and i had a problem.This class has a site where it keeps links to pdfs on notes,books etc( a total of 35 i think).
So in order to start reading i had to download these one by one .
And then i thought hey that is a good a chance to not read and develop something.
Well in the end it took me more time to code this than just download them one by one but  now i am prepared..

Update:
	I dont think i passed the exam :/

Unfortunately i do not have time to explain what i did exactly , i took some time though and reorganized the code and wrote some comments, but it is still a little bit out of style.

So i start by creating a simple http server(localhost:8080) with two routes , one has js script that prompts the user to give the url that has the pdfs that he wants to download and the other  retrieves the url from the headers and starts the downloading process
Furthemore i wanted to play with the eventemitter so the downloadPdf function inherits from EventEmitter and emits the 'end' event when it finishes downloading a pdf so that the recursiveDownload function can start the downloading process of the next pdf link.
(You will notice that i download the pdfs one by one in a recursive like style .I did that because i wanted to try some recursion and the emit event.It could have been faster and better if i did those(the downloading) to run in 'parallel').
Ok so here is the whole code.

{% highlight javascript %}
var fs = require('fs');
var http = require('http');
var EventEmitter = require('events').EventEmitter,
utils = require('util');



/*
*  Create basic http server on localhost:8080
*  -Route 1: / 		 -> returns a script that prompts user to enter the url that has the pdf links and then does an ajax call to Route 2
*  -Route 2: /url    -> starts the process of finding pdfs and downloading them to the directory that you started this programme
*/
http.createServer(function(req,res){

	if(req.url == "/"){
		res.write("<script>var answer = prompt('Enter url to find pdfs');    var xmlhttp = new XMLHttpRequest(); xmlhttp.open('GET','http://localhost:8080/url',true); xmlhttp.setRequestHeader('url', answer); xmlhttp.send(); </script>");
		res.end();
	} 
	else if (req.url == "/url"){
		main(req.headers['url'])
	}
}).listen(8080,function(){
	console.log("go to localhost:8080 bro");
});


var regex = {
	domain : /http(s?):\/\/([\w]+\.){1}([\w]+\.?)+/ ,
	links : /href="([^"]*.pdf)"/g
}

var main = function(urlToSearch){
		this.domain = urlToSearch.match(regex.domain)[0];
		this.urlToSearch = urlToSearch;
		this.baseUrl = '';

		var piecesUrl = urlToSearch.split("/");
		for(var i=0; i<piecesUrl.length-1; i++){
			this.baseUrl += piecesUrl[i]+"/";
		}

		var main  = this;

		http.get(this.urlToSearch,function(res) {
			var data = '';
		  
      res.on('data', function(chunk) {
		    data += chunk;
		    });
		  


      res.on("end", function() {
			  var links = [];
        //get all link href tags from this url's html
			  links =  data.toString().match(regex.links);
		    startRecursion(links);
        });
		  
      }).on("error", function() {
		        console.log("error");
		  });


  /*
  *  Start recursive download 
  */
	function startRecursion(links){
		recursiveDownload(0,links);
	}

	function recursiveDownload(i,links){
	//exit recursion when i >= links 
      if(i<links.length){
				this.counter = i;
				var that = this;
				var pdfFile = links[i].match(/"(.*?)"/); //to not get ""
				var pdfUrl;

				if(pdfFile[1][0] == "/") {
					//then we use domain/pdfile
					pdfUrl =  main.domain+pdfFile[1];
				}
				else{
					//we use current site position ../ and href
					pdfUrl  = main.baseUrl+pdfFile[1];
				}
				
        //every file that we download has this name standard : counter_theNameOfHrefLink
        //use of substring : if we have href syntax -> GoThere/AwesomePdf we want to grab the AesomePdf as the name , it does not ork properly beacause href may have more than one /
				var fileName = this.counter + "_"+ pdfFile[1].substring(pdfFile[1].indexOf("/")+1,pdfFile[1].length);
				
				console.log("downloading: " + fileName);
				
        //this is where the actual download of pdf happens 
        //it gets the url of the pdf and filename to create
				var download = new downloadPdf(pdfUrl,fileName);
				

        //when downloadPdf emits end signal we catch it here and call recursiveDownload again to initiate the download of the next pdf
				download.on('end',function(){
					console.log(fileName + " downloaded!");
					recursiveDownload(that.counter+ 1,links);
				});
			}else {
				console.log("Nothing else to download , gimme more..")
			}
	}
}


/*
* It creates a writeable stream and pipes the response into it
* When it ends it emits an event 'end'
*/
var downloadPdf = function(pdfUrl,fileName){
	var that = this;
	http.get(pdfUrl,function(resp){		
		var stream = fs.createWriteStream(__dirname+"/"+fileName);
		resp.pipe(stream);
		resp.on('end',function(){ that.emit('end');});
	});
}


// doanloadPdf needs to inherit from EventEmiiter so that it can emit events
utils.inherits(downloadPdf,EventEmitter);



{% endhighlight %}

