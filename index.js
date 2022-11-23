const { createCanvas, loadImage, registerFont } = require("canvas")
const { Client, Collection } = require("discord.js");
const fs = require("fs")
const mysql = require("mysql2")
const parseDuration = require('parse-duration')
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

// ../../../../discord/raacos
var jsonconfig = fs.readFileSync(`./config.json`);
const config = JSON.parse(jsonconfig);

const client = new Client({
    intents: 13313
});

const connection = mysql.createConnection({
    host: "localhost",
    user: config.phpmyadmin_user,
    password: config.phpmyadmin_secret,
    database: config.phpmyadmin_db
})

connection.connect(function(err) {
    if(err) throw err
    else console.log(`Connecté à la base de données sous l'id ${connection.threadId}.`)
})

client.commands = new Collection()
client.cartes = {
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": []
}
client.echanges = {}
client.players = {}
client.utilisateurs = []
const liste_points = {
    "": [5, 10, 25, 80],
    "g": [50, 75, 100, 185]
}

client.once("ready", () => {

    const guildId = "956188493468545024"
    const guild = client.guilds.cache.get(guildId)
    let commands

    if(guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    fs.readdir("./commands", (err, files) => {
        if (err) throw err

        files.forEach(file => {
            if(!file.endsWith(".js")) return
            const command = require(`./commands/${file}`)
            if(command.arguments > 0) {

                commands?.create({
                    name: command.name,
                    description: command.desc,
                    options: command.args
                })

            } else {

                commands?.create({
                    name: command.name,
                    description: command.desc
                })

            }
            client.commands.set(command.name, command)
            console.log(`Commande ${command.name} compilée et créée avec succès.`)
        })

        console.log(`Je suis en ligne dans ${client.guilds.cache.size} serveurs.`);

        client.user.setActivity("Ushūmon", { type: "PLAYING" })
        console.log("Status activé avec succès.")

        connection.query("SELECT * FROM `players`;", function(err, results, fields) {
                
            if(err) {

                console.log(err)

            } else {

                results.forEach(result => {
    
                    client.players[result.tag] = {
                        id: result.id,
                        tag: result.tag
                    }
                    client.utilisateurs.push({id: result.id, tag: result.tag})
    
                })
    
                fs.writeFile(`./json/profils.json`, JSON.stringify(client.players), err => {
    
                    if (err) {
        
                        console.log(err)
        
                    } else {
        
                        console.log("Profils enregistrez.")
    
                    } 
    
                })
    
    
                fs.writeFile(`./json/utilisateurs.json`, JSON.stringify(client.utilisateurs), err => {
    
                    if (err) {
    
                        console.log(err)
    
                    }
                    
                })                

            }

        })

        connection.query("SELECT * FROM `players`;", function(err, results, fields) {
                
            if(err) {

                console.log(err)

            } else {

                var tout_les_joueurs = new Map
    
                results.forEach(result => {
        
                    tout_les_joueurs.set(result.id, result.points)
        
                })
    
                var classement = new Map([...tout_les_joueurs.entries()].sort((a, b) => b[1] - a[1]))
    
                let place = 1
    
                classement.forEach((value, key) => {
    
                    connection.query("SELECT * FROM players WHERE id = " + key + " ;", async function(err, results2, fields) {
                
                        if(err) {
                           
                            console.log(err)

                        } else {

                            classement = place
                            place = place + 1

                            connection.query("UPDATE players SET `classement` = '" + classement + "' WHERE `players`.`id` = " + key + ";", function(err, results, fields) {
                
                                if(err) {
                    
                                    console.log(err)
                    
                                }
                    
                            })

                        }
            
                    })
    
                })

            }

        })

    })

});

fs.readdir("./cartes", (err, files) => {
    if (err) throw err
    files.forEach(file => {
        var jsonCarte = fs.readFileSync(`./cartes/${file}`);
        var Carte = JSON.parse(jsonCarte);
        if(Carte.fusion) return
        client.cartes[Carte.rarety].push(Carte.code)
    })
})

client.on("interactionCreate", async (interaction) => {
    if(!interaction.isCommand()) return

    const { commandName, options } = interaction

    const command = client.commands.get(commandName)
    if (!command) return
    command.run(interaction, client, options, config, connection)
})

client.on('messageReactionAdd', (reaction, user) => {
    
    if(user.bot) return

    if(reaction._emoji.id !== "956595335206166558") return

    connection.query("SELECT * FROM echanges WHERE channel = " + reaction.message.channelId + " AND destinataire = " + user.id + ";", function(err, results, fields) {

        if(results.length < 1) return

        var Echange = results[0]

        connection.query("SELECT * FROM players WHERE id = " + Echange.echangeur + " ;", function(err, results, fields) {

            var Profil = results[0]

            Profil.liste_cartes = JSON.parse(Profil.liste_cartes)
            Profil.hebdo_liste_echanges = JSON.parse(Profil.hebdo_liste_echanges)
            Profil.cartes = JSON.parse(Profil.cartes)

            connection.query("SELECT * FROM players WHERE id = " + Echange.destinataire + " ;", async function(err, results2, fields) {

                if(results2.length < 1) return interaction.reply({
                    content: `<@${destinataire}> n'a pas encore commencé sa partie.`,
                    ephemeral: true
                })

                var Profil_Destinataire = results2[0]

                Profil_Destinataire.liste_cartes = JSON.parse(Profil_Destinataire.liste_cartes)
                Profil_Destinataire.hebdo_liste_echanges = JSON.parse(Profil_Destinataire.hebdo_liste_echanges)
                Profil_Destinataire.cartes = JSON.parse(Profil_Destinataire.cartes)
        
                if(Profil.daily_echanges >= 2) return client.channels.cache.get(Echange.channel).send(`<@${Echange.echangeur}> a déjà fait son nombre d'échanges maximal par jour.`)
                if(Profil.hebdo_liste_echanges.includes(Echange.destinataire)) return client.channels.cache.get(Echange.channel).send(`<@${Echange.echangeur}> vous a déjà échangé une carte cette semaine.`)
        
                if(Profil_Destinataire.daily_echanges >= 2) return client.channels.cache.get(Echange.channel).send(`<@${Echange.destinataire}> a déjà fait son nombre d'échanges maximal par jour.`)
                if(Profil_Destinataire.hebdo_liste_echanges.includes(Echange.echangeur)) return client.channels.cache.get(Echange.channel).send(`<@${Echange.echangeur}> vous a déjà échangé une carte cette semaine.`)
        
                if(!Profil.cartes[Echange.carte_echangeur] > 0) return client.channels.cache.get(Echange.channel).send("<@" + Echange.echangeur + "> n'a plus la carte `" + Echange.carte_echangeur + "` dans son inventaire.")
                if(!Profil_Destinataire.cartes[Echange.carte_destinataire] > 0) return client.channels.cache.get(Echange.channel).send("Vous n'avez plus la carte `" + Echange.carte_destinataire + "` dans votre inventaire.")
        
                var carte_destinataire_sans_g = Echange.carte_destinataire.replace("g",  "")
                if(!Profil.cartes[`${Echange.carte_destinataire}`]) {
    
                    Profil.cartes[`${Echange.carte_destinataire}`] = 1
                    Profil.liste_cartes.push(Echange.carte_destinataire)
                    Profil.points = Profil.points + liste_points[Echange.carte_destinataire.replace(carte_destinataire_sans_g, "")][Echange.carte_destinataire[0]/1-1]
    
                }
                else Profil.cartes[`${Echange.carte_destinataire}`] = Profil.cartes[`${Echange.carte_destinataire}`] + 1
        
                Profil.cartes[Echange.carte_echangeur] = Profil.cartes[Echange.carte_echangeur] - 1
                Profil.hebdo_liste_echanges.push(Echange.destinataire)
                Profil.daily_echanges = Profil.daily_echanges + 1
                Profil.hebdo_echanges = Profil.hebdo_echanges + 1

                var carte_echangeur_sans_g = Echange.carte_echangeur.replace("g",  "")
                if(!Profil_Destinataire.cartes[`${Echange.carte_echangeur}`]) {
    
                    Profil_Destinataire.cartes[`${Echange.carte_echangeur}`] = 1
                    Profil_Destinataire.liste_cartes.push(Echange.carte_echangeur)
                    Profil_Destinataire.points = Profil_Destinataire.points + liste_points[Echange.carte_echangeur.replace(carte_echangeur_sans_g, "")][Echange.carte_echangeur[0]/1-1]
    
                }
                else Profil_Destinataire.cartes[`${Echange.carte_echangeur}`] = Profil.cartes[`${Echange.carte_echangeur}`] + 1

                Profil_Destinataire.cartes[Echange.carte_destinataire] = Profil_Destinataire.cartes[Echange.carte_destinataire] - 1
                Profil_Destinataire.hebdo_liste_echanges.push(Echange.echangeur)
                Profil_Destinataire.daily_echanges = Profil_Destinataire.daily_echanges + 1
                Profil_Destinataire.hebdo_echanges = Profil_Destinataire.hebdo_echanges + 1

                if(Profil.cartes[Echange.carte_echangeur] === 0) Profil.liste_cartes = arrayRemove(Profil.liste_cartes, `${Echange.carte_echangeur}`)
                if(Profil.cartes[Echange.carte_echangeur] === 0) delete Profil.cartes[Echange.carte_echangeur]

                if(Profil_Destinataire.cartes[Echange.carte_destinataire] === 0) Profil_Destinataire.liste_cartes = arrayRemove(Profil_Destinataire.liste_cartes, `${Echange.carte_destinataire}`)
                if(Profil_Destinataire.cartes[Echange.carte_destinataire] === 0) delete Profil_Destinataire.cartes[Echange.carte_destinataire]

                Profil.liste_cartes = JSON.stringify(Profil.liste_cartes)
                Profil.hebdo_liste_echanges = JSON.stringify(Profil.hebdo_liste_echanges)
                Profil.cartes = JSON.stringify(Profil.cartes)

                Profil_Destinataire.liste_cartes = JSON.stringify(Profil_Destinataire.liste_cartes)
                Profil_Destinataire.hebdo_liste_echanges = JSON.stringify(Profil_Destinataire.hebdo_liste_echanges)
                Profil_Destinataire.cartes = JSON.stringify(Profil_Destinataire.cartes)

                connection.query("UPDATE players SET `cartes` = '" + Profil.cartes + "', `liste_cartes` = '" + Profil.liste_cartes + "', `hebdo_liste_echanges` = '" + Profil.hebdo_liste_echanges + "', `hebdo_echanges` = '" + Profil.hebdo_echanges + "', `daily_echanges` = '" + Profil.daily_echanges + "' WHERE `players`.`id` = " + Echange.echangeur + ";", function(err, results, fields) {
            
                    if(err) {

                        console.log(err)

                    } else {

                        connection.query("UPDATE players SET `cartes` = '" + Profil_Destinataire.cartes + "', `liste_cartes` = '" + Profil_Destinataire.liste_cartes + "', `hebdo_liste_echanges` = '" + Profil_Destinataire.hebdo_liste_echanges + "', `hebdo_echanges` = '" + Profil_Destinataire.hebdo_echanges + "', `daily_echanges` = '" + Profil_Destinataire.daily_echanges + "' WHERE `players`.`id` = " + Echange.destinataire + ";", function(err, results, fields) {
            
                            if(err) {
        
                                console.log(err)
        
                            } else {

                                client.channels.cache.get(Echange.channel).send(`<@${Echange.echangeur}> <@${Echange.destinataire}>\n**Échange effectué avec succès !**`)

                            }

                            connection.query("DELETE FROM echanges WHERE `echanges`.`channel` = " + reaction.message.channelId + " AND `echanges`.`destinataire` = " + user.id + ";", function(err, results, fields) {
            
                                if(err) {
            
                                    console.log(err)
            
                                }
                    
                            })
                
                        })

                    }
        
                })

            })

        })
        
    })

})

client.on('ready', async () => {

    const duration = parseDuration('5m')

    setInterval( async () => {

        client.players = {}
        client.utilisateurs = []

        fs.readdir("./players", (err, files) => {

            files.forEach(file => {

                var jsonprofil = fs.readFileSync(`./players/${file}`);
                var profil = JSON.parse(jsonprofil);

                client.players[profil.tag] = {
                    id: profil.id,
                    tag: profil.tag
                }
                client.utilisateurs.push({id: profil.id, tag: profil.tag})

            })

            fs.writeFile(`./json/profils.json`, JSON.stringify(client.players), err => {

                if (err) {
    
                    console.log(err)
    
                } else {
    
                    console.log("Profils enregistrez.")

                } 

            })


            fs.writeFile(`./json/utilisateurs.json`, JSON.stringify(client.utilisateurs), err => {

                if (err) {

                    console.log(err)

                }
            })

        })

        await sleep(500)

        connection.query("SELECT * FROM `players`;", function(err, results, fields) {
                
            if(err) {

                console.log(err)

            } else {

                var tout_les_joueurs = new Map
    
                results.forEach(result => {
        
                    tout_les_joueurs.set(result.id, result.points)
        
                })
    
                var classement = new Map([...tout_les_joueurs.entries()].sort((a, b) => b[1] - a[1]))
    
                let place = 1
    
                classement.forEach((value, key) => {
    
                    connection.query("SELECT * FROM players WHERE id = " + key + " ;", async function(err, results2, fields) {
                
                        if(err) {
                           
                            console.log(err)

                        } else {

                            classement = place
                            place = place + 1

                            connection.query("UPDATE players SET `classement` = '" + classement + "' WHERE `players`.`id` = " + key + ";", function(err, results, fields) {
                
                                if(err) {
                    
                                    console.log(err)
                    
                                }
                    
                            })

                        }
            
                    })
    
                })

            }

        })

        console.log("Liste et classement des joueurs mise à jour.")

    }, duration)

})

client.login(config.token);

/*
client.once("ready", async () => {

    fs.readdir("./imgcartes", (err, files) => {

        files.forEach(async file => {

            var canvas = createCanvas(788, 1160)
            const ctx = canvas.getContext("2d")
    
            var img = await loadImage(`./imgcartes/${file}`)
            ctx.drawImage(img, 0, 0, 788, 1160)

            registerFont('./Barlow-Black.ttf', { family: 'Supercell' })

            var jsonCard = fs.readFileSync(`./cartes/${file.replace(".png", ".json")}`);
            var Card = JSON.parse(jsonCard);

            var img = await loadImage(`./carte.png`)
            ctx.drawImage(img, 0, 0, 788, 1160)

            var etoile = await loadImage(`./img/etoiles/${Card.rarety}g.png`)
            ctx.drawImage(etoile, 264, 889, etoile.width*0.05, etoile.height*0.05)

            ctx.globalAlpha = 1;
            ctx.fillStyle = "#1c1c1c"
            ctx.font = "60px 'Supercell'";
            ctx.textAlign = "center"
            ctx.fillText(`${Card.name}`, 788/2, 1035)
            ctx.font = "30px 'Supercell'";
            ctx.fillText(`#${file.replace(".png", "")}`, 107, 1118)

            fs.writeFile(`./img/cartess/${file.replace(".png", "")}g.png`, canvas.toBuffer(), err => {

                if (err) {

                    console.log(err)

                }

            })

        })

    })

})
*/