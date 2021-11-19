
import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, ScrollView, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Inputs from './inputs.js';
import Bloomberg from './bloomberg.js';
import RenderHtml from 'react-native-render-html';
import Maps from './maps.js';
import { useWindowDimensions } from 'react-native';

function HomeScreen({navigation}){
  exports.navigation=navigation;
    return (
      <Inputs/>
    );
}

function infoScreen({route, navigation}){
  const {text, url} = route.params;
  console.log(text);
  console.log(url);
  const { width } = useWindowDimensions();

  const source = {
    html: text,
  }

  return (

    <ScrollView>
      <Image
        style={{width: 50, height: 50}}
        source={{uri: url}}
      />
      <RenderHtml
        contentWidth={width}
        source={source} />
    </ScrollView>

  );
}

function bloombergScreen({navigation}){
  exports.navigation=navigation;
    return (
      <Bloomberg/>
    );
}

function mapsScreen({navigation}){
  exports.navigation=navigation;
  return (
      <Maps/>
  );
}

const Stack = createStackNavigator();

function App(){
  return (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Stock market app" component={HomeScreen} />
      <Stack.Screen name="Info" component={infoScreen} />
      <Stack.Screen name="Bloomberg radio stream" component={bloombergScreen} />
      <Stack.Screen name="SP500 HQ locations" component={mapsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
}

const styles = StyleSheet.create({
  MainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: 0,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: '100%',
    marginTop: 16,
  },
  bigLogo: {
    alignItems: 'center',
    width: 100,
    height: 180,
  },
});

export default App;
