const Discord = require('discord.js');
const fs = require("fs")

function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

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
                    content: "La carte `" + carte + "` n'est pas éligible à l'enchantement.",
                    ephemeral: true
                })
    
                var rarety = [10, 30, 100, 400, 800]
                var liste_points = {
                    "": [5, 10, 25, 80, 120],
                    "g": [50, 75, 100, 185, 320]
                }
    
                var poudre_a_avoir = String(rarety[carte[0]/1-1] - Profil.poudre_rare)
    
                if(Profil.poudre_rare < rarety[carte[0]/1-1]) return interaction.reply({
                    content: "Il vous manque " + poudre_a_avoir + config.emojis.poudre_rare + " pour enchanter la carte `" + carte + "`.",
                    ephemeral: true
                })
    
                var carte_sans_g = carte.replace("g",  "")
    
                if(!Profil.cartes[`${carte}g`]) {
    
                    Profil.cartes[`${carte}g`] = 1
                    Profil.points = Profil.points + liste_points["g"][carte[0]/1-1]
                    Profil.liste_cartes.push(`${carte}g`)
    
                }
                else Profil.cartes[`${carte}g`] = Profil.cartes[`${carte}g`] + 1
    
                Profil.poudre_rare  = Profil.poudre_rare - rarety[carte[0]/1-1]
    
                Profil.cartes[carte] = Profil.cartes[carte] - 1
                if(Profil.cartes[carte] === 0) Profil.liste_cartes = arrayRemove(Profil.liste_cartes, `${carte}`)
                if(Profil.cartes[carte] === 0) Profil.points = Profil.points - liste_points[""][carte[0]/1-1]
                if(Profil.cartes[carte] === 0) delete Profil.cartes[carte]
    
                Profil.hebdo_cartes_enchantees = Profil.hebdo_cartes_enchantees + 1
                
                Profil.tag = interaction.user.tag

                Profil.liste_cartes = JSON.stringify(Profil.liste_cartes)
                Profil.cartes = JSON.stringify(Profil.cartes)

                connection.query("UPDATE players SET `tag` = '" + interaction.user.tag + "', `cartes` = '" + Profil.cartes + "', `liste_cartes` = '" + Profil.liste_cartes + "', `poudre_rare` = '" + Profil.poudre_rare + "', `hebdo_cartes_enchantees` = '" + Profil.hebdo_cartes_enchantees + "', `points` = '" + Profil.points + "' WHERE `players`.`id` = " + interaction.user.id + ";", function(err, results, fields) {
                
                    if(!err) {
        
                        interaction.reply({
                            content: `<@${interaction.user.id}> vient d'enchanter la carte ` + "`" + carte + "`" + ` !`,
                            files: [{
                                attachment: `./img/cartes/${carte}g.png`,
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
    name: "enchanter",
    desc: "Enchante une carte à partir de poudre dorée.",
    arguments: 1,
    args: [
        {
            name: "carte",
            description: `Les cartes à enchanter.`,
            required: true,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ]
}