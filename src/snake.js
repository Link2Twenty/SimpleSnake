/**
 * Snake.js - A snake game in javascript using HTML5 canvas.
 * version 0.1
 *
 * created by: Andrew Bone (link2twenty.github.io)
 */

// Constants to be used in the game
const GAME_WIDTH = 35;
const GAME_HEIGHT = 35;
const GAME_RESOLUTION = 25;
const GAME_BACKGROUND = "#ADC3B7";
const GAME_COLOR = "#233223";

const SNAKE_START_LENGTH = 5;
const SNAKE_START_X = Math.floor(GAME_WIDTH / 2);
const SNAKE_START_Y = Math.floor(GAME_HEIGHT / 2);
const SNAKE_START_SPEED = 100;

const FOOD_TOTAL = 1;

/**
 * initialize the game
 *
 * @param {HTMLCanvasElement} canvas - the canvas element to draw on
 */
const init = (canvas, scorebox) => {
  // get the context of the canvas
  const context = canvas.getContext("2d");

  // set the canvas width and height
  canvas.width = GAME_WIDTH * GAME_RESOLUTION;
  canvas.height = GAME_HEIGHT * GAME_RESOLUTION;

  // style the score
  scorebox.style.backgroundColor = GAME_COLOR;
  scorebox.style.color = GAME_BACKGROUND;
  scorebox.style.width = GAME_WIDTH * GAME_RESOLUTION + 2 + "px";

  // create the snake
  const snake = new Snake(
    SNAKE_START_X,
    SNAKE_START_Y,
    SNAKE_START_LENGTH,
    SNAKE_START_SPEED,
    GAME_COLOR
  );

  // create the food
  const foods = [...new Array(FOOD_TOTAL)].map(() => new Food(snake));

  // listen for key presses and update the snake direction
  document.addEventListener("keydown", (e) => snake.setDirection(e));

  // start the game loop
  const gameLoop = (delta) => {
    if (snake.dead) return;

    // clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = GAME_BACKGROUND;
    context.fill();

    // draw the snake
    snake.draw(context, delta);

    // check if the snake has collided with the food
    foods.forEach((food) => {
      food.draw(context, delta);

      // if the food has not snake has not eaten the food continue
      if (!snake.hasCollided(food)) return;

      snake.grow();
      food.generate(snake);

      //update score
      scorebox.textContent = `Score: ${snake.score}`;
    });

    requestAnimationFrame(gameLoop);
  };

  // start the game loop
  requestAnimationFrame(gameLoop);
};

class Snake {
  #body = [];
  #color = "";
  #dead = false;
  #delta = null;
  #direction = { x: 1, y: 0 };
  #speed = 0;
  #startNode = { x: null, y: null, length: null };

  constructor(x, y, length, speed, color) {
    this.#startNode = { x, y, length, speed };
    this.#color = color;

    this.#spawnSnake();
  }

  /**
   * Getter for body array
   *
   * @returns {Array} array of body segements
   */
  get body() {
    return this.#body;
  }

  /**
   * Getter for the dead property
   *
   * @returns {Boolean} is the snake dead?
   */
  get dead() {
    return this.#dead;
  }

  /**
   * Getter for the current length minus the starting length
   *
   * @returns {Number} current length minus starting length
   */
  get score() {
    return this.#body.length - this.#startNode.length;
  }

  /**
   * function to move the snake
   */
  #move() {
    const nextX = this.#body[0].x + this.#direction.x;
    const nextY = this.#body[0].y + this.#direction.y;

    const newHead = {
      x: nextX > GAME_WIDTH - 1 ? 0 : nextX < 0 ? GAME_WIDTH - 1 : nextX,
      y: nextY > GAME_HEIGHT - 1 ? 0 : nextY < 0 ? GAME_HEIGHT - 1 : nextY,
    };

    // move each part of the snake
    for (let i = this.#body.length - 1; i >= 1; i--) {
      const part = this.#body[i];
      const previousPart = this.#body[i - 1];

      if (part.x === newHead.x && part.y === newHead.y) this.#dead = true;

      part.x = previousPart.x;
      part.y = previousPart.y;
    }

