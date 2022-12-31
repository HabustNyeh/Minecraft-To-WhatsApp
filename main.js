require('./config')

function clockString(ms) {
    let days = Math.floor(ms / (24 * 60 * 60 * 1000));
    let daysms = ms % (24 * 60 * 60 * 1000);
    let hours = Math.floor((daysms) / (60 * 60 * 1000));
    let hoursms = ms % (60 * 60 * 1000);
    let minutes = Math.floor((hoursms) / (60 * 1000));
    let minutesms = ms % (60 * 1000);
    let sec = Math.floor((minutesms) / (1000));
    return days + " Hari " + hours + " Jam " + minutes + " Menit " + sec + " Detik ";
}

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason, 
  MessageRetryMap, 
  fetchLatestBaileysVersion,
  isJidBroadcast,
  jidDecode
} = require('@adiwajshing/baileys')
const WebSocket = require('ws')
const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const P = require('pino')
const PhoneNumber = require('awesome-phonenumber')
let logger = P({ timestamp: () => `"time":"${(global.getDate()).toJSON()}"` })
logger.level = 'trace'
const os = require('os')
let config
global.timestamp = {
	start: getDate()
}

const msgRetryCounterMap = MessageRetryMap => { }

global.authFolder = 'session_bot'

async function starts(){
	function sleep(s){
		const date = global.getDate().getTime()
		let myDate = global.getDate().getTime()
		s = s*1000
		do {
			myDate = global.getDate().getTime() 
		} while (myDate - date < s) 
	} 
	
	const { state, saveCreds } = await useMultiFileAuthState(global.authFolder)
	let { version } = await fetchLatestBaileysVersion()
	
	config = { 
		version: version,
		printQRInTerminal: true,
		auth: state,
		//shouldIgnoreJid: jid => isJidBroadcast(jid),
		receivedPendingNotifications: false,
		syncFullHistory: false,
		generateHighQualityLinkPreview: true,
		shouldProcessHistoryMsg: false, 
		markOnlineOnConnect: true, 
		msgRetryCounterMap
	}
	
	global.conn = await makeWASocket(config)
	global.sleep = sleep
	
	global.conn.reply = (grup, msg, reply = null) => {
		global.conn.sendMessage(grup, { text: msg }, { quoted: reply});
	}
	
	global.conn.chats = {}
    global.conn.contacts = {}
	
	global.conn.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            jid = decode.user + '@' + decode.server
            return decode.user && decode.server && jid
        } else return jid
    }
    
	if(typeof conn.user.jid == 'undefined') global.conn.user.jid = await conn.decodeJid(conn.user.id) 
	if(typeof conn.user.name == 'undefined') global.conn.user.name = conn.getName(conn.user.jid)
	
	global.conn.getName = (jid, withoutContact = false) => {
    	
        jid = conn.decodeJid(jid)
        withoutContact = this.withoutContact || withoutContact
        let v
        if (jid.endsWith('@g.us')) {
            v = conn.contacts[jid] || {}
            if (!(v.name || v.subject)) v = conn.groupMetadata(jid).then((data) => { return data }) || {}
            return (v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
        }
        else v = jid === '0@s.whatsapp.net' ? {
            jid,
            vname: 'WhatsApp'
        } : jid === conn.user.jid ?
            conn.user :
            (conn.contacts[jid] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
	
	async function status() {
		 conn.updateProfileStatus(`${botname} | Runtime: ${clockString(process.uptime() * 1000)}`)
	}
	setTimeout(status, 10000)
	setInterval(status, 10000)
	try {
		global.conn.connectionUpdate = connectionUpdate.bind(global.conn)
		global.conn.credsUpdate = saveCreds.bind(global.conn)
		global.conn.onGetMessage = onGetMessage.bind(global.conn)
	} catch (e) {
		console.log(e)
	}
	await reloadHandler() 
	
	listener(true)
	setTimeout(()=> { conn.reply(botstaffgrup,'Listening on 9090') }, 5000)
}

const decodeSocket = (msg) => {
	let _msg = msg.split('.|.')
	return { __msg: _msg[1], grup: _msg[0] }
}

const listener = (type) => {
	let conn = global.conn
	require('net').createServer(socket => {
		socket.on('data', (msg) => {
			msg = msg.toString('utf8')
			let { __msg, grup } = decodeSocket(msg)
			grup = Group.getGrup(grup)
			if(grup != null){
				conn.reply(grup, __msg)
			} else {
				console.log(msg)
			}
		})
	}).listen(9090, 'localhost');
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect } = update
  global.timestamp.connect = new Date
  if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut && global.conn.ws.readyState !== WebSocket.CONNECTING) {
  	console.log(connection + ' : ' + lastDisconnect.error) 
  	console.log(await reloadHandler(true, true)) 
  }
}

const event = (type) => {
	let conn = global.conn
	if(!type){
		conn.ev.off('messages.upsert', conn.onGetMessage)
		conn.ev.off('creds.update', conn.credsUpdate)
		conn.ev.off('connection.update', conn.connectionUpdate)
	} else if(type){
		conn.ev.on('creds.update', conn.credsUpdate)
		conn.ev.on('connection.update', conn.connectionUpdate)
		conn.ev.on('messages.upsert', conn.onGetMessage)
	}
	global.conn = conn
}


process.on('uncaughtException', console.error)
// let strQuot = /(["'])(?:(?=(\\?))\2.)*?\1/

let isInit = true
global.reloadHandler = async(restatConn, forced) => {
  if (restatConn) {
  	let timer = setTimeout(()=> { console.log('ERROR') }, 5000) 
    try { 
    	if(global.conn.ws.readyState == 1 || forced){
    	    await global.conn.ws.close()
            global.conn = {
                ...global.conn, ...await makeWASocket(config)
            }
        }
    } catch(e) {  console.log(e) }
    finally { clearTimeout(timer) }
  }
  if (!isInit || restatConn) {
  	await event(false)
  }
  await event(true)
  isInit = false
  return true
}

const decodeMsg = (m) => {
	if(typeof m.key.participant == 'undefined') m.key.participant = m.participant
	if(m.key.fromMe) m.key.participant = conn.user.jid
	m.sender = conn.decodeJid(m.key.participant) 
	m.chat = m.key.remoteJid
	if(m.message){
        m.msg = m.message[Object.keys(m.message)[0]]
        if(m.msg.text){
        	m.text = m.msg.text
        } else {
        	m.text = m.msg
        }
        m.contextInfo = m.msg.contextInfo || {}
        m.mentionedJid = m.contextInfo.mentionedJid || []
    }
    return m
}

global.readonly = false

const onGetMessage = (chatUpdate) => {
	let m = chatUpdate.messages[0]
	m = decodeMsg(m)
	
	if(m.text){
		try{
			if(!readonly){
				if(m.text.includes(prefix) && owner.includes(m.sender.split('@s.whatsapp.net')[0])){
					let text = m.text.split(prefix)[1]
					if(text == 'readonly'){
						global.readonly = true
					} else if(text == 'sendmsg'){
						global.readonly = false
					} else if(text == 'chat'){
						global.conn.reply(m.chat, m.chat, m)
					}
				}
			}
		} catch(e) {
			console.log(e) 
		}
	}
	
	require('./print')(m, global.conn);
}

starts()
