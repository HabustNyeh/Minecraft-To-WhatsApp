const process = require('process');
let { spawn } = require('child_process')
let path = require('path')
let fs = require('fs')
let package = require('./package.json')
const CFonts  = require('cfonts')
let chalk = require('chalk') 

function cpon(txt, font){
	CFonts.say(txt, {
		font: font || 'console', 
		align: 'center', 
		gradient: ['blue', 'red']
	})
}

cpon('Minecraft Bot', 'chrome') 
cpon('WhatsApp', 'chrome')
cpon('By: HabustNyeh')

let myGlobal = {}

//myGlobal.setMaintenance = function setMaintenance() {

myGlobal.evLoopStart = function evProcessLoop(args, evP) {
    evP.on('message', data => {
    	console.log('[RECEIVED]', data)
        switch (data) {
        	case 'reset':
                evP.kill()
            break
            case 'uptime':
                evP.send(process.uptime())
            break
        }
    })
    evP.on('exit', code => {
    	console.error('Exited with code:', code)
        //if (code === 0) return
        if(code == null){
        	evP.kill('SIGKILL')
        	myGlobal.start(args);
        } else {
        	fs.watchFile(args, () => {
        	    fs.unwatchFile(args) 
                evP.kill('SIGKILL')
                console.log(chalk.redBright(`Update ${args}`))
                myGlobal.start(args) 
            })
        }
    })
}

/**
 * Start a js file
 * @param {String} file `path/to/file`
 */
myGlobal.start = function start(file) {
  let args = [path.join(__dirname, file), ...process.argv.slice(2)]
  cpon([process.argv[0], ...args].join(' ')) 
  let p = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })
  //myGlobal.setMaintenance()
  myGlobal.evLoopStart(file, p)
  // console.log(p)
}
myGlobal.start('main.js') 