const userCardTemplate = document.querySelector("[data-user-template]")
const userCardContainer = document.querySelector("[data-user-cards-container]")
const searchInput = document.querySelector("[data-search]")

let users = []

searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase()
    users.forEach(user => {
        const isVisible = user.name.toLowerCase().includes(value)
        user.element.classList.toggle("hide", !isVisible)
    })
})

fetch("./json/utilisateurs.json")

    .then(res => res.json())
    .then(data => {

        users = data.map(user => {

            fetch(`./players/${user.id}.json`)
            .then(res => res.json())
            .then(data2 => {

                console.log(data2)
        
                value.textContent = `#${data2.classement} du classement`
                header.href = "profil.php?id=" + data2.tag.replace(/#/g, "%23")
                value.href = "profil.php?id=" + data2.tag.replace(/#/g, "%23")
               
            })

            const card = userCardTemplate.content.cloneNode(true).children[0]
            const header = card.querySelector("[data-header]")
            const value = card.querySelector("[data-body]")
            header.textContent = user.tag
            userCardContainer.append(card)

            return { name: user.tag, element: card}

        });
       
})