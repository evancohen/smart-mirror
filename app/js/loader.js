
const fs = require('fs');
var pos = require('./plugin_positions.js')()
const cheerio = require('cheerio')

const new_file = 'main_index.html';
const plugin_folder_name ='plugins';
const debug = false;

var loader = {};
var locations={};

var content=[]
var services=[]
var controllers=[]
var css=[]

if(debug) {console.log(" in plugin loader")}
// get files in path that match filter (if specified)
function getFiles (dir,	filter, files_){
	files_ = files_ || [];
	var files = fs.readdirSync(dir);
	for (var f of files){
		var name = dir + '/' + f;
		if (fs.statSync(name).isDirectory()){
			getFiles(name, filter, files_);
		} else {
			if((!filter || name.endsWith(filter)) && name.indexOf("node_modules") == -1){
				files_.push(name);
			}
		}
	}
	return files_;
}

function loadInfo (){
	content=getFiles(plugin_folder_name,'index.html');
	services=getFiles(plugin_folder_name,'service.js');
	controllers=getFiles(plugin_folder_name,'controller.js');
	css=getFiles(plugin_folder_name,'plugin.css');
}
function setup_services($){

	$('body').append('\n<!--- Services -->\n');
	for(var s of services){
		var ss = "<script src=\""+s+"\"></script>\n"
		$('body').append(ss)
	}
}

function setup_controllers($){
	$('body').append('\n<!--- Controllers -->\n');
	var ss = "<script src=\"app/js/controller.js\"></script>\n"
	$('body').append(ss)
	for(var c of controllers){
		 ss = "<script src=\""+c+"\"></script>\n"
		$('body').append(ss)
	}
}
function setup_css($){
	for(var c of css){
		 ss = "<link rel=\"stylesheet\" href=\""+c+"\"/>\n"
		$('head').append(ss)
	}
}

function findServiceEntry(plugin)
 {
	for (var x of services){
		if(x.indexOf(plugin)>=0){
			if(debug) {console.log("service entry="+x)}
			return x;
		}
	}
	return null
}
function findControllerEntry(plugin)
 {
	for (var x of controllers){
		if(x.indexOf(plugin)>=0){
			return x;
		}
	}
	return null
}

function findCSSEntry(plugin)
 {
	for (var x of css){
		if(x.indexOf(plugin)>=0){
			return x;
		}
	}
	return null
}

 // updates the app index.html with discovered plugin info
loader.loadPluginInfo = function(filename, config){
	 if(debug) {console.log("in loadinfo, config.plugins="+JSON.stringify(config.plugins)); }
	 if(config.plugins === undefined){
		 if(debug){console.log("changing to stock location info");}
		 config.plugins=pos;
	 }
	 // find all the plugins and their files
	 loadInfo();
	 // read the index.html file template, as json object
	 var $= cheerio.load(fs.readFileSync(filename));
	 var id_div = "";

	 // add entries for css to head
	 setup_css($)

	 // add entries for services to body
	 setup_services($)
	 // add entries for controllers to body
	 setup_controllers($)

	 // loop thru all the index.html files found
	 for(var h of content){
		 // get the plugin name
		 if(debug)	{console.log("looking for plugin="+h)}
		 // get the plugin name
		 var plugin = h.substring(h.indexOf("/")+1, h.lastIndexOf("/"))
		 id_div="";
	 if(debug){ console.log("plugin name="+plugin)}

		 // make the html to insert
		 id_div += "\n<div ng-include=\"'"+h+"'\"></div>"

		if(debug){ console.log(" plugin info for "+plugin+"="+id_div)}
		 var d= '';
		 // default position
		 var page_location = 'bottom-center'
		 // was this plugin added
		 var added = false;
		 // loop thru the module position info
		 for(var p of config.plugins){
			 // if the config name is the same as this module
			 if(debug) {console.log(" h entry="+h +	" name="+p.name)}
			 if(h.indexOf(p.name)>=0){
				 // get the area div location
				 page_location = p.area
				 // first time we've seen this area?
				 if(locations[page_location] == undefined){
					 // create object to hold items
					 locations[page_location]={items:[], delayed:[]}
				 }
				 if(debug) {console.log(page_location+" length="+locations[page_location].items.length)}
				 // if the position ordering is 'any'
				 if(p.order =='*') {
					 if(debug) {console.log(" place anywhere")}
					 // append it
					 locations[page_location].delayed.push(id_div)
				 }
				 // if needs to be first
				 else if(p.order == 1){
					 if(debug) {console.log(" place 1st")}
					 // prepend it
					 locations[page_location].items.unshift(id_div)
				 }
				 // has some other position, greater than 1
				 else{
					 // if there are already more than 1 entry
					 if(debug) {console.log(" place in position\n count = "+locations[page_location].items.length +" pos="+p.order)}
					 // if more already than this one
					 if(locations[page_location].items.length> p.order){
						 if(debug) {console.log(" more than 1")}
						 // splice it in where it belongs
						 locations[page_location].items.splice((p.order+0),id_div)
					 } else {
						 if(debug) {console.log(" adding to the end")}
						 // add it to the end
						 locations[page_location].items.push(id_div)
					 }
				 }
				 // indicate added
				 added=true;
				 break
			 }
		 }
		 // if not added (no position info)
		 if(added==false){
			 // locate the default location
			 d=$("div."+page_location)
			 // put this module there
			 // if alresady something in this div
			 // put our stuff in front
			 // length is not updated while we are running
			 d.append(id_div)
			 }
	 }
	 // defered adds because jquery caches the elements til this script ends
	 for(var v of Object.keys(locations)){
		 var d=$("div."+v)
		 for(var e of locations[v].items){
			 if(d.length>0){
				 d.prepend(e)
			 }
			 else{
				d.append(e)
			 }
		 }
		 for(var e of locations[v].delayed){
			 if(d.length>0){
				 d.prepend(e)
			 }
			 else{
				d.append(e)
			 }
		 }
	 }
	 // get the new html
	 var x = $.html();
	 //if(debug) console.log("new html = "+ x)
	 try {
		// write it to the new file
		fs.writeFileSync(new_file, x)
	 }
	catch(error) {
		console.log(error)
	}
	$=''
		// pass back the new file to load
	return '/'+ new_file;
}

module.exports = loader