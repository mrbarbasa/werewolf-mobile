// Room Lobby
Template.roomLobby.helpers({
  currentState: function() {
    return Rooms.findOne({name: this.name}).state;
  },
  currentRole: function() {
    return Players.findOne({name: Meteor.user().username}).role;
  },
  currentTime: function() {
    return Rooms.findOne(this._id).seconds;
  },
  serverMessage: function() {
    return Rooms.findOne(this._id).message;
  },
  canStartGame: function() {
    return Players.findOne({name: Meteor.user().username}).isHost && this.state === 'WAITING' && this.players.length === this.maxPlayers;
  },
  // TODO: Commented out for now
  // isPlaying: function() {
  //   return Rooms.findOne({name: this.name}).state === 'PLAYING';
  // },
  isNightPhase: function() {
    return Rooms.findOne({name: this.name}).phase === 'NIGHT';
  },
  isDayPhase: function() {
    return Rooms.findOne({name: this.name}).phase === 'DAY';
  }
});

Template.roomLobby.events({
  'click #start-game': function() {
    var room = this;
    Meteor.call('startGame', room);
  },
  // TODO: For testing only
  'click #game-cleanup': function() {
    Meteor.call('gameCleanup', this);
  },
  'click #leave-room': function() {
    Meteor.call('playerLeaveRoom', this.name);
  },
  'click #game-menu': function() {
    $('#role-villager').toggleClass('hidden');
    $('#role-seer').toggleClass('hidden');
    $('#role-werewolf').toggleClass('hidden');
  }
});


// Players List
Template.playersList.helpers({
  players: function() {
    var players = [];
    Rooms.findOne({name: this.name}).players.forEach(function(p) {
      players.push(Players.findOne(p._id));
    });
    return players;
  },
  playerState: function() {
    return this.isAlive ? 'living-player' : 'dead-player';
  },
  canSeeOtherRoles: function() {
    var p = Players.findOne({name: Meteor.user().username});
    // Note: this refers to the currently iterated player
    var werewolvesUnite = p.role === 'WEREWOLF' && this.role === 'WEREWOLF';
    var easyMode = false;
    if (p.roomId) {
      easyMode = Rooms.findOne(p.roomId).mode === 'EASY';
    }
    return (!this.isAlive && easyMode) || werewolvesUnite;
  },
  scannedBySeer: function() {
    var easyMode = false;
    if (this.roomId) {
      easyMode = Rooms.findOne(this.roomId).mode === 'EASY';
    }
    // If easy mode, player has to be alive, else if hard mode, show scanned info regardless
    return ((this.isAlive && easyMode) || !easyMode) && Session.get('scanned_' + this.name) === 'SCANNED';
  },
  scannedRole: function() {
    return this.role === 'WEREWOLF' ? 'WEREWOLF' : 'nope';
  },
  showKillButton: function() {
    var p = Players.findOne({name: Meteor.user().username});
    var nightPhase = false;
    var playerKilled = true;
    if (p.roomId) {
      var room = Rooms.findOne(p.roomId);
      if (room) {
        nightPhase = room.phase === 'NIGHT';
        playerKilled = room.playerKilled;
      }
    }
    return p.role === 'WEREWOLF' && p.isAlive && this.isAlive && nightPhase && !playerKilled && this.role !== 'WEREWOLF';
  },
  showScanButton: function() {
    var p = Players.findOne({name: Meteor.user().username});
    var nightPhase = false;
    if (p.roomId) {
      nightPhase = Rooms.findOne(p.roomId).phase === 'NIGHT';
    }
    return p.role === 'SEER' && p.isAlive && this.isAlive && nightPhase && this.role !== 'SEER' && Session.get('scanned_' + this.name) !== 'SCANNED';
  }
});

Template.playersList.events({
  'click #kill-player': function() {
    Meteor.call('playerKillPlayer', this);
  },
  'click #scan-player': function() {
    Session.set('scanned_' + this.name, 'SCANNED');
  }
});


// Role Villager
Template.roleVillager.helpers({
  villager: function() {
    return "I am a villager";
  }
});


// Role Seer
Template.roleSeer.helpers({
  seer: function() {
    return "I am a seer";
  }
});


// Role Werewolf
Template.roleWerewolf.helpers({
  werewolf: function() {
    return "I am a werewolf";
  }
});
