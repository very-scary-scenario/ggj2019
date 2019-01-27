var GOING_STEP_LENGTH = 2000;
var AUCTIONEER_STEP_LENGTH = 500;
var AUDIENCE_STEP_LENGTH = 1000;

var ROOM_WALL_WIDTH = 20;
var ROOM_WALL_LENGTH = 320;
var DOOR_SIZE = ROOM_WALL_LENGTH/4;
var STEPS_SIZE = ROOM_WALL_LENGTH*0.8;
var SPRITE_SIZE = 128;

var ROOMS = [
  'Toilet',
  'Bedroom',
  'Lounge',
  'Dungeon',
  'Hallway',
  'Kitchen',
  'Office',
  'Guest room',
  'Pantry',
  'Parlour',
  'Closet',
];

var elements = {
  introduction: document.getElementById('client-introduction'),
  acceptClient: document.getElementById('accept-client'),
  clientAvatar: document.getElementById('client-avatar'),
  inspection: document.getElementById('inspection'),
  floorPlan: document.getElementById('floorplan'),
  acceptLot: document.getElementById('accept-lot'),
  auctionHouse: document.getElementById('auction-house'),
  displayedFloorPlan: document.getElementById('displayed-floor-plan'),
  auctioneer: document.getElementById('auctioneer'),
  wallet: document.getElementById('wallet'),
  currentBid: document.getElementById('current-bid'),
  highestBidder: document.getElementById('highest-bidder'),
  winningBidder: document.getElementById('winning-participant'),
  participants: document.getElementById('participants'),
  bidButton: document.getElementById('bid-button'),
  goings: document.querySelectorAll('#goings span')
};

var client;
var currentLot = 0;
var totalLots = 4;
var lot;
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
  new Participant('Pherdinand van Maxinpants', false),
  new Participant('Felicity Spendilwick', false),
  new Participant('Hugh G. Waddington IV', false),
  new Participant('Freddy "Wydelad" Bloggsmith', false)
];
var playerParticipant = new Participant('you', true);
var allParticipants = [playerParticipant].concat(enemyParticipants);
var participant;
for (var pi = 0; pi < allParticipants.length; pi++) {
  participant = allParticipants[pi];
  participant.element = document.createElement('li');
  participant.element.classList.add(participant.isPlayer ? 'player' : 'enemy');
  participant.element.appendChild(document.createTextNode(participant.name));
  elements.participants.appendChild(participant.element);
}

function Client() {
  this.sprite = choice(CLIENT_SPRITES);
}

