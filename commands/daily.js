const fs = require("fs")

module.exports = {
    run: async (interaction, client, options, config, connection) => {

        connection.query("SELECT * FROM players WHERE id = " + interaction.user.id + " ;", function(err, results, fields) {
                
            if(!err) {

                if(results.length < 1) return interaction.reply({
                    content: `Vous n'avez pas encore commencé votre partie. Faites la commande /start pour la commencer.`,
                    ephemeral: true
                })

                var Profil = results[0]
                var date = new Date()
                var nb_day = date.getDay()

                if(Profil.dernier_daily == nb_day) {
                    interaction.reply({
                        content: `Vous avez déjà récupéré votre récompense journalière.`,
                        ephemeral: true
                    })
    
                } else {

                    if(Profil.dernier_daily + 1 === nb_day) Profil.streak = Profil.streak + 1
                    else Profil.streak = 1                    
    
                    Profil.dernier_daily = nb_day

                    
                    Profil.pieces = Profil.pieces + 1000
    
                    Profil.tag = interaction.user.tag

                    if(Profil.streak == 7) {

                        Profil.pieces = Profil.pieces + 1000
                        Profil.streak = 1

                        connection.query("UPDATE players SET `tag` = '" + interaction.user.tag + "', `pieces` = '" + Profil.pieces + "', `dernier_daily` = '" + nb_day + "', `streak` = '" + Profil.streak + "' WHERE `players`.`id` = " + interaction.user.id + ";", function(err, results, fields) {
                
                            if(!err) {
            
                                interaction.reply({
                                    content: `<@${interaction.user.id}> vient de récupérer sa récompense journalière avec un bonus pour avoir fait la commande chaque jours de la semaine, il gagne donc 2000${config.emojis.piece} !`,
                                    ephemeral: false
                                })
            
                            } else {
                                console.log(err)
                            }
            
                        })

                    } else {

                        connection.query("UPDATE players SET `tag` = '" + interaction.user.tag + "', `pieces` = '" + Profil.pieces + "', `dernier_daily` = '" + nb_day + "', `streak` = '" + Profil.streak + "' WHERE `players`.`id` = " + interaction.user.id + ";", function(err, results, fields) {
                
                            if(!err) {
            
                                interaction.reply({
                                    content: `<@${interaction.user.id}> vient de récupérer sa récompense journalière, il gagne donc 1000${config.emojis.piece} !`,
                                    ephemeral: false
                                })
            
                            } else {
                                console.log(err)
                            }
            
                        })

                    }

                }

            } else {

                console.log(err)
                
            }

        })
        
    },
    name: "daily",
    desc: "Récupère votre récompense journalière."
}