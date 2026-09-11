# Contributing to the Smart Mirror

Everybody is invited and welcome to contribute to the Smart Mirror. There is a lot to do...if you are not a developer perhaps you would like to help with the documentation on [smart-mirror.io](http://smart-mirror.io/)? If you are a developer and have a feature/capability you'd like to see, why not spent a couple of hours and help build it? 

The process is straight-forward.

 - Fork Smart Mirror [git repository](https://github.com/evancohen/smart-mirror).
 - Write the code for your feature/capability.
 - Create a Pull Request against the [**dev**](https://github.com/evancohen/smart-mirror/tree/dev) branch of the Smart Mirror.

GitHub Actions checks pushes and pull requests with two jobs:

- **Install application** preserves Travis's Node.js 14 runtime, installs the
  native build prerequisites, and runs the full `npm install` (including native
  dependency builds, Bower, and JSONForm setup), followed by `npm test`.
- **ESLint** runs `npm test` independently on Node.js 24, installing only the
  ESLint version declared in `package.json` so lint feedback is available even
  if a legacy application dependency fails to install.

CI does not launch the mirror or validate Raspberry Pi hardware support. After
installing the app's dependencies locally, run the lint check with `npm test`.
