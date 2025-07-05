let deck = [], playerHand = [], dealerHand = [], gameOver = false, balance = 1000, currentBet = 0, darkMode = false;

    const deckElement = document.getElementById('deck');
    const cardCountElement = document.getElementById('cardCount');
    const dealerHandElement = document.getElementById('dealerHand');
    const playerHandElement = document.getElementById('playerHand');
    const dealerScoreElement = document.getElementById('dealerScore');
    const playerScoreElement = document.getElementById('playerScore');
    const resultMessageElement = document.getElementById('resultMessage');
    const hitBtn = document.getElementById('hitBtn');
    const standBtn = document.getElementById('standBtn');
    const restartBtn = document.getElementById('restartBtn');
    const balanceAmountElement = document.getElementById('balanceAmount');
    const themeToggle = document.getElementById('themeToggle');

    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    function initGame() {
      createDeck();
      shuffleDeck();
      dealInitialCards();
      updateUI();
      disableActions(false);
      gameOver = false;
      resultMessageElement.textContent = '';
      resultMessageElement.className = 'result-message';
    }

    function createDeck() {
      deck = [];
      for (let suit of suits) {
        for (let value of values) {
          deck.push({ suit, value });
        }
      }
    }

    function shuffleDeck() {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }

    function dealInitialCards() {
      playerHand = [];
      dealerHand = [];

      playerHand.push(drawCard());
      playerHand.push(drawCard());
      dealerHand.push(drawCard());
      dealerHand.push({ ...drawCard(), hidden: true });

      currentBet = 50;
      balance -= currentBet;
      updateBalance();
    }

    function drawCard() {
      if (deck.length === 0) {
        createDeck();
        shuffleDeck();
      }
      return deck.pop();
    }

    function calculateScore(hand) {
      let score = 0, aces = 0;
      for (let card of hand) {
        if (card.hidden) continue;
        if (card.value === 'A') {
          aces++;
          score += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
          score += 10;
        } else {
          score += parseInt(card.value);
        }
      }
      while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
      }
      return score;
    }

    function updateUI() {
      dealerHandElement.innerHTML = '';
      playerHandElement.innerHTML = '';
      cardCountElement.textContent = `${deck.length} cards`;

      dealerHand.forEach(card => {
        const cardEl = createCardElement(card);
        dealerHandElement.appendChild(cardEl);
      });

      playerHand.forEach(card => {
        const cardEl = createCardElement(card);
        playerHandElement.appendChild(cardEl);
      });

      dealerScoreElement.textContent = `Score: ${calculateScore(dealerHand)}`;
      playerScoreElement.textContent = `Score: ${calculateScore(playerHand)}`;
    }

    function createCardElement(card) {
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('card');

      if (card.hidden) {
        const back = document.createElement('div');
        back.classList.add('card-back');
        cardDiv.appendChild(back);
      } else {
        const colorClass = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
        cardDiv.classList.add(colorClass);

        const valueDiv = document.createElement('div');
        valueDiv.classList.add('card-value');
        valueDiv.textContent = card.value;

        const suitDiv = document.createElement('div');
        suitDiv.classList.add('card-suit');
        suitDiv.textContent = card.suit;

        cardDiv.appendChild(valueDiv);
        cardDiv.appendChild(suitDiv);
      }

      return cardDiv;
    }

    function hit() {
      if (gameOver) return;
      playerHand.push(drawCard());
      const playerScore = calculateScore(playerHand);
      if (playerScore > 21) stand(); // bust
      updateUI();
    }

    function stand() {
      if (gameOver) return;
      dealerHand.forEach(card => card.hidden = false);
      let dealerScore = calculateScore(dealerHand);
      while (dealerScore < 17) {
        dealerHand.push(drawCard());
        dealerScore = calculateScore(dealerHand);
      }
      gameOver = true;
      determineWinner();
      updateUI();
      disableActions(true);
    }

    function determineWinner() {
      const playerScore = calculateScore(playerHand);
      const dealerScore = calculateScore(dealerHand);
      let result, outcome;

      if (playerScore > 21) {
        result = 'You busted! Dealer wins.';
        outcome = 'lose';
      } else if (dealerScore > 21) {
        result = 'Dealer busted! You win.';
        outcome = 'win';
        balance += currentBet * 2;
      } else if (playerScore === dealerScore) {
        result = 'Push! It\'s a draw.';
        outcome = 'draw';
        balance += currentBet;
      } else if (playerScore === 21 && playerHand.length === 2) {
        result = 'Blackjack! You win 3:2!';
        outcome = 'blackjack';
        balance += Math.floor(currentBet * 2.5);
      } else if (playerScore > dealerScore) {
        result = 'You win!';
        outcome = 'win';
        balance += currentBet * 2;
      } else {
        result = 'Dealer wins.';
        outcome = 'lose';
      }

      resultMessageElement.textContent = result;
      resultMessageElement.classList.add(outcome);
      updateBalance();
    }

    function updateBalance() {
      balanceAmountElement.textContent = balance;
    }

    function disableActions(disable) {
      hitBtn.disabled = disable;
      standBtn.disabled = disable;
    }

    hitBtn.addEventListener('click', hit);
    standBtn.addEventListener('click', stand);
    restartBtn.addEventListener('click', initGame);
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });

    initGame();