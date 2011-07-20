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
  
In this example we call a sub-template from the main template so we define the **friend** template:
  
	<!-- friend HTML template -->
	<div class="friend"><%=myUserName%> is friend with <%=data.userName%></div>
    
And lastly we need to provide BabaJS the **data** and call the main method: **generateHTML**:   
  
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
  
In this example we used sub-templating and we used the asynch approach since we are not sure if the **friend** template is stored locally. If BabaJS can't find the **friend** template it will fetch it from a server which you specify and will continue with the process. Of course you can use the sub-templating using synch mode only if you are sure that the templates are already stored locally in BabaJS.     
It is also possible to use BabaJS in a simpler mode where you just provide the template as a string, like so:

	var html = BabaJS.generateHTML("<div><%=data.userName%></div>",{userName:"me"});
	document.getElementById("test").innerHTML = html;

## Main Features
* **PHP Like** &ndash; the syntaxt and the behavior of the template is similar to PHP so no need to learn something new. You can define variables in one template and use them anywhere in the templates or even in sub-templates.
* **Sub Templating** &ndash; you can call to render a template from another templates, so it makes it easier to devide templates into logic units, and use them where needed.
* **Dependency Management** &ndash; you can tell BabaJS if a template has dependencies, like JS or CSS files, and BabaJS will fetch these dependencies before rendering the template, only if needed.
* **Fast** &ndash; BabaJS compiles the templates in order to achive fast execution.
* **Text Based** &ndash; BabaJS is doing text manipulation and doesn&lsquo;t work on the DOM elements, thus allowing it to work on Node.JS as well.
* **No Framework Dependencies** &ndash; you can use BabaJS with any framework you are already using, BabaJS is written using raw Javascript. 
* **Formatting Flags** &ndash; you can specify formatting flags to control the way the final output of BabaJS is being formatted. BabaJS allows you to attach a hook to format the final output before it is passed back. BabaJS has some predefined flags to output secure HTML (i.e escaping some HTML tags). 

## Template Tags
### Context
Inside of the BabaJS tags you can execute JS code. this code is running in the context of BabaJS, so you can call BabaJS API using the **this** keyword.  
Another reserved word is the **data** keyword which is the object that you pass BabaJS to provide that data to be used to generate the HTML. So if you pass an object like so:  

	{name:"amir",age:100}
  
you can access the data like so:
  
	if( data.age > 99 ) return "you are old dude";
  
### Code Tag
**&lt;% JS code %&gt;**  
The code tag allows you to execute javascript inside the template. if the code returns a value then BabaJS will replace this tag with the return value. If the code is not returning value, then the BabaJS will just remove the tag from the template after executing the javascript.  
Here are a few example:
  
	<% var a=1;%>
	<% return a; %>
	<% return data.userName; %>
	<% return this.includeTemplate("temp1"); %>
  
Lets see what we have done:
  
1. declare a variable named **a** and assign to it the value **1**. BabaJS will just remove this tag from the template since it does&lsquo;t return any value.
2. return the value of **a**, so the tag will be replaced by the string **1**
3. return the value of the **data.userName**
4. return the value of the sub template **temp1**
  
### Assign Tag  
**&lt;%= JS code %&gt;**  
The assign tag is just a short cut of the code tag, where you don&lsquo;t need to write the **return** keyword. The assign tag is used only to return immediate value and not to declare and execute other code.  
Examples:  

	<%=a%>
	<%=data.userName%>
	<%=this.includeTemplate("temp1"); %>
  
Like the previous example, the only thing that was change here is that we removed the **return** keyword.  
