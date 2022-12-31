let { WAMessageStubType } = require('@adiwajshing/baileys')
let urlRegex = require('url-regex-safe')({ strict: false })
let PhoneNumber = require('awesome-phonenumber')
let chalk = require('chalk')
let fs = require('fs')
let s, detik

module.exports = async function (m, conn = { user: {} }) {
  let _name = await conn.getName(m.sender)
  let sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (m.pushName ? ' ~' + m.pushName : ' ~' + _name) 
  let chat = await conn.getName(m.chat)
  let text = ''
  if(m.mentionedJid) {
  	for(let i=0; i<m.mentionedJid.length;i++){
  	    m.text.replaceAll('@'+m.mentionedJid[i].split('@')[0], await conn.getName(m.mentionedJid[i])) 
      }
  }
  text = m.text
  
  let me = PhoneNumber('+' + (conn.user && conn.user.jid).replace('@s.whatsapp.net', '')).getNumber('international')
  console.log(`
${chalk.black(chalk.bgYellow('%s'))} ${chalk.redBright('%s')}
${chalk.blueBright('From')} ${chalk.green('%s')} ${chalk.blueBright('On')} ${chalk.black(chalk.bgGreen('%s'))}
${chalk.yellow('%s')}`,
    (m.messageTimestamp ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp)) : new Date).toTimeString(),
    me + ' ~' + conn.user.name,
    sender,
    m.chat + (chat ? ' ~' + chat : ''),
    text.trim()
  )
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'lib/print.js'"))
  delete require.cache[file]
})