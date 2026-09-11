# Contributing to the Smart Mirror

Everybody is invited and welcome to contribute to the Smart Mirror. There is a lot to do...if you are not a developer perhaps you would like to help with the documentation on [smart-mirror.io](http://smart-mirror.io/)? If you are a developer and have a feature/capability you'd like to see, why not spent a couple of hours and help build it? 

The process is straight-forward.

 - Fork Smart Mirror [git repository](https://github.com/evancohen/smart-mirror).
 - Write the code for your feature/capability.
 - Create a Pull Request against the [**dev**](https://github.com/evancohen/smart-mirror/tree/dev) branch of the Smart Mirror.

GitHub Actions runs `npm test` (ESLint) on pushes and pull requests. CI installs
only the ESLint version declared in `package.json`, using Node.js 24. It does not
install or launch the mirror application, so it does not validate Electron,
native modules, or Raspberry Pi hardware support. After installing the app's
dependencies locally, run the same check with `npm test`.
