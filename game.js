var GOING_STEP_LENGTH = 2000;
var AUCTIONEER_STEP_LENGTH = 500;
var AUDIENCE_STEP_LENGTH = 1000;

var ROOM_WALL_WIDTH = 20;
var ROOM_WALL_LENGTH = 320;
var DOOR_SIZE = ROOM_WALL_LENGTH/4;
var STEPS_SIZE = ROOM_WALL_LENGTH*0.8;
var SPRITE_SIZE = 128;

var REQUIRED_ROOM_WEIGHT = 40/100;
var FURNITURE_WEIGHT = 30/100;
var STYLES_WEIGHT = 30/100;

var HOUSE_PRICES = [
  200,
  300,
  500,
  1000,
  5000,
  10000,
];

var STYLES = [
  'cute',
  'cool',
  'stylish',
  'weird',
];
var ANY_STYLE = 'new';
var STYLE_OPTIONS = STYLES.concat([ANY_STYLE]);

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
  clientBudget: document.getElementById('client-budget'),
  clientStory: document.getElementById('client-story'),
  clientPreferences: document.getElementById('client-preferences'),
  inspection: document.getElementById('inspection'),
  floorPlanCanvas: document.getElementById('floorplan-canvas'),
  floorPlan: document.getElementById('floorplan'),
  rooms: document.getElementById('rooms'),
  furniture: document.getElementById('furniture'),
  acceptLot: document.getElementById('accept-lot'),
  auctionHouse: document.getElementById('auction-house'),
  displayedFloorPlan: document.getElementById('displayed-floor-plan'),
  auctioneer: document.getElementById('auctioneer'),
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
  this.funds = 10000;
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

function chooseSentence(options) {
  string = '';
  baseList = choice(options);
  for (var i = 0; i < baseList.length; i++) {
    string = string + choice(baseList[i]);
  }
  return string;
}

function splitCamel(camelCasePhrase) {
  return camelCasePhrase.replace(/([A-Z])/g, function(m) {
    return ' ' + m.toLowerCase();
  }).trim();
}

function capFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function Client() {
  this.budget = choice(HOUSE_PRICES)/2;
  elements.clientBudget.innerText = this.budget.toString(10);
  this.sprite = choice(CLIENT_SPRITES);
  this.story = [
    chooseSentence(CLIENT_STORIES.A),
    chooseSentence(CLIENT_STORIES.A),
    chooseSentence(CLIENT_STORIES.B),
  ];

  this.desiredStyle = choice(STYLE_OPTIONS);

  this.desiredRoom = choice(ROOMS);
  this.preferences = [
    chooseSentence(CLIENT_PREFERENCES.A),
    chooseSentence(CLIENT_PREFERENCES.B).replace('<style>', this.desiredStyle),
    chooseSentence(CLIENT_PREFERENCES.C) + ' a ' + this.desiredRoom.toLowerCase() + '.',
  ];

  this.desiredItems = [];
  var itemName;
  for (var i = 2; i > 0; i--) {
    itemName = choice(FURNITURE_SPRITES).name;
    this.desiredItems.push(itemName);
    this.preferences.push(chooseSentence(CLIENT_PREFERENCES.E) + ' ' + splitCamel(itemName) + '.');
  }
}
Client.prototype.affinityFor = function(lot) {
  score = 0;

  if (lot.rooms.indexOf(this.desiredRoom) !== -1) {
    score += REQUIRED_ROOM_WEIGHT;
  }

  var tagScore = 0;
  var furnitureScore = 0;
  var item;
  for (var fi = 0; fi < lot.furniture.length; fi++) {
    if (
      (lot.furniture[fi].tags.indexOf(this.desiredStyle) !== -1) ||
      (this.desiredStyle === ANY_STYLE)
    ) {
      tagScore += 1;
    }

    if (this.desiredItems.indexOf(lot.furniture[fi].name) !== -1) {
      furnitureScore += (1 / this.desiredItems.length);
    }
  }

  tagScore = (tagScore / lot.furniture.length) * STYLES_WEIGHT;
  score += tagScore;
  score += furnitureScore * FURNITURE_WEIGHT;

  return score;
};
Client.prototype.priceCompatibility = function(price) {
  var negativeWeighting = -1;
  var positiveWeighting = 0.1;
  var underBudgetRatio = (this.budget - price) / this.budget;
  var weight;
  if (underBudgetRatio > 0) {
    weight = positiveWeighting;
  } else {
    weight = negativeWeighting;
  }
  return Math.max((1 - (weight * underBudgetRatio)), 0);
};
Client.prototype.satisfactionWith = function(lot, price) {
  return this.affinityFor(lot) * this.priceCompatibility(price);
};

function Lot() {
  currentLot++;

  this.address = (Math.floor(Math.pow(Math.random(), 3) * 200) + 1).toString(10) + ' ' + choice(choice(STREET_NAMES_A)) + ' ' + choice(choice(STREET_NAMES_B)) + ', ' + choice(PLACE_NAMES);
  this.furniture = [];
  this.rooms = [];
  this.draw();

  document.getElementById('match-rate').innerText = client.affinityFor(this).toString(10);
}
Lot.prototype.inspect = function() {
  elements.inspection.querySelector('.address').innerText = this.address;
  elements.inspection.querySelector('.lot-number').innerText = currentLot.toString(10);
  elements.inspection.querySelector('.total-lots').innerText = totalLots.toString(10);
  elements.auctionHouse.querySelector('.address').innerText = this.address;
};
Lot.prototype.draw = function() {
  var ctx = elements.floorPlanCanvas.getContext('2d');
  ctx.clearRect(0, 0, elements.floorPlanCanvas.width, elements.floorPlanCanvas.height);
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
        this.furniture.push(sprite);
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
        var roomName = choice(ROOMS);
        this.rooms.push(roomName);
        ctx.fillText(roomName, locForCoordinate(x) + ROOM_WALL_LENGTH / 2, locForCoordinate(y) + ROOM_WALL_LENGTH / 2);
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

  while (this.rooms.length < 2 + Math.floor(Math.random() * 4)) {
    this.rooms.push(choice(ROOMS));
  }

  this.floorPlan = elements.floorPlanCanvas.toDataURL();
  elements.floorPlan.src = this.floorPlan;
  elements.displayedFloorPlan.src = this.floorPlan;

  var li;

  elements.rooms.innerHTML = '';
  for (var ri = 0; ri < this.rooms.length; ri++) {
    li = document.createElement('li');
    li.innerText = this.rooms[ri];
    elements.rooms.appendChild(li);
  }

  elements.furniture.innerHTML = '';
  for (var fi = 0; fi < this.furniture.length; fi++) {
    li = document.createElement('li');
    li.innerText = capFirst(
      this.furniture[fi].tags.join(' ') + ' ' +
      splitCamel(this.furniture[fi].name)
    );
    elements.furniture.appendChild(li);
  }
};

function Auction() {
  this.currentBid = 10;
  this.appraisal = choice(HOUSE_PRICES);
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
        alert('you won this house! the client\'s satisfaction was ' + client.satisfactionWith(lot, self.currentBid).toString(10));
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

  elements.clientStory.innerHTML = '';
  var p;
  for (var si = 0; si < client.story.length; si++) {
    p = document.createElement('p');
    p.innerText = client.story[si];
    elements.clientStory.appendChild(p);
  }

  elements.clientPreferences.innerHTML = '';
  for (var pi = 0; pi < client.preferences.length; pi++) {
    p = document.createElement('p');
    p.innerText = client.preferences[pi];
    elements.clientPreferences.appendChild(p);
  }
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
