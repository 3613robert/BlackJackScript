// ----- Constants ------
const AMOUNTCARDS = 52;
const AMOUNTPERSUIT = 13;
const AMOUNTSUITS = 4;
const SUITS = ["Hearts", "Diamonds", "Spades", "Clubs"];
const MAXCARDS = 8; 
const start  = document.getElementById('startspel');
const hit = document.getElementById('hit');
const pass = document.getElementById('pass');
const scoreD = document.getElementById('scoreD');
const scoreP = document.getElementById('scoreP');
const bet = document.getElementById('bet');
const bank = document.getElementById('totaal')
const doubleButton = document.getElementById('double');
const insuranceButton = document.getElementById('insurancebutton');
const betResult = document.getElementById('betresult');
const result = document.getElementById('result');

// ---- Create deck and store dealt cards
const ranks = Array.from({ length: 13 }, (_, i) => i + 1);  // create array with rank cards

const kaartenDeck = SUITS.flatMap(suit =>
  Array.from({ length: 13 }, (_, i) => {
    const rank = i + 1;
    const value = i === 0 ? 11 : (i < 9 ? i + 1 : 10);

    return {
      suit,
      rank,
      value,
      image: `url(/cards/${suit}/${rank}.jpg)`
    };
  })
);

let currentDeck = structuredClone(kaartenDeck) // kopie

let handDealer = []; // store card dealt with suit, rank, value and image
let handPlayer = []; // store card dealt with suit, rank, value and image

// ---- Define divs for each possible card up to six and show them
const pHandDiv = [
    document.getElementById('kaart1P'),
    document.getElementById('kaart2P'),
    document.getElementById('kaart3P'),
    document.getElementById('kaart4P'),
    document.getElementById('kaart5P'),
    document.getElementById('kaart6P'),
    document.getElementById('kaart7P'),
    document.getElementById('kaart8P')]

const dHandDiv = [
    document.getElementById('kaart1D'),
    document.getElementById('kaart2D'),
    document.getElementById('kaart3D'),
    document.getElementById('kaart4D'),
    document.getElementById('kaart5D'),
    document.getElementById('kaart6D'),
    document.getElementById('kaart7D'),
    document.getElementById('kaart8D')]

for (let i = 0; i < pHandDiv.length; i++) {
        const cardDealt = pHandDiv[i];
        cardDealt.style.width = "85px";
        cardDealt.style.height = "120px";
        cardDealt.style.display = "inline-block"; 
} 

for (let i = 0; i < dHandDiv.length; i++) {
        const cardDealt = dHandDiv[i];
        cardDealt.style.width = "85px";
        cardDealt.style.height = "120px";
        cardDealt.style.display = "inline-block"; 
}

// -- game variables
let gameOn = false;
let scorePlayer = 0;
let scoreDealer = 0; 
let firstDealPlayer = true;
let betAmountRound = 0;
let roundInsurance = false;
let roundResult = null; // "win" | "lose" | "push" | "blackjack"

// --- Rendering Hands
function renderPlayerHand() {
    // Clear all slots
    for (let i = 0; i < MAXCARDS; i++) {
        pHandDiv[i].style.backgroundImage = "none";
    }

    // Render cards from state
    for (let i = 0; i < handPlayer.length; i++) {
        pHandDiv[i].style.backgroundImage = handPlayer[i].image;
        pHandDiv[i].style.backgroundSize = "cover";
        pHandDiv[i].style.backgroundPosition = "center";
    }
}

function renderDealerHand() {
    for (let i = 0; i < MAXCARDS; i++) {
        dHandDiv[i].style.backgroundImage = "none";
    }

    for (let i = 0; i < handDealer.length; i++) {
        dHandDiv[i].style.backgroundImage = handDealer[i].image;
        dHandDiv[i].style.backgroundSize = "cover";
        dHandDiv[i].style.backgroundPosition = "center";
    }
}

function resetCards() {
    renderDealerHand();
    renderPlayerHand();
}

// -- Bet logic

