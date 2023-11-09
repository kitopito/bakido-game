import Phaser, { GameObjects } from "phaser";
import { images } from "./images";
//import { $isGameOvered, $score } from "../state/state";

var paddle: Phaser.Physics.Matter.Image;
const fishPhaseMap = new Map<Phaser.Physics.Matter.Image, number>();

export class GameScene extends Phaser.Scene {
  private KeyLeft?: Phaser.Input.Keyboard.Key;
  private KeyRight?: Phaser.Input.Keyboard.Key;
  private KeySpace?: Phaser.Input.Keyboard.Key;
  
  private isLeftButtonPressed: boolean = false;
  private isRightButtonPressed: boolean = false;
  private isFallButtonPressed: boolean = false;

  private maxPhase: number = 8;
  private scoreText?: Phaser.GameObjects.Text; 
  private score: number = 0;

  private items?: Phaser.GameObjects.Group;
  private fishY: number = 150;
  private nextCircleX: number = 750;
  private nextCircleY: number = 50;
  
  private currentFish?: Phaser.Physics.Matter.Image;
  private nextFish?: Phaser.Physics.Matter.Image;
//  private nextFish?: Phaser.GameObjects.Sprite;
  
  private isKeyboardEnable = true;
  
  private canvas?: HTMLCanvasElement;

  preload() {
    this.canvas = this.sys.game.canvas;

    this.load.image('sky', '/graph.png');
    this.load.image('logo', '/obake.png');

//    this.load.image('ball', '/vite.svg');
    this.load.image('paddle', '/koumori.png');

    for(let i=0;i<9;i++) {
      this.load.image(images[i].key, '/'+images[i].fileName);
    }
  }

