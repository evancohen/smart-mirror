const fs = require('fs');
const pluginDir = __dirname + '/plugins';

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

module.exports = getConfigSchema