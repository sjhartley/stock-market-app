import React, { Component } from 'react'
import { ToastAndroid, Image, StyleSheet, View, TouchableOpacity, ScrollView, Text, Alert } from 'react-native';
var app_stuff = require('./App.js');
var Sound=require('react-native-sound');
import axios from 'axios';
const cheerio = require('react-native-cheerio');

function get_bloomberg(){
  var url="https://playerservices.streamtheworld.com/api/livestream?transports=hls&version=1.8&mount=WBBRAMAAC48";
  //this url is used to retrieve the bloomberg stream url

  return new Promise(function(resolve, reject){
    axios.get(url).then(function(response){
      var body=cheerio.load(response.data, {xmlMode: true});
      var transport_suf=body("transport")
      var server_ip=body("server ip");
      var mount=body("mount");
      var stream_url=`https://${server_ip.first().text()}/${mount.text()}${transport_suf.attr('mountSuffix')}`;
      console.log(`stream_url=${stream_url}`);
      resolve(stream_url);
    });
  });
}

class Bloomberg extends Component {

  constructor(props){
    super(props);

    this.state={
      loaded: "bloomberg radio url not loaded",
      playing: 0,
    }
  }

componentDidMount(){
  //in mounting phase the stream url is retrieved

  console.log("mount");

  self=this;
  get_bloomberg().then(function(url){
      axios.get(url).then(function(new_stuff){
        var body=new_stuff.data.toString();
        var http_search=body.search("https://");
        console.log(http_search);
        var stream_url=body.slice(http_search).split('\n')[0];
        console.log(url);

        var bloomberg=new Sound(stream_url, null, (err) => {
          if(err){
            console.log(`there is an error: ${err}`);
          }

        });
        self.bloomberg=bloomberg;
        self.setState({loaded: "bloomberg radio url loaded"});
      })
    });
}

componentWillUnmount(){
  //when unmounting occurs it is important to release the stream so that it does not continue playing if user exits bloomberg radio page
  console.log("unmount");
  if(typeof this.bloomberg !== 'undefined'){
    this.bloomberg.release();
    console.log("releasing bloomberg");
  }
}

play(){
  if(typeof this.bloomberg !== 'undefined'){
    console.log("playing bloomberg");
    this.bloomberg.play();
    this.setState({playing: 1});
  }
  else{
    console.log("not defined!!!");
    ToastAndroid.show("stream not currently available!!!", ToastAndroid.SHORT);
  }
}

stop(){
  if(typeof this.bloomberg !== 'undefined'){
    this.bloomberg.pause();
    console.log("stopping");
    this.setState({playing: 0});

  }
  else{
    console.log("not defined!!!");
    ToastAndroid.show("stream not currently available", ToastAndroid.SHORT);
  }

}

render () {
  return(
<View style = {styles.container}>
  <TouchableOpacity
    style={styles.submitButton}
    onPress={()=> this.play()}>
    <Text>Resume</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.submitButton}
    onPress={()=> this.stop()}>
    <Text>Stop</Text>
  </TouchableOpacity>

  <View>
    <Text>{`${this.state.loaded}`} </Text>
  </View>

</View>
)
}

}

function bloombergPage(){
  app_stuff.navigation.navigate('Bloomberg radio stream');
}

const styles = StyleSheet.create({
   container: {
      paddingTop: 23
   },
   input: {
      margin: 15,
      height: 40,
      borderColor: '#7a42f4',
      borderWidth: 1,
   },
   submitButton: {
      backgroundColor: '#7a42f4',
      padding: 10,
      margin: 15,
      height: 40,
   },
   submitButtonText:{
      color: 'white'
   }
})

export default Bloomberg
exports.bloombergPage = bloombergPage;
