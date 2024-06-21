document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.getElementById("startButton");
  const startNextRoundButton = document.getElementById("startNextRoundButton");
  const nextButton = document.getElementById("nextButton");
  const tabooButton = document.getElementById("tabooButton");
  const correctButton = document.getElementById("correctButton");

  startButton.addEventListener("click", startGame);
  startNextRoundButton.addEventListener("click", startNewRound);
  nextButton.addEventListener("click", skipCard);
  tabooButton.addEventListener("click", useTabooWord);
  correctButton.addEventListener("click", guessCorrectWord);

  let skipsLeft;
  let timerInterval;
  const gameData = {
    scoreRed: 0,
    scoreBlue: 0,
    currentCard: null,
    timeLeft: 60,
    turn: "red",
    usedIndices: new Set(),
  };

  let words = [];

  // Wörter aus der externen JSON-Datei laden
  fetch("words.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Netzwerkantwort war nicht ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      words = data;
      console.log("Wörter erfolgreich geladen:", words);
      initializeGame();
    })
    .catch((error) => console.error("Error loading words:", error));

  function initializeGame() {
    // Event-Listener hinzufügen
    startButton.addEventListener("click", startGame);
    startNextRoundButton.addEventListener("click", startNewRound);
    nextButton.addEventListener("click", skipCard);
    tabooButton.addEventListener("click", useTabooWord);
    correctButton.addEventListener("click", guessCorrectWord);
  }

  function startGame() {
    resetGame();
    document.getElementById("gameInterface").classList.remove("hidden");
    document.getElementById("inputContainer").classList.add("hidden");
    gameData.timeLeft =
      parseInt(document.getElementById("timeSetting").value) || 60;
    skipsLeft = parseInt(document.getElementById("skipLimit").value) || 3;
    switchTeam();
    loadNewCard();
    updateScoreDisplay();
    timerInterval = setInterval(updateTimer, 1000);
    manageRoundButtonVisibility();
  }

  function startNewRound() {
    clearInterval(timerInterval);
    gameData.timeLeft =
      parseInt(document.getElementById("timeSetting").value) || 60;
    skipsLeft = parseInt(document.getElementById("skipLimit").value) || 3;
    timerInterval = setInterval(updateTimer, 1000);
    loadNewCard();
    switchTeam();
  }

  function skipCard() {
    if (skipsLeft > 0) {
      skipsLeft--;
      loadNewCard();
    } else {
      alert("Keine weiteren Übersprünge erlaubt!");
    }
  }

  function useTabooWord() {
    playSound("tabooSound");
    updateScore(-1);
    loadNewCard();
  }

  function guessCorrectWord() {
    playSound("correctSound");
    updateScore(1);
    loadNewCard();
  }

  function switchTeam() {
    gameData.turn = gameData.turn === "red" ? "blue" : "red";
    const body = document.body;
    if (gameData.turn === "red") {
      body.classList.add("team-red");
      body.classList.remove("team-blue");
    } else {
      body.classList.add("team-blue");
      body.classList.remove("team-red");
    }
    manageRoundButtonVisibility();
  }

  function loadNewCard() {
    if (gameData.usedIndices.size === words.length || skipsLeft <= 0) {
      gameData.usedIndices.clear();
      return;
    }

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * words.length);
    } while (gameData.usedIndices.has(randomIndex));

    gameData.usedIndices.add(randomIndex);
    gameData.currentCard = words[randomIndex];
    console.log("Aktuelle Karte:", gameData.currentCard); // Überprüfen Sie, ob die aktuelle Karte korrekt geladen wird
    document.getElementById(
      "wordDisplay"
    ).innerText = `Erkläre: ${gameData.currentCard.term}`;
    const tabooWordsList = document.getElementById("tabooWordsList");
    tabooWordsList.innerHTML = "";

    gameData.currentCard.tabooWords.forEach((word) => {
      const listItem = document.createElement("li");
      listItem.innerText = word;
      tabooWordsList.appendChild(listItem);
    });

    document.getElementById("tabooWordsDisplay").classList.remove("hidden");
  }

  function updateTimer() {
    if (gameData.timeLeft > 0) {
      gameData.timeLeft--;
      document.getElementById(
        "timerDisplay"
      ).innerText = `Verbleibende Zeit: ${gameData.timeLeft} Sekunden`;
    } else {
      clearInterval(timerInterval);
      alert('Zeit ist abgelaufen! Bitte drücke "Los", um fortzufahren.');
      manageRoundButtonVisibility();
    }
  }

  function updateScoreDisplay() {
    document.querySelector("#teamRed h2").innerText =
      document.getElementById("teamNameRed").value || "Team Rot";
    document.querySelector("#teamBlue h2").innerText =
      document.getElementById("teamNameBlue").value || "Team Blau";
    document.getElementById("scoreRed").innerText = gameData.scoreRed;
    document.getElementById("scoreBlue").innerText = gameData.scoreBlue;
  }

  function updateScore(point) {
    if (gameData.turn === "red") {
      gameData.scoreRed += point;
      document.getElementById("scoreRed").innerText = gameData.scoreRed;
      checkForWin(gameData.scoreRed);
    } else {
      gameData.scoreBlue += point;
      document.getElementById("scoreBlue").innerText = gameData.scoreBlue;
      checkForWin(gameData.scoreBlue);
    }
  }

  function checkForWin(score) {
    let winningScore = parseInt(document.getElementById("winningScore").value);
    if (score >= winningScore) {
      endGame();
    }
  }

  function endGame() {
    playSound("endSound");
    clearInterval(timerInterval);
    alert(
      `Spiel beendet! Team ${gameData.turn} hat gewonnen mit ${
        gameData.turn === "red" ? gameData.scoreRed : gameData.scoreBlue
      } Punkten.`
    );
    resetGame();
  }

  function manageRoundButtonVisibility() {
    const button = document.getElementById("startNextRoundButton");
    if (gameData.timeLeft <= 0) {
      button.classList.remove("hidden");
    } else {
      button.classList.add("hidden");
    }
  }

  function resetGame() {
    gameData.scoreRed = 0;
    gameData.scoreBlue = 0;
    gameData.currentCard = null;
    gameData.usedIndices.clear();
    document.getElementById("scoreBlue").innerText = "0";
    document.getElementById("scoreRed").innerText = "0";
    document.getElementById("gameInterface").classList.add("hidden");
    document.getElementById("inputContainer").classList.remove("hidden");
    document.getElementById("tabooWordsDisplay").classList.add("hidden");
    document.getElementById("wordDisplay").innerText = "";
    document.getElementById("tabooWordsList").innerHTML = "";
  }

  function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.play();
    } else {
      console.error("SoundElement mit ID " + soundId + " nicht gefunden.");
    }
  }
});
