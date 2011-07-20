# BabaJS - Javascript Template Manager

## What is BabaJS?
BabaJS is an open source Javascript template manager.
  
The basic concept is: Template + Data = HTML
  
Here is a simple example:  
First we define an HTML template using the BabaJS special tags:

	<!-- user HTML template -->
	<div class="user">
		<span><% return data.userName%></span>
		<%IF data.hasPic %>
			<img src="<% return 'http://imgs.mydomain.com/'+ data.userPic; %>" />
		<%ELSE%>
			<span>Add User Pic Here!</span>
		<%ENDIF%>
		<span>User Friends:</span>
		<% var myUserName = data.userName; %>
		<%LOOP for( var i=0; i< data.friends.length; i++ ) %>
			<div class="friend">User <%=i%></div>
			<% return this.includeTemplate("friend", window.getFriend( data.friends[i] ) ); %>
		<%ENDLOOP%>
	</div>
  
In this example we call a sub-template from the main template so we define the *friend* template:
	<!-- friend HTML template -->
	<div class="friend"><%=myUserName%> is friend with <%=data.userName%></div>
  
And lastly we need to provide BabaJS the *data* and call the main method: *generateHTML*:   

	BabaJS.generateHTML({
		templateName:"user",
		requires:["friend"], //defining the dependencies between the two templates. this is neccessary only if BabaJS needs to fetch the template prior the process.
		ready: function(html){  //in this case we use asynch call back to get the HTML, but synch is also supported.
			document.getElementById("test").innerHTML = html;
		},
		//this is the data that we pass to BabaJS which in the context of the template will be accesed by the data keyword.
		{userName:"me",
		hasPic: true,
		userPic: "me.jpg",
		friends:["amir","baba","daniel","mia","yael"]}
	);
  
In this example we used sub-templating and we used the asynch approach since we are not sure if the *friend* template is stored locally. If BabaJS can't find the *friend* template it will fetch it from a server which you specify and will continue with the process. Of course you can use the sub-templating using synch mode only if you are sure that the templates are already stored locally in BabaJS.     
It is also possible to use BabaJS in a simpler mode where you just provide the template as a string, like so:

	var html = BabaJS.generateHTML("<div><%=data.userName%></div>",{userName:"me"});
	document.getElementById("test").innerHTML = html;

## Main Features
    * Sub Templating – you can include additional templates from other template as much as you like.
    * Dependency Management – BabaJS keep track about dependencies between templates and  JS and CSS files to make sure all are loaded when needed.
    * Fast – BabaJS compiles the templates in order to achive fast execution.
    * Template Stack Variables – BabaJS allows you to define variables in the template tags and access them from anywhere in the template or from included templates.
    * Text Based - BabaJS is doing text manipulation and doesn’t work on the DOM elements, thus allowing it to work on Node.JS as well.
    * Template Manager – BabaJS is not only a template engine, but also a manager that provides API to add/remove and create dependencies between templates.

To learn more about the API: http://www.amirharel.com/2011/04/26/babajs/