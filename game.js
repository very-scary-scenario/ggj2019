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

  this.update();
}
Auction.prototype.getNextBidder = function() {
  // calculate something better here based on each participant's wallet, the current bid vs. the appraisal price, and whether they're the interested participant

  var desirability;

  (this.appraisal > this.currentBid) ? desirability = 1: desirability = 0.1;  

  var mightBid = [];
  if ((Math.random() < desirability) && (this.interestedParticipant !== this.winningParticipant)) {
    mightBid.push(this.interestedParticipant);
  }

  var enemy;
  for (var ei = 0; ei < enemyParticipants.length; ei++) {
    enemy = enemyParticipants[ei];
    if (enemy === this.interestedParticipant || enemy === this.winningParticipant) {
      continue;
    }
    console.log((Math.random() * desirability));
    if (Math.random() * desirability > 0.5) mightBid.push(enemy);
  }
  console.log(mightBid);

  if (mightBid.length) return choice(mightBid);
}
Auction.prototype.setNextAction = function() {
  var self = this;

  clearTimeout(this.nextAction);

  var nextBidder = this.getNextBidder();
  if (nextBidder) {
    this.nextAction = setTimeout(function() {
      self.bid(nextBidder);
    }, Math.random() * STEP_LENGTH);
  } else {
    console.log('not bidding');

    this.nextAction = setTimeout(function() {
      if (self.winningParticipant !== null) self.goingLevel += 1;
      self.update();
    }, STEP_LENGTH);
  }
}
Auction.prototype.update = function() {
  elements.currentBid.innerText = this.currentBid.toString(10);

  for (var pi = 0; pi < allParticipants.length; pi++) {
    participant = allParticipants[pi]
    if ((participant === this.winningParticipant) ^ (participant.element.classList.contains('winning'))) {
      participant.element.classList.toggle('winning')
    }
  }

  var ge;
  var isOver = true;
  for (var gi = 0; gi < elements.goings.length; gi++) {
    ge = elements.goings[gi];
    if (gi >= this.goingLevel) {
      ge.classList.remove('shown');
      isOver = false;
    } else {
      ge.classList.add('shown');
    }
  }

  if ((isOver || (this.winningParticipant === playerParticipant)) ^ (elements.bidButton.hasAttribute('disabled'))) {
    elements.bidButton.toggleAttribute('disabled');
  }

  if (this.winningParticipant !== null) {
    elements.highestBidder.innerText = this.winningParticipant.name;
    elements.winningBidder.innerText = this.winningParticipant.name;
  } else {
    elements.highestBidder.innerText = 'nobody';
  }

  if (isOver) {
    console.log('this is over');
  } else {
    this.setNextAction();
  }
}
Auction.prototype.bid = function(participant) {
  increment = Math.pow(10, Math.floor(Math.log10(this.currentBid * 5))-1);
  this.currentBid += increment;
  this.winningParticipant = participant;
  this.goingLevel = 0;
  this.update();
}

function runAuction() {
  auction = new Auction();

  elements.bidButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    auction.bid(playerParticipant);
  })
}

runAuction();
