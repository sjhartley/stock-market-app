import React, { Component } from 'react';
import { ImageBackground, Image, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
const funcs = require('./funcs.js');
const bloomberg =require('./bloomberg.js');
const maps=require('./maps.js');


class Inputs extends Component {
   state = {
      keyWord: '',
   }
   handlekeyWord = (text) => {
      this.setState({ keyWord: text })
   }
   render() {
      return (
         <View style = {styles.container}>
         <ImageBackground source={require('./money_img1.jpg')} style={{width: '100%', height: '100%', opacity: 1}}>
            <TextInput style = {styles.input}
               underlineColorAndroid = "transparent"
               placeholder = "keyWord"
               autoCapitalize = "none"
               onChangeText = {this.handlekeyWord}/>

               <TouchableOpacity
                 style={styles.submitButton}
                 onPress={()=> funcs.nasdaq_get(this.state.keyWord)}>
                 <Text>NASDAQ100 stock retriever</Text>
               </TouchableOpacity>

               <TouchableOpacity
                 style={styles.submitButton}
                 onPress={()=> bloomberg.bloombergPage()}>
                 <Text>Bloomberg Radio</Text>
               </TouchableOpacity>

               <TouchableOpacity
                 style={styles.submitButton}
                 onPress={()=> maps.mapsPage()}>
                 <Text>Maps</Text>
               </TouchableOpacity>

               </ImageBackground>
         </View>
      )
   }
}
export default Inputs

const styles = StyleSheet.create({
   container: {
      paddingTop: 23
   },
   input: {
      margin: 15,
      height: 40,
      textAlign: 'center',
      backgroundColor: '#7a42f4',
   },
   submitButton: {
      backgroundColor: '#7a42f4',
      alignItems: 'center',
      padding: 10,
      margin: 15,
      height: 40,
   },
   submitButtonText:{
      color: 'white'
   }
})
