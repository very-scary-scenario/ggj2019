var GOING_STEP_LENGTH = 2000;
var AUCTIONEER_STEP_LENGTH = 500;
var AUDIENCE_STEP_LENGTH = 1000;

var elements = {
  inspection: document.getElementById('inspection'),
  acceptLot: document.getElementById('accept-lot'),
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
var lot;

function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function Participant(name, isPlayer) {
  this.name = name;
  this.isPlayer = Boolean(isPlayer);
  this.funds = 500;
}

var enemyParticipants = [
  new Participant('Pherdinand van Maxinpants', false),
  new Participant('Felicity Spendilwick', false),
  new Participant('Hugh G. Waddington IV', false),
  new Participant('Freddy "Wydelad" Bloggsmith', false)
];
var playerParticipant = new Participant('you', true);
var allParticipants = [playerParticipant].concat(enemyParticipants);

function Lot() {
  this.address = (Math.floor(Math.pow(Math.random(), 3) * 200) + 1).toString(10) + ' ' + choice(choice(STREET_NAMES_A)) + ' ' + choice(choice(STREET_NAMES_B)) + ', ' + choice(PLACE_NAMES);
}
Lot.prototype.inspect = function() {
  elements.inspection.querySelector('.address').innerText = this.address;
  elements.auctionHouse.querySelector('.address').innerText = this.address;

};

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

  makeAudienceGesticulate();
  makeAuctioneerGesticulate();
  this.update();
}
Auction.prototype.getNextBidder = function() {
  // calculate something better here based on each participant's wallet, the current bid vs. the appraisal price, and whether the property actually meets their needs

  var desirability;

  desirability = Math.pow(((this.appraisal/6) / this.currentBid), 0.5);

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
    }, Math.min(
      Math.random() * GOING_STEP_LENGTH * Math.min((this.currentBid / this.appraisal), 1),
      (GOING_STEP_LENGTH / 4)
    ));
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

function runAuction(lot) {
  auction = new Auction(lot);
  elements.inspection.classList.remove('active');
  elements.auctionHouse.classList.add('active');

  makeAuctioneerGesticulate();
  makeAudienceGesticulate();
}

var auctioneerGesticulationTimeout;
var audienceGesticulationTimeout;

function makeAuctioneerGesticulate() {
  clearTimeout(auctioneerGesticulationTimeout);
  elements.auctioneer.setAttribute('data-gesticulation', (Math.floor(Math.random() * 11) + 1).toString(10));
  auctioneerGesticulationTimeout = setTimeout(makeAuctioneerGesticulate, Math.random() * AUCTIONEER_STEP_LENGTH);
}

function makeAudienceGesticulate() {
  clearTimeout(audienceGesticulationTimeout);
  choice(enemyParticipants).element.setAttribute('data-gesticulation', choice([1, 4, 5, 6]).toString(10));
  audienceGesticulationTimeout = setTimeout(makeAudienceGesticulate, Math.random() * AUDIENCE_STEP_LENGTH);
}

function doLoop() {
  // introduce a new client if we need to
  // introduce a new lot, and then run the auction

  lot = new Lot();
  lot.inspect();
  elements.auctionHouse.classList.remove('active');
  elements.inspection.classList.add('active');
}

elements.acceptLot.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  runAuction(lot);
});

elements.bidButton.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  auction.bid(playerParticipant);
});

doLoop();
