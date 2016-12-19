JSON Form dependencies
======================

This folder contains required and optional dependencies for JSON Form.

Required
--------
- [jQuery](http://jquery.com/) v1.7.2 or above
- [Underscore.js](http://documentcloud.github.com/underscore/) v1.3.3 or above


Optional
--------
The libraries in the ```opt``` subfolder are optional as long as you do not use the feature they enable:
- [JSON Schema Validator](https://github.com/garycourt/JSV) is required to validate sumbitted values against the JSON schema that gave birth to the form. This folder includes a "build" of the validator (basically a merge of its different components scoped to avoid leaking variables to the global context.
- [Bootstrap](http://twitter.github.com/bootstrap/) v2.0.3 or above for styling purpose (JSON Form only uses the ```bootstrap.css``` file)
- [wysihtml5](http://jhollingworth.github.com/bootstrap-wysihtml5/) if the form uses ```wysihtml5``` textarea fields
- [jQuery UI Sortable](http://jqueryui.com/demos/sortable/) v1.8.20 or above for drag-and-drop support within arrays and tabarrays. Note the plugin itself depends on jQuery IU Core, jQuery UI Mouse, and jQuery UI Widget.