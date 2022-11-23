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

                var args = options._hoistedOptions[0].value
                var args = args.replace(/ /g, "").split("+", args.length)

                var points_de_rareté = [5, 20, 100, 400]

                var liste_points = {
                    "": [5, 10, 25, 80, 120],
                    "g": [50, 75, 100, 185, 320]
                }

                var cartes_a_avoir = {}
                var cartes_differentes = []
    
                var poudre_a_donner = 0
                var poudre_rare_a_donner = 0
                
                for (let pas = 0; pas < args.length; pas++) {
    
                    if(!fs.existsSync(`./cartes/${args[pas].replace("g", "")}.json`)) return interaction.reply({
                        content: "La carte `" + args[pas] + "` n'existe pas.",
                        ephemeral: true
                    })
    
                    if(!cartes_differentes.includes(args[pas])) cartes_differentes.push(args[pas])
    
                    if(cartes_a_avoir[args[pas]] > 0) cartes_a_avoir[args[pas]] = cartes_a_avoir[args[pas]] + 1
                    else cartes_a_avoir[args[pas]] = 1
    
                    if(args[pas].endsWith("g")) poudre_rare_a_donner = poudre_rare_a_donner + points_de_rareté[args[pas].split("", args[pas].length)[0]/1-1]
                    else poudre_a_donner = poudre_a_donner + points_de_rareté[args[pas].split("", args[pas].length)[0]/1-1]
    
                }
    
                for (let pas = 0; pas < cartes_differentes.length; pas++) {
    
                    var nombre_de_carte_a_detruire = cartes_a_avoir[cartes_differentes[pas]]
                    var nombre_de_carte_dans_linv = Profil.cartes[cartes_differentes[pas]]
    
                    if(!nombre_de_carte_dans_linv > 0) return interaction.reply({
                        content: "Vous n'avez pas d'exemplaire de la carte `" + args[pas] + "` dans votre inventaire.",
                        ephemeral: true
                    })
    
                    else if (nombre_de_carte_a_detruire > nombre_de_carte_dans_linv) return interaction.reply({
                        content: "Vous n'avez pas assez d'exemplaire de la carte `" + args[pas] + "` dans votre inventaire.",
                        ephemeral: true
                    })
    
                }
    
                for (let pas = 0; pas < cartes_differentes.length; pas++) {
    
                    Profil.cartes[cartes_differentes[pas]] = Profil.cartes[cartes_differentes[pas]] - cartes_a_avoir[args[pas]]
                    if(Profil.cartes[cartes_differentes[pas]] === 0) Profil.liste_cartes = arrayRemove(Profil.liste_cartes, `${cartes_differentes[pas]}`)
                    if(Profil.cartes[cartes_differentes[pas]] === 0 && !cartes_differentes[pas].endsWith("g")) Profil.points = Profil.points - liste_points[""][(cartes_differentes[pas])[0]/1-1]
                    if(Profil.cartes[cartes_differentes[pas]] === 0 && cartes_differentes[pas].endsWith("g")) Profil.points = Profil.points - liste_points["g"][(cartes_differentes[pas])[0]/1-1]
                    if(Profil.cartes[cartes_differentes[pas]] === 0) delete Profil.cartes[cartes_differentes[pas]]
                    
                }
    
                Profil.poudre = Profil.poudre + poudre_a_donner
                Profil.poudre_rare = Profil.poudre_rare + poudre_rare_a_donner
    
                Profil.hebdo_poudre_gagnee = Profil.hebdo_poudre_gagnee + poudre_a_donner
                Profil.hebdo_hebdo_cartes_detruites = Profil.hebdo_hebdo_cartes_detruites + args.length
    
                Profil.tag = interaction.user.tag

                Profil.liste_cartes = JSON.stringify(Profil.liste_cartes)
                Profil.cartes = JSON.stringify(Profil.cartes)

                connection.query("UPDATE players SET `tag` = '" + interaction.user.tag + "', `pieces` = '" + Profil.pieces + "', `cartes` = '" + Profil.cartes + "', `liste_cartes` = '" + Profil.liste_cartes + "', `poudre` = '" + Profil.poudre + "', `poudre_rare` = '" + Profil.poudre_rare + "', `hebdo_poudre_gagnee` = '" + Profil.hebdo_poudre_gagnee + "' WHERE `players`.`id` = " + interaction.user.id + ";", function(err, results, fields) {
                
                    if(!err) {
        
                        interaction.reply({
                            content: `<@${interaction.user.id}> a gagné **${poudre_a_donner}**${config.emojis.poudre} et **${poudre_rare_a_donner}**${config.emojis.poudre_rare} en détruisant ${args.length} cartes.`,
                            ephemeral: false
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
    name: "detruire",
    desc: "Détruit de cartes choisies pour obtenir de la poudre magique.",
    arguments: 1,
    args: [
        {
            name: "cartes",
            description: `Les cartes à détruire, si elles sont plusieurs, mettre en "+" entre elles.`,
            required: true,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ]
}