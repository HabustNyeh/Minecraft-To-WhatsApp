global.owner = ['6282181661561'] //your number
global.botname = "" //Bot name
global.botstaffgrup = '' //get with (prefix)chat in grup staff

// Config Whatsapp socket
global.prefix = '/'

global.getDate = function getDateNow(addTime, type) {
	//let date = new Date(Date.now() + 25200000) ?? in vps or UTC WIB
	let date = new Date()
	if(addTime && !isNaN(addTime)) date = new Date(date.getTime() + addTime)
	if(type && (type == 'number' || type == 'time')) return date.getTime()
	return date
}

global.janji = function janji(func, nameFunc, data, i){
	let result
	if(Array.isArray(data)){
		result = func[nameFunc](...data)
		.then((res) => {
			if(i){
				return res[i]
			} else {
				return res
			}
		})
		.catch((err) => {
			return err
		})
	}
	if(typeof data == 'string'){
		result = func[nameFunc](data)
		.then((res) => {
			if(i){
				return res[i]
			} else {
				return res
			}
		})
		.catch((err) => {
			return err
		}) 
	}
	return result
}

global.Group = {
	getGrup(string) {
		string = string.toLowerCase()
		let grup = {
			name: 'id', //name in Minecraft, id group - get with (prefix)chat
		}
		let results = Object.keys(grup).map(v => [v, new RegExp(v, 'gi')]).filter(v => v[1].test(string))
		if (!results.length) return null
		else return grup[results[0][0]]
	}
}
