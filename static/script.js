document.addEventListener('DOMContentLoaded', () => {
    const buttonContainer = document.querySelector('#button-container')
    const buttonList = document.querySelectorAll('.colored-button')
    const newGame = document.querySelector('#new-game')
    const win = document.querySelector('#win')
    let gameWon = false
    let gameId = ''
    let marco = []
    let polo = []

    // flashes the given buttons for the specified count & delay
    const flashButtons = async (buttons, count=1, delay=500) => {
        return new Promise((accept, reject) => {
            let i = 0
            setInterval(() => {
                if (i++ < count*2)
                    buttons.forEach(b => buttonList[b].classList.toggle('flash'))
                else
                    accept()
            }, delay)
        })
    }

    // plays the current button sequence
    const playMarco = () => {
        marco.forEach(b => flashButtons([b]))
    }

    // fetches the current state of given game id, including the current button
    // sequence and the win status
    const fetchGame = async (id) => {
        return new Promise((accept, reject) => {
            (async () => {
                const game = await fetch(`/game/${id}`).then(r => r.json())
                marco.push(game.currentSequence[marco.length])
                gameWon = game.hasWon
                accept()
            })()
        })
    }
    
    // starts a new game when the user clicks the new game button
    // flashes the first button of a newely generated button sequence
    newGame.addEventListener('click', async () => {
        gameId = await fetch('/game', {method: 'POST'}).then(r => r.text())
        console.log(`New gameId: ${gameId}`)
        
        buttonList.forEach(b => b.setAttribute('disabled', 'false'))
        marco = []
        polo = []
        setTimeout(async () => {
            await fetchGame(gameId)
            playMarco()
        }, 1000)
    })

    // button press logic
    // if wrong button is pressed at any time, return from fuction
    buttonContainer.addEventListener('click', async (e) => {
        if (e.target && e.target.dataset.num >= 0) {
            polo.push(Number(e.target.dataset.num))

            if (marco[polo.length-1] !== polo[polo.length-1]) {
                // wrong button pressed
                // flash all buttons and replay marco
                await flashButtons([...Array(buttonList.length).keys()], 3, 200)
                playMarco()
            
            } else if (marco.length === polo.length) {
                const correct = await fetch(`/game/${gameId}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(polo)
                })
                .then(r => r.text())
                .then(r => r === 'true')
                
                if (correct) {
                    console.log('right')
                } else {
                    console.log('wrong')
                }
            }
        }
    })
})