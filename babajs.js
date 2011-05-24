/**
 * @fileOverview This is the implementation of BabaJS - javascript template engine 
 * @author <a href="mailto:harel.amir1@gmail.com">Amir Harel</a>
 * @version 1.0.4
 * @description check out full documentation at http://www.amirharel.com/2011/04/25/babajs/
 */
var BabaJS = {
	_stack : {},
	/**
	 * @description generates an HTML from a given template. this method could be used in synch (retur value) or asynch (use callback) way.
	 * @param {Object|String} obj could be a template string or a template object. in case the obj is a string then the method will return the generated HTML. 
	 * 		in case the obj is an object the following attributes are expected:
	 * 		templateName {String} the template name to be used
	 * 		fetcher {Function} a callback function to be used in case we need to fetch a template. the method will get two params, the template name and the callback to be called when the template is available. the callback will get the template text.
	 * 		context {Object} the context of the callbacks (fetcher and URLConvertor). if not provided then we use the context which was set in the setConfig and if there is no context there we use the window as the default context.
	 * 		URLConvertor {Function} callback function to convert a template name into a URL. please provide this method if you don't provide the fetcher. the template manager will try to fetch templates if needed, but it needs to know how to map a template name into a template URL. this callback will get the template name and return the template URL. 
	 * 		ready {Function} callback to be used when the template is ready.
	 * 		requires {Object} this is used to tell the template manager which template/js/css files this template needs. the template manager will try to fetch these resources if they are not stored locally already. the requires could be either an array of template names or an object with 3 arrays: js,css,templates.
	 * @param {Object} data the data to be passed into the template. 
	 * @returns {String|undefined} if ready is provided then the function return undefined, else it return the template only if the template manager has it locally.
	 */
	generateHTML: function(obj,data){
		this._stack = {};
		if( typeof obj === "string" ){ //we got the template as the first parameter.
			var compiledTemplate = this._compile(obj); //compile it
			return this._replaceCompiledTags(compiledTemplate.chtml,compiledTemplate.ctags,data); //evaluate it
		}
		if( !obj.ready ){ //this means the caller is expecting the html in the return value.
			var template = this._templates[obj.templateName];
			if( template ){				
				if( !template.compiled ){
					template.compiled = this._compile(template.raw);
					delete template.raw;
				}
				return this._replaceCompiledTags(template.compiled.chtml,template.compiled.ctags,data);
			}
			else{
				throw new Error(obj.templateName + " was not found in template manager");
			}
		}
		this._asynchGenerateHTML(obj,data);
	},
	
	/**
	 * @private
	 * @description config params for the template manager.
	 * @property {Function} fetcher callback function to be used in order to fetch templates when they are not stored locally.
	 * @property {Function} URLConvertor callback to be used in order to convert a template name into a URL
	 * @property {Object} context the context of the above callback functions. the default is the window. 
	 */
	_cfg: {fetcher:null,URLConvertor:null,context: window},
	
	/**
	 * @description set global config for the template manager. The template manager will try to use these settings in case they are not provided in the generateHTL method.
	 * @param {Object} cfg can contains the followings:
	 * 		fetcher {Function}
	 * 		URLConvertor {Function}
	 * 		context {Object}
	 */
	setConfig: function(cfg){
		if( cfg.URLConvertor ) this._cfg.URLConvertor = cfg.URLConvertor;
		if( cfg.fetcher ) this._cfg.fetcher = cfg.fetcher;
		if( cfg.context ) this._cfg.context = cfg.context;
		if( cfg.dep ) this._dep = cfg.dep;
	},
	
	/**
	 * @private
	 * @description dependencies of template. the structure is key=template name and value=object of templates, js, and css where all of them ar arryay of files of dependencies. 
	 */
	_dep: {},
	
	/**
	 * @description include template within a template. use this method to include a sub template from a template. when you include a template make sure you have the template locally since this method works in a snych way.
	 * @param {String} name the template name
	 * @param {Object} the data object to be used in the template.
	 * @returns {String} the evaluated template.  
	 */
	includeTemplate: function(name,data){
		var template = this._templates[name];
		if( template ){
			if( !template.compiled ){
				template.compiled = this._compile(template.raw);
				delete template.raw;
			}
			return this._replaceCompiledTags(template.compiled.chtml,template.compiled.ctags,data);
		}
		throw new Error( name + " was not found in template manager");
	},
	
	/**
	 * @description removes a template from the template manager
	 * @param {String} templateName the template to be removed.  
	 */
	removeTemplate: function(templateName){
		delete this._templates[templateName];
	},
	
	/**
	 * @private
	 * @description this method checks from the provided array which template we don't have locally.
	 * @param {Array} arr array of templates
	 * @returns {Array} array of templates that we don't have locally.
	 */
	_getMissingTemplates: function(arr){
		var res = [];
		for( var i=0; i<arr.length; i++){
			if( !this._templates[arr[i]] ){
				res.push(arr[i]);
			}
		}
		return res;
	},
	
	/**
	 * @private
	 * @description fetch a template from server and store it locally.
	 */
	_fetchTemplate: function(obj,name,url,cb,context){
		var fetcher = obj.fetcher ? obj.fetcher : this._cfg.fetcher;
		var cbContext = obj.context ? obj.context : this._cfg.context;
		if( fetcher ){
			var that = this;
			fetcher.call(cbContext,name,function(text){
				that._templates[name] = {compiled: that._compile(text)};
				cb.call(context,true);
			});
		}
		else{
			this._ajax(url, function(text){
				if( text !== false ){
					this._templates[name] = {compiled: this._compile(text)};
					cb.call(context,true);
				}
				else{
					cb.call(context,false);
				}
			},this);
		}
	},
	
	/**
	 * @private
	 * @description fetch a url from the server
	 */
	_ajax: function(url,cb,context){
		var xhr;
		if( window.ActiveXObject ){
			xhr = new window.ActiveXObject( "Microsoft.XMLHTTP" ); 
		}
		else{
			xhr = new window.XMLHttpRequest();
		}
		xhr.open("GET",url);
		xhr.onreadystatechange = function(){
			if( xhr.readyState == 4 ){//&& xhr.status == 200 ){
				if( xhr.status == 200 || xhr.status == 0 ){
					cb.call(context,xhr.responseText);
				}
				else{
					cb.call(context,false);
				}
			}
		};
		xhr.send();
	},
	
	/**
	 * @description make sure that required files are stored locally.
	 * @param {Array} tempArr array of all the template names
	 * @param {Array} jsArr array of all the javascript files
	 * @param {Array} cssArr array of all the css files.
	 * @param {Function} cb callback to be called when all the resources were loaded successfuly.
	 */
	ensureLocal: function(tempArr,jsArr,cssArr,cb){
		this._ensureLocal(
			{URLConvertor:this._cfg.URLConvertor,fetcher:this._cfg.fetcher,context:this._cfg.context},
			tempArr,
			jsArr,
			cssArr,
			function(success){
				cb.call(this._cfg.context,success);
			},this);	
	},
	
	
	/**
	 * @private
	 * @description fetches the templates/js/css files.
	 */
	_ensureLocal: function( obj,tempArr,jsArr,cssArr,cb,context ){
		jsArr = jsArr ? jsArr : [];
		cssArr = cssArr ? cssArr : [];
		var counter = 0;
		var convertor = obj.URLConvertor ? obj.URLConvertor : this._cfg.URLConvertor;
		var cbContext = obj.context ? obj.context : this._cfg.context;
		var totalCount = tempArr.length + cssArr.length + jsArr.length;
        if( totalCount == 0 ){
            cb.call(context,true);
        }
        for( var i=0; i<tempArr.length; i++ ){
			var url = convertor ? convertor.call(cbContext,tempArr[i]) : "";
			this._fetchTemplate(obj,tempArr[i],url,function(success){
				if( success === false ){
					throw new Error("Failed to fetch template" + url );
					return;
				}
				counter++;
				if( counter == totalCount ){
					cb.call(context,true);
				}
			},this);		
		}
		for( var i=0; i<jsArr.length; i++){
			this._fetchJS(jsArr[i],function(success){
				counter++;
				if( counter == totalCount ){
					cb.call(context,true);
				}
			},this);
		}
		for( var i=0; i<cssArr.length; i++){
			this._fetchCSS(cssArr[i],function(success){
				counter++;
				if( counter == totalCount ){
					cb.call(context,true);
				}
			},this);
		}
	},
	
	/**
	 * @private
	 * @description fetch the javascript file and place it in the head tag
	 */
	_fetchJS: function(js,cb,context){
		if( this._js[js] ){
			cb.call(context,true);
		}
		else{
			this._ajax(js,function(text){
				if( text === false ){
					cb.call(context,false);
					return;
				}
				var script = document.createElement("script");
				script.type = "text/javascript";
				if( this._isIE() ){
					//IE has its own thing: http://www.phpied.com/dynamic-script-and-style-elements-in-ie/
					script.text = text;
				}else{
					script.innerHTML = text;
				}
				document.getElementsByTagName("head")[0].appendChild(script);
				this._js[js] = true;
				cb.call(context,true);
			},this);
		}
	},
	
	/**
	 * @private
	 */
	_ie: null,
	
	/**
	 * @private
	 * @description returns true if the browser is IE
	 */
	_isIE: function(){
		if( this._ie === null ){
			this._ie = navigator.userAgent.indexOf("MSIE") != -1 ? true : false;
		}
		return this._ie;
	},
	
	/**
	 * @private
	 * @description fetch a css file and place it in the head tag
	 */
	_fetchCSS: function(css,cb,context){
		if( this._css[css] ){
			cb.call(context,true);
		}
		else{
			this._ajax(css,function(text){
				if( text === false ){
					cb.call(context,false);
					return;
				}
				var style = document.createElement("style");
				style.type = "text/css";
				if( this._isIE() ){
					//IE has its own thing: http://www.phpied.com/dynamic-script-and-style-elements-in-ie/
					style.styleSheet.cssText = text;
				}
				else{
					style.innerHTML = text;
				}
				document.getElementsByTagName("head")[0].appendChild(style);
				this._css[css] = true;
				cb.call(context,true);
			},this);
		}
	},
	
	/**
	 * @private
	 * @description cheks all the dependencies of a template in a recursive way. 
	 */
	_getDependencies: function(templateName,res,visited){
		res = res? res : {templates:[],js:[],css:[]};
		visited = visited? visited : {};
		if( visited[templateName] ) return res; //preventing endless loops
		if( !this._dep[templateName] ) return res;
		visited[templateName] = true;
		if( this._dep[templateName].templates ){
			res.templates = this._uniqueAdd(res.templates,this._dep[templateName].templates);
			for( var i=0; i<this._dep[templateName].templates.length; i++){				
				this._getDependencies(this._dep[templateName].templates[i],res,visited);	
			}
		}
		if( this._dep[templateName].js ){
				res.js = this._uniqueAdd(res.js,this._dep[templateName].js);			
		}
		if( this._dep[templateName].css ){
				res.css = this._uniqueAdd(res.css,this._dep[templateName].css);			
		}
		return res;		
	},
	
	/**
	 * @private
	 * @description concat two arrays and making sure for unique values.
	 * @returns {Array} new array
	 */
	_uniqueAdd: function(arr1,arr2){
		var res = [];
		//if( !(arr2 instanceof Array) ) arr2 = [arr2];
		var checker = {};
		for( var i=0; i<arr1.length; i++ ){
			res.push(arr1[i]);
			checker[arr1[i]] = true;
		}
		for( var i=0; i<arr2.length; i++ ){
			if( !checker[arr2[i]] ) res.push(arr2[i]);
		}
		return res;		
	},
	
	/**
	 * @private
	 * @description generate an HTML in a asynch mode.
	 */
	_asynchGenerateHTML: function(obj,data){
		var cbContext = obj.context ? obj.context : this._cfg.context;
		var templatesArr = [obj.templateName];
		if( obj.requires && obj.requires instanceof Array ) templatesArr = templatesArr.concat(obj.requires);
		if( obj.requires && obj.requires.templates ) templatesArr = templatesArr.concat(obj.requires.templates);
		var templatesToFetch = this._getMissingTemplates( templatesArr );
		var jsRequires = [];
		if( obj.requires && obj.requires.js ) jsRequires = obj.requires.js;
		var cssRequires = [];
		if( obj.requires && obj.requires.css ) cssRequires = obj.requires.css;
		//getting the dependencies we have for the template
		var dep = this._getDependencies(obj.templateName);
		var visited = {};
		visited[obj.templateName] = true;
		//gathering all the dependencies for all the templates that are required for this template.
		for( var i=0; i<templatesArr.length; i++ ){
			this._getDependencies(templatesArr[i],dep,visited);
		}
		
		templatesToFetch = this._uniqueAdd(templatesToFetch,dep.templates);
		jsRequires = this._uniqueAdd(jsRequires,dep.js);
		cssRequires = this._uniqueAdd(cssRequires,dep.css);
		
		this._ensureLocal( obj,templatesToFetch , jsRequires, cssRequires, function(success){
			var template = this._templates[obj.templateName];
			if( !template.compiled ){
				template.compiled = this._compile(template.raw);
				delete template.raw;
			}
			var res = this._replaceCompiledTags(template.compiled.chtml,template.compiled.ctags,data);
			if( obj.ready ) obj.ready.call(cbContext,res,obj.templateName);
		}, this);
			
			
	},
	
	_templates:{},
	_css:{},
	_js:{},
	
	/**
	 * @description Add templates to the template manager to be stored locally.
	 * @param {Object} templates associative array with key=template name and value= template text.
	 */
	addTemplates: function(templates){
		for( var name in templates ){
			var compiled = this._compile(templates[name]);
			this._templates[name] = {compiled:compiled};			
		}
	},

    	/**
	 * @description Add one template to the template manager
	 * @param {String} templateName
	 * @param {String} text the template string
	 */
	addTemplate: function(templateName,text){
        	if( this._templates[templateName] ) return;
            var compiled = this._compile(text);
            this._templates[templateName] = {compiled:compiled};
    	},
	
	
	/**
	 * @private
	 * @description replace the compiled tags ( _{x}_ ) with its evaluation ctag.
	 * @param {String} chtml the compiled HTML where template tags where replaced with _{x}_ where x=ctag id
	 * @param {Object} ctags associative array where key=ctag id and value=ctag object.
	 * @param {Object} data the data to be passed to the template
	 * @returns {String} the result html.
	 */
	_replaceCompiledTags: function(chtml,ctags,data){
		var regex = /_{([\d]+)}_/g;
		var regReplace = /_{[\d]+}_/;
		var match;
		regex.lastIndex = 0;
		while((match = regex.exec(chtml))){
			chtml = chtml.replace( regReplace , this._evalCtag(ctags,match[1],data));
			regex.lastIndex = 0;
		}
		return chtml;
	},
	
	/**
	 * @private
	 * @description return the html representation of a ctag when given the data to evaluate it with. 
	 * @param {Object} ctags associative array where key=ctag id and value=ctag object.
	 * @param {Number} ctagid the ctag id to be eval
	 * @param {Object} data the data to be passed to the template
	 * @returns {String} the result HTML.
	 */
	_evalCtag: function(ctags,ctagid,data){
		var ctag = ctags[ctagid];
		switch( ctag.type ){
			case "code" : return this._evalCodeTag(data,ctag);
			case "assign" : return this._evalCodeTag(data,ctag,true);
			case "if" : return this._evalConditionTag(data,ctags,ctag);
			case "loop" : return this._evalLoopTag(data,ctags,ctag);
			default:
				return "Unknown tag";
		}
	},
	
	/**
	 * @private
	 * @description evaluate a loop ctag
	 */
	_evalLoopTag: function(data,ctags,ctag){
		var vars = "";
		var res = "";
		var fnBody = "";
		for( var i in this._stack ){
			vars += "var " + i + "=" + this._stringify(this._stack[i]) + ";\r\n";
		}
		var stack = "";
		for( var i in this._stack ){
			stack += "this._stack['"+i+"'] = " + i + ";\r\n";
		}
		for( var i=0; i<ctag.vars.length;i++){
			stack += "this._stack['"+ctag.vars[i]+"'] = " + ctag.vars[i] + ";\r\n";
		}
		var code = "var _retVal = '';\r\n"+ctag.code + "{\r\n\t "+stack+"\r\n _retVal += this._replaceCompiledTags('"+ctag.chtml1.replace(/[\r\n]/g,"")+"',ctags,data);} return _retVal;";
		fnBody = 'try{'+
			vars + 
			code +
			'}catch(_err){return _err;}finally{'+
			stack +			
			'}' ;

		try{
			var fn = new Function("data","ctags", fnBody);
			var res = fn.call(this,data,ctags);			
		}
		catch(err){
	            this._log("ERROR: ", err," Fn=_evalLoopTag ctag=",ctag," data=",data);
		    throw err;
		}
		return res;
	},

    _log: function(){
        if( window.console ){
            console.log.apply(console,arguments);
        }
    },
	
	/**
	 * @private
	 * @description eval a condition tag
	 */
	_evalConditionTag: function(data,ctags,ctag){
		var vars = "";
		var res = "";
		for( var i in this._stack ){
			vars += "var " + i + "=" + this._stringify(this._stack[i]) + ";\r\n";
		}
		var stack = "";
		for( var i in this._stack ){
			stack += "this._stack['"+i+"'] = " + i + ";\r\n";
		}
		for( var i=0; i<ctag.vars.length;i++){
			stack += "this._stack['"+ctag.vars[i]+"'] = " + ctag.vars[i] + ";\r\n";
		}
		var code = "return (" + ctag.code + ");";
		var fnBody = 'try{'+
			vars + 
			code +
			'}catch(_err){return _err;}finally{'+
			stack +			
			'}' ;
		
		try{
			var fn = new Function("data", fnBody);
			var res = fn.call(this,data);
			if( res ){
				return this._replaceCompiledTags(ctag.chtml1,ctags,data);
			}
			else{
				return this._replaceCompiledTags(ctag.chtml2,ctags,data);
			}
		}
		catch(err){
			debugger;
            this._log("ERROR: ",err," Fn=_evalConditionTag ctag=",ctag," data=",data);
			throw err;
		}
		return res;
	},
	
	/**
	 * @private 
	 * @description eval a code tag
	 */
	_evalCodeTag: function(data,ctag,assign){
		var vars = "";
		var res = "";
		for( var i in this._stack ){
			vars += "var " + i + "=" + this._stringify(this._stack[i]) + ";\r\n";
		}
		
		var stack = "";
		for( var i in this._stack ){
			stack += "this._stack['"+i+"'] = " + i + ";\r\n";
			//vars += "var " + i + "=" + this._stack[i] + ";\r\n";
		}
		for( var i=0; i<ctag.vars.length;i++){
			stack += "this._stack['"+ctag.vars[i]+"'] = " + ctag.vars[i] + ";\r\n";
		}
		var code = ((assign===true)? "return " : "" ) + ctag.code + ((assign===true)? ";" : "" );
		var fnBody = 'try{'+
			vars + 
			code +
			'}catch(_err){return _err;}finally{'+
			stack +
			' '+
			'}' ;
		
		try{
			var fn = new Function("data", fnBody);
			var res = fn.call(this,data);
			if( typeof res === 'undefined' ){
				res = "";
			}
		}
		catch(err){
			debugger;
            this._log("ERROR: ",err," Fn=_evalCodeTag ctag=",ctag," data=",data);
			throw err;
		}
		return res;
		
	},  

	/**
	 * @description convert an object into a string. we try to use the browser implementation as a default. if there is no JSON
	 * object we throw an error only if the obj is either an Object or an Array.
	 */ 
    	_stringify: function(obj){
        	if( window.JSON ) return JSON.stringify(obj);
	        if( typeof obj == "string" || typeof obj == "number" || typeof obj == "boolean" ) return obj.toString();
	        throw new Error("Can't stringify an Object or an Array without JSON Support. please include a JSON object to the window object. Try https://github.com/douglascrockford/JSON-js");
	},
	
	/**
	 * @private
	 * @description compile a template into a ctags and chtml.
	 * @param {String} t template text
	 * @returns {Object} with chtml and ctags.
	 */
	_compile: function(t){
		var q = []; //queue of the current ctag that we are working on. this is only the ctag id.
		var count = 0; //keeping track of the ctag ids.
		//the return value
		var res = {
			chtml: "",
			ctags: {}
		};
		var c; //current char
		var current = "chtml"; //controller that tells us if we are working on a ctag or on the chtml from the res object.
		var currentTag = null; //the current ctag type
		var state = "html"; //if the current is the ctag id, we need to know on which part of the ctag we are working on right now.
		//starting to loop over all the chars in the template.
		for( var i=0,len=t.length; i<len; i++){
			c = t.charAt(i); //the current char
			if( (c == "<") && ( i<len-1 && t.charAt(i+1) == "%" ) ){ //checking to see if we found an open ctag			
				var ctagType = this._getCtagType(t,i+2); //getting the ctag type
				currentTag = ctagType; //saving the current ctag type
				if( ctagType == "code" || ctagType == "assign" || ctagType == "if" || ctagType == "loop" ){
					//first we need to save the state for the current ctag
					if( q.length > 0 ){
						res.ctags[q[q.length-1]]._state = state;
					}					
					var ctag = this._getNewCtag(ctagType); //creating a new ctag
					q.push(count); //add it to the top of the queue
					res.ctags[count] = ctag; //add it to the result object
					this._addToCurrent(current,state,res, "_{" + count + "}_"); //add the ctag reference to the current working text.
					current = count; //save the current ctag id
					count++; //increase the number of ctags
				}
				state = "tag"; //we are now looping over the ctag name
			}
			else if( state == "tag" ){
				if( ctagType == "code" && c == "%" ){
					state = "code"
				}
				else if( ctagType == "assign" && c == "=" ){
					state = "code";
				}
				else if( c == " " ) state = "code";
                else if( c == "%" && i<len-1 && t.charAt(i+1) == ">"){ //its either endloop or endif or else
                    if(currentTag == "else" ){
                        state = "chtml2";
                    }
                    else{
                        q.pop(); //we are no longer working on this ctag
                        if( q.length == 0 ){ //if there is no more ctags in the queue, we set the working env to the up most html
                            currentTag = null;
                            current = "chtml";
                            state = "html";
                        }
                        else{ //we set the previous ctag to be the current one.
                            var lastCtag = res.ctags[q[q.length-1]];
                            currentTag = lastCtag.type;
                            current = q[q.length-1];
                            state = lastCtag._state;
                        }
                    }
                    i++;
                }
			}
			else if( c == "%" && i<len-1 && t.charAt(i+1) == ">" ){ //found a closing ctag
				if( currentTag == "code" || currentTag == "assign" ){//|| currentTag == "endif" || currentTag == "endloop"){
					//closing the current ctag
					q.pop(); //we are no longer working on this ctag					
					if( q.length == 0 ){ //if there is no more ctags in the queue, we set the working env to the up most html
						currentTag = null;
						current = "chtml";
						state = "html";
					}
					else{ //we set the previous ctag to be the current one.
						var lastCtag = res.ctags[q[q.length-1]];
						currentTag = lastCtag.type;
						current = q[q.length-1];
						state = lastCtag._state;
					}
				}				
				else if( currentTag == "if" || currentTag == "loop"){ //if the closing ctag is if or loop it means that we are now looping the chtm1
					state = "chtml1";
				}
								
				i++; //ignoreing the closing sign i.e ">"
			}
			else if( state != "tag" ){ //we don't keep the ctag name
				this._addToCurrent(current,state,res,c);
			}
		}
		this._findVars(res); //find all the var declerations in the code sections.	
		//this._removeNewLinesFromCode(res);
		return res;
	},
	
	/**
	 * @private
	 * @description finds all var in the code and put it in the vars array
	 */
	_findVars: function(res){
		for( var id in res.ctags ){			
            res.ctags[id].vars = this._findVar(res.ctags[id].code);
		}
	},

    /**
     * check if a char is a white space
     * @param c {String} one char
     * @return {Boolean} true is this is a whitespace char
     *@private
     */
    _isWhiteSpace: function(c){
        return /[\s]/.test(c);
    },
	
	/**
	 * finds all variable declerations in the code segment.
     * @param code{String}
     * @return {Array} array with all the variables defined in this code segment.
     * @private
	 */
	_findVar: function(code){
        var res = []; //return array with all variable found in the code.
        var inDec = false; //are we inside of a decleration of variables
        var newVar = ""; //new var
        var pc = 0; // perenthasis count
        var bc = 0; // bracket count
        var inFn = false; //are we inside of a function - we ignore code if we do
        var inStr = false; //are we inside of a string - we ignore the code if we do
        var dqc = 0; //double qoute counter
        var sqc = 0; //single quote counter
        var inAssign = false; //are we in an assignment code for a variable
        var inLoop = false; //are we inside of a loop. we need to know since you can define vars like 'for( var a in b )'
        for( var i=0, len = code.length; i< len ; i++ ){ //main loop on the code segment.
            var ch = code.charAt(i); //current char
            if( ch == "("){
                pc++;
                //testing to see if we have "function("
                if( !inFn && i>=8 && code.charAt(i-1) == "n" && code.charAt(i-2) == "o" && code.charAt(i-3) == "i" && code.charAt(i-4) == "t" && code.charAt(i-5) == "c" && code.charAt(i-6) == "n" && code.charAt(i-7) == "u" && code.charAt(i-8) == "f" ){
                    inFn = true;
                }
                //testing to see if we have "for(" or "while("
                if( !inLoop && !inFn && !inAssign &&
                        ((i>=3 && code.charAt(i-1) == 'r' && code.charAt(i-2) == 'o' && code.charAt(i-3) == 'f' )||
                        (i>=5 && code.charAt(i-1) == 'e' && code.charAt(i-2) == 'l' && code.charAt(i-3) == 'i' && code.charAt(i-4) == 'h' && code.charAt(i-5) == 'w'))){
                    inLoop = true;

                }
            }
            else if( ch == ")"){
                pc--;
                if( pc == 0 && !inFn && !inStr && inLoop ) inLoop = false; //checking to see if the loop was closed.
				if( inFn && bc == 0 && pc == 0 ) inFn = false; //checking to see if a function was closed.
            }
            else if( ch == "{"){
                bc++;
            }
            else if( ch == "}"){
                bc--;
                if( inFn && bc == 0 && pc == 0 ) inFn = false; //checking to see if a function was closed.
            }
            else if( ch == "\"" ){
                dqc = dqc ? 0 : 1;
            }
             else if( ch == "\'" ){
                sqc = sqc ? 0 : 1;
            }
            else if( ch == "=" && !inFn && inDec && !inStr ){ //checking to see if we are in an assignment for a variable
                inAssign = true;
				if( newVar ){
                    res.push( newVar );
                    newVar = "";
                }
                continue;
            }
            if( sqc || dqc ){ //checking to see if we are inside of a string
                inStr = true;
            }
            else{
                inStr = false;
            }

            if( inFn || inStr ) continue; //ignoring function and strings
            if( !inLoop && pc) continue; // ignoring function parameters: someFunc(a,b);
            
            if( !inDec && ch == 'v' ){
                //checking if we found a var decleration
                if( (i == 0 && i < len-4 && code.charAt(i+1) == 'a' && code.charAt(i+2) == 'r' && this._isWhiteSpace(code.charAt(i+3)) ) ||
                    ( (this._isWhiteSpace(code.charAt(i-1))|| code.charAt(i-1)== '{' || code.charAt(i-1)== '(') && i < len -4 && code.charAt(i+1) == 'a' && code.charAt(i+2) == 'r' && this._isWhiteSpace(code.charAt(i+3) )) ){

                    inDec = true;
                    i += 3;
                }
            }
            else if( inDec ){ //if we already in a var decleration segment
                if( ch == ","  ){
                   if( newVar ){
                    res.push( newVar );
                    newVar = "";
                   }
                   inAssign = false;
                }
                else if( ch == ' ' && inLoop ){                    
                    if( newVar ){
                        res.push( newVar );
                        newVar = "";
                    }					
                    if( i < len-3 && code.charAt(i+1) == 'i' && code.charAt(i+2) == 'n' && code.charAt(i+3) == ' '){
                        var t=1;
						inDec = false;
                        inAssign = false;
                    }
                }
                else if( ch == ';' ){
                    if( newVar ){
                        res.push( newVar );
                        newVar = "";
                    }
                    inDec = false;
                    inAssign = false;
                }
                else if( ch == 'i' && i<len-3 && code.charAt(i+1) == "n" && this._isWhiteSpace(code.charAt(i+2) ) ){
                    if( newVar ){
                        res.push( newVar );
                        newVar = "";
                    }
                    inDec = false;
                }
                else if( !this._isWhiteSpace(ch) && !inAssign  ){
                    newVar += ch;
                }
            }
        }
        return res;
	},
	
	/**
	 * @private
	 * @description add the current char to the working chtml
	 */
	_addToCurrent: function(current,state,res,str){
		if( current == "chtml" ) {
			res.chtml += str;
		}
		else{
			res.ctags[current][state] += str;
		}
	},
	
	/**
	 * @private
	 * @description gets the current ctag type
	 */
	_getCtagType: function(t,i){
		if( t.charAt(i) == "=" ) return "assign";
		if( t.charAt(i).toUpperCase() == "I" ) return "if";
		if( t.charAt(i).toUpperCase() == "L" ) return "loop";
		if( t.charAt(i).toUpperCase() == "E" ){
			if( i < t.length - 2 ){
				if( t.charAt(i+1).toUpperCase() == "L" ) return "else";
				if( t.charAt(i+1).toUpperCase() == "N" ){
					if( i < t.length - 4 ){
						if( t.charAt(i+3).toUpperCase() == "I" ) return "endif";
						if( t.charAt(i+3).toUpperCase() == "L" ) return "endloop";
					}
				}
			}
		}
		return "code";
	},
	
	/**
	 * @private
	 * @description return a default ctag object
	 */
	_getNewCtag: function(type){
		return {
			type:type,
			code:"",
			chtml1:"",
			chtml2:"",
			vars: []
		};
	}

};