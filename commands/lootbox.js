const { createCanvas, loadImage } = require("canvas")
const Discord = require('discord.js');
const fs = require("fs")
const parseDuration = require('parse-duration')

module.exports = {
    run: async (interaction, client, options, config, connection) => {

        return interaction.reply({
            content: `Cette commande n'est pas encore active.`,
            ephemeral: true
        })

        connection.query("SELECT * FROM players WHERE id = " + interaction.user.id + " ;", async function(err, results, fields) {
                
            if(!err) {

                if(results.length < 1) return interaction.reply({
                    content: `Vous n'avez pas encore commencé votre partie. Faites la commande /start pour la commencer.`,
                    ephemeral: true
                })

                var Profil = results[0]

                Profil.liste_cartes = JSON.parse(Profil.liste_cartes)
                Profil.cartes = JSON.parse(Profil.cartes)

                if(Profil.pieces < 100) {

                    interaction.reply({
                        content: `Vous n'avez pas assez de pièces pour ouvrir une lootbox.`,
                        ephemeral: true
                    })
    
                } else {
    
                    /*
                    DROP
                    0 Rien
                    1 15 Poudre dorée
                    2 10 Poudre dorée
                    3 10 Poudre
                    4 15 Poudre
                    5 20 Poudre
                    6 Carte 2e
                    7 Carte 3e
                    8 150 pièces
                    9 200 pièces
                    10 Carte 4e
                    11 Carte g2e
                    12 300 pièces
                    13 Carte g3e
                    14 Carte g4e
                    */

                    var liste_points = {
                        "": [5, 10, 25, 80],
                        "g": [50, 75, 100, 185]
                    }

                    var nb_marque = 0
                    var isImage = false
                    var imageName = ""

                    for (let i = 0; i < 14; i++) {

                        if(Math.floor(Math.random() * 4) === 1) nb_marque = nb_marque + 1

                    }

                    if (nb_marque == 0) {

                        txt = `rien du tout, lol.` 

                    } else if (nb_marque == 1) {
                        
                        Profil.poudre_rare = Profil.poudre_rare + 15
                        txt = `**15**${config.emojis.poudre_rare}.`

                    } else if (nb_marque == 2) {

                        Profil.poudre_rare = Profil.poudre_rare + 10
                        txt = `**10**${config.emojis.poudre_rare}.`

                    } else if (nb_marque == 3) {
                    
                        Profil.poudre = Profil.poudre + 10
                        txt = `**10**${config.emojis.poudre}.`
                    
                    } else if (nb_marque == 4) {
                    
                        Profil.poudre = Profil.poudre + 15
                        txt = `**15**${config.emojis.poudre}.`
                    
                    } else if (nb_marque == 5) {
                    
                        Profil.poudre = Profil.poudre + 20
                        txt = `**20**${config.emojis.poudre}.`
                    
                    } else if (nb_marque == 6) {

                        nombre = 2
                    
                        var carte = client.cartes[`${nombre}`][Math.floor(Math.random() * client.cartes[`${nombre}`].length)]
    
                        var carte_sans_g = carte.replace("g",  "")

                        if(!Profil.cartes[`${carte}`]) {
    
                            Profil.cartes[`${carte}`] = 1
                            Profil.points = Profil.points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
    
                        }
                        else Profil.cartes[`${carte}`] = Profil.cartes[`${carte}`] + 1
    
                        if(!Profil.liste_cartes.includes(carte)) Profil.liste_cartes.push(carte)

                        txt = `:`
                        isImage = true
                        imageName = carte
                    
                    } else if (nb_marque == 7) {

                        nombre = 3
                    
                        var carte = client.cartes[`${nombre}`][Math.floor(Math.random() * client.cartes[`${nombre}`].length)]
    
                        var carte_sans_g = carte.replace("g",  "")

                        if(!Profil.cartes[`${carte}`]) {
    
                            Profil.cartes[`${carte}`] = 1
                            Profil.points = Profil.points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
    
                        }
                        else Profil.cartes[`${carte}`] = Profil.cartes[`${carte}`] + 1
    
                        if(!Profil.liste_cartes.includes(carte)) Profil.liste_cartes.push(carte)

                        txt = `:`
                        isImage = true
                        imageName = carte
                    
                    } else if (nb_marque == 8) {

                        Profil.pieces = Profil.pieces + 150
                        txt = `150${config.emojis.piece}.`
                    
                    } else if (nb_marque == 9) {

                        Profil.pieces = Profil.pieces + 200
                        txt = `200${config.emojis.piece}.`
                    
                    } else if (nb_marque == 10) {

                        nombre = 4
                    
                        var carte = client.cartes[`${nombre}`][Math.floor(Math.random() * client.cartes[`${nombre}`].length)]
    
                        var carte_sans_g = carte.replace("g",  "")

                        if(!Profil.cartes[`${carte}`]) {
    
                            Profil.cartes[`${carte}`] = 1
                            Profil.points = Profil.points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
    
                        }
                        else Profil.cartes[`${carte}`] = Profil.cartes[`${carte}`] + 1
    
                        if(!Profil.liste_cartes.includes(carte)) Profil.liste_cartes.push(carte)

                        txt = `:`
                        isImage = true
                        imageName = carte
                    
                    } else if (nb_marque == 11) {

                        nombre = 2
                    
                        var carte = client.cartes[`${nombre}`][Math.floor(Math.random() * client.cartes[`${nombre}`].length)]

                        carte = `${carte}g`

                        var carte_sans_g = carte.replace("g",  "")

                        if(!Profil.cartes[`${carte}`]) {
    
                            Profil.cartes[`${carte}`] = 1
                            Profil.points = Profil.points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
    
                        }
                        else Profil.cartes[`${carte}`] = Profil.cartes[`${carte}`] + 1
    
                        if(!Profil.liste_cartes.includes(carte)) Profil.liste_cartes.push(carte)

                        txt = `:`
                        isImage = true
                        imageName = carte
                    
                    } else if (nb_marque == 12) {

                        Profil.pieces = Profil.pieces + 300
                        txt = `300${config.emojis.piece}.`
                    
                    } else if (nb_marque == 13) {

                        nombre = 3
                    
                        var carte = client.cartes[`${nombre}`][Math.floor(Math.random() * client.cartes[`${nombre}`].length)]

                        carte = `${carte}g`

                        var carte_sans_g = carte.replace("g",  "")

                        if(!Profil.cartes[`${carte}`]) {
    
                            Profil.cartes[`${carte}`] = 1
                            Profil.points = Profil.points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
    
                        }
                        else Profil.cartes[`${carte}`] = Profil.cartes[`${carte}`] + 1
    
                        if(!Profil.liste_cartes.includes(carte)) Profil.liste_cartes.push(carte)

                        txt = `:`
                        isImage = true
                        imageName = carte
                    
                    } else if (nb_marque == 14) {

                        nombre = 4
                    
                        var carte = client.cartes[`${nombre}`][Math.floor(Math.random() * client.cartes[`${nombre}`].length)]

                        carte = `${carte}g`

                        var carte_sans_g = carte.replace("g",  "")
    
                        if(!Profil.cartes[`${carte}`]) {
    
                            Profil.cartes[`${carte}`] = 1
                            Profil.points = Profil.points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
    
                        }
                        else Profil.cartes[`${carte}`] = Profil.cartes[`${carte}`] + 1
    
                        if(!Profil.liste_cartes.includes(carte)) Profil.liste_cartes.push(carte)

                        txt = `:`
                        isImage = true
                        imageName = carte
                    
                    }

                    Profil.pieces = Profil.pieces - 100
    
                    Profil.tag = interaction.user.tag

                    Profil.liste_cartes = JSON.stringify(Profil.liste_cartes)
                    Profil.cartes = JSON.stringify(Profil.cartes)

                    connection.query("UPDATE players SET `tag` = '" + interaction.user.tag + "', `pieces` = '" + Profil.pieces + "', `poudre` = '" + Profil.poudre + "', `poudre_rare` = '" + Profil.poudre_rare + "', `cartes` = '" + Profil.cartes + "', `liste_cartes` = '" + Profil.liste_cartes + "' WHERE `players`.`id` = " + interaction.user.id + ";", function(err, results, fields) {
                
                        if(!err) {

                            if(isImage) {

                                interaction.reply({
                                    content: `<@${interaction.user.id}> ouvre une lootbox et gagne ${txt}`,
                                    files: [{
                                        attachment: `./img/cartes/${carte}.png`,
                                        name: `${carte}.jpg`,
                                        description: `Carte qui vient d'être gagnée grâce à la lootbox.`
                                      }]
                                })

                            } else {

                                interaction.reply({
                                    content: `<@${interaction.user.id}> ouvre une lootbox et gagne ${txt}`
                                })

                            }
        
                        } else {
                            console.log(err)
                        }
        
                    })
    
                }                


            } else {

                console.log(err)
                
            }

        })
    },
    name: "lootbox",
    desc: "Ouvre une lootbox."
}