function Lot() {
  currentLot++;

  this.address = (Math.floor(Math.pow(Math.random(), 3) * 200) + 1).toString(10) + ' ' + choice(choice(STREET_NAMES_A)) + ' ' + choice(choice(STREET_NAMES_B)) + ', ' + choice(PLACE_NAMES);
  this.draw();
}
Lot.prototype.inspect = function() {
  elements.inspection.querySelector('.address').innerText = this.address;
  elements.inspection.querySelector('.lot-number').innerText = currentLot.toString(10);
  elements.inspection.querySelector('.total-lots').innerText = totalLots.toString(10);
  elements.auctionHouse.querySelector('.address').innerText = this.address;
};
Lot.prototype.draw = function() {
  var ctx = elements.floorPlan.getContext('2d');
  ctx.clearRect(0, 0, elements.floorPlan.width, elements.floorPlan.height);
  ctx.font = (ROOM_WALL_WIDTH * 2).toString(10) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.imageSmoothingEnabled = true;

  function locForCoordinate(coord) {
    return (
      DOOR_SIZE +
      (Math.floor(coord/2) * ROOM_WALL_LENGTH) +
      (Math.floor((coord+1)/2) * ROOM_WALL_WIDTH)
    );
  }
  function sizeForCoordinate(coord) {
    return (coord % 2) ? ROOM_WALL_LENGTH : ROOM_WALL_WIDTH;
  }

  for (var y = 0; y < 7; y++) { for (var x = 0; x < 7; x++) {
    if ((x % 2) && (y % 2)) {
      // this is the space inside a room

      // should there be steps here?
      if (Math.random() < (1/10)) {
        var margin = Math.floor(0.5 * (ROOM_WALL_LENGTH - STEPS_SIZE));
        var step = choice(STEP_SPRITES);
        ctx.drawImage(document.getElementById('sprite-' + step.prefix), locForCoordinate(x) + margin, locForCoordinate(y) + margin, STEPS_SIZE, STEPS_SIZE);
        continue;
      }

      // should we furnish it?
      var sprite;
      var itemNeed = 0.6;

      while (Math.random() < itemNeed) {
        itemNeed = itemNeed/2;
        sprite = choice(FURNITURE_SPRITES);
        var spriteX = locForCoordinate(x);
        var spriteY = locForCoordinate(y);

        // pick a wall to stick to
        if (Math.random() > 0.5) {
          spriteX += Math.floor(Math.random() * (ROOM_WALL_LENGTH - SPRITE_SIZE));
          spriteY = (Math.random() > 0.5) ? spriteY : spriteY + (ROOM_WALL_LENGTH - SPRITE_SIZE);
        } else {
          spriteY += Math.floor(Math.random() * (ROOM_WALL_LENGTH - SPRITE_SIZE));
          spriteX = (Math.random() > 0.5) ? spriteX : spriteX + (ROOM_WALL_LENGTH - SPRITE_SIZE);
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(document.getElementById('sprite-' + sprite.prefix), spriteX, spriteY, SPRITE_SIZE, SPRITE_SIZE);
        ctx.imageSmoothingEnabled = true;
      }

      // should we give it a name?
      if (Math.random() < 0.25) {
        ctx.fillText(choice(ROOMS), locForCoordinate(x) + ROOM_WALL_LENGTH / 2, locForCoordinate(y) + ROOM_WALL_LENGTH / 2);
      }

      continue;
    } else if ((x % 2) || (y % 2)) {
      // this is a wall
      if (x === 0 || x === 6 || y === 0 || y === 6) {
        // this is an external wall
        // should we put a window on it?
        if (Math.random() > 0.5) {
          if (x % 2) {
            ctx.drawImage(document.getElementById('floorplan-window-h'), locForCoordinate(x), locForCoordinate(y), sizeForCoordinate(x), sizeForCoordinate(y));
          } else {
            ctx.drawImage(document.getElementById('floorplan-window-v'), locForCoordinate(x), locForCoordinate(y), sizeForCoordinate(x), sizeForCoordinate(y));
          }
          continue;
        }
      } else {
        // this is a space for an internal wall
        // do we want to leave it empty?
        if (Math.random() > 0.4) {
          continue;
        // do we want a door on it?
        } else if (Math.random() > 0.5) {
          if (x % 2) {
            // this is a horizontal wall
            if (Math.random() > 0.5) {
              ctx.drawImage(document.getElementById('floorplan-door-n'), locForCoordinate(x) + Math.floor(Math.random() * (ROOM_WALL_LENGTH - DOOR_SIZE)), locForCoordinate(y) - DOOR_SIZE, DOOR_SIZE, DOOR_SIZE);
            } else {
              ctx.drawImage(document.getElementById('floorplan-door-s'), locForCoordinate(x) + Math.floor(Math.random() * (ROOM_WALL_LENGTH - DOOR_SIZE)), locForCoordinate(y + 1), DOOR_SIZE, DOOR_SIZE);
            }
          } else if (y % 2) {
            // this is a vertical wall
            if (Math.random() > 0.5) {
              ctx.drawImage(document.getElementById('floorplan-door-w'), locForCoordinate(x) - DOOR_SIZE, locForCoordinate(y) + Math.floor(Math.random() * (ROOM_WALL_LENGTH - DOOR_SIZE)), DOOR_SIZE, DOOR_SIZE);
            } else {
              ctx.drawImage(document.getElementById('floorplan-door-e'), locForCoordinate(x + 1), locForCoordinate(y) + Math.floor(Math.random() * (ROOM_WALL_LENGTH - DOOR_SIZE)), DOOR_SIZE, DOOR_SIZE);
            }
          }
        }
      }
    } else {
      // this is a node
    }

    ctx.fillRect(locForCoordinate(x), locForCoordinate(y), sizeForCoordinate(x), sizeForCoordinate(y));
  }}

  this.floorPlan = elements.floorPlan.toDataURL();
  elements.displayedFloorPlan.src = this.floorPlan;
};

function Auction() {
  this.currentBid = 10;
  this.appraisal = 500;
  this.winningParticipant = null;
  this.goingLevel = 0;

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
  var self = this;

  elements.wallet.innerText = playerParticipant.funds.toString(10);
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
    this.winningParticipant.funds -= this.currentBid;

    if (this.winningParticipant === playerParticipant) {
      setTimeout(function() {
        alert('you won this house!');
        introduceClient();
      }, GOING_STEP_LENGTH);
    } else {
      setTimeout(function() {
        alert('you did not win this house');
        doLot();
      }, GOING_STEP_LENGTH);
    }

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
  elements.introduction.classList.remove('active');
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
  // pre-cache stuff
  var sprite;
  var cacheableImages = FURNITURE_SPRITES.concat(STEP_SPRITES).concat(CLIENT_SPRITES);
  for (var si = 0; si < cacheableImages.length; si++) {
    sprite = new Image();
    sprite.src = cacheableImages[si].path;
    sprite.id = 'sprite-' + cacheableImages[si].prefix;
    document.getElementById('image-cache').appendChild(sprite);
  }

  introduceClient();
}

function gameShouldContinue() {
  if (currentLot >= totalLots) {
    alert('this game is over, we do not yet know how to tell you how well you did');
    return false;
  } else {
    return true;
  }
}

function introduceClient() {
  if (!gameShouldContinue()) return;

  client = new Client();
  elements.clientAvatar.setAttribute('src', client.sprite.path);
  elements.auctionHouse.classList.remove('active');
  elements.inspection.classList.remove('active');
  elements.introduction.classList.add('active');
}

function doLot() {
  if (!gameShouldContinue()) return;

  // introduce a new lot, and then run the auction
  lot = new Lot();
  lot.inspect();
  elements.auctionHouse.classList.remove('active');
  elements.introduction.classList.remove('active');
  elements.inspection.classList.add('active');
}

elements.acceptLot.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  runAuction(lot);
});

elements.acceptClient.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  doLot();
});

elements.bidButton.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  auction.bid(playerParticipant);
});

doLoop();
