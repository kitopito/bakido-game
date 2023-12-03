import { GameScene } from "./game";

export function getConfig(spacer: number): Phaser.Types.Core.GameConfig {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: spacer + 600,
      scene: GameScene,
      scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
      },
      physics: {
        default: 'matter',
        matter: {
          gravity: { y: 1 },
          debug: true
        },
        arcade: {
        //      gravity: { y: 200 }
        }
      },
      backgroundColor: '#ffffff',
    }
    
    return config;
}