const { createCanvas, loadImage } = require("canvas")
const Discord = require('discord.js');
const fs = require("fs")
const parseDuration = require('parse-duration')
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

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

                if(Profil.pieces < 1000) {

                    interaction.reply({
                        content: `Vous n'avez pas assez de pièces pour ouvrir ce paquet.`,
                        ephemeral: true
                    })
    
                } else {
    
                    // Drops :
                    // 1e : 75%
                    // 2e : 19.5%
                    // 3e : 5%
                    // 4e : 0.5%
    
                    // Dimension réelle d'une carte 788px x 1125px +35
                    // Dimension toile d'une carte 284px x 406px
                    // Dimension réelle d'une toile 4440px x 2350px
                    // Dimension toile d'une toile 1598px x 846 px
                    // Espacement entre chaque carte 50px
                    // Division par 2.77
    
                    var canvas = createCanvas(1598, 916)
                    const ctx = canvas.getContext("2d")
    
                    var coordonee_x = 13
                    var coordonee_y = 0
    
                    var liste_rarete = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4]
    
                    var liste_points = {
                        "": [5, 10, 25, 80],
                        "g": [50, 75, 100, 185]
                    }
    
                    liste_cartes = []
    
                    for (let pas = 0; pas < 10; pas++) {
    
                        var nombre = liste_rarete[Math.floor(Math.random() * liste_rarete.length)]
                        var carte = client.cartes[`${nombre}`][Math.floor(Math.random() * client.cartes[`${nombre}`].length)]
    
                        if(Math.floor(Math.random() * 100 + 1) === 1) carte = `${carte}g`
    
                        liste_cartes.push(carte)
    
                    }
    
                    liste_cartes.sort()
                    liste_cartes.reverse()
    
                    for (let pas = 0; pas < 10; pas++) {
    
                        carte = liste_cartes[pas]
    
                        var image = await loadImage(`./img/cartes/${carte}.png`)
                        var logo_new = await loadImage(`./img/nouvelle.png`)
    
                        ctx.drawImage(image, coordonee_x, coordonee_y, 284, 405.4)
    
                        var carte_sans_g = carte.replace("g",  "")
    
                        if(Profil.cartes[`${carte}`] === undefined) ctx.drawImage(logo_new, coordonee_x-13, coordonee_y, 72, 72)
    
                        if(!Profil.cartes[`${carte}`]) {
    
                            Profil.cartes[`${carte}`] = 1
                            Profil.points = Profil.points + liste_points[carte.replace(carte_sans_g, "")][carte[0]/1-1]
    
                        }
                        else Profil.cartes[`${carte}`] = Profil.cartes[`${carte}`] + 1
    
                        if(!Profil.liste_cartes.includes(carte)) Profil.liste_cartes.push(carte)
    
                        coordonee_x = coordonee_x + 320
    
                        if(coordonee_x > 1293) coordonee_y = 442
                        if(coordonee_x > 1293) coordonee_x = 13
    
                    }
    
                    Profil.pieces = Profil.pieces - 1000
    
                    Profil.hebdo_cartes_invoquees = Profil.hebdo_cartes_invoquees + 10
    
                    Profil.tag = interaction.user.tag

                    Profil.liste_cartes = JSON.stringify(Profil.liste_cartes)
                    Profil.cartes = JSON.stringify(Profil.cartes)
                    
                    await sleep(1000)

                    connection.query("UPDATE players SET `tag` = '" + interaction.user.tag + "', `pieces` = '" + Profil.pieces + "', `cartes` = '" + Profil.cartes + "', `liste_cartes` = '" + Profil.liste_cartes + "' WHERE `players`.`id` = " + interaction.user.id + ";", function(err, results, fields) {
                
                        if(!err) {
        
                            interaction.reply({
                                content: `<@${interaction.user.id}>`,
                                files: [{
                                    attachment: canvas.toBuffer(),
                                    name: 'paquet_de_cartes.jpg',
                                    description: 'Un paquet de 10 cartes Ushumon.'
                                  }]
                            })
        
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
    name: "invoquer",
    desc: "Ouvre un paquet de dix cartes."
}