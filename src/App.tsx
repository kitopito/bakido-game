import React, { useEffect, useState } from 'react'
import { GameScene, gameConfig } from './game/game'
import { Button, Center, Container, Flex, Grid, GridItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, useDisclosure } from '@chakra-ui/react';
import { $isGameOvered, $score } from './state/state';
import { useStore } from '@nanostores/react'

function GameComponent() {
  const [isReady, setReady] = useState(false);
  const [screenWidth, setScreenWidth] = useState(400);
  const [screenHeight, setScreenHeight] = useState(400);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const isGameOvered = useStore($isGameOvered);

  const sw = document.body.clientWidth;
//  const sw = document.documentElement.clientWidth;
  console.log(sw);
  const sh = document.body.clientHeight;
  console.log(sh);

  useEffect(() => {
     // Nothing really special here... Your phaser3 config should work just fine.  
    let config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
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
      }
    }

     let game = new Phaser.Game(config)
     // Triggered when game is fully visible.
     game.events.on('putOnGameScene', setReady)
     // Add your scene/s here (or in `scene` key of `config`).
     game.scene.add("GameScene", GameScene, true)
     // If you don't do this, you get duplicates of the canvas piling up
     // everytime this component renders. 
     return () => {
       setReady(false)
       game.destroy(true)
     }
   // You must have an empty array here otherwise the game restarts every time
   // the component renders.
   }, []);

  return (
    <> <Container w={sw} maxWidth={"2000px"} h={sh} maxHeight={"2000px"}>

    <Center>
    <div id="phaser-game" className={isReady ? "visible" : "invisible"} />
    </Center>

    <Grid templateColumns='repeat(7, 1fr)' gap={4}>
    <GridItem colSpan={1} textAlign={"center"}></GridItem>
    <GridItem colSpan={1} textAlign={"center"}></GridItem>

    <GridItem colSpan={1} textAlign={"center"}>
    <Button onMouseEnter={()=>{
      window.dispatchEvent(new CustomEvent("leftButtonClicked"));
    }} onMouseUp={()=>{
      window.dispatchEvent(new CustomEvent("leftButtonUp"));
    }} onMouseLeave={()=>{
      window.dispatchEvent(new CustomEvent("leftButtonUp"));
    }}>left</Button>
    </GridItem>

    <GridItem colSpan={1} textAlign={"center"}>
    <Button onClick={()=>{
      window.dispatchEvent(new CustomEvent("fallButtonClicked"));
    }}>fall</Button>
    </GridItem>
  
    <GridItem colSpan={1} textAlign={"center"}>
    <Button onMouseEnter={()=>{
      window.dispatchEvent(new CustomEvent("rightButtonClicked"));
    }} onMouseUp={()=>{
      window.dispatchEvent(new CustomEvent("rightButtonUp"));
    }} onMouseLeave={()=>{
      window.dispatchEvent(new CustomEvent("rightButtonUp"));
    }}>right</Button>
    </GridItem>

    <GridItem colSpan={1} textAlign={"center"}></GridItem>
    <GridItem colSpan={1} textAlign={"center"}></GridItem>
    </Grid>
    
    <Button onClick={onOpen}>Open Modal</Button>

      <Modal isOpen={isGameOvered} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Game Over</ModalHeader>
          <ModalBody>
            <h2>Score {$score.get()}</h2>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='ghost'>Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container> </>
  )
}

export default GameComponent
