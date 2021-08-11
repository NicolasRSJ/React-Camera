import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Modal, Image, PermissionsAndroid } from 'react-native';
import { Camera } from 'expo-camera';
import Icon from 'react-native-vector-icons/Entypo';
import Base64 from 'react-native-base64'
import CameraRoll from "@react-native-community/cameraroll";

export default function App() {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const camRef = useRef(null);
  const [base64, setBase64] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    (async () => {
      const { status } = await PermissionsAndroid.request(permission)
      setHasPermission(status === 'granted');
    })();

  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Acesso Negado!</Text>;
  }

  async function takePicture(){
    if(camRef){
      const data = await camRef.current.takePictureAsync();
      setCapturedPhoto(data.uri);
      setOpen(true);
    }
  }

  async function converterBase64(){
    const uriBase64 = await Base64.encode(capturedPhoto)
    setBase64(uriBase64)
  }

  async function savePicture() {
    const asset = await CameraRoll.save(capturedPhoto,{
      album: 'Camera'
    })
    .then( resp =>{
      alert("Salvo Com Sucesso!");
    })
    .catch(error => {
      console.error("Ops algo aconteceu: ", error)
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={camRef}
      >
        <View
          style={styles.containerButtonTurn}
        >
          <TouchableOpacity
            style={styles.buttonTurn}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
              )
            }}
          >
            <Icon name="cycle" type="entypo" size={50} />
          </TouchableOpacity>
        </View>
      </Camera>

      <TouchableOpacity
        style={styles.button}
        onPress={takePicture}
      >
        <Icon name="camera" type="entypo" size={55} />
      </TouchableOpacity>

      { capturedPhoto &&
        <Modal
          animationType="slide"
          transparent={true}
          visible={open}
        >
          <View
            style={styles.containerPhoto}
          >

            <View style={ styles.containerButtons }>
              <TouchableOpacity style={styles.buttonClose} onPress={()=> setOpen(false)}>
                <Icon name="cross" type="entypo" size={30} color="red" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonClose} onPress={ savePicture }>
                <Icon name="align-bottom" type="entypo" size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonClose} onPress={ converterBase64 }>
                <Icon name="flow-branch" type="entypo" size={30} color="blue" />
              </TouchableOpacity>
            </View>
            

            <Image
              style={styles.image}
              source={{uri: capturedPhoto}}
            />
          </View>
        </Modal>
      }

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  containerButtonTurn: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  buttonTurn: {
    position: 'absolute',
    bottom: 20,
    left: 20
  },
  button: {
    justifyContent: "center",
    alignItems: 'center',
    margin: 20,
    borderRadius: 10,
    height:50,
  },
  camera: {
    flex: 1
  },
  containerPhoto:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20
  },
  containerButtons: {
    margin: 10,
    flexDirection: 'row'
  },
  buttonClose: {
    margin: 10
  },
  image: {
    width: '100%',
    height: 450,
    borderRadius: 10
  }
});