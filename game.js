let STEP_LENGTH = 2000;

let elements = {
  auctionHouse: document.getElementById('auction-house'),
  wallet: document.getElementById('wallet'),
  currentBid: document.getElementById('current-bid'),
  highestBidder: document.getElementById('highest-bidder'),
  winningBidder: document.getElementById('winning-participant'),
  participants: document.getElementById('participants'),
  bidButton: document.getElementById('bid-button'),
  goings: document.querySelectorAll('#goings span')
}

var auction;

function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function Participant(name, isPlayer) {
  this.name = name;
  this.isPlayer = new Boolean(isPlayer);
  this.funds = 500;
}

var enemyParticipants = [
  new Participant('rival one', false),
  new Participant('rival two', false),
  new Participant('rival three', false),
  new Participant('rival four', false)
]
var playerParticipant = new Participant('you', true);
var allParticipants = [playerParticipant].concat(enemyParticipants);

function Auction() {
  this.currentBid = 10;
  this.appraisal = 500;
  this.winningParticipant = null;
  this.goingLevel = 0;

  this.interestedParticipant = choice(enemyParticipants);

  var participant;
  for (var pi = 0; pi < allParticipants.length; pi++) {
    participant = allParticipants[pi];
    participant.element = document.createElement('li');
    participant.element.appendChild(document.createTextNode(participant.name));
    elements.participants.appendChild(participant.element);
  }

  this.setNextAction();
  this.update();
}
Auction.prototype.setNextAction = function() {
  clearTimeout(this.nextAction);
  var self = this;
  this.nextAction = setTimeout(function() {
    self.goingLevel += 1;
    self.update();
  }, STEP_LENGTH);
}
Auction.prototype.update = function() {
  elements.currentBid.innerText = this.currentBid.toString(10);

  for (var pi = 0; pi < allParticipants.length; pi++) {
    participant = allParticipants[pi]
    if ((participant === this.winningParticipant) ^ (participant.element.classList.contains('winning'))) {
      participant.element.classList.toggle('winning')
    }
  }

  if ((this.winningParticipant === playerParticipant) ^ (elements.bidButton.hasAttribute('disabled'))) {
    elements.bidButton.toggleAttribute('disabled');
  }

  if (this.winningParticipant !== null) {
    elements.highestBidder.innerText = this.winningParticipant.name;
    elements.winningBidder.innerText = this.winningParticipant.name;
  } else {
    elements.highestBidder.innerText = 'nobody';
  }

  var ge;
  var notOver = true;
  for (var gi = 0; gi < elements.goings.length; gi++) {
    ge = elements.goings[gi];
    if (gi >= this.goingLevel) {
      ge.classList.remove('shown');
    } else {
      ge.classList.add('shown');
      notOver = true;
    }
  }

  if (!notOver) {
    console.log('this is over');
  } else {
    this.setNextAction();
  }
}
Auction.prototype.run = function() {
  this.update();
}
Auction.prototype.bid = function(participant) {
  increment = Math.pow(10, Math.floor(Math.log10(this.currentBid * 5))-1);
  this.currentBid += increment;
  this.winningParticipant = participant;
  this.update();
}

function runAuction() {
  auction = new Auction();
  auction.run();

  elements.bidButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    auction.bid(playerParticipant);
  })
}

runAuction();
