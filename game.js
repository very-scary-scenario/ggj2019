var GOING_STEP_LENGTH = 2000;
var AUCTIONEER_STEP_LENGTH = 500;
var AUDIENCE_STEP_LENGTH = 1000;

var elements = {
  auctionHouse: document.getElementById('auction-house'),
  auctioneer: document.getElementById('auctioneer'),
  wallet: document.getElementById('wallet'),
  currentBid: document.getElementById('current-bid'),
  highestBidder: document.getElementById('highest-bidder'),
  winningBidder: document.getElementById('winning-participant'),
  participants: document.getElementById('participants'),
  bidButton: document.getElementById('bid-button'),
  goings: document.querySelectorAll('#goings span')
};

var auction;

function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function Participant(name, isPlayer) {
  this.name = name;
  this.isPlayer = Boolean(isPlayer);
  this.funds = 500;
}

var enemyParticipants = [
  new Participant('rival one', false),
  new Participant('rival two', false),
  new Participant('rival three', false),
  new Participant('rival four', false)
];
var playerParticipant = new Participant('you', true);
var allParticipants = [playerParticipant].concat(enemyParticipants);

function Auction() {
  this.currentBid = 10;
  this.appraisal = 500;
  this.winningParticipant = null;
  this.goingLevel = 0;

  var participant;
  for (var pi = 0; pi < allParticipants.length; pi++) {
    participant = allParticipants[pi];
    participant.element = document.createElement('li');
    participant.element.classList.add(participant.isPlayer ? 'player' : 'enemy');
    participant.element.appendChild(document.createTextNode(participant.name));
    elements.participants.appendChild(participant.element);
  }

  this.update();
}
Auction.prototype.getNextBidder = function() {
  // calculate something better here based on each participant's wallet, the current bid vs. the appraisal price, and whether the property actually meets their needs

  var desirability;

  desirability = (this.appraisal > this.currentBid) ? 1 : 0.1;  

  var mightBid = [];

  var enemy;
  for (var ei = 0; ei < enemyParticipants.length; ei++) {
    enemy = enemyParticipants[ei];
    if (enemy === this.winningParticipant) {
      continue;
    }
    if (Math.random() * desirability > 0.5) mightBid.push(enemy);
  }

  if (mightBid.length) return choice(mightBid);
};
Auction.prototype.setNextAction = function() {
  var self = this;

  clearTimeout(this.nextAction);

  var nextBidder = this.getNextBidder();
  if (nextBidder) {
    this.nextAction = setTimeout(function() {
      self.bid(nextBidder);
    }, Math.random() * GOING_STEP_LENGTH);
  } else {
    console.log('not bidding');

    this.nextAction = setTimeout(function() {
      if (self.winningParticipant !== null) self.goingLevel += 1;
      self.update();
    }, GOING_STEP_LENGTH);
  }
};
Auction.prototype.update = function() {
  elements.currentBid.innerText = this.currentBid.toString(10);

  for (var pi = 0; pi < allParticipants.length; pi++) {
    participant = allParticipants[pi];
    if ((participant === this.winningParticipant) ^ (participant.element.classList.contains('winning'))) {
      participant.element.classList.toggle('winning');
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
    this.winningParticipant.element.classList.add('won');
  } else {
    this.setNextAction();
  }
};
Auction.prototype.bid = function(participant) {
  increment = Math.pow(10, Math.floor(Math.log10(this.currentBid * 5))-1);
  this.currentBid += increment;
  this.winningParticipant = participant;
  this.goingLevel = 0;
  this.update();
};

function runAuction() {
  auction = new Auction();

  elements.bidButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    auction.bid(playerParticipant);
  });
}

function makeAuctioneerGesticulate() {
  elements.auctioneer.setAttribute('data-gesticulation', (Math.floor(Math.random() * 11) + 1).toString(10));
  setTimeout(makeAuctioneerGesticulate, Math.random() * AUCTIONEER_STEP_LENGTH);
}

function makeAudienceGesticulate() {
  choice(enemyParticipants).element.setAttribute('data-gesticulation', choice([1, 4, 5, 6]).toString(10));
  setTimeout(makeAudienceGesticulate, Math.random() * AUDIENCE_STEP_LENGTH);
}

runAuction();
makeAuctioneerGesticulate();
makeAudienceGesticulate();
