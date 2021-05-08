const app = require("http").createServer();
const io = require("socket.io")(app, {
  cors: {
    origin: "https://sampaioleal.github.io",
  },
});
const cron = require("node-cron");

const state = require("./state");

app.listen(3000);

// Colors that will be used to define the cube color for each player
const colors = [
  "#d41414",
  "#821818",
  "#000000",
  "#d6165d",
  "#bf18ba",
  "#6018bf",
  "#182dbf",
  "#1872bf",
  "#16a7a0",
  "#16a750",
  "#40a716",
  "#ffeb3b",
  "#f17c18",
];

function notifyAll() {
  io.emit("update", state);
}

// Get a random color
function getColor() {
  return colors[Math.round(Math.random() * colors.length)];
}

// Add a fruit to the map randomly
function addFruits() {
  // LOGIC: Add a fruit on level 1
  function level1() {
    let fruit = {
      x: Math.round(Math.random() * 19),
      y: Math.round(Math.random() * 19),
      z: -0.5,
    };
    if (hasFruit(fruit.x, fruit.y, fruit.z)) {
      addFruits();
    } else {
      state.addFruit(fruit);
    }
  }

  // LOGIC: Add a fruit on level 2
  function level2() {
    let fruit = {
      x: 19.5,
      y: Math.round(Math.random() * 19),
      z: Math.round(Math.random() * -19) - 1,
    };
    if (hasFruit(fruit.x, fruit.y, fruit.z)) {
      addFruits();
    } else {
      state.addFruit(fruit);
    }
  }

  // LOGIC: Add a fruit on level 3
  function level3() {
    let fruit = {
      x: Math.round(Math.random() * 19),
      y: 19.5,
      z: Math.round(Math.random() * -19) - 1,
    };
    if (hasFruit(fruit.x, fruit.y, fruit.z)) {
      addFruits();
    } else {
      state.addFruit(fruit);
    }
  }

  // Compute which level a new fruit will be added
  const add = [level1, level2, level3];
  add[Math.round(Math.random() * 2)]();
}

// Check if already exists a fruit in the respective coords
function hasFruit(x, y, z) {
  let result = false;
  state.fruits.map((fruit) => {
    if (fruit.x === x && fruit.y === y && fruit.z === z) {
      result = true;
    }
  });
  return result;
}

// Check player collision with a fruit
async function checkCollision(playerID, notifyCollision) {
  let player = await state.players[state.findByID(playerID)];

  // This needs to be more optimized
  switch (player.level) {
    case 1:
      if (hasFruit(player.x, player.y, -0.5)) {
        state.addPoints(playerID);
        state.removeFruit(player.x, player.y, -0.5);
        notifyCollision();
      }
      break;
    case 2:
      if (hasFruit(19.5, player.y, player.z)) {
        state.addPoints(playerID);
        state.removeFruit(19.5, player.y, player.z);
        notifyCollision();
      }
      break;
    case 3:
      if (hasFruit(player.x, 19.5, player.z)) {
        state.addPoints(playerID);
        state.removeFruit(player.x, 19.5, player.z);
        notifyCollision();
      }
      break;

    default:
      break;
  }
}

// Socket logics
io.on("connection", function (socket) {
  // This needs to be outside the socket logics
  function notifyCollision() {
    socket.emit("collision");
  }

  socket.emit("welcome", state);

  socket.on("addPlayer", () => {
    state.addPlayer(socket.id, getColor());
    notifyAll();
  });

  socket.on("movePlayer", async (direction) => {
    await state.movePlayer(direction, socket.id);
    checkCollision(socket.id, notifyCollision);
    notifyAll();
  });

  socket.on("disconnect", () => {
    state.removePlayer(socket.id);
    notifyAll();
  });
});

// Cron job to compute  new fruits
// Clear all fruits when reach the limit
cron.schedule("*/4 * * * * *", () => {
  if (state.fruits.length < 1200) {
    addFruits();
    notifyAll();
  } else {
    state.clearFruits();
  }
});
