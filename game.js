
let elements = {
  auctionHouse: document.getElementById('auction-house'),
  wallet: document.getElementById('wallet'),
  currentBid: document.getElementById('current-bid'),
  highestBidder: document.getElementById('highest-bidder'),
  winningBidder: document.getElementById('winning-participant'),
  participants: document.getElementById('participants'),
  bidButton: document.getElementById('bid-button')
}

var auction;

function Participant(name, isPlayer) {
  this.name = name;
  this.isPlayer = new Boolean(isPlayer);
}

function Auction() {
  this.currentBid = 10
  this.winningParticipant = null;

  this.playerParticipant = new Participant('you', true),
  this.participants = [
    this.playerParticipant,
    new Participant('rival one', false),
    new Participant('rival two', false),
    new Participant('rival three', false),
    new Participant('rival four', false)
  ]
  var participant;
  for (var pi = 0; pi < this.participants.length; pi++) {
    participant = this.participants[pi]
    participant.element = document.createElement('li');
    participant.element.appendChild(document.createTextNode(participant.name))
    elements.participants.appendChild(participant.element);
  }

  this.update();
}
Auction.prototype.update = function() {
  elements.currentBid.innerText = this.currentBid.toString(10);

  for (var pi = 0; pi < this.participants.length; pi++) {
    participant = this.participants[pi]
    if ((participant === this.winningParticipant) ^ (participant.element.classList.contains('winning'))) {
      participant.element.classList.toggle('winning')
    }
  }

  if (this.winningParticipant !== null) {
    elements.highestBidder.innerText = this.winningParticipant.name;
    elements.winningBidder.innerText = this.winningParticipant.name;
  } else {
    elements.highestBidder.innerText = 'nobody';
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
  console.log('awoo');

  elements.bidButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    auction.bid(auction.playerParticipant);
  })
}

runAuction();