function betAmount() {
    betAmountRound = bet.options[bet.selectedIndex].value[0] + bet.options[bet.selectedIndex].value[1];
    let bank2 = parseInt(bank.innerHTML, 10);
    if (gameOn &&  betAmountRound <= bank2) {
        bank.innerHTML -= betAmountRound;
    } else if (bank2 >= betAmountRound) {
        result.innerHTML = '';
        start.classList.remove('hidden');
    } else if(bank2 < betAmountRound) {
        result.innerHTML = "Select lower bet!";
        start.classList.add('hidden');
    };
}

function resolveBet() {
    const insurancePays = (roundInsurance && scoreDealer === 21);
    let bankSum = 0.00;
    betResult.classList.remove('hidden');
    let val = bank.innerHTML;
    let betVal = 0;
    switch (roundResult) {
        case "win":
            result.style.color = 'goldenrod';
            betResult.style.color = 'goldenrod';
            betVal = Number(betAmountRound) * 2.00;
            bankSum = Math.abs(Number(val) + Number(betVal));
            bank.innerHTML = bankSum;
            betResult.innerHTML = `Won this round: ${betVal} euro!`;
            break;
        case "blackjack":
            betVal = Number(betAmountRound) * 2.5;
            bankSum = Math.abs(Number(val) + Number(betVal));
            bank.innerHTML = bankSum;
            betResult.innerHTML = `Won this round: ${betVal} euro!`;                 
            break;
        case "push":
            result.style.color = 'grey';
            betResult.style.color = 'grey';
            betVal = Number(betAmountRound) * 1.00;
            bankSum = Math.abs(Number(val) + Number(betVal));
            bank.innerHTML = bankSum;
            betResult.innerHTML = `Bet returned: ${betVal} euro!`;
            break; 
        case "lose": 

            if (insurancePays) {
                betVal = Number(betAmountRound * 1.50);
                bank.innerHTML = Number(bank.innerHTML) + betVal
                result.innerHTML = `insurance payed: ${betVal} euro!`;
            } else if (!insurancePays) {
                betResult.style.color = 'red';
                result.style.color = 'red';
                betResult.classList.remove('hidden');
                betResult.innerHTML = `Lost this round: ${betAmountRound} euro!`;
            }           
            break;
        case "bankrupt":
            result.style.color = 'red';
            result.innerHTML = "You lost, Bank has been reset";
            bank.innerHTML = 50;
            break; 
        }
    }

function doubleBet() {
    firstDealPlayer = false;
    if (Number(bank.innerHTML) >= betAmountRound) {
        bank.innerHTML = Number(bank.innerHTML) - betAmountRound;
        betAmountRound = Number(betAmountRound * 2);
        doubleButton.classList.add('hidden');
        dealCardPlayer();
        passb();
    } else {
        result.innerHTML = "Not enough funds to double";
        console.log(betAmountRound)
    }
}

function insurance() {
    if (Number(bank.innerHTML) >= (betAmountRound * 0.5)) {
        bank.innerHTML = Number(bank.innerHTML) - (betAmountRound * 0.5);
        insuranceButton.classList.add('hidden');
        roundInsurance = true;
    } else {
        result.innerHTML = "Not enough funds to insure";
    }
}

// -- Game logic

function drawCard() {
    const index = Math.floor(Math.random() * currentDeck.length);
    return currentDeck.splice(index, 1)[0];
}

function dealCardPlayer() {
    const card = drawCard();
    handPlayer.push(card);
    ShowScorePlayer() // updatescoresPlayer
    renderPlayerHand();
        // To see if first 2 cards are BJ and also first 2 of dealer might be.
    if (scorePlayer === 21 && firstDealPlayer) {
        if ([10, 11].includes(scoreDealer) && handDealer.length === 1){
            dealCardDealer();
            if (scoreDealer === 21 && handDealer.length === 2) {
                result.innerHTML = "Push on both BlackJack";
                gameOn = false;
                roundPush = true;
                endRound('push');
            } else {
                result.innerHTML = "You've got BlackJack! You've Won";
                gameOn = false;
                roundWonBj = true;
                endRound('blackjack');
            }
        } else {
            result.innerHTML = "You've got BlackJack! You've Won";
            gameOn = false;
            roundWonBj = true;
            endRound('blackjack');
        }
    }
    showButtons();
}

function dealCardDealer() {
    const card = drawCard();
    handDealer.push(card);
    showScoreDealer();
    renderDealerHand();
}

