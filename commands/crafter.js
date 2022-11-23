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

                if(!fs.existsSync(`./craft/${carte}.json`)) return interaction.reply({
                    content: "La carte `" + carte + "` n'est pas éligible au craft.",
                    ephemeral: true
                })
    
                var jsonCraft = fs.readFileSync(`./craft/${carte}.json`);
                var Craft = JSON.parse(jsonCraft);
    
                var toutes_les_cartes = {}
                var liste_des_cartes = []
    
                var liste_points = {
                    "": [5, 10, 25, 80, 120],
                    "g": [50, 75, 100, 185, 320]
                }
    
                for (let pas = 0; pas < Craft.recette.length; pas++) {
    
                    if(!toutes_les_cartes[Craft.recette[pas]]) {
    
                        toutes_les_cartes[Craft.recette[pas]] = 1
                        liste_des_cartes.push(Craft.recette[pas])
                    
                    } else toutes_les_cartes[Craft.recette[pas]] = toutes_les_cartes[Craft.recette[pas]] + 1
    
                }
    
                for (let pas = 0; pas < liste_des_cartes.length; pas++) {

                    if(!Profil.cartes[liste_des_cartes[pas]]) return interaction.reply({
                        content: "Vous n'avez pas assez d'exemplaire de la carte `" + liste_des_cartes[pas] + "` dans votre inventaire.",
                        ephemeral: true
                    })
    
                    if (toutes_les_cartes[liste_des_cartes[pas]] > Profil.cartes[liste_des_cartes[pas]]) return interaction.reply({
                        content: "Vous n'avez pas assez d'exemplaire de la carte `" + liste_des_cartes[pas] + "` dans votre inventaire.",
                        ephemeral: true
                    })
    
                }
    
                for (let pas = 0; pas < liste_des_cartes.length; pas++) {
    
                    Profil.cartes[liste_des_cartes[pas]] = Profil.cartes[liste_des_cartes[pas]] - toutes_les_cartes[liste_des_cartes[pas]]
                    if(Profil.cartes[liste_des_cartes[pas]] < 1) Profil.liste_cartes = arrayRemove(Profil.liste_cartes, `${liste_des_cartes[pas]}`)
                    if(Profil.cartes[carte] === 0) Profil.points = Profil.points - liste_points[""][(liste_des_cartes[pas])[0]/1-1]
                    if(Profil.cartes[liste_des_cartes[pas]] < 1) delete Profil.cartes[liste_des_cartes[pas]]
    
                }
    
                carte_sans_g = carte.replace("g", "")
    
                if(Profil.cartes[carte]) Profil.cartes[carte] = Profil.cartes[carte] + 1
                else {
    
                    Profil.cartes[carte] = 1
                    Profil.liste_cartes.push(carte)
                    Profil.points = Profil.points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
                    Profil.mois_points = Profil.mois_points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
    
                }

                Profil.hebdo_cartes_craftees = Profil.hebdo_cartes_craftees + 1
                
                Profil.tag = interaction.user.tag

                Profil.liste_cartes = JSON.stringify(Profil.liste_cartes)
                Profil.cartes = JSON.stringify(Profil.cartes)

                connection.query("UPDATE players SET `tag` = '" + interaction.user.tag + "', `cartes` = '" + Profil.cartes + "', `liste_cartes` = '" + Profil.liste_cartes + "', `hebdo_cartes_craftees` = '" + Profil.hebdo_cartes_craftees + "' WHERE `players`.`id` = " + interaction.user.id + ";", function(err, results, fields) {
                
                    if(!err) {
        
                        interaction.reply({
                            content: `<@${interaction.user.id}> vient de crafter la carte ` + "`" + carte + "`" + ` !`,
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
    name: "crafter",
    desc: "Craft une carte à partir de cartes de fusion.",
    arguments: 1,
    args: [
        {
            name: "carte",
            description: `La carte à crafter.`,
            required: true,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ]
}