const fs = require('fs');
const {resolve} = require('path')
const {exec} = require('child_process')
const pluginDir = resolve('./plugins');

// translation debug
const tdebug=false
//TODO get general schema, then plugin schema

function getConfigSchema(config, cb) {
	// get the configured language translation file (built before this process is started)
	let currentLangInfo=JSON.parse(fs.readFileSync("app/locales/"+config.general.language.substring(0,2)+"c.json"))

	let configSchema = { schema: {}, form: [], value: {} };
	exec("arecord -l | grep -w 'card'", function (arecerr, stdout) {
		fs.readdir(pluginDir, function (err, files) {
			let l = files.length;
			for (var index = 0; index < files.length; ++index) {
				var file = files[index];
				if (file[0] !== '.') {
					// if this plugin is active
					if(isActive(file,config)){
						// read its schema file 					
						var filePath = pluginDir + '/' + file + '/config.schema.json';
						fs.readFile(filePath, 'utf8',  (err, data) => {
							if (!err) {              
								try {
									// get as object
									let pluginConfigSchema = JSON.parse(data);  
									let schemaName = ''          
									try {
										// get the schema name from the file, may not match the plugin name (geolocation plugin schema is geoPosition)
										schemaName = Object.keys(pluginConfigSchema.schema)[0]
										// translate the schema file for remote config
										translateForm(schemaName, pluginConfigSchema,currentLangInfo)
										if(tdebug)
											console.log("updated schema="+JSON.stringify(pluginConfigSchema))
									}
									catch(error){
										console.log("unable to translate form for plugin "+schemaName + " error="+JSON.stringify(error))
									}

									if (pluginConfigSchema.schema.speech && !arecerr) {
										getAudioDevices(pluginConfigSchema, stdout)
									}
									// add the plugin schema to the overall schema
									Object.assign(configSchema.schema, pluginConfigSchema.schema)
									if(tdebug)
										console.log("output schema is "+JSON.stringify(configSchema))
									// add the form part to the form layout
									if (pluginConfigSchema.form) { configSchema.form = configSchema.form.concat(pluginConfigSchema.form) }
									// add the value section (default values)
									if (pluginConfigSchema.value) { Object.assign(configSchema.value, pluginConfigSchema.value) }
								}
								catch (error) {
									console.log("error ="+ error +" plugin="+file +"\n json ="+data)
								}
							}
							--l;	/* this loop is running async, so many at once, 
									 decrement the counter to indicate we have processed one loop of plugins */
							if(!l && tdebug)
								console.log("completed schema="+JSON.stringify(configSchema))	
							// if the counter has gone to zero invoke the callback
							!l && cb(configSchema)
						});
					}
					else{
						--l 	/* this plugin is not active, 
								 but count it as processed so loop control above will finish */
						if(tdebug)
							console.log("plugin="+file+" is marked inactive")
					}	
				}					
			}
		});
	});
}
function isActive(pluginName,config){
	// assume result is true
	// some plugins in folder are not respresented in control data
	let result=true
	// loop thru the plugin config data for the plugins
	// careful some plugins are not listed there, cause they are required 
	// (general, speech, plugin config, remote (this plugin), etc)
	// this is controlled by the default plugin config info in remote/.config.default.json
	// so assumption is we want a module, unless found otherwise
	for(let entry of config.plugins){
		// if this config entry matches the passed in plugin, and the plugin is disabled
		if(entry.name===pluginName && entry.active==false ){
			// indicate so
			result=false;
			// end loop
			break;
		}
	}	
	if(tdebug)
		console.log("returning active status for plugin="+pluginName+"="+result)
	return result
}
function getAudioDevices(obj, stdO) {
	var devOut = []
	stdO.split("\n").forEach(function (option) {
		if (option != "") {
			let hwID = 'plughw:' + option.match(/\d+(?=:)/g).join(',')
			let desc = option.match(/\[(.*?)\]/g).join(' ').replace(": ", "")
			devOut.push({ hwID, desc })
		}
	})
	devOut.forEach(function (dataItm) {
		obj.schema.speech.properties.device.enum = ["default"]
		obj.schema.speech.properties.device.enum.push(dataItm.hwID)
		obj.form[0].items.forEach(function (formItm, formIdx) {
			if (formItm.key == 'speech.device') {
				formItm.titleMap = { default: "Default Device" }
				formItm.titleMap[dataItm.hwID] = dataItm.desc
				obj.form[0].items[formIdx] = formItm
			} 
		})
	})
}
function translateForm(pn, items, formdata){
	if(tdebug)
		console.log("entered="+JSON.stringify(items))
	for(let [key, value] of Object.entries(items)){
		if(tdebug) 
			console.log("type="+typeof value)
		// if this is an object m iterate to the actual text strings we can affect
		if(typeof value == 'object')
			translateForm(pn, value, formdata)
		else{ 
			// have a text string of some sort
			if(tdebug)
				console.log("checking "+key+" to be translatable")
			// we only process some
			switch(key){
			// the fields will we translate
			case 'title':
			case 'description':
			case 'helpvalue':
			case 'legend':
				// our value field is {{string}}
				if(value.startsWith("{{") && value.endsWith("}}")) {
					// extract the translation key string
					let datakey=value.substring(2,value.length-2)	
					// oops the legend allows the same string format, 
					// don't try to translate that
					if(key == 'legend' && datakey=="value"){
						if(tdebug)
							console.log("NOT translating for legend value plugin"+pn+" item="+key+ " for value="+value)
					}
					else{			

						if(tdebug)
							console.log("translating for plugin "+pn+" item="+key+ " for value="+datakey)	
						try {
							if(tdebug)
								console.log("pn language data ="+JSON.stringify(formdata[pn]['config'][datakey]))			
							// save the translated value over the lookup
							// if there is data for this translation key
							if(formdata[pn]['config'][datakey] !== undefined)
								// replace the ({{???}} string with it
								items[key]=formdata[pn]['config'][datakey]
						}
						catch(error){
							console.log(" language file lookup error="+error)
						}
					}				
				} 
				else {
					// had a string value, but no special keyword format found
					if(tdebug)
						console.log("NOT translating for plugin"+pn+" item="+key+ " for value="+value)
				}
			}
		}	
	}	
}

module.exports = getConfigSchema