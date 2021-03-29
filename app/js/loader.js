const fs = require("fs")
//var pos = require('./plugin_positions.js')()
const cheerio = require("cheerio")

const debug = false
const _ = require("lodash")

// new output html filename
const new_file = "main_index.html"
// plugin folder name
const plugin_folder_name = "plugins"
// important plugin files
const controller_name = "controller.js"
const html_name = "index.html"
const service_name = "service.js"
const css_name = "plugin.css"
const locale_name = ".json"

var loader = {}
var locations = {}

var filesList = [
	html_name,
	service_name,
	controller_name,
	css_name,
	locale_name,
]
var pluginFiles = {}
var base_language_files = {}
base_language_files[locale_name] = []

if (debug) {
	console.log(" in plugin loader")
}
function NameinFilter(filters, name) {
	let v = null
	for (let n of filters) {
		if (
			(name.endsWith(n) && !name.endsWith("c" + n)) ||
			(name.endsWith(n) &&
				!name.endsWith("c" + n) &&
				n == locale_name &&
				name.includes("locales/"))
		) {
			v = n
			break
		}
	}
	return v
}
// get files in path that match filters (if specified)
function getFilesMatch(dir, filters, files_) {
	files_ = files_ || {}
	let files = fs.readdirSync(dir)
	for (let f of files) {
		let name = dir + "/" + f
		try {
			if (fs.statSync(name).isDirectory()) {
				// don't scan the plugin node_modules folder
				if (
					name.indexOf("node_modules") == -1 &&
					name.indexOf("bower_components") == -1 &&
					name.indexOf("save") == -1
				) {
					getFilesMatch(name, filters, files_)
				}
			} else {
				// if not a nested node folder
				if (
					name.indexOf("node_modules") == -1 &&
					name.indexOf("schema") == -1
				) {
					// see if this file is one we are interested in
					let key = NameinFilter(filters, name)
					// if so
					if (key) {
						if (debug)
							console.log("saving file found for key=" + key + " name=" + name)
						// save it
						files_[key].push(name)
					}
				}
			}
		} catch (exception) {
			console.log(" exception=" + exception)
		}
	}
	return files_
}

function loadInfo() {
	// build hash table for results, single pass
	pluginFiles = {}
	for (let f of filesList) {
		pluginFiles[f] = []
	}
	if (debug) {
		console.log(" searching for plugin files")
	}
	// only go thru drectory tree once
	pluginFiles = getFilesMatch(plugin_folder_name, filesList, pluginFiles)
	if (debug) {
		console.log("plugin files =" + JSON.stringify(pluginFiles))
	}
	base_language_files = getFilesMatch("app", [locale_name], base_language_files)
}
function insert_services($) {
	$("body").append("\n<!--- Services -->\n")
	for (let s of pluginFiles[service_name]) {
		let ss = '<script src="' + s + '"></script>\n'
		$("body").append(ss)
	}
}

function insert_controllers($) {
	$("body").append("\n<!--- Controllers -->\n")
	let ss = '<script src="app/js/controller.js"></script>\n'
	$("body").append(ss)
	for (let c of pluginFiles[controller_name]) {
		ss = '<script src="' + c + '"></script>\n'
		$("body").append(ss)
	}
}
function insert_css($) {
	for (let c of pluginFiles[css_name]) {
		let ss = '<link rel="stylesheet" href="' + c + '"/>\n'
		$("head").append(ss)
	}
}
// make sure to remove plugin controller, service and css entries too if disabled
function cleanup(plugin_name) {
	var names = [service_name, controller_name, css_name, locale_name]
	var deletelist = []
	// loop thru the differnet sets of files we found
	for (var name of names) {
		// loop thru all the files of a type (service, controllers, ...)
		for (var i in pluginFiles[name]) {
			if (debug)
				console.log(
					"cleanup looking for " + plugin_name + " in " + pluginFiles[name][i]
				)
			// if the saved info matches the disabled plugin
			if (
				pluginFiles[name][i].toLowerCase().includes(plugin_name.toLowerCase())
			) {
				// lets remove it from the list
				// if this is not a locale file
				if (name !== locale_name) {
					if (debug)
						console.log(
							"removing " +
								name +
								" entry for i=" +
								i +
								" " +
								pluginFiles[name][i]
						)
					// we can remove it as we only look at the list once
					// only 1 file of a type by plugin
					pluginFiles[name].splice(i, 1)
					break
				} else {
					// can't delete from the list while we are searching it
					// save index, in reverse order for delete later
					// add new higher number to front of list
					deletelist.unshift(i)
				}
			}
		}
	}
	// if we have stuff to delete, only one plugin at a time
	if (deletelist.length > 0) {
		// do it, depends on changing later in the array before earlier
		// list is highest index to lowest
		for (var d of deletelist) {
			if (debug) console.log("deleteing " + pluginFiles[locale_name][d])
			pluginFiles[locale_name].splice(d, 1)
		}
	}
}

