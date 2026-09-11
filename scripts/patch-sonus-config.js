// Sonus declares TypeScript >=5.5 but still uses an option removed in 5.5.
// Apply this compatibility fix before running its native/TypeScript build.
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../node_modules/sonus/tsconfig.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (!config.compilerOptions) {
    throw new Error('Sonus tsconfig.json is missing compilerOptions');
}
if (Object.prototype.hasOwnProperty.call(config.compilerOptions, 'suppressImplicitAnyIndexErrors')) {
    delete config.compilerOptions.suppressImplicitAnyIndexErrors;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}
