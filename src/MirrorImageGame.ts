import Game from "./sleek/Game";
import Graphics from "./sleek/Graphics";
import { CLICK, LEVEL, LOGO, NEXT, RIGHT, WRONG }  from "./MirrorImageResources";
import SplashPage from "./SplashPage";

const SKY: string = "#151515";
const MIRROR: string = "#3c3c3c";
const COLORS: string[] = ["#01b3e1", "#f64b41", "#01bf9b", "#fd8336", "#fc5372"];
const GROW_SPEED: number = 0.1;
const ROTATE_SPEED: number = 0.1;
const TIME_LIMIT: number = 60;

export default class MirrorImageGame extends Game {
  ang: number = 0;
  targetAng: number = 0;

  mirrorLength: number = 1000;
  mainSize: number = 512;
  optionSize: number = 256;
  optionCount: number = 2;
  patternSize: number = 2;

  patternScale: number = 0;


  mousePressed: boolean = false;
  mouseX: number;
  mouseY: number;

  target: number[];
  options: number[][];
  colorCount: number = 2;
  resourcesLoaded: boolean = false;
  correctOption: number = 0;

  patternDelta: number = GROW_SPEED;
  score: number = 0;
  time: number = TIME_LIMIT;
  atStart: boolean = true;
  startTime: number;
  atEnd: boolean = false;
  count: number = 0;

  splashPage: SplashPage;

  constructor() {
    super();

    super.init();
  }

  mouseDown(x: number, y: number) {
    this.mousePressed = true;
    this.mouseX = x;
    this.mouseY = y;
  }

  onResourcesLoaded(): void {
    console.log("Resources loaded");
    this.splashPage = new SplashPage(LOGO, () => {
      this.splashPage = null;
    });
    
    this.resourcesLoaded = true;
  }

  startGame(): void {
    this.startTime = new Date().getTime();
    this.atStart = false;
    this.ang = 0;
    this.targetAng = 0;
    this.patternScale = 0;
    this.score = 0;
    this.count = 0;
    this.optionCount = 2;
    this.colorCount = 2;
    this.nextPattern();
  }

  generatePattern() {
    if (this.count === 10) {
      this.optionCount = 3;
      LEVEL.play();
    }
    if (this.count === 20) {
      this.colorCount = 3;
      LEVEL.play();
    }
    this.count++;
    this.patternSize = 2;
    NEXT.play();

    this.target = [];
    let mixed: boolean = false;
    for (let y = 0; y < this.patternSize; y++) {
      for (let x = 0; x < this.patternSize; x++) {
        const tile: number = Math.floor(Math.random() * this.colorCount);
        this.target.push(tile);

        if (tile != this.target[0]) {
          mixed = true;
        }
      }
    }

    if (!mixed) {
      const x: number = Math.floor(Math.random() * this.patternSize);
      const y: number = Math.floor(Math.random() * this.patternSize);
      const tile: number = (this.target[0] + 1) % this.colorCount;

      this.target[x + (y * this.patternSize)] = tile;
    }

    this.correctOption = Math.floor(Math.random() * this.optionCount);
    this.options = [];
    for (let option = 0; option < this.optionCount; option++) {
      const optionPattern: number[] = [];
      this.options.push(optionPattern);

      for (let y = 0; y < this.patternSize; y++) {
        for (let x = 0; x < this.patternSize; x++) {
          const ty: number = this.patternSize - 1 - y;
          const col: number = this.target[x + (ty * this.patternSize)];
          optionPattern.push(col);
        }
      }

      if (option != this.correctOption) {
        // mix it up a bit
        const first: number[] = [];
        const others: number[] = [];

        for (let i = 0; i < optionPattern.length; i++) {
          if (optionPattern[i] === optionPattern[0]) {
            first.push(i);
          } else {
            others.push(i);
          }
        }

        const f: number = first[Math.floor(Math.random() * first.length)];
        const o: number = others[Math.floor(Math.random() * others.length)];

        const temp: number = optionPattern[f];
        optionPattern[f] = optionPattern[o];
        optionPattern[o] = temp;
      }
    }
  }

  drawPattern(xp: number, yp: number, size: number, pattern: number[]): void {
    const tileSize: number = Math.floor(size / this.patternSize);

    for (let y = 0; y < this.patternSize; y++) {
      for (let x = 0; x < this.patternSize; x++) {
        const col: string = COLORS[pattern[x + (y * this.patternSize)]];
        Graphics.fillRoundedRect(xp + (x * tileSize) + (tileSize / 2) - ((tileSize / 2) * this.patternScale),
          yp + (y * tileSize) + (tileSize / 2) - ((tileSize / 2) * this.patternScale),
          (tileSize - 3) * this.patternScale,
          (tileSize - 3) * this.patternScale, size / 20, col);
      }
    }
  }

  nextPattern(): void {
    this.generatePattern();
    this.patternDelta = GROW_SPEED;
  }

