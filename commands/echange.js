const Discord = require('discord.js');
const fs = require("fs");
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

module.exports = {
    run: async (interaction, client, options, config, connection) => {

        connection.query("SELECT * FROM players WHERE id = " + interaction.user.id + " ;", function(err, results, fields) {

            if(results.length < 1) return interaction.reply({
                content: `Vous n'avez pas encore commencé votre partie. Faites la commande /start pour la commencer.`,
                ephemeral: true
            })

            var Profil = results[0]

            Profil.liste_cartes = JSON.parse(Profil.liste_cartes)
            Profil.cartes = JSON.parse(Profil.cartes)

            var destinataire = options._hoistedOptions[0]
            var ta_carte = options._hoistedOptions[1].value.replace(/ /g, "")
            var sa_carte = options._hoistedOptions[2].value.replace(/ /g, "")

            if(!fs.existsSync(`./cartes/${ta_carte}.json`)) return interaction.reply({
                content: "La carte `" + ta_carte + "` n'existe pas.",
                ephemeral: true
            })

            if(!fs.existsSync(`./cartes/${sa_carte}.json`)) return interaction.reply({
                content: "La carte `" + sa_carte + "` n'existe pas.",
                ephemeral: true
            })

            if(destinataire.user.bot) return interaction.reply({
                content: `Vous ne pouvez pas échanger de cartes avec un bot.`,
                ephemeral: true
            })

            if(destinataire.value === interaction.user.id) return interaction.reply({
                content: `Vous ne pouvez pas échanger de cartes avec vous même.`,
                ephemeral: true
            })

            if(!fs.existsSync(`./players/${destinataire.value}.json`)) return interaction.reply({
                content: `<@${destinataire.value}> n'a pas encore commencé sa partie.`,
                ephemeral: true
            })

            if(!Profil.cartes[ta_carte] > 0) return interaction.reply({
                content: "Vous ne possèdez pas d'exemplaires de la carte `" + ta_carte + "` dans votre inventaire.",
                ephemeral: true
            })

            connection.query("SELECT * FROM players WHERE id = " + destinataire.value + " ;", async function(err, results2, fields) {

                if(results2.length < 1) return interaction.reply({
                    content: `<@${destinataire}> n'a pas encore commencé sa partie.`,
                    ephemeral: true
                })

                var Profil_Destinataire = results2[0]

                Profil_Destinataire.liste_cartes = JSON.parse(Profil_Destinataire.liste_cartes)
                Profil_Destinataire.cartes = JSON.parse(Profil_Destinataire.cartes)

                if(!Profil_Destinataire.cartes[sa_carte] > 0) return interaction.reply({
                    content: "<@" + destinataire.value + "> ne possède pas d'exemplaires de la carte `" + sa_carte + "` dans son inventaire.",
                    ephemeral: true
                })
    
                var jsontacarte = fs.readFileSync(`./cartes/${ta_carte}.json`);
                var tacarte = JSON.parse(jsontacarte);
    
                var jsonsacarte = fs.readFileSync(`./cartes/${sa_carte}.json`);
                var sacarte = JSON.parse(jsonsacarte);
    
                interaction.reply({
                    content: `Votre de demande d'échange a bien été envoyée.`,
                    ephemeral: true
                })
    
                await sleep(5)
                const message_daccord = await client.channels.cache.get(interaction.channelId).send(`<@${destinataire.user.id}>, **${interaction.user.tag}** souhaite t'échanger la carte :\n${config.emojis.etoiles[ta_carte[0]]} **${tacarte.name}** (${ta_carte})\n__*contre*__\n${config.emojis.etoiles[sa_carte[0]]} **${sacarte.name}** (${sa_carte})\nEs-tu d'accord ? (30sec pour accepter)`)
                message_daccord.react("<:oui:956595335206166558>")
    
                connection.query("INSERT INTO `echanges` (`destinataire`, `echangeur`, `carte_destinataire`, `carte_echangeur`, `channel`) VALUES ('" + destinataire.value + "', '" + interaction.user.id + "', '" + sa_carte + "', '" + ta_carte + "', '" + interaction.channelId + "');", function(err, results, fields) {
                
                    if(err) {
    
                        console.log(err)
    
                    }
    
                })

                await sleep(30000)

                connection.query("DELETE FROM echanges WHERE `echanges`.`channel` = " + reaction.message.channelId + " AND `echanges`.`destinataire` = " + user.id + ";", function(err, results, fields) {
            
                    if(err) {

                        console.log(err)

                    } else {

                        message_daccord.edit("**Échange annulé !** (timeout)")

                    }
        
                })

            })
            
        })

    },
    name: "echange",
    desc: "Echange une carte avec un autre joueur.",
    arguments: 1,
    args: [
        {
            name: "destinataire",
            description: `Personne avec qui tu souhaite fairel'échange.`,
            required: true,
            type: Discord.Constants.ApplicationCommandOptionTypes.USER
        },
        {
            name: "ta_carte",
            description: "Carte que tu souhaite donner.",
            required: true,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: "sa_carte",
            description: "Carte que tu souhaite reçevoir.",
            required: true,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ]
}