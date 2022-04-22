const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const wiki = require('../../../storage/wiki.json');

// Old wiki command, this will be removed once the wiki gets an overhaul
module.exports = {
    name: 'wiki',
    usage: '`?wiki <search>` - Figura wiki command.',
    /**
     * 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     */
	 async execute(message, args) {
        const result = search(args);
        if (!result.length) {
            message.channel.send(`Could not find anything about "${args.join(' ')}".`);
        }
        else if(result.length>20){
			message.channel.send(`Too many possible matches. Try adding another keyword.`);
		}
		else{
			var string=""
			for(const entry in result){
				string+=`\n${entry.name??"No Name Provided"}\n\t<${entry.url??"No Url Provided"}>`
			}
            message.channel.send(`Possible matches found:${string}`);
        }
    },
};

/**
 *
 * @param {String[]} argKeywordArray
 */
function search(argKeywordArray) {
	argKeywordArray=argKeywordArray.map(string=>string.toLowerCase())
	var keywordSet=new Set()
	for(const keyword of argKeywordArray){
		for(const w of keyword.split(/[_.\-]+/g)){
			keywordSet.add(w)
		}
	}
	var mostKeywords=[]
	var currentMaximum=0
	for(const entry of wiki){
		var numKeywords=0
		for(const keyword of entry.keywords){
			for (const word of keywordSet){
				if(keyword==word){
					numKeywords++
				}
			}
		}
		if(numKeywords==currentMaximum){
			mostKeywords.push(entry)
		}
		else if(numKeywords>currentMaximum){
			currentMaximum=numKeywords
			mostKeywords=[entry]
		}
	}
	if(currentMaximum==0){return[]}
	var matches=[]
	var currentPriority=0
	for(const entry of mostKeywords){
		if ((entry.priority??0)==currentPriority){
			matches.push(entry)
		}
		else if((entry.priority??0)>currentPriority){
			currentPriority=entry.priority
			matches=[entry]
		}
	}
	return matches
}
