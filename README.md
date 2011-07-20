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
  
### Condition Tag  
**&lt;%IF JS expression %&gt;**  HTML **&lt;%ELSE%&gt;** HTML **&lt;%ENDIF%&gt;**  
The condition tag allows you evaluate a javascript expression and to include a HTML and or template tags according to the expression value.  
Example:

	<%IF data.val == 1 %>
		yes
	<%ELSE%>
		<%IF data.name=="amir" %>
			hi amir
		<%ENDIF%>
		no
	<%ENDIF%>
  
In this example we check the value of val in the data object and if its equal to 1 we output “yes” otherwise we output “hi amir” if the data.name is equal to amir and then we output “no”  
  
### Loop Tag   
**&lt;%LOOP JS loop code %&gt;**  HTML **&lt;%ENDLOOP%&gt;**  
The loop tag allows you to loop a certain HTML several times. The code section is expected to be a loop and there is not need to add the open brackets.  
Example:  

	<%LOOP for( var i=0; i<10; i++) %>
		<span> value of i=<%=i%></span><br/>
	<%ENDLOOP%>
  
## BabaJS API  
Once you include BabaJS into your project you can access BabaJS using the global variable BabaJS. The following are the public methods you can access:  

### generateHTML
**generateHTML(obj,data)**  
This method generate HTML using a given template and a data object.   
The method can executed in two mode:  
1. **synchronous** where the function return the HTML in the return value.  
2. **asynchronous** where the function return the HTML in a callback function. 
  
If the synch mode is used, make sure that the template, and sub templates (if there are) is stored locally, and there is no CSS or JS dependencies that are not loaded already.  
  
**Params**:  
  
* **obj** {String|Object} this parameter can be either a String or an object. in case this is a string then it is the template string to be parsed, and the method is executed in the **synch** mode, which mean that the HTML will return in the return value of the function. If **obj** is an Object then the followings are a valid attributes:  
 * **templateName** {String} a unique name for the templates. BabaJS stores the compiled templates and refer to them by this name.  
 * **URLConvertor** {Function} a callback function to be used by the template manager to convert the templateName into a URL in case the template is not stored locally. The template manager will attempt to fetch the template from the server using the URL that you will provide. The callback function gets the templateName in the parameter and should return the template URL as a string. This callback function is required if you don’t provide a **fetcher**. You can also set this callback in the **setConfig** method to be global callback for all templates. In case you set a callback in the generateHTML and also set a global callback in the **setConfig**, then the local callabck will be used.  
 * **fetcher** {Function} callback function that allows you to control the fetching of templates that are not stored locally by BabaJS. Provide this callback if you want to fetch templates for the template manager when it needs it. The callback gets as the first parameter the template name, and the second parameter is a callback function to be called when the template is ready. the callback parameter gets the template as a string in the first parameter. To indicate that you failed to fetch the template return **false** to the callback method. You can also set this callback in the **setConfig** method to be global callback for all templates. In case you set a callback in the **generateHTML** and also set a global callback in the **setConfig**, then the local callabck will be used.  
 * **context** {Object} set the callback function context (both for **URLConvertor** and **fetcher**). This is optional and if no context is set, the window object will be set as the default context of callbacks. You can also set this object in the **setConfig** method to be global context for all callbacks. In case you set a context in the **generateHTML** and also set a global context in the **setConfig**, then the local context will be used. 
 * **ready** {Function} callback function when the HTML is ready. the callback will get in the first parameter the genrated HTML, and the second parameter is the template name that was requested. If this callback is not provided then the template manager assume that the generateHTML was called in the **synch** mode and will try to return the HTML in the return value (this will be possible only if everything is already stored locally by the template manager)
 * **requires** {Array|Object} the template manager knows how to handle dependencies. if a template is depended on another template BabaJS will make sure it has it locally. The template manager also support javascript and CSS dependencies, so if a template is depended on a CSS file, the template manager will make sure the CSS is loaded before generating the HTML. The requires attribute could be either an array of template names, or an object with the following attributes:
     * **templates** {Array} array of templates name that are required in this template.
     * **js** {Array} array of javascript files that this templates depended on.
     * **css** {Array} array of CSS files that this template depends on.
* **data** {Any} the data object that the template manager will pass to the code of the template tags. you can access the data object by using the **data** keyword inside javascript code.	 
  
Examples:  
  
This is a synch use of generateHTML by providing the template as a string.  
  
	var html = BabaJS.generateHTML("<%=data.name%>",{name:"amir"});
	alert(html); //will output "amir"
  
In this example we didn't provide the "ready" callback, the method will be executed in a **synch** mode and will try to generate and return the HTML in the return value.  
this will work only if "temp1" is stored locally and all its dependencies are loaded already.
  
	var html = BabaJS.generateHTML({templateName:"temp1"},{name:"amir"});
  	
In this example we provide a template name and a convertor callback to return a URL of the template. we also provide a "ready" callback to be used when the HTML is ready.  
Tthis will force the generateHTML to be used in an **asynch** mode.
  
	function onHTMLReady(html,templateName){
		switch( templateName ){
			case "user-page": loadUserPage(html); break;
			case "msg-page" : loadMessagePage(html); break;
		}
	}

	function URLConvertor(templateName){
		return templateName+".html";
	}
	//BabaJS will check to see if it has the template temp1 and if not will try to fetch it using XMLHTTPRequest using the URL that was provided
	BabaJS.generateHTML(
		{templateName:"temp1",
		URLConvertor:URLConvertor,
		ready: onHTMLReady,
		 },{name:"amir"});

  
In this example we provided a fetcher method to handle the fetching of the templates by ourselves. this is useful if you already fetched the template or want to fetch several templates in a batch.  
we also provided a dependency between "temp1" to "temp2" and "temp3" which wil tell BabaJS to make sure it has these templates locally before generating the HTML.
  
	function fetchTemplate(templateName,cb){
		$.ajax( URLConvertor(templateName) , {success:function(data){cb(data);}});
	}

	BabaJS.generateHTML(
		{templateName:"temp1",
		fetcher: fetchTemplate,
		requires: ["temp2","temp3"],
		ready: onHTMLReady,
		},{name:"amir"});
  

In this example we extended the dependencies to add CSS and javascript library for this template. BabaJs will load these files, if they are not already loaded, and make sure they are added to the head tag of the document.

	BabaJS.generateHTML(
		{templateName:"temp1",
		fetcher: fetchTemplate,
		requires: {templates:["temp2"],css:["styles/style1.css"],js:["scripts/jquery.js"]},
		ready: onHTMLReady,
		},{name:"amir"});
  