  update(): void {
    if (!this.resourcesLoaded) {
      return;
    }
    if (this.splashPage) {
      this.splashPage.draw();
      this.splashPage.update();
      return;
    }

    (<any>Graphics.ctx).webkitImageSmoothingEnabled = true;
    (<any>Graphics.ctx).mozImageSmoothingEnabled = true;
    Graphics.ctx.imageSmoothingEnabled = true;
    Graphics.ctx.font = "100px Lobster";

    let rotating: boolean = true;

    if (!this.atStart && !this.atEnd) {
      if (this.ang < this.targetAng) {
        this.ang += ROTATE_SPEED;
        if (this.ang >= this.targetAng) {
          this.ang = this.targetAng;
          this.nextPattern();
        }
      } else {
        rotating = false;

        if (((this.patternScale > 0) && this.patternDelta < 0) ||
          ((this.patternScale < 1) && this.patternDelta > 0)) {
          this.patternScale += this.patternDelta;
          if (this.patternScale > 1) {
            this.patternScale = 1;
          }
          if (this.patternScale < 0) {
            this.patternScale = 0;
            this.targetAng = this.ang + (Math.PI / 2);
          }
        }
      }
    }


    Graphics.maintainAspectRatio(1);

    Graphics.fillRect(0, 0, Graphics.width(), Graphics.height(), SKY);

    Graphics.push();
    Graphics.translate(Graphics.width() / 2, Graphics.height() / 2);
    Graphics.rotate(this.ang);
    Graphics.fillRoundedRect(-(this.mirrorLength / 2), -3, this.mirrorLength, 6, 5, MIRROR);

    if ((!this.atStart && !this.atEnd)) {
      this.drawPattern(-this.mainSize / 2, -this.mainSize - 20, this.mainSize, this.target);

      const selectWidth: number = (this.optionSize * this.optionCount) + (20 * (this.optionCount - 1));
      const x: number = -(selectWidth / 2);
      const y: number = 20;
      for (let i = 0; i < this.optionCount; i++) {
        this.drawPattern(x + (i * (this.optionSize + 20)), y, this.optionSize, this.options[i]);
        if (this.mousePressed) {
          const path: Path2D = new Path2D();
          path.rect(x + (i * (this.optionSize + 20)), y, this.optionSize, this.optionSize);
          if (Graphics.ctx.isPointInPath(path, this.mouseX, this.mouseY)) {
            if (i === this.correctOption) {
              this.score++;
              RIGHT.play();
            } else {
              WRONG.play();
            }

            this.patternDelta = -GROW_SPEED;
          }
        }
      }

      Graphics.ctx.beginPath();
      Graphics.ctx.moveTo(0, 40 + this.optionSize);
      Graphics.ctx.lineTo(40, 80 + this.optionSize);
      Graphics.ctx.lineTo(-40, 80 + this.optionSize);
      Graphics.ctx.closePath();
      Graphics.ctx.fillStyle = MIRROR;
      Graphics.ctx.fill();
    }

    Graphics.pop();

    if (this.atStart) {
      this.time = TIME_LIMIT;
    } else if (this.atEnd) {
      this.patternScale = 0;
      this.ang = 0;
      this.targetAng = 0;
    } else {
      this.time = Math.floor(TIME_LIMIT - ((new Date().getTime() - this.startTime) / 1000));
      if (this.time === 0) {
        this.atEnd = true;
        this.patternScale = 0;
        this.ang = 0;
        this.targetAng = 0;
      }
    }

    if (this.atStart) {
      Graphics.ctx.fillStyle = COLORS[0];
      Graphics.ctx.fillText("Pick the Mirror Image", 200, 200);
      Graphics.ctx.fillStyle = COLORS[2];
      Graphics.ctx.fillText("How many can you", 240, 400);
      Graphics.ctx.fillText("get in 30 seconds?", 270, 500);
      Graphics.ctx.fillStyle = COLORS[1];
      Graphics.ctx.fillText("Click to Start", 370, 900);

      if (this.mousePressed) {
        this.startGame();
        CLICK.play();
      }
    }
    if (this.atEnd) {
      Graphics.ctx.fillStyle = COLORS[0];
      Graphics.ctx.fillText("You scored " + this.score, 400, 200);
      Graphics.ctx.fillStyle = COLORS[2];
      Graphics.ctx.fillText("Great Job!", 440, 400);
      Graphics.ctx.fillStyle = COLORS[1];
      Graphics.ctx.fillText("Click to Continue", 330, 520);
      Graphics.ctx.fillStyle = COLORS[3];
      Graphics.ctx.fillText("Share your score!", 330, 900);

      if (this.mousePressed &&
        (Math.floor(((new Date().getTime() - this.startTime) / 1000)) > TIME_LIMIT)) {
          if (this.mouseY > Graphics.height() / 2) {
            const a: HTMLAnchorElement = document.createElement("a");
            a.target = "_blank";
            a.href = "https://twitter.com/intent/tweet?text=I%20scored%20" + this.score + "%20on%20Mirror%20Match!%20%23gamedevjs%20Play%20https%3A%2F%2Fkevglass.itch.io%2Fmirror-match";
            a.click();
            CLICK.play();
          } else {
            this.atStart = true;
            this.atEnd = false;
            CLICK.play();
          }
      }
    }

    // overlays
    Graphics.ctx.fillStyle = COLORS[2];
    Graphics.ctx.fillText("" + this.score, 20.5, Graphics.height() - 20.5);
    Graphics.ctx.fillStyle = COLORS[0];
    const timeStr: string = this.time < 10 ? "0" + this.time : "" + this.time;
    Graphics.ctx.fillText(timeStr, Graphics.width() - 130.5, Graphics.height() - 20.5);

    this.mousePressed = false;
  }
}