  create() {
    window.addEventListener("leftButtonClicked", (event) => {
      this.isLeftButtonPressed = true;
    });
    window.addEventListener("leftButtonUp", (event) => {
      this.isLeftButtonPressed = false;
    });
    window.addEventListener("rightButtonClicked", (event) => {
      this.isRightButtonPressed = true;
    });
    window.addEventListener("rightButtonUp", (event) => {
      this.isRightButtonPressed = false;
    });
    window.addEventListener("fallButtonClicked", (event) => {
      this.isFallButtonPressed = true;
    });
    
    const canvas = this.sys.game.canvas;

    const floor = this.matter.add.rectangle(400, 575, 800, 50, {
      isStatic: true,
      friction: 0
    });
    const leftWall = this.matter.add.rectangle(-25, 400, 50, 800, {
      isStatic: true,
      friction: 0
    });
    const rightWall = this.matter.add.rectangle(825, 400, 50, 800, {
      isStatic: true,
      friction: 0
    });
    const glassCeiling = this.matter.add.rectangle(400, 20, 800, 50, {
      isStatic: true,
      isSensor: true,
      friction: 0
    });

    this.add.image(400, 300, 'sky').setScale(0.5);

    this.scoreText = this.add.text(
      10, 16, 'Score: 0', { fontSize: '32px', color: '#000000'});
    /*
    $score.subscribe(score => {
      this.scoreText?.setText('Score: ' + score);
    })
    */

    paddle = this.matter.add.image(
//      canvas.width / 2, 60, "paddle");
      0, 0, "paddle")
    paddle.setStatic(true);
    paddle.setScale(0.4);
//    paddle.setOrigin(0);
    paddle.setPosition(400,70);
    paddle.setIgnoreGravity(true);
//    console.log(paddle.originX);
    paddle.setCollisionGroup(-1); // unable collision
    paddle.setCollidesWith(0); // unable collision

    this.items = this.add.group();
    const firstFish = this.createFish(0);
    firstFish.setIgnoreGravity(true);
    firstFish.setPosition(
      paddle.x ,//+ paddle.displayWidth/2 - firstFish.displayWidth/2 - firstFish.width/2,
      this.fishY
    );
    firstFish.setStatic(true);
    firstFish.setCollisionGroup(-1); // no collision
    firstFish.setCollidesWith(0);
    firstFish.setBounce(0.5);
    this.currentFish = firstFish;
    fishPhaseMap.set(firstFish, 0);

    const rand: number = getRandomInt(0, 4);
    this.nextFish = this.createFish(rand);
    this.nextFish.setIgnoreGravity(true);
    this.nextFish.setPosition(
      this.nextCircleX,//+ paddle.displayWidth/2 - firstFish.displayWidth/2 - firstFish.width/2,
      this.nextCircleY
    );
    this.nextFish.setStatic(true);
    this.nextFish.setCollisionGroup(-1); // no collision
    this.nextFish.setCollidesWith(0);
    this.nextFish.setBounce(0.5);
    fishPhaseMap.set(this.nextFish, rand);
       
    this.matter.world.on("collisionstart", (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
//        console.log(pair);
        const rootBodyA  = getRootBody(bodyA);// as Phaser.Physics.Matter.Image;
//        console.log("ふぃっしゅ1");
//        console.log(rootBodyA);
        const rootBodyB  = getRootBody(bodyB);// as Phaser.Physics.Matter.Image;
//        console.log("ふぃっしゅ2");
//        console.log(rootBodyB);
        
        const object1 = rootBodyA.gameObject as Phaser.Physics.Matter.Image;
        const object2 = rootBodyB.gameObject as Phaser.Physics.Matter.Image;

        const isItem1Fish = fishPhaseMap.get(object1) != undefined;
        const isItem2Fish = fishPhaseMap.get(object2) != undefined;
        const isFishCollision = isItem1Fish && isItem2Fish;
            
        const isSensor = rootBodyA.isSensor || rootBodyB.isSensor;
        if(isSensor) {
          // Game Over
          console.log("Sensor当たったナリ");
          this.matter.world.pause();
          console.log("当たった");
          this.scoreText?.setText('Score: ' + this.score);
          window.dispatchEvent(new CustomEvent("setScore", {detail: this.score}));
          console.log("ナリ");
          this.isKeyboardEnable = false;
//          $isGameOvered.set(true);
          window.dispatchEvent(new CustomEvent("gameOvered"));
        }

//        console.log("魚判定");
//        console.log(fishPhaseMap);
//        console.log(isItem1Fish);
//        console.log(isItem2Fish);
        if(isFishCollision) {
//          console.log("サカナぶつかり中");
          const fish1 = rootBodyA.gameObject as Phaser.Physics.Matter.Image;
          const fish2 = rootBodyB.gameObject as Phaser.Physics.Matter.Image;


          const phase: number = fishPhaseMap.get(fish1) as number;
          const newX: number = (fish1.body?.position.x! + fish2.body?.position.x!) / 2;
          const newY: number = (fish1.body?.position.y! + fish2.body?.position.y!) / 2;

          if(fishPhaseMap.get(fish1) == fishPhaseMap.get(fish2)) {
//            console.log("ブツカタ Map");
//            console.log(fishPhaseMap);

            fishPhaseMap.delete(fish1);
            fish1.destroy();
            fishPhaseMap.delete(fish2);
            fish2.destroy();

//            console.log(this.items?.getChildren().length);
//            console.log("消しました");
//            console.log(fishPhaseMap);
            
            if(phase != this.maxPhase) { //最大の状態じゃなかったら
              const newFish = this.createFish(phase + 1);
              newFish.setX(newX);
              newFish.setY(newY);
              fishPhaseMap.set(newFish, phase + 1);
            }

            console.log("スコア足す前");
//            console.log($score.get());
//            $score.set($score.get() + Math.pow(2, phase));
            this.score += Math.pow(2, phase);
            this.scoreText?.setText('Score: ' + this.score);
            console.log("スコア足す後");
//            console.log($score.get());
          }
        }
      })
    });
    
    this.KeyLeft = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.KeyRight = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.KeySpace = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
  update(): void {
//    this.physics.collide(ball, paddle)
    if((this.KeyLeft?.isDown || this.isLeftButtonPressed) && this.isKeyboardEnable) {
//      console.log("←押された");
      console.log("keyboad enable " + this.isKeyboardEnable);
      if(paddle.x - 5 > 0) {
        paddle.x += -5;
  //      this.currentFish!.x += -5;
        this.currentFish!.x = paddle.x;
      }
//      console.log(paddle.x);
//      console.log(this.currentFish!.x);
    }

    if((this.KeyRight?.isDown || this.isRightButtonPressed) && this.isKeyboardEnable) {
//      console.log("→押された");
      if(paddle.x + 5 < this.canvas!.width) {
        paddle.x += +5;
  //      this.currentFish!.x += +5;
        this.currentFish!.x = paddle.x;
      }
//      console.log(paddle.x);
//      console.log(this.currentFish!.x);
//      paddle.setPosition(paddle.x+5, paddle.y);
    }
    if((Phaser.Input.Keyboard.JustDown(this.KeySpace!) || this.isFallButtonPressed) && this.isKeyboardEnable) {
      this.isFallButtonPressed = false;
      console.log("スペースキー押された");
      this.currentFish?.setStatic(false);
      this.currentFish?.setIgnoreGravity(false);
      this.currentFish?.setCollisionGroup(1); // enable collision
      this.currentFish?.setCollidesWith(-1); // enable collision

      const rand: number = getRandomInt(0, 4);
      this.currentFish = this.nextFish;
      this.currentFish?.setPosition(
        paddle.x,//+ paddle.displayWidth/2 - firstFish.displayWidth/2 - firstFish.width/2,
        this.fishY
      );
      this.nextFish = this.createFish(rand);
//      this.currentFish.setPosition(0,0);
//      this.currentFish.setOrigin(0);
      this.nextFish.setPosition(
        this.nextCircleX,//+ paddle.displayWidth/2 - this.currentFish.width/2 - this.currentFish.displayWidth/2,
//        0,
//        paddle.y - newBall.height - newBall.displayHeight/2
        this.nextCircleY
      );
      this.nextFish.setStatic(true);
      this.nextFish?.setCollisionGroup(-1);
      this.nextFish.setCollidesWith(0);

//      console.log("魚座標");
//      console.log(this.currentFish.x);
//      console.log(this.currentFish.width);
//      console.log(this.currentFish.originX);
      fishPhaseMap.set(this.nextFish, rand);
    }
  }

  private createFish(phase: number): Phaser.Physics.Matter.Image {
    let status: string = '';
    let scale: number = 1;
    let newFish;

    status = images[phase].key;
    scale = images[phase].scale;
    /*
    switch (phase) {
      case 0: status = 'vite'; scale = 0.5; break;
      case 1: status = 'candy'; scale = 0.15; break;
      case 2: status = 'cat'; scale = 0.2; break;
      case 3: status = 'majo'; scale = 0.2; break;
      case 4: status = 'gaikotsu'; scale = 0.3; break;
      case 5: status = 'castle'; scale = 0.3; break;
      case 6: status = 'moon'; scale = 0.4; break;
      case 7: status = 'obake'; scale = 0.5; break;
      case 8: status = 'pumpkin'; scale = 0.8; break;
      default: status = 'logo';
    }
    */
//    console.log("コウモリ座標");
//    console.log(paddle.x);
//    console.log(paddle.y);
//    console.log(paddle.width);
//    console.log(paddle.height);

    newFish = this.matter.add.image(0, 0, status);
    newFish.setCircle(newFish.displayWidth/2);
    this.items?.add(newFish);
//    newBall.setOrigin(0);
    newFish.setScale(scale);
    newFish.setBounce(0.5);

//      newBall.setScale(0.3).refreshBody();
//    console.log(newBall);
//      newBall.setBounce(1, 1);
//    newBall.setGravityY(200);

    return newFish;
  }
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRootBody(body: MatterJS.BodyType) {
  /*
  this.matter.world.on("collisionstart", (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
    event.pairs.forEach(pair => {
      const { bodyA, bodyB } = pair;
  のbodyAがnullになるのを防ぐための関数
 https://github.com/photonstorm/phaser/issues/3985
  */
  while (body.parent !== body) body = body.parent;
  return body;
}

export const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  scene: GameScene,
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1 },
      debug: true
    },
    arcade: {
//      gravity: { y: 200 }
    }
  }
};

//const game = new Phaser.Game(gameConfig);