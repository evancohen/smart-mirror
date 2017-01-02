JSON Form Playground
=========

The playground is a one-page application that lets you try out JSON Form. It features all the examples that appear in the documentation, as well as an editor that lets you build on top of them.

For examples to load, the playground must be served over HTTP. There are many ways you can achieve that. Here are two:

1. Using Python's `SimpleHTTPServer` from the root of the JSON Form project:
```bash
python -m SimpleHTTPServer
```
Then open this page in your favorite browser:
[`http://localhost:8000/playground/`](http://localhost:8000/playground/)

2. Using `http-server` node module from the root of the JSON Form project:
```bash
npm install -g http-server
http-server
```
Then open this in page in your favorite browser:
[`http://localhost:8080/playground/`](http://localhost:8080/playground/)

NB: The final `/` in the URL is needed.