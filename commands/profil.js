const Discord = require('discord.js');
const fs = require("fs")

function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

module.exports = {
    run: async (interaction, client, options, config, connection) => {

        if(options._hoistedOptions[0]) args = options._hoistedOptions[0].value
        else args = interaction.user.id

        connection.query("SELECT * FROM players WHERE id = " + args + " ;", async function(err, results, fields) {
                
            if(!err) {

                if(results.length < 1) return interaction.reply({
                    content: `Vous n'avez pas encore commencé votre partie. Faites la commande /start pour la commencer.`,
                    ephemeral: true
                })

                var Profil = results[0]

                var embed = new Discord.MessageEmbed()
                .setTitle(`Profil de ${Profil.tag}`)
                .setDescription(`#${Profil.classement} dans le classement\n\nPièces: ${Profil.pieces}${config.emojis.piece}\nPoints: ${Profil.points}${config.emojis.xp}\nPlus d'infos ici : [clique](http://${config.ip}/profil.php?id=${encodeURIComponent(Profil.tag)})`)
                .setColor("#00ddff")
                
                interaction.reply({
                    embeds: [embed],
                    ephemeral: false
                })
    
            } else {

                console.log(err)
                
            }

        })

    },
    name: "profil",
    desc: "Affiche le profil d'un joueur choisi.",
    arguments: 1,
    args: [
        {
            name: "joueur",
            description: `Joueur dont vous souhaitez voir le profil.`,
            type: Discord.Constants.ApplicationCommandOptionTypes.USER
        }
    ]
}