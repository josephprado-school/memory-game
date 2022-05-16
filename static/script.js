document.addEventListener('DOMContentLoaded', () => {
    const buttonList = document.querySelectorAll('.colored-button')
    const winMsg = document.querySelector('#win')
    let hasWon = false
    let marco = []
    let polo = []
    let id = ''

    // starts a new game when user clicks new game button
    document.querySelector('#new-game').addEventListener('click', async () => {
        buttonList.forEach(b => {
            b.setAttribute('disabled', 'false')
            b.classList.add('inactive')
        })
        winMsg.classList.add('hidden')

        id = await fetch('/game', {method: 'POST'}).then(r => r.text())
        await fetchGame()
        start()
    })

    // fetch game details from server
    const fetchGame = async () => {
        return new Promise((accept, reject) => {
            (async () => {
                const game = await fetch(`/game/${id}`).then(r => r.json())
                console.log(game)
                hasWon = game.hasWon
                marco = game.currentSequence
                accept()
            })()
        })
    }

    const toggleFlash = (buttons) => {
        buttons.forEach(b => buttonList[b].classList.toggle('flash'))
    }

    // flashes the specified buttons for the given count and delay
    const flashButton = async (buttons, count=1, delay=350) => {
        return new Promise((accept, reject) => {
            let i = 0
            const flash = setInterval(() => {
                toggleFlash(buttons)
                if (++i === count*2) {
                    clearInterval(flash)
                    accept()
                }
            }, delay)
        })
    }

    // play the current button sequence
    // disable buttons during play
    const playMarco = async () => {
        buttonList.forEach(b => b.setAttribute('disabled', 'true'))

        for (let i = 0; i < marco.length; i++)
            await flashButton([marco[i]])

        buttonList.forEach(b => b.setAttribute('disabled', 'false'))
    }

    // start/restart
    const start = () => {
        polo = []
        playMarco()
    }

    document.querySelector('#button-container').addEventListener('mousedown', (e) => {
        if (e.target && e.target.dataset.num >= 0)
            e.target.classList.toggle('inactive')
    })

    document.querySelector('#button-container').addEventListener('mouseup', (e) => {
        if (e.target && e.target.dataset.num >= 0)
            e.target.classList.toggle('inactive')
    })

    // handle button presses
    document.querySelector('#button-container').addEventListener('click', async (e) => {
        if (e.target && e.target.dataset.num >= 0) {
            polo.push(Number(e.target.dataset.num))
            const n = polo.length

            if (marco[n-1] !== polo[n-1]) {
                await flashButton([...Array(buttonList.length).keys()], 3, 150)
                start()

            } else if (n === marco.length) {
                // verify polo on server
                // if correct, fetch new game details
                // otherwise, restart
                const correct = await fetch(`/game/${id}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(polo)
                })
                .then(r => r.text())
                .then(r => r === 'true')
                
                if (correct) { // fetch new game details
                    await fetchGame()

                    if (hasWon) { // end game
                        buttonList.forEach(b => {
                            b.setAttribute('disabled', 'true')
                            b.classList.remove('inactive')
                        })
                        winMsg.classList.remove('hidden')

                    } else // round not over, continue
                        start()

                } else {
                    // mismatch between server and marco
                    // error if reach here
                    console.log('Server-marco mismatch?')
                    start()
                }
            }
        }
    })
})