    // move the head
    this.#body[0].x = newHead.x;
    this.#body[0].y = newHead.y;
  }

  /**
   * Function to spawn the snake in its initial position
   */
  #spawnSnake() {
    const { x, y, length, speed } = this.#startNode;

    this.#body = [];
    this.#body.push({
      part: "head",
      x: x,
      y: y,
    });

    for (let part = 1; part < length; part++) {
      this.#body.push({
        part: "body",
        x: x - part,
        y: y,
      });
    }

    this.#delta = null;
    this.#direction = { x: 1, y: 0 };
    this.#speed = speed;
  }

  /**
   * function to draw the snake
   *
   * @param {ctx} context 2d context of the canvas
   * @param {number} delta timestamp from requestAnimationFrame
   */
  draw(context, delta) {
    // draw the snake
    context.fillStyle = this.#color;

    // draw the tail
    for (let i = 0; i < this.#body.length; i++) {
      context.fillRect(
        this.#body[i].x * GAME_RESOLUTION - 1,
        this.#body[i].y * GAME_RESOLUTION - 1,
        GAME_RESOLUTION - 1,
        GAME_RESOLUTION - 1
      );
    }

    if (!this.#delta) this.#delta = delta;

    if (delta - this.#delta > this.#speed) {
      this.#move();
      this.#delta = delta;
    }
  }

  /**
   * Function to add a new part to the snake
   */
  grow() {
    const directionX =
      this.#body[this.#body.length - 1].x - this.#body[this.#body.length - 2].x;
    const directionY =
      this.#body[this.#body.length - 1].y - this.#body[this.#body.length - 2].y;

    const newPart = {
      part: "body",
      x: this.#body[this.#body.length - 1].x + directionX,
      y: this.#body[this.#body.length - 1].y + directionY,
    };

    this.#body.push(newPart);
    this.#speed = this.#speed > 0 ? this.#speed - 1 : 0;
  }

  /**
   * Function to check if the snake has collided with the food
   *
   * @param {Food} food instance of the food class
   * @returns {Boolean} has the food been eaten?
   */
  hasCollided(food) {
    const { x, y } = this.#body[0];

    return x === food.x && y === food.y;
  }

  reset() {
    this.#dead = false;
    this.#spawnSnake();
  }

  /**
   * update the direction of the snake
   *
   * @param {'up'|'down'|'left'|'right'} direction set the direction of the snake
   */
  setDirection({ code }) {
    const direction = ["KeyW", "ArrowUp"].includes(code)
      ? "up"
      : ["KeyS", "ArrowDown"].includes(code)
      ? "down"
      : ["KeyA", "ArrowLeft"].includes(code)
      ? "left"
      : ["KeyD", "ArrowRight"].includes(code)
      ? "right"
      : null;

    // change the direction of the snake
    const lastX = this.#body[0].x - this.#body[1].x;
    const lastY = this.#body[0].y - this.#body[1].y;

    switch (direction) {
      case null:
        return;
      case "up":
        if (lastY === 1) break;
        this.#direction.x = 0;
        this.#direction.y = -1;
        break;
      case "down":
        if (lastY === -1) break;
        this.#direction.x = 0;
        this.#direction.y = 1;
        break;
      case "left":
        if (lastX === 1) break;
        this.#direction.x = -1;
        this.#direction.y = 0;
        break;
      case "right":
        if (lastX === -1) break;
        this.#direction.x = 1;
        this.#direction.y = 0;
        break;
    }
  }
}

class Food {
  constructor(snake) {
    this.generate(snake);
  }

  /**
   * Draw the food into the world
   */
  draw(context) {
    // draw the food
    context.fillStyle = GAME_COLOR;
    context.fillRect(
      this.x * GAME_RESOLUTION - 1,
      this.y * GAME_RESOLUTION - 1,
      GAME_RESOLUTION - 1,
      GAME_RESOLUTION - 1
    );
  }

  /**
   * Place food into the world
   *
   * @param {Snake} snake an instance of a snake
   * @returns {void}
   */
  generate(snake) {
    // generate a new food
    this.x = Math.round(Math.random() * (GAME_WIDTH - 1));
    this.y = Math.round(Math.random() * (GAME_HEIGHT - 1));

    // check if the food is on the snake
    for (const part of snake.body) {
      if (this.x === part.x && this.y === part.y) {
        this.generate(snake);
        return;
      }
    }
  }
}

// initialize the game
init(document.getElementById("game"), document.querySelector(".score"));
