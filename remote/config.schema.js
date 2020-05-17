const fs = require('fs');
const {resolve} = require('path')
const {exec} = require('child_process')
const pluginDir = resolve('./plugins');

// translation debug
const tdebug=false
//TODO get general schema, then plugin schema

function getConfigSchema(language, cb) {
	// get the configured language translation file (built before this process is started)
	let currentLangInfo=JSON.parse(fs.readFileSync("app/locales/"+language.substring(0,2)+"c.json"))
	let configSchema = { schema: {}, form: [], value: {} };
	exec("arecord -l | grep -w 'card'", function (arecerr, stdout) {
		fs.readdir(pluginDir, function (err, files) {
			let l = files.length;
			for (var index = 0; index < files.length; ++index) {
				var file = files[index];
				if (file[0] !== '.') {
					var filePath = pluginDir + '/' + file + '/config.schema.json';
					fs.readFile(filePath, 'utf8',  (err, data) => {
						--l;
						if (!err) {              
							try {
								let pluginConfigSchema = JSON.parse(data);            
								try {
									if(tdebug)
										console.log("schema config found language="+language+" plugin="+ Object.keys(pluginConfigSchema.schema)[0])
									let pm = Object.keys(pluginConfigSchema.schema)[0]
									translateForm(pm, pluginConfigSchema,currentLangInfo)
									if(tdebug)
										console.log("updated schema="+JSON.stringify(pluginConfigSchema))
								}
								catch(error){
									console.log("unable to translate form for plugin "+filePath)
								}

								if (pluginConfigSchema.schema.speech && !arecerr) {
									getAudioDevices(pluginConfigSchema, stdout)
								}
								Object.assign(configSchema.schema, pluginConfigSchema.schema)
								if(tdebug)
									console.log("output schema is "+JSON.stringify(configSchema))
								if (pluginConfigSchema.form) { configSchema.form = configSchema.form.concat(pluginConfigSchema.form) }
								if (pluginConfigSchema.value) { Object.assign(configSchema.value, pluginConfigSchema.value) }
							}
							catch (error) {
								console.log("error ="+ error +" plugin="+file +"\n json ="+data)
							}
						}
						if(!l && tdebug)
							console.log("completed schema="+JSON.stringify(configSchema))	
						!l && cb(configSchema)
					});
				}
			}
		});
	});
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
		if(typeof value == 'object')
			translateForm(pn, value, formdata)
		else{ 
			if(tdebug)
				console.log("checking "+key+" to be translatable")
			switch(key){
			// what fields will we translate?
			case 'title':
			case 'description':
			case 'helpvalue':
			case 'legend':
				// our value field is {{string}}
				if(value.startsWith("{{") && value.endsWith("}}")) {
					// extract the translation key string
					let datakey=value.substring(2,value.length-2)
					if(tdebug)
						console.log("translating for plugin "+pn+" item="+key+ " for value="+datakey)	
					try {
						if(tdebug)
							console.log("pn language data ="+JSON.stringify(formdata[pn]['config'][datakey]))			
						// save the translated value over the lookup
						items[key]=formdata[pn]['config'][datakey]
					}
					catch(error){
						console.log(" language file lookup error="+error)
					}
				} 
				else {
					if(tdebug)
						console.log("NOT translating for plugin"+pn+" item="+key+ " for value="+value)
				}
			}
		}	
	}	
}

module.exports = getConfigSchema