function hitb() {
    doubleButton.classList.add('hidden');
    insuranceButton.classList.add('hidden');
    firstDealPlayer = false;
    dealCardPlayer();
        // checks if new card makes bust 
    if (scorePlayer >= 22){
        if (roundInsurance) {
            passb()
        } else {
        result.innerHTML = "You've gone bust, try again";
        gameOn = false;
        roundWon = false;
        endRound('lose');
        }
    } else if (scorePlayer === 21) {
        passb()
    }
    showButtons();
}

function passb() {
    doubleButton.classList.add('hidden');
    insuranceButton.classList.add('hidden');
    gameOn = false;
    showButtons();
    while (scoreDealer <= 16) {
        dealCardDealer();
    }
    if (scoreDealer === 21 && handDealer.length === 2){
        result.innerHTML = "Dealer has Blackjack!";
        endRound('lose');
    } else if (scoreDealer >= 22 && scorePlayer <= 21) {
        result.innerHTML = "Dealer Bust, You've won!";
        endRound('win');
    } else if (scoreDealer <= 21 && scorePlayer <= 21) {
        if (scorePlayer > scoreDealer) {
            result.innerHTML = `Player wins with a ${scorePlayer}!`;
            endRound('win');
        } else if(scoreDealer > scorePlayer) {
            result.innerHTML = `Dealer wins with a ${scoreDealer}!`;
            endRound('lose');
        } else if (scoreDealer === scorePlayer) {
            endRound('push');
        }
    } else if (scoreDealer === 21 && scorePlayer >= 22 && roundInsurance){
            result.innerHTML = "Insurance kicked in";
            resolveBet();
    }
}

function endRound(result) {
  gameOn = false;
  roundResult = result;
  resolveBet();
  showButtons();
}

// -- Show scores + Score helpers
function calculateScore(hand) {
    let sum = 0;
    let aces = 0;

    for (const card of hand) {
        sum += card.value;
        if (card.rank === 1) aces++;
    }

    while (sum > 21 && aces > 0) {
        sum -= 10; // Ace 11 -> 1
        aces--;
    }
    return sum;
}

function ShowScorePlayer() {
    scorePlayer = calculateScore(handPlayer);
    scoreP.innerHTML = scorePlayer
}

function showScoreDealer() {
    scoreDealer = calculateScore(handDealer);
    scoreD.innerHTML = scoreDealer;
}

//-- Show buttons 
function showButtons() {
    if (gameOn) {
        start.classList.add('hidden');
        bet.classList.add('hidden');
        hit.classList.remove('hidden');
        pass.classList.remove('hidden');
    } else {
        start.classList.remove('hidden');
        bet.classList.remove('hidden');
        hit.classList.add('hidden');
        pass.classList.add('hidden');
    }
}

function showDoubleButton() {
    if ([9, 10, 11].includes(scorePlayer) && firstDealPlayer) {
        doubleButton.classList.remove('hidden')
    } else if (scorePlayer !== 11 && !firstDealPlayer) doubleButton.classList.add('hidden');
}

function showInsuranceButton() {
    if (scoreDealer === 11 && handDealer.length === 1) {
        insuranceButton.classList.remove('hidden')
    } else {
        insuranceButton.classList.add('hidden')
    }
}


// -- new Game function and Start Game function
function newGame() {
    roundInsurance = false;
    betResult.innerHTML = '';
    betResult.classList.remove('lost');
    firstDealPlayer = true;
    currentDeck = structuredClone(kaartenDeck);
    result.innerHTML = "";
    scoreDealer = 0;
    scorePlayer = 0;
    gameOn = true;
    handDealer = [];
    handPlayer = [];    
    showButtons();    
    resetCards();
}  

function startGame() {
    newGame();
    betAmount();
    dealCardPlayer();
    dealCardDealer();
    dealCardPlayer();
    showInsuranceButton();
    showDoubleButton();
}

start.addEventListener('click', startGame);
hit.addEventListener('click', hitb);
pass.addEventListener('click', passb);
bet.addEventListener("input", betAmount);
doubleButton.addEventListener('click', doubleBet);
insuranceButton.addEventListener('click', insurance);