// updates the app index.html with discovered plugin info
loader.loadPluginInfo = function (filename, config) {
	let configDefault = null
	if (config.plugins === undefined) {
		try {
			let path = __dirname + "/../../remote/.config.default.json"
			configDefault = JSON.parse(fs.readFileSync(path, "utf8"))
		} catch (error) {
			console.log("unable to locate default config=" + error)
		}
		config.plugins = configDefault.plugins
		configDefault = null
	}
	if (debug) {
		console.log("in loadinfo, config.plugins=" + JSON.stringify(config.plugins))
	}
	// find all the plugins and their files
	loadInfo()
	// read the index.html file template, as json object
	let $ = cheerio.load(fs.readFileSync(filename))
	let id_div = ""

	// order matters
	let plugin_hash = {}
	// convert array to hash for quick lookup
	config.plugins.forEach((entry) => {
		// make sure the lookup key is lowercase  and leading/trailing spaces removed
		// to avoid user data entry problems
		plugin_hash[entry.name.trim().toLowerCase()] = entry
	})

	// loop thru all the index.html files found
	for (let h of pluginFiles[html_name]) {
		// get the plugin name
		if (debug) {
			console.log("\nlooking for plugin=" + h)
		}
		// get the plugin name
		let plugin_name = h.substring(h.indexOf("/") + 1, h.lastIndexOf("/"))
		id_div = ""
		if (debug) {
			console.log("plugin name=" + plugin_name)
		}

		// make the html to insert
		id_div += "\n<div ng-include=\"'" + h + "'\"></div>"

		if (debug) {
			console.log(" plugin info for " + plugin_name + "=" + id_div + "\n")
		}

		// default position
		let page_location = "bottom-center"
		// was this plugin added
		let added = false
		// get the config info for this plugin,
		let p = plugin_hash[plugin_name.trim().toLowerCase()]
		// if already set or default
		if (p) {
			if (debug) {
				console.log(" h entry=" + h + " name=" + p.name)
			}
			if (p.active == undefined || p.active == true) {
				if (debug) {
					console.log("plugin " + p.name + " is active=" + p.active)
				}
				// get the area div location
				page_location = p.area
				// first time we've seen this area?
				if (locations[page_location] == undefined) {
					// create object to hold items
					locations[page_location] = { items: [], delayed: [] }
				}
				if (debug) {
					console.log(
						page_location + " length=" + locations[page_location].items.length
					)
				}
				// if the position ordering is 'any'
				if (p.order == "*") {
					if (debug) {
						console.log(" place anywhere")
					}
					// append it
					locations[page_location].delayed.push(id_div)
				}
				// if needs to be first
				else if (p.order == 1) {
					if (debug) {
						console.log(" place 1st")
					}
					// prepend it
					locations[page_location].items.unshift(id_div)
				}
				// has some other position, greater than 1
				else {
					// if there are already more than 1 entry
					if (debug) {
						console.log(
							" place in position\n count = " +
								locations[page_location].items.length +
								" pos=" +
								p.order
						)
					}
					// if more already than this one
					if (locations[page_location].items.length >= p.order) {
						if (debug) {
							console.log(" more than 1")
						}
						// splice it in where it belongs
						let insert_index = parseInt(p.order) - 1
						locations[page_location].items.splice(insert_index, 0, id_div)
						if (debug) {
							console.log(
								"insert_index=" +
									insert_index +
									" list=" +
									JSON.stringify(locations[page_location].items)
							)
						}
					} else {
						if (debug) {
							console.log(" adding to the end")
						}
						// add it to the end
						locations[page_location].items.push(id_div)
					}
				}
				// indicate added
				added = true
			} else {
				if (debug) {
					console.log("plugin " + p.name + " is NOT active=" + p.active)
				}
				// make sure not to load plugin's controller or service
				cleanup(p.name)
				added = true
			}
		}

		// if not added (no position info)
		if (added == false) {
			if (debug) {
				console.log("not yet added" + id_div)
			}
			// locate the default location
			let d = $("div." + page_location)
			// put this module there
			if (d) {
				if (page_location !== "bottom-center") d.append(id_div)
				else {
					if (debug) console.log("id_div=" + stringify(d, 1, null, 2))
					d.prepend(id_div)
				}
			} else {
				if (debug) {
					console.log("not yet added, location not found" + id_div)
				}
			}
			// some plugin with index.html file, but not in the config data
			let lnfile =
				__dirname +
				"/app/locales/" +
				config.general.language.trim().substring(0, 2) +
				"c.json"
			if (fs.existsSync(lnfile))
				// remove the language file if it exists, cause rebuild
				fs.unlinkSync(lnfile)
		}
	}
	// defered adds because jquery caches the elements til this script ends
	for (let v of Object.keys(locations)) {
		let d = $("div." + v)
		if (debug) {
			console.log(
				"processing for location=" +
					v +
					" d length=" +
					d.children().length +
					" items=" +
					JSON.stringify(locations[v].items)
			)
		}
		let existing_children = d.children().length
		for (let e of v.indexOf("bottom") < 0 /* && v.indexOf('bottom-center')<0 */
			? locations[v].items
			: locations[v].items.reverse()) {
			if (debug) {
				console.log("item =" + e)
			}
			if (existing_children >= 1) {
				if (v.indexOf("bottom-center") >= 0) {
					d.append(e)
					if (debug) {
						console.log("appending  bottom-center item =" + e)
					}
				} else {
					d.prepend(e)
					if (debug) {
						console.log("prepending  item =" + e)
					}
				}
			} else {
				d.append(e)
				if (debug) {
					console.log("appending  item =" + e)
				}
			}
		}
		for (let e of locations[v].delayed) {
			if (debug) {
				console.log("delayed =" + e)
				console.log("existing_children=" + existing_children)
			}
			if (existing_children > 0) {
				if (v.indexOf("bottom") < 0) {
					if (debug) {
						console.log("appending  item =" + e)
					}
					d.append(e)
				} else {
					if (debug) {
						console.log("prepending  item =" + e)
					}
					d.prepend(e)
				}
			} else {
				if (v.indexOf("bottom") < 0) {
					if (debug) {
						console.log("appending  item =" + e)
					}
					d.append(e)
				} else {
					if (debug) {
						console.log("prepending  item =" + e)
					}
					d.prepend(e)
				}
			}
		}
	}

	function stringify(val, depth, replacer, space) {
		depth = isNaN(+depth) ? 1 : depth
		function _build(key, val, depth, o, a) {
			// (JSON.stringify() has it's own rules, which we respect here by using it for property iteration)
			/* eslint-disable no-mixed-spaces-and-tabs */
			return !val || typeof val != "object"
				? val
				: ((a = Array.isArray(val)),
				  JSON.stringify(val, function (k, v) {
						if (a || depth > 0) {
							if (replacer) v = replacer(k, v)
							if (!k) return (a = Array.isArray(v)), (val = v)
							!o && (o = a ? [] : {})
							o[k] = _build(k, v, a ? depth : depth - 1)
						}
				  }),
				  o || (a ? [] : {}))
			/* eslint-enable no-mixed-spaces-and-tabs */
		}
		return JSON.stringify(_build("", val, depth), null, space)
	}
	// add entries for css to head
	insert_css($)

	// order matters, services must be first, as controllers will use them
	// add entries for services to body
	insert_services($)
	// add entries for controllers to body
	insert_controllers($)
	// get the new html
	let x = $.html()
	//if(debug) console.log("new html = "+ x)
	try {
		// write it to the new  index.html file
		fs.writeFileSync(new_file, x)
	} catch (error) {
		console.log(error)
	}
	// clear html object storage. no longer needed
	$ = ""
	// build the constructed language files
	writeTranslationFiles()
	// clear the data collected about files
	pluginFiles = {}
	// pass back the new file to load
	return "/" + new_file
}
function getfilecontents(file) {
	try {
		var x = fs.readFileSync(file, "utf8")
		var y = x.toString()
		if (y[0] !== "{") return y.substring(1)
		else return y
	} catch (error) {
		return "{}"
	}
}
function writeTranslationFiles() {
	// loop thru the locale files found in app/locales
	// used by the angular translation service, setup in app/js/app.js
	for (var base of base_language_files[locale_name]) {
		// we will construct the final file from the little parts from all the plugins
		// this makes plugins in control of their translation data
		// construct the filename for the constructed locale file (we add a 'c' to the language string)
		// the config in app/js/app.js is expecting 'enc.json', 'dec.json', etc (c = constructed)
		var basefn = base.split("/")
		// get the name and extension from the last filename entry
		// app/locales/en.json ->  [en][json]
		var basename = basefn.slice(-1).toString().split(".")
		// add a 'c' to the lanugage d (en->enc)
		basename[0] += "c"
		// join the name and extension back together
		// reuse the variable
		basename = basename.join(".")
		// get rid of old entry in full name split results
		basefn.pop()
		// add the new name/ext
		basefn.push(basename)
		// reconstruct the filename
		basefn = basefn.join("/")
		// if the file doesn't exist, build it
		// for performance, don't rebuild all the time
		if (!fs.existsSync(basefn)) {
			var base_locale_object = ""
			try {
				if (debug) console.log("processing base locale file=" + base)
				// get the base as an object
				base_locale_object = JSON.parse(getfilecontents(base))
			} catch (error) {
				console.error(
					"unable to parse base locale file=" +
						base +
						" contents=" +
						getfilecontents(base)
				)
				base_locale_object = {}
			}
			if (debug) console.log("processing base locale file=" + base)
			// loop thru the plugin locale file segments we found
			for (var la_file of pluginFiles[locale_name]) {
				// get the file name  (plugins/geolocation/locales/en.json)
				// 'en.json'
				var plugin_lang = la_file.split("/").slice(-1).toString()
				// same for the base translation file
				// en.json
				var base_lang = base.split("/").slice(-1).toString()
				if (debug)
					console.log(
						"comparing l='" + plugin_lang + "' with '" + base_lang + "'=r"
					)
				// if they match (we are woring on the same language part)
				// they are all in the same big list, all the files
				// for disabled plugins have been remnoved from the list by cleanup()
				if (plugin_lang == base_lang) {
					if (debug) console.log("matching language file=" + la_file)
					// get its content, if any
					var plugin_locale_contents = getfilecontents(la_file)
					// if the file is curently empty, skip it
					if (plugin_locale_contents != "") {
						try {
							// don't let a fragment parsing error kill file creation
							// parse the content
							var plugin_locale_object = JSON.parse(plugin_locale_contents)
							// and merge it into combined result
							// Object.assign overlays existing items of the same name, not merge
							// use lodash
							_.merge(base_locale_object, plugin_locale_object)
						} catch (error) {
							console.log(
								" unable to parse " +
									la_file +
									" content=" +
									plugin_locale_contents
							)
						}
					}
				}
			}

			// check for any commands to add to the end of the list, so they don't pollute the what can I say list
			if (base_locale_object.commandsend !== undefined) {
				// add then at the end of the commands list
				for (var f of Object.keys(base_locale_object.commandsend)) {
					base_locale_object.commands[f] = base_locale_object.commandsend[f]
				}
				// remove it from the runtime data
				delete base_locale_object.commandsend
			}
			if (debug)
				console.log(
					"merged data for file=" +
						base +
						"=" +
						JSON.stringify(base_locale_object, null, 2)
				)

			if (debug) console.log(" new base filename=" + basefn)
			// write out the constructed locale file, in readable for for person
			fs.writeFileSync(basefn, JSON.stringify(base_locale_object, null, 2))
		}
	}
}

module.exports = loader
