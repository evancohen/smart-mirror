const fs = require('fs');
const {resolve} = require('path')
const {exec} = require('child_process')
const pluginDir = resolve('./plugins');


//TODO get general schema, then plugin schema

function getConfigSchema(cb) {
	let configSchema = { schema: {}, form: [], value: {} };
	exec("arecord -l | grep -w 'card'", function (arecerr, stdout) {
		fs.readdir(pluginDir, function (err, files) {
			let l = files.length;
			for (var index = 0; index < files.length; ++index) {
				var file = files[index];
				if (file[0] !== '.') {
					var filePath = pluginDir + '/' + file + '/config.schema.json';
					fs.readFile(filePath, 'utf8', function (err, data) {
						--l;
						if (!err) {
							let pluginConfigSchema = JSON.parse(data);
							if (pluginConfigSchema.schema.speech && !arecerr) {
								getAudioDevices(pluginConfigSchema, stdout)
							}
							Object.assign(configSchema.schema, pluginConfigSchema.schema)
							if (pluginConfigSchema.form) { configSchema.form = configSchema.form.concat(pluginConfigSchema.form) }
							if (pluginConfigSchema.value) { Object.assign(configSchema.value, pluginConfigSchema.value) }
						}
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
			let hwID = 'plughw:' + option.match(/\d+(?=\:)/g).join(',')
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


module.exports = getConfigSchema
