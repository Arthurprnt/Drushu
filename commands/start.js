const fs = require("fs")
const { isNativeError } = require("util/types")

module.exports = {
    run: async (interaction, client, options, config, connection) => {

        connection.query("SELECT * FROM players WHERE id = " + interaction.user.id + " ;", function(err, results, fields) {

            if(results.length >= 1) return interaction.reply({
                content: `Vous avez déjà commencé votre partie.`,
                ephemeral: true
            })

            connection.query("INSERT INTO `players` (`id`, `tag`, `cartes`, `liste_cartes`, `hebdo_liste_echanges`) VALUES ('" + interaction.user.id + "', '" + interaction.user.tag + "', '{}', '[]', '[]');", function(err, results, fields) {
            
                if(!err) {

                    interaction.reply({
                        content: `<@${interaction.user.id}> vient de commencer sa partie, il reçoit donc 1000${config.emojis.piece} !`,
                        ephemeral: false
                    })

                } else {

                    console.log(err)

                }

            })
        })

    },
    name: "start",
    desc: "Commence votre partie de Ushūmon."
}