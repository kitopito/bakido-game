import React, { useEffect, useState } from 'react'
import { GameScene, gameConfig } from './game/game'
import { Button, Center, Container, Flex, Grid, GridItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Text, background, useDisclosure } from '@chakra-ui/react';
//import { $isGameOvered, $score } from './state/state';
import { useStore } from '@nanostores/react'
import isMobile from "ismobilejs"
import { getConfig } from './game/config';
import { $screenHeight, $screenWidth } from './state/state';

let game: Phaser.Game;

function GameComponent() {
  const [isReady, setReady] = useState(false);
  const [screenWidth, setScreenWidth] = useState(400);
  const [screenHeight, setScreenHeight] = useState(400);

  const { isOpen, onOpen, onClose } = useDisclosure();
//  const isGameOvered = useStore($isGameOvered);
  const [isGameOvered, setIsGameOverd] = useState(false);
  window.addEventListener("gameOvered", (event) => {
    setIsGameOverd(true);
  });
  const [score, setScore] = useState(0);
  window.addEventListener("setScore", (event) => {
    setScore((event as CustomEvent).detail);
    console.log("スコアセット " + (event as CustomEvent).detail.toString());
  });

  const _isMobile = isMobile(window.navigator).any;
  const sw = document.body.clientWidth;
//  const sw = document.documentElement.clientWidth;
  console.log(sw);
  const sh = document.body.clientHeight;
  console.log(sh);
  const spacer = sh * 0.2;
  
  useEffect(() => {
     // Nothing really special here... Your phaser3 config should work just fine.  
    console.log("useEffect中");
    $screenHeight.set(sh);
    $screenWidth.set(sw);

     /*let */game = new Phaser.Game(getConfig(spacer));
     // Triggered when game is fully visible.
     game.events.on('putOnGameScene', setReady)
     // Add your scene/s here (or in `scene` key of `config`).
//     game.scene.add("GameScene", GameScene, true)
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

{/*
    <Container height={sh * 0.2}></Container>
*/}

    <Center>
    <div id="phaser-game" className={isReady ? "visible" : "invisible"} />
{/*
    <Container id="phaser-game" className={isReady ? "visible" : "invisible"} marginX={0}/>
*/}
    </Center>

    {_isMobile //|| true
    ? <Grid templateColumns='repeat(7, 1fr)' gap={4} margin={"10px"}>
      <GridItem colSpan={1} textAlign={"center"}></GridItem>
      <GridItem colSpan={1} textAlign={"center"}></GridItem>

      <GridItem colSpan={1} textAlign={"center"}>
      <Button fontSize={"20px"} height={"50px"}
        onTouchStart={()=>{
          window.dispatchEvent(new CustomEvent("leftButtonClicked"));
        }} 
        onTouchEnd={()=>{
          window.dispatchEvent(new CustomEvent("leftButtonUp"));
        }} 
        onTouchCancel={()=>{
          window.dispatchEvent(new CustomEvent("leftButtonUp"));
        }}
      >シモ</Button>
      </GridItem>

      <GridItem colSpan={1} textAlign={"center"}>
      <Button fontSize={"20px"} height={"50px"}
        onClick={()=>{
          window.dispatchEvent(new CustomEvent("fallButtonClicked"));
        }}
      >ラク</Button>
      </GridItem>
    
      <GridItem colSpan={1} textAlign={"center"}>
      <Button fontSize={"20px"} height={"50px"}
        onTouchStart={()=>{
          window.dispatchEvent(new CustomEvent("rightButtonClicked"));
        }} 
        onTouchEnd={()=>{
          window.dispatchEvent(new CustomEvent("rightButtonUp"));
        }} 
        onTouchCancel={()=>{
          window.dispatchEvent(new CustomEvent("rightButtonUp"));
        }}
      >カミ</Button>
      </GridItem>

      <GridItem colSpan={1} textAlign={"center"}></GridItem>
      <GridItem colSpan={1} textAlign={"center"}></GridItem>
      </Grid>
    : <Center><Text>矢印ボタンで移動　スペースで落下</Text></Center>}
    
    <Modal isOpen={isGameOvered} onClose={onClose} colorScheme='blue'>
      <ModalOverlay/>
      <Container height={sh * 0.2}></Container>
      <ModalContent marginTop={sh * 0.35}>
        <ModalHeader>Game Over</ModalHeader>
        <ModalBody>
          <h2>Score {score}</h2>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={()=>{
//            setReady(false);
            game.destroy(true);
            game = new Phaser.Game(getConfig(spacer));
            game.events.on('putOnGameScene', setReady);
            //     game.scene.add("GameScene", GameScene, true)
//            setReady(true);
            setIsGameOverd(false);
          }}>
            retry
          </Button>
          <Button variant='ghost'>Secondary Action</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </Container> </>
  )
}

export default GameComponent
