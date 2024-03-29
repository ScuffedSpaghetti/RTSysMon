## Instructions to setup
1. install a recent version of Node.js(at least version 14.0.0) and npm
2. run `npm install` in client, server and server/webapp
3. run `npm run build` in server/webapp

To automatically build the vue webapp in development mode whenever a change is made run `npm run watch` in server/webapp


## Deploying
* first follow the setup instructions
* to customize configs create a file named local.yaml in the config folders to allow overriding the default config options. Look in the default.yaml files for configurable settings.
* the server can be executed by running `node server.js` in the server directory
* the server address needs to be added to the config of the clients, it is the same as the web address
* once the server address is set, the client can be executed with `node client.js` to get the stats of the machine it is running on
* the the server can be accessed in the browser
* once it is set up it is possible to make it portable by placing a node.js binary with it so that node and npm do not need to be installed on the target system


Optionally, to get cpu power and temperature on supported processors turbostat can be installed and the client needs be run as root. In debian turbostat can be found in the linux-cpupower package, in ubuntu it is in linux-tools-generic.


## Web URL options
Various options can be placed at the very end of the uri after a question mark to configure the web interface. Multiple options can be separated by the ampersand symbol.
EX:  
https://example.com/RTSysMon/#/?dark_mode&auto_cucle=20&auto_scroll
* dark_mode - force the UI to start in dark mode
* light_mode - force the UI to start in light mode
* auto_scroll=[speed] - automatically scroll the page up and down. 
* auto_cycle=[home time,node time] - automatically switch between all nodes at the specified intervals