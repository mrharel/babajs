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
  
### includeTemplate
**includeTemplate(templateName,data)**  
This method can be called from templates to include sub-templates. This method returns the HTML in the return value of the method, so if you don&lsquo;t specify a dependency just make sure you have the sub template locally. To make sure the sub-template is stored locally you can either set it in the requires attribute of the generateHTML method, or set a dependency in the **setConfig** method.  
  
**Params**:  
  
* **templateName** {String} template name
* **data** {Any} the data object that the template manager will pass to the code of the template tags. you can access the data object by using the **data** keyword inside javascript code.	 
  
**Return** {String} the result HTML  
  
### ensureLocal
**ensureLocal(tempArr,jsArr,cssArr,cb)**  
This method populate the template manager with templates and load any javascript or CSS files that are not loaded yet. Use this method to populate the template manager in initialization or in any step you need to add multiple templates to the template manager  
  
**Params**:  
  
* **tempArr** {Array} array of template names. BabaJS will only fetch templates that are not stored locally.  
* **jsArr** {Array} array of javascript files. BabaJS will only load the files if they are not loaded already.  
* **cssArr** {Array} array of CSS files. BabaJS will only load the files if they are not loaded already.  
* **cb** {Function} callback function that will be called once all the files were loaded successfully. In case of an error an exception will be throw.  
  
**Examples**:  
in this example we make sure t1,t2,t3 are loaded along with some javascript and css files that required for this templates. when the template manager load all the files we call the generateHTML in the synch mode since we know that all the resources are stored locally.  

	BabaJS.ensureLocal(["t1","t2","t3"],["jquery.js","page1.js"],["style1.css"], function(){
		var html = BabaJS.generateHTML({templateName:"t1"},{name:"amir"});
	});  
  
### setConfig
**setConfig(cfg)**  
This method allows you to predefine some settings so you wont need to repeat them whenever you call generateHTML method.  
  
**Params**: 
  
* **cfg** {Object} 
 * **URLConvertor ** {Function} global function to convert a template name to a URL. this method will be called if you don’t provide a **URLConvertor** in the **generateHTML** method and the template manager requires to have a URL from a template name.  
 * **fetcher** {Function} global callback to fetch templates.  
 * **context** {Object} global context for all callback function you provide
 * **dep** {Object} This allows you to set a dependency hierarchy for templates. the object is a key/value pair where the key=template name and the value=is an object with templates,js,css which are all arrays of dependency files. Before BabaJS will generate an HTML from a template it will check all the dependencies it has in and will make sure all of them are loaded. The dependencies can have two or more dependencies pointing to each other (no endless loop here), so temp1 could have temp2 as a dependency and temp2 can have temp1 as a dependency, BabaJS will fetch temp1 and temp2 whenever you request temp1 or temp2 if they are not stored locally.  
 * **flagCb** {Function} callback hook for formatting flags. the function gets two parameter. The first {String} the output string to be formatted, and the second one {Array} with all the parameters you set for this flag. If this function return a string then this is the string that BabaJS will return as a final result. If no string is returned then BabaJS return the original string. 
  
**Examples**:  
In this example BabaJS will fetch the "temp1","temp2","temp3" and "js1.js","js2.js" and "style1.css" before generating the HTML.
  
	BabaJS.setConfig({
		dep:{
			"temp1":{templates:["temp2","temp3"], js:["js1.js","js2.js"]},
			"temp2":{templates:["temp1","temp3"],css:["style1.css"]},
			"temp3:{templates:["temp1"],js:["js1.js"]}
		},
		URLConvertor: URLConvertor,
		context : this
	});

	BabaJS.generateHTML({templateName:"temp1",ready:onHTMLReady}, myData );  
  
### removeTemplate
**removeTemplate(templateName)**  
This method allows you to remove a template from the template manager, so the next time you will request this template the template manager will try to fetch it.  
  
**Params**: 
  
* **templateName** {String} template name to be removed
  
### secureText
**secureText(text,flag)**  
Escape string according to the flag level. This method is a utility method to help you escape special HTML chars. BabaJS use this method when you provide an S/s flag in the template tags
  
**Params**:  
  
* **text** {String} string to escape  
* **flag** {String} **low** or **high** for different type of ecaping levels:   
 * **low** level will escape &lt;,&gt;,&quot;,and &lsquo; 
 * **high** level will escape &lt;,&gt;,&quot;, &lsquo;,&#96;,,!,@,$,%,(,),[,],{,},= and +  
  
**Return** {String}  
  
## Formating Flags  
BabaJS allows you to control the way output is being formatted by setting flags inside the template tags.  
First you need to set a format flag in either a **code tag** or **assign tag** as follows:  
  
	<%f(x1,x2,..xn) JS Code %>
  
Where **f** is a reserved word for flag where it must be followed by a parentheses (..) with parameters. Usually the first one will be the flag type while the others can be some additional parameters. 
BabaJS allows to add hook to flags using the **setConfig** method.  
BabaJS has predefined flags:  
  
* **s** secure text with level **low** (see the **secureText** method)  
* **S** secure text with level **high** (see the **secureText** method)  
  
**Examples**:  
In this example we added a predefined flag to format the user input value with a secure formatting, so it will escape some HTML tags, so no code injection will be allowed.
  
	<div class="user-input">
		<%f(s)=data.userInput%>
	</div>
  
In this example we set oute own formatting flags and added a hook in the **setConfig** method to handle these flags before they are returned by BabaJS. First we add the flags in the template tags:  
  
	<span class="money">your current balance is: $<%f(pretty-number,",")=data.money%></span>
	<p>
		<%f(max-str,70,"read more...")=data.longText%>
	</p>
  
And now we set the hook and the handlers for each flag type:  
  
	BabaJS.setConfig({flagCb: function(str,flags){
		//switcing on the first parameter which is the type of the flag:
		switch( flags[0] ){
			case 'max-str':
				return maxStr(str,flags[1],flags[2]);
			case 'pretty-number':
				return prettyNumber(str,[1]);
		}
	});  

	function maxStr(str,max,endStr){
		if( str.length < max ) return str;
		endStr = endStr ? endStr : "...";
		return str.substr(0,max-endStr.length)+endStr;
	}

	function prettyNumber(str,delimiter){
		delimiter = delimiter ? delimiter : ",";
		return str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1"+delimiter);
	}
	