const { profileEnd } = require('console');
const Discord = require('discord.js');
const fs = require("fs")

module.exports = {
    run: async (interaction, client, options, config, connection) => {

        connection.query("SELECT * FROM players WHERE id = " + interaction.user.id + " ;", async function(err, results, fields) {
                
            if(!err) {

                if(results.length < 1) return interaction.reply({
                    content: `Vous n'avez pas encore commencé votre partie. Faites la commande /start pour la commencer.`,
                    ephemeral: true
                })

                var Profil = results[0]

                Profil.liste_cartes = JSON.parse(Profil.liste_cartes)
                Profil.cartes = JSON.parse(Profil.cartes)
                
                var carte = options._hoistedOptions[0].value.replace(/ /g, "")

                if(!fs.existsSync(`./cartes/${carte}.json`)) return interaction.reply({
                    content: "La carte `" + carte + "` n'est pas éligible à la forge.",
                    ephemeral: true
                })
    
                if(carte[0]/1 > 4) return interaction.reply({
                    content: "Il est impossible de forger une carte de plus de 4 étoiles.",
                    ephemeral: true
                })
    
                var rarety = [50, 100, 500, 2000]
                var liste_points = {
                    "": [5, 10, 25, 80],
                    "g": [50, 75, 100, 185]
                }

                var poudre_a_avoir = String(rarety[carte[0]/1-1] - Profil.poudre)
    
                if(Profil.poudre < rarety[carte[0]/1-1]) return interaction.reply({
                    content: "Il vous manque " + poudre_a_avoir + config.emojis.poudre + " pour forger la carte `" + carte + "`.",
                    ephemeral: true
                })
    
                var carte_sans_g = carte.replace("g",  "")
    
                if(!Profil.cartes[`${carte}`]) {
    
                    Profil.cartes[`${carte}`] = 1
                    Profil.points = Profil.points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
    
                }
                else Profil.cartes[`${carte}`] = Profil.cartes[`${carte}`] + 1
    
                Profil.poudre  = Profil.poudre - rarety[carte[0]/1-1]
    
                Profil.hebdo_cartes_forgees = Profil.hebdo_cartes_forgees + 1
                
                Profil.tag = interaction.user.tag

                Profil.liste_cartes = JSON.stringify(Profil.liste_cartes)
                Profil.cartes = JSON.stringify(Profil.cartes)

                connection.query("UPDATE players SET `tag` = '" + interaction.user.tag + "', `cartes` = '" + Profil.cartes + "', `liste_cartes` = '" + Profil.liste_cartes + "', `poudre` = '" + Profil.poudre + "', `hebdo_cartes_forgees` = '" + Profil.hebdo_cartes_forgees + "' WHERE `players`.`id` = " + interaction.user.id + ";", function(err, results, fields) {
                
                    if(!err) {
        
                        interaction.reply({
                            content: "<@" + interaction.user.id + "> a forgé la carte `" + carte + "` pour " + rarety[carte[0]/1-1] + config.emojis.poudre + ".",
                            files: [{
                                attachment: `./img/cartes/${carte}.png`,
                                name: `${carte}.jpg`,
                                description: `Carte qui vient d'être craftée.`
                              }]
                        })
        
                    } else {
                        console.log(err)
                    }
        
                })
    
            } else {

                console.log(err)
                
            }

        })

    },
    name: "forger",
    desc: "Forge une carte à partir de poudre.",
    arguments: 1,
    args: [
        {
            name: "carte",
            description: `Les cartes à créer.`,
            required: true,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ]
}