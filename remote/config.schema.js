const fs = require('fs');
const {resolve} = require('path')
const {exec} = require('child_process')
const pluginDir = resolve('./plugins');

//TODO get general schema, then plugin schema

function getConfigSchema(cb) {
	let configSchema = { schema: {}, form: [], value: {} };
	fs.readdir(pluginDir, function (err, files) {
		let l = files.length - 1;
		for (var index = 0; index < files.length; ++index) {
			var file = files[index];
			if (file[0] !== '.') {
				var filePath = pluginDir + '/' + file + '/config.schema.json';
				fs.readFile(filePath, 'utf8', function(err, data) {
					--l;
					if (!err) {
						let pluginConfigSchema = JSON.parse(data);
						if (file="speech") {
							getAudioDevices (pluginConfigSchema)
						}
						Object.assign(configSchema.schema, pluginConfigSchema.schema)
						if (pluginConfigSchema.form){configSchema.form = configSchema.form.concat(pluginConfigSchema.form)}
						if (pluginConfigSchema.value){Object.assign(configSchema.value,pluginConfigSchema.value)}
					}
					!l && cb (configSchema)
				});
			}
		}
	});
}
function getAudioDevices(obj) {
	exec("arecord -l | grep -w 'card'", function (err, stdout) {
		if (!err) {
			var devOut = []
			stdout.split("\n").forEach(function (option) {
				let hwID = 'hw:'+ option.match(/\d+(?=\:)/g).join(',')
				let desc = option.match(/(?:\:)[a-zA-Z\[\]\d ]+/g).join(' ').replace(": ", "")
				devOut.push({ hwID, desc })
			})
			devOut.forEach(function (dataItm) {
				formObject.schema.speech.properties.device.enum.push(dataItm.hwID)
				formObject.form.forEach(function (formItm) {
					if (formItm.key == mode) {
						formItm.titleMap[dataItm.hwID]=dataItm.desc
					}
				})
			})
		}
	})
}


module.exports = getConfigSchema