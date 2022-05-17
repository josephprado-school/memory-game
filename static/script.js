document.addEventListener('DOMContentLoaded', () => {
    const buttonList = document.querySelectorAll('.colored-button')
    const winMsg = document.querySelector('#win')
    let disabled = true
    let hasWon = false
    let marco = []
    let polo = []
    let id = ''

    // starts a new game when user clicks new game button
    // flashes all buttons once to indicate start of game
    // then plays marco
    document.querySelector('#new-game').addEventListener('click', async () => {
        await flashButton([...Array(buttonList.length).keys()], 1, 500)
        buttonList.forEach(b => b.classList.add('inactive'))
        winMsg.classList.add('hidden')

        id = await fetch('/game', {method: 'POST'}).then(r => r.text())
        await fetchGame()
        setTimeout(start, 1000)
    })

    // fetches the current game details from the server
    const fetchGame = async () => {
        const game = await fetch(`/game/${id}`).then(r => r.json())
        hasWon = game.hasWon
        marco = game.currentSequence
    }

    // flashes the specified buttons for the given count and delay
    const flashButton = async (buttonNums, count=1, delay=350) => {
        return new Promise((accept, reject) => {
            let i = 0
            const flash = setInterval(() => {
                buttonNums.forEach(b => buttonList[b].classList.toggle('inactive'))
                if (++i === count*2) {
                    clearInterval(flash)
                    accept()
                }
            }, delay)
        })
    }

    // play the current button sequence
    // disable buttons during play and re-enable afterward
    const playMarco = async () => {
        disabled = true

        for (let i = 0; i < marco.length; i++)
            await flashButton([marco[i]])

        disabled = false
    }

    // start/restart round
    const start = () => {
        polo = []
        playMarco()
    }

    // remove highlight when user clicks on (mouseup) or moves off (mouseout) target    
    ['mouseup', 'mouseout'].forEach(s => {
        document.querySelector('#button-container').addEventListener(s, (e) => {
            if (e.target && e.target.dataset.num >= 0 && disabled === false)
                e.target.classList.add('inactive')
        })
    })

    // highlight when user press or holds on target
    document.querySelector('#button-container').addEventListener('mousedown', (e) => {
        if (e.target && e.target.dataset.num >= 0 && disabled === false)
            e.target.classList.remove('inactive')
    })

    // handle button presses
    // only register presses when not disabled
    document.querySelector('#button-container').addEventListener('click', async (e) => {
        if (e.target && e.target.dataset.num >= 0 && disabled === false) {
            polo.push(Number(e.target.dataset.num))
            const n = polo.length

            if (marco[n-1] !== polo[n-1]) {
                disabled = true
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
                        disabled = true
                        buttonList.forEach(b => b.classList.remove('inactive'))
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