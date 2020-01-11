class State {
  players = [];
  fruits = [];
  online = 0;

  addFruit(fruit) {
    this.fruits.push(fruit);
  }
  removeFruit(x, y, z) {
    state.fruits.map((fruit, key) => {
      if (fruit.x === x && fruit.y === y && fruit.z === z) {
        state.fruits.splice(key, 1);
      }
    });
  }
  clearFruits() {
    this.fruits = [];
  }

  addPlayer(playerID, color) {
    const player = {
      id: playerID,
      color,
      points: 0,
      level: 3,
      x: 19,
      y: 20,
      z: -1
    };
    this.players.push(player);
    this.online = this.players.length;
  }
  async addPoints(playerID) {
    const player = await this.players[this.findByID(playerID)];
    player.points += 1;
  }
  findByID(playerID) {
    let playerKey;

    this.players.map((player, key) => {
      if (player.id == playerID) {
        playerKey = key;
      }
    });

    return playerKey;
  }
  removePlayer(playerID) {
    this.players.splice(this.findByID(playerID), 1);
  }
  async movePlayer(direction, playerID) {
    const player = await this.players[this.findByID(playerID)];
    if (player) {
      if (player.level === 1) {
        switch (direction) {
          case "w":
            player.y += 1;
            break;
          case "a":
            if (player.x - 1 > -1) player.x -= 1;
            break;
          case "s":
            if (player.y - 1 > -1) {
              player.y -= 1;
            }
            break;
          case "d":
            player.x += 1;
            break;
          default:
            break;
        }
      } else if (player.level === 2) {
        switch (direction) {
          case "w":
            player.y += 1;
            break;
          case "a":
            player.z += 1;
            break;
          case "s":
            if (player.y - 1 > -1) player.y -= 1;
            break;
          case "d":
            if (player.z - 1 > -21) player.z -= 1;
            break;
          default:
            break;
        }
      } else if (player.level === 3) {
        switch (direction) {
          case "w":
            if (player.x - 1 > -1 && player.z - 1 > -21) {
              player.x -= 1;
              player.z -= 1;
            }
            break;
          case "a":
            player.z += 1;
            break;
          case "s":
            if (player.x == 19 && player.z == -1) {
            } else {
              player.x += 1;
              player.z += 1;
            }
            break;
          case "d":
            if (player.z - 1 > -21) player.z -= 1;
            break;
          default:
            break;
        }
      }
      if (player.y === 20 && player.level === 1) {
        player.level = 3;
        player.z -= 1;
      }
      if (player.x === 20 && player.level === 1) {
        player.level = 2;
        player.z -= 1;
      }
      if (player.z === 0 && player.level === 2) {
        player.level = 1;
        player.x -= 1;
      }
      if (player.y === 20 && player.level === 2) {
        player.level = 3;
        player.x -= 1;
      }
      if (player.z === 0 && player.level === 3) {
        player.level = 1;
        player.y -= 1;
      }
      if (player.x === 20 && player.level === 3) {
        player.level = 2;
        player.y -= 1;
      }
    }
  }
}

const state = new State();

module.exports = state;
