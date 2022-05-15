document.addEventListener('DOMContentLoaded', () => {
    const buttonContainer = document.querySelector('#button-container')
    const buttonList = document.querySelectorAll('.colored-button')
    const newGame = document.querySelector('#new-game')
    const win = document.querySelector('#win')
    let gameId = ''
    let sequence = []

    // flashes the given button for 1/2 second
    const flashButton = (button) => {
        let i = 0
        setInterval(() => {
            if (i++ < 2)
                buttonList[button].classList.toggle('flash')
        }, 500)
    }

    // fetches the current state of given game id, including the current button
    // sequence and the win status
    const fetchGame = async (id) => {
        const cs = await fetch(`/game/${id}`).then(r => r.json())
        sequence.push(cs.currentSequence[cs.currentSequence.length - 1])
        sequence.forEach(button => flashButton(button))
        console.log(`Sequence: ${sequence}`)
    }

    // starts a new game when the user clicks the new game button
    // flashes the first button of a newely generated button sequence
    newGame.addEventListener('click', async () => {
        gameId = await fetch('/game', {method: 'POST'}).then(r => r.text())
        console.log(`New game id# ${gameId}`)
        
        buttonList.forEach(button => button.setAttribute('disabled', 'false'))
        sequence = []
        setTimeout(() => fetchGame(gameId), 1000)
    })

    // 
    buttonContainer.addEventListener('click', async (e) => {
        if (e.target && e.target.nodeName == 'BUTTON') {
            // record press
        }
        
    })

})