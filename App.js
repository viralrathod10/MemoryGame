import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions, Alert, Modal, Pressable, ImageBackground } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import DoodlerMain from "./doodler";
import PlatformMain from './platform';

/*
Welcome to Doodle Jump! This app allows the user to play a game similar to the real mobile game, Doodle Jump. In my
app, the user controls the character by tilting their phone from the left to the right and trying to jump off of 
platforms. If the user fails to jump on a platform and falls, the game ends.

When the game starts, there is a modal that appears to allow the user to start the game. When the user falls, there
is a modal that appears letting them know of this, and what their high score was. The current score for each round
is displayed at the top of the screen at all times. The end modal allows the user to start a new game.

For my app, I used the accelerometer becuase I felt it would be easier to move the character than the gyroscope. The
accelerometer outputs a constant number if the phone is tilted one way, but still not moving. This would make sense
for my app because I wanted the character to move as long as the phone was tilted, even if it wasn't moving. I tried
using the gyroscope and looking at the output of the values to see if they would work for my app, but I didn't think
they would, so I moved over to the accelerometer.

One limitation of my app is that the character seems to jump a little bit above the platforms sometimes, and a little 
bit below other times. I believe this is due to my code checking if the character is moving downward so that it doesn't
jump while its going up. When it checks for this, it might wait until the speed is high enough or setTimeout may be 
interfering.
*/

export default function App() {

  const screenWidth = Dimensions.get("screen").width
  const screenHeight = Dimensions.get("screen").height
  const [doodlerLeft, setDoodlerLeft] = useState(screenWidth / 2)
  const [doodlerBottom, setDoodlerBottom] = useState(screenHeight / 4)
  const [mult, setMult] = useState(0)
  const [platformBottom, setPlatformBottom] = useState(screenHeight)
  const [platformLeft, setPlatformLeft] = useState(screenWidth / 2)
  const [run, setRun] = useState(false)
  const [modalVisible, setModalVisible] = useState(false);
  const [score, setScore] = useState(0)
  const [highScore, setHigh] = useState(0)
  const [startModal, setStartModal] = useState(true)

  const screenLeft = 0
  const screenRight = screenWidth
  const screenBottom = 0
  const screenTop = screenHeight


  const plats = ([
    {key: 1, pVert: screenBottom, pHori: (Math.random() * screenWidth) * 0.8},
    {key: 2, pVert: screenHeight * 0.2 , pHori: (Math.random() * screenWidth) * 0.8},
    {key: 3, pVert: screenHeight * 0.4, pHori: (Math.random() * screenWidth) * 0.8},
    {key: 4, pVert: screenHeight * 0.6, pHori: (Math.random() * screenWidth) * 0.8},
    {key: 5, pVert: screenHeight * 0.8, pHori: (Math.random() * screenWidth) * 0.8},
  ])

  const [temp, setTemp] = useState(plats)

  const [speedTemp, setSpeed] = useState(0);
  const [speedTemp2, setSpeed2] = useState(0);

  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);




  const _subscribe = () => {
    Accelerometer.setUpdateInterval(15)
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  function bottomBounce(){
    setDoodlerBottom(doodlerBottom + (22 - mult))
    setMult(mult + 1)
  }

  function bounce(){

    const down = temp

    for (let i = 0; i <= 4; i++){
      if (doodlerBottom >= down[i].pVert - 50 && doodlerBottom <= down[i].pVert){
        if (doodlerLeft < down[i].pHori + 100 && doodlerLeft > down[i].pHori - 70){
          setSpeed(doodlerBottom)
          setTimeout(() => {
            if ((doodlerBottom - speedTemp) < -15){
              setMult(0)
              setSpeed(0)
            }
          }, 5);
        }
      }

    }

  }

  function downPlat(){
    const down = temp

    for (let i = 0; i <= 4; i++){
      if (doodlerBottom > 0)
        down[i].pVert -= (doodlerBottom / 50)
        

      //console.log(down[i].pVert)
    }

    setTemp(down)

  }

  function checkBot(){

    const down = temp

    for (let i = 0; i <= 4; i++){
      if (down[i].pVert < screenBottom){
        down[i].pVert = (screenTop)
        down[i].pHori = (Math.random() * screenWidth) * 0.8
      }
    }

    setTemp(down)

  }

  function newGame(){
    setModalVisible(false)
    const down = temp

    for (let i = 0; i <= 4; i++){
      down[i].pHori = (Math.random() * screenWidth) * 0.8
    }


    setDoodlerBottom(screenHeight / 4)
    setDoodlerLeft(screenWidth / 2)
    setRun(true)
    setTemp(down)
    setScore(0)
    setMult(0)

  }

  function startGame(){
    setRun(true)
    setStartModal(false)
  }


  useEffect(() => {
    //consoleLog()

    if (run == true){

      if (doodlerBottom <= (screenBottom - 200)){ //bottom bounce
        if (score > highScore){
          setHigh(score)
        }
        setModalVisible(true)
        setRun(false)
      }
      else {
        bottomBounce()
      }

      if (Math.abs(x) > 0.015){
        setDoodlerLeft(doodlerLeft + (25 * x))
      }

      if (doodlerLeft < screenLeft - 30){
        setDoodlerLeft(screenRight - 30)
      }
      else if (doodlerLeft > screenRight - 30){
        setDoodlerLeft(screenLeft - 30)
      }
      

      downPlat()

      checkBot()

      bounce()

      setSpeed(doodlerBottom)
          setTimeout(() => {
            setSpeed2(doodlerBottom - speedTemp)
            if (speedTemp2 > 0){
              setScore(score + Math.round((speedTemp2) / 10))
            }
          }, 5);
    }

  }, [data]);


  

  

  const { x, y, z } = data;


  return (
    <View style={styles.container}>
      <ImageBackground source = {require("./assets/background.png")} style={styles.background}>


      <Modal
          animationType="slide"
          transparent={true}
          visible={startModal}
          onRequestClose={() => {
            setStartModal(!startModal);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Welcome to Doodle Jump</Text>
              <Text style={styles.modalText}>Press Start to Begin</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => startGame()}
              >
                <Text style={styles.textStyle}>Start</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>You Fell :(</Text>
              <Text style={styles.modalText}>High Score: {highScore}</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => newGame()}
              >
                <Text style={styles.textStyle}>New Game</Text>
              </Pressable>
            </View>
          </View>
        </Modal>


        <PlatformMain
        pBottom={temp[0].pVert}
        pLeft={temp[0].pHori}/>
        <PlatformMain
        pBottom={temp[1].pVert}
        pLeft={temp[1].pHori}/>
        <PlatformMain
        pBottom={temp[2].pVert}
        pLeft={temp[2].pHori}/>
        <PlatformMain
        pBottom={temp[3].pVert}
        pLeft={temp[3].pHori}/>
        <PlatformMain
        pBottom={temp[4].pVert}
        pLeft={temp[4].pHori}/>

        

        <DoodlerMain
        dLeft={doodlerLeft}
        dBottom={doodlerBottom}/>

        <Text style = {styles.text}>Score: {score}</Text>

      </ImageBackground>
    </View>
  );
}

function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 10000) / 10000;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    alignItems: "center",
  },
  background:{
    flex: 1,
    alignItems: "center",
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  text: {
    padding: 100,
    fontSize: 24,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  hilt: {
    width: 300,
    height: 100,
    backgroundColor: 'white',
    resizeMode: "contain",
    transform: [{rotate: '90deg'}]
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "green",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  modalText: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center"
  }
});
