document.getElementById("startButton").addEventListener('click', function() {
    document.getElementById('gameInterface').classList.remove('hidden');
    startGame();
});

const gameData = {
    scoreRed: 0,
    scoreBlue: 0,
    currentCard: null,
    timeLeft: 60,    // Sekunden
    turn: 'red',
    usedIndices: new Set()
};

const words = [
    { term: 'Eisbär', tabooWords: ['Eis', 'Schnee', 'Antarktis', 'Polar', 'Tier']},
    { term: 'Handy', tabooWords: ['tragbar', 'drahtlos', 'telefonieren', 'SMS', 'Internet']},
    { term: 'Wien', tabooWords: ['Hauptstadt', 'Österreich', 'Bundesland', 'Bezirk', 'Europa']}
];

let timerInterval;

function startGame(){
    gameData.timeLeft = 60;
    switchTeam();
    loadNewCard();
    updateScoreDisplay();
    timerInterval = setInterval(updateTimer, 1000); // jede Sekunde wird der Timer aktualisiert
};

function switchTeam(){
    gameData.turn = gameData.turn === 'red' ? 'blue' : 'red';
    const body = document.body;
    if (gameData.turn === 'red') {
        body.classList.add('team-red');
        body.classList.remove('team-blue');
    } else {
        body.classList.add('team-blue');
        body.classList.remove('team-red');
    }
    document.getElementById('startNextRoundButton').classList.remove('hidden');
}

function loadNewCard() {
    if (gameData.usedIndices.size === words.length) {
        gameData.usedIndices.clear(); // Optional: Set zurücksetzen, um von vorn zu beginnen
        return;
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * words.length);
    } while (gameData.usedIndices.has(randomIndex));

    gameData.usedIndices.add(randomIndex);
    gameData.currentCard = words[randomIndex];
    document.getElementById('wordDisplay').innerText = `Erkläre: ${gameData.currentCard.term}`;
    const tabooWordsList = document.getElementById('tabooWordsList');
    tabooWordsList.innerHTML = '';

    // Hinzufügen jedes Tabu-Wortes als ein Listeneintrag
    gameData.currentCard.tabooWords.forEach(word => {
        const listItem = document.createElement('li');
        listItem.innerText = word;
        tabooWordsList.appendChild(listItem);
    });
    document.getElementById('tabooWordsDisplay').classList.remove('hidden'); // Zeige die Tabu-Wörter an
}


function updateTimer() {
    if (gameData.timeLeft > 0) {
        gameData.timeLeft--;
        document.getElementById('timerDisplay').innerText = `Verbleibende Zeit: ${gameData.timeLeft} Sekunden`;
    } else {
        clearInterval(timerInterval);
        alert('Zeit ist abgelaufen! Bitte drücke "Los", um fortzufahren.');
    }
}

function endGame() {
    clearInterval(timerInterval);
    alert(`Spiel beendet! Deine Punktezahl: ${gameData.score}`);
    document.getElementById('gameInterface').classList.add('hidden');
}

function updateScoreDisplay() {
    document.getElementById('scoreRed').innerText = gameData.scoreRed;
    document.getElementById('scoreBlue').innerText = gameData.scoreBlue;
}


function updateScore(point) {
    if(gameData.turn === 'red'){
        gameData.scoreRed += point;
        document.getElementById('scoreRed').innerText = gameData.scoreRed;
    } else {
        gameData.scoreBlue += point;
        document.getElementById('scoreBlue').innerText = gameData.scoreBlue;
    }
    
}

function startNewRound() {
    gameData.timeLeft = 60;
    timerInterval = setInterval (updateTimer, 1000);
}

document.getElementById('startNextRoundButton').addEventListener('click', function() {
    this.classList.add('hidden');
    startNewRound();
});

// Event-Handler für den "Nächste Karte"-Knopf
document.getElementById('nextButton').addEventListener('click', loadNewCard);

// Event-Handler für den "Tabu-Wort benutzt"-Knopf
document.getElementById('tabooButton').addEventListener('click', function() {
 // Punktabzug bei Nutzung eines Tabu-Wortes
    updateScore(-1);
    switchTeam();
});
document.getElementById('correctButton').addEventListener('click', function() {
    updateScore(1);
    switchTeam();
})
