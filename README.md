# Use Less. Do More.
...Or Yet Another Useless JavaScript Library 

Was cut violently from a recent project of mine. It does not even compile, totally lacks documentation and pretty useless for now. Hence the name.

**::)**

Some code is formatted using tabs with tab width set to 4. GitHub does not allow to change tab size for repository viewer, so be prepared for creeped formatting when viewing the code via browser. Will fix that in future.

##Installing as NPM module

Copy `useless` folder to `node_modules` subfolder of your project. In this case the whole library will load as source which you can browse and/or edit. Edits are welcome!

##Installing as pre-built monolithic script

If you want to use only platform-independent part of the library, go to `build` folder and pick `useless.js`. This one is ready to be included to either server or client side.

For minified version (with unit tests stripped) pick `useless.min.js`. This one is ready to be used in production setup.

##Building

Build command:

`node build.js <header-file> <output-folder>`

For building useless.js, run `node build.js useless ./build`. It will compile `useless.js` in root directory to `./build/useless.js`, and also will generate minified version `./build/useless.min.js` via Google Closure Compiler. There will be also intermediate file `./build/useless.stripped.js` with unit tests and comments stripped.

To make reduced version (with some submodules disabled), you can make your own version of `useless.js` file, commenting out unneeded `$include` directives. And then running build command to compile it.


