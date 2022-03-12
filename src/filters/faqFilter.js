const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../util/utility');
const DataStorage = require('../util/dataStorage');

const cooldownTime = 10; // minutes
const cooldowns = new Discord.Collection();

/**
 * 
 * @param {Discord.Message} message 
 */
module.exports.filter = async function (message) {
    if (process.env.HELP_CHANNELS.split(',').find(x => x == message.channel.id)) {
        // if sent in a help channel, check for FAQ keywords

        // this is basically a crappy pattern check thing
        // underscores are used as spaces so when adding a pattern using
        // a command it's less pain to program, % character splits the
        // string and therefore acts pretty much as "any characters in between"

        if (!DataStorage.storage.faq) DataStorage.storage.faq = new Map();

        DataStorage.storage.faq.forEach(async (value, key, map) => { // eslint-disable-line no-unused-vars
            let includesAll = true;
            const keywords = key.replaceAll('_', ' ').replaceAll('\\ ', '_').split('%');
            keywords.forEach(keyword => {
                includesAll &= message.content.toLowerCase().includes(keyword);
            });
            // if all keywords are found in the message and there is no cooldown then send the corresponding answer
            if (includesAll) {
                if (cooldowns.has(key) && cooldowns.get(key) > Date.now()) return; // still on cooldown
                cooldowns.set(key, Date.now() + cooldownTime * 1000 * 60); // new cooldown
                cleanCooldowns();
                const sentMessage = await message.channel.send(utility.buildEmbed(value.replaceAll('_', ' ').replaceAll('\\ ', '_').replaceAll('´', '`')));
                sentMessage.createReactionCollector().on('collect', async (reaction, user) => {
                    if (reaction.emoji.name == '❌' && user.id == message.author.id) {
                        sentMessage.delete().catch(console.error);
                    }
                });
            }
        });
    }
};

/**
 * Removes cooldowns for FAQ entries that no longer exist
 */
function cleanCooldowns() {
    if (DataStorage.storage.faq) {
        cooldowns.forEach((value, key, map) => { // eslint-disable-line no-unused-vars
            if (!DataStorage.storage.faq.has(key)) {
                cooldowns.delete(key);
            }
        });
    }
}
