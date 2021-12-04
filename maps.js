import React, { Component } from 'react'
import { Modal, Alert, Dimensions, PixelRatio, Image, StyleSheet, View, TouchableOpacity, ScrollView, Text } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { ProgressBar} from 'react-native-paper';
var app_stuff = require('./App.js');
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const cheerio = require('react-native-cheerio');
var misc=require('./misc.js');

const screen = Dimensions.get('window');
const aspectRatio=screen.width/screen.height;

function dms_2_dec(d, m, s){
//convert degrees/minutes/seconds to decimal degrees

  if( d=='') d='0';
  if( m=='') m='0';
  if( s=='') s='0';

  if( m<0 ) m=-m;
  if( s<0 ) s=-s;

  if( d<0 || d=='-0' ){
    m=-m; s=-s;
  }

  dec = parseFloat(d)+parseFloat(m)/60+parseFloat(s)/3600;
  return dec;
}

function symbolHandler(coords, obj){
var symbolsDict={
  'N': '+',
  'S': '-',
  'E': '+',
  'W': '-',
};

for(var symbol in symbolsDict){
  if(coords.toString().search(symbol) != -1){
    if(symbol == 'N' || symbol == 'S'){
      obj.lat=`${symbolsDict[symbol]}${obj.lat}`;
    }
    else if(symbol == 'E' || symbol == 'W'){
      obj.long=`${symbolsDict[symbol]}${obj.long}`;
    }
  }
}
return obj;
};

function object_maker(compLocation, compName, gics_sector, gics_sub, i){
locationObj=new Object();
if((typeof compLocation !== 'undefined') || (typeof compName !== 'undefined') || (typeof compLocation.children('a').attr('href') !== 'undefined')){
  if((compLocation.text().length != 0) && (compName.text().length != 0)){
    locationObj.location=compLocation.text();
    locationObj.name=compName.text();
    compObj=new Object();
    compObj.name=locationObj.name;
    compObj.gics_sector=gics_sector.text();
    compObj.gics_sub=gics_sub.text();
    locationObj.compObj=compObj;
    locationUrl=`https://en.wikipedia.org${compLocation.children('a').attr('href')}`;
    locationObj.url=locationUrl;
    locationObj.idx=i;
  }
  else{
    console.log("UNDEFINED!!!!!!!!!!!!");
    locationObj.location=null;
    locationObj.name=null;
    locationObj.url=null;
  }
}
else{
  console.log("UNDEFINED!!!!!!!!!!!!");
  locationObj.location=null;
  locationObj.name=null;
  locationObj.url=null;
}
return locationObj;
}

function sp500Location(){
  var table_link="https://en.wikipedia.org/wiki/List_of_S%26P_500_companies";
  var base_Url="https://en.wikipedia.org/wiki/";

  var options = {
    url: table_link,
    method: 'get',
    headers: {
      'Accept': '/',
      'Connection': 'keep-alive',
    },
    maxRedirects: 5,
  };
  var comp_proms = [];
  var location_proms = [];
  var comp_locations = [];
  var no_dupl_url = [];

  return new Promise(function(resolve, reject){
  axios(options).then(function(response){
    var constituents=cheerio.load(response.data);
    constituents('table#constituents tbody tr').each(function(i, el){
      var table_entry=constituents(el);
      var msg_str="";
      var compLocation=table_entry.children('td').eq(5);
      var compName=table_entry.children('td').eq(1);
      var gics_sector=table_entry.children('td').eq(3);
      var gics_sub=table_entry.children('td').eq(4);

      var locationObj=object_maker(compLocation, compName, gics_sector, gics_sub, i);
      if((locationObj.name !== null) && (locationObj.location !== null) && (locationObj.url !== null)){
        comp_locations.push(locationObj);
        var idx=no_dupl_url.findIndex(e => e.url == locationObj.url);
        console.log(idx);
        console.log(locationObj);
        if(idx == -1){
          no_dupl_url.push(locationObj);
        }
        else{
          no_dupl_url[idx].name = no_dupl_url[idx].name + `,\n${locationObj.name}`;
          compObj=new Object();
          compObj.name=compName.text();
          compObj.gics_sector=gics_sector.text();
          compObj.gics_sub=gics_sub.text();
          no_dupl_url[idx].compObj = compObj;

        }
      }
  });
  resolve(no_dupl_url);
});
});
}

function locationHandler(locationObj){

var options = {
  url: locationObj.url,
  method: 'get',
  headers: {
    'Accept': '/',
    'Connection': 'keep-alive',
  },
};

return new Promise(function(resolve, reject){
axios(options).then(function(response){
  var body=cheerio.load(response.data);

  var coords=body('span .geo-dms').first();
  if(!coords || coords.length == ""){
    coords=body('span .geo-dec').first();
    if(!coords || coords.length == ""){
      coords='not available';
      reject(new Error('coords not available'));
    }
    else{
      coords=coords.text().toString();
      console.log(`\n\ngeo-dec coords=${coords}\n\n`);
      var coordObj=new Object();
      coordObj.lat=coordObj.long="";

      coordObj.lat=coords.split('°')[0].split('N')[0].split('S')[0];
      coordObj.long=coords.split('°')[1].split('E')[0].split('W')[0];
      console.log(`coordObj.long=${coordObj.long}`);
      if(coordObj.long.search(' ') != -1){
        coordObj.long=coordObj.long.split(' ')[1];
      }

      coordObj=symbolHandler(coords, coordObj);
      console.log(`\n\n${coordObj}\n\n`)

      locationObj.latitude=parseFloat(coordObj.lat);
      locationObj.longitude=parseFloat(coordObj.long);
      console.log(locationObj);
      resolve(locationObj);
    }
  }
  else{
    coords=coords.text().trim();

    var dmsObj=new Object();
    dmsObj.lat=dmsObj.long="";

    dmsObj.dms1=coords.split('N')[0].split('S')[0];
    dmsObj.dms2=coords.split('E')[0].split('W')[0].slice(dmsObj.dms1.length+1).trim();

    [dmsObj.d1, dmsObj.m1, dmsObj.s1] = [dmsObj.dms1.split('°')[0], dmsObj.dms1.split('′')[0].split('°')[1], dmsObj.dms1.split('″')[0].split('′')[1]];
    [dmsObj.d2, dmsObj.m2, dmsObj.s2] = [dmsObj.dms2.split('°')[0], dmsObj.dms2.split('′')[0].split('°')[1], dmsObj.dms2.split('″')[0].split('′')[1]];

    dmsObj.lat=dms_2_dec(dmsObj.d1, dmsObj.m1, dmsObj.s1);
    dmsObj.long=dms_2_dec(dmsObj.d2, dmsObj.m2, dmsObj.s2);

    dmsObj=symbolHandler(coords, dmsObj);

    locationObj.latitude=parseFloat(dmsObj.lat);
    locationObj.longitude=parseFloat(dmsObj.long);
    resolve(locationObj);
  }
}).catch((error) => {
  console.log(`\n\n${error}\n${locationObj.url}\n\n`);
});
});

}

class Maps extends Component {

constructor(props){
super(props);

this.state = {
  loadMarkers_enable: 0,
  markers: [],
  mounted: false,
  total: 0,
  count: 0,
  start:0,
  done: 0,
  selectedState: "",
  states: [],
  selectedSector: "",
  gics_sectors: [],
  selectedSub: "",
  gics_subs: [],
  stateBtnColor: '#FF0000',
  secBtnColor: '#FF0000',
  subBtnColor: '#FF0000',
  showModal: false,
  modalText: "",
};
}

//start retrieving data here
componentDidMount(){
console.log(`\n\nMOUNTED\n\n`);
this.setState({mounted: true});
console.log(screen.width);
}

componentWillUnmount(){
console.log("\n\nUNMOUNTING\n\n");
this.setState({mounted: false});
}

add_locationObj(locationObj){
self=this;
return new Promise(function(resolve, reject){
  self.setState({
    markers: self.state.markers.concat(locationObj)
  });
});
}

stateCollector(markers){
  states=[];
  for(i=0; i< markers.length; i++){
    console.log(i);
    state=misc.bracket_remover(markers[i].location.split(',')[1].trim());
    stateObj=new Object();
    stateObj.locations=[];
    idx=states.findIndex(e => e.state == state);

    if(idx == -1){
      stateObj.state=state;
      stateObj.locations.push(markers[i]);
      states.push(stateObj);
    }
    else{
      states[idx].locations.push(markers[i]);
    }

  }
  this.setState({states: states});
}

gics_secCollector(markers){
  sectors=[];
  for(i=0; i< markers.length; i++){
    console.log(i);
    console.log(markers[i].compObj.gics_sector);
    sector=markers[i].compObj.gics_sector;
    sectorObj=new Object();
    sectorObj.locations=[];
    idx=sectors.findIndex(e => e.sector == sector);

    if(idx == -1){
     sectorObj.sector=sector;
     sectorObj.locations.push(markers[i]);
     sectors.push(sectorObj);
    }
    else{
     sectors[idx].locations.push(markers[i]);
    }

  }
  this.setState({gics_sectors: sectors});
}

gics_subCollector(markers){
  subs=[];
  for(i=0; i< markers.length; i++){
    console.log(i);
    //console.log(markers[i].compObj.gics_sub);
    sub=markers[i].compObj.gics_sub;
    subObj=new Object();
    subObj.locations=[];
    idx=subs.findIndex(e => e.sub == sub);

    if(idx == -1){
     subObj.sub=sub;
     subObj.locations.push(markers[i]);
     subs.push(subObj);
    }
    else{
     subs[idx].locations.push(markers[i]);
    }

  }

  this.setState({gics_subs: subs}, console.log(this.state.gics_subs));
}

delta_calc(locations){

minLat = locations[0].latitude;
maxLat = locations[0].latitude;
minLong = locations[0].longitude;
maxLong = locations[0].longitude;

locations.forEach(location => {
  minLat = Math.min(minLat, location.latitude);
  maxLat = Math.max(maxLat, location.latitude);
  minLong = Math.min(minLong, location.longitude);
  maxLong = Math.max(maxLong, location.longitude);
});

midLat = (minLat + maxLat) / 2;
midLong = (minLong + maxLong) / 2;

deltaLat = (maxLat - minLat);
deltaLong = (maxLong - minLong);

console.log(`deltaLat = ${deltaLat}, deltaLong=${deltaLong}`);
return [midLat, midLong, deltaLat, deltaLong];
}

changeBtnColors(category){
colorDict={
  'state': ['#FFFFFF', '#FF0000', '#FF0000'],
  'sec': ['#FF0000', '#FFFFFF', '#FF0000'],
  'sub': ['#FF0000', '#FF0000', '#FFFFFF'],
};

this.setState({stateBtnColor: colorDict[category][0]});
this.setState({secBtnColor: colorDict[category][1]});
this.setState({subBtnColor: colorDict[category][2]});
}

showSelectMarkers(select, category){
self=this;
console.log(`select=${select}`);
console.log(`category=${category}`);
arr=[];
idx=-1;
if(category === "state"){arr.push(...this.state.states); idx=arr.findIndex(e => e.state == select); this.changeBtnColors('state');}
else if(category === "sector"){arr.push(...this.state.gics_sectors); idx=arr.findIndex(e => e.sector == select); this.changeBtnColors('sec');}
else if(category === "sub"){arr.push(...this.state.gics_subs); idx=arr.findIndex(e => e.sub == select); this.changeBtnColors('sub');}

console.log(arr);
console.log(`idx=${idx}`);
if(idx !== -1){
  console.log(arr[idx].locations);
  this.setState({ markers: arr[idx].locations});
  region={
    latitude: arr[idx].locations[0].latitude,
    longitude: arr[idx].locations[0].longitude
  };
  console.log(region);
  delta_arr=this.delta_calc(arr[idx].locations);

  this.map.animateToRegion(
  {
    latitude: delta_arr[0],
    longitude: delta_arr[1],
    latitudeDelta: delta_arr[2],
    longitudeDelta: delta_arr[3]
  },
    2400
  );

}
}

async store_markers(markers, no_dupl_url_length){
if(this.state.markers.length == no_dupl_url_length)
{
  try{
    await AsyncStorage.setItem('@markers', JSON.stringify(markers));
    console.log("\n\nMARKERS STORED!!!\n\n");
  }
  catch(e){
    console.log("\n\nMARKERS NOT STORED\n\n");
  }
}
else{
  console.log(no_dupl_url_length);
}
}

get_markers(){
this.setState({start: 1});
this.setState({loadMarkers_enable: 1});

self=this;
return new Promise(function(resolve, reject){
  markers_retr=AsyncStorage.getItem('@markers');
  resolve(markers_retr);
}).then(function(markers_retr){
    markers_retr=JSON.parse(markers_retr);
    console.log(markers_retr);
    self.stateCollector(markers_retr);
    self.gics_secCollector(markers_retr);
    self.gics_subCollector(markers_retr);
    self.setState({markers: markers_retr});
});
}

coord_promises(no_dupl_url){
self=this;
Promise.resolve().then(function(){
  return (0);
}).then(function rec_func(n){

    if(n === no_dupl_url.length){
      self.setState({start: 1});
      return(0);
      //exit with success code
    }

    if((no_dupl_url[n].url !== null)){
        locationHandler(no_dupl_url[n]).then(function(locationObj){
          self.add_locationObj(locationObj);
          console.log(locationObj);
          //add to state variable here!!!
          return no_dupl_url.length;
        }).then(function(no_dupl_url_length){
          self.store_markers(self.state.markers, no_dupl_url.length);
        });
    }
    else{
      console.log("NULL");
    }

    return(Promise.resolve(rec_func(n+1)));
}).then(function(){
  console.log("Done...");
});
}

promiseHandler(){
self=this;
return new Promise(function(resolve, reject){
  sp500Location().then(function(no_dupl_url){
    self.coord_promises(no_dupl_url);
  });
});
}

markerAlert(name){
alert(name);
}

startScrape(){
this.setState({loadMarkers_enable: 1});
this.setState({start: 0});
}

resetScrape(){
this.setState({loadMarkers_enable: 0});
this.setState({start: 0});
}

modal_show(location, name){
this.setState({showModal: true});
modal_txt=`location: ${location}\n\nname: ${name}`;
this.setState({modalText: modal_txt});
}

loadMarker = (loadMarkers_enable) =>{

if(loadMarkers_enable == 0){
  console.log(loadMarkers_enable);
  return(
  <View>
  <View style={{paddingLeft: 100, paddingRight: 100, paddingTop: 50}}>
  <TouchableOpacity style={{backgroundColor: '#FF0000'}} onPress={() => this.startScrape()}>
    <Text>load SP500 company location markers</Text>
  </TouchableOpacity>
  </View>
  <View style={{paddingLeft: 100, paddingRight: 100, paddingTop: 50}}>
  <TouchableOpacity style={{backgroundColor: '#FF0000'}} onPress={() => this.get_markers()}>
    <Text>load SP500 company location markers from local storage</Text>
  </TouchableOpacity>
  </View>
  </View>
  )
}
else if(loadMarkers_enable == 1){
  self=this;
  console.log(loadMarkers_enable);
  if(this.state.start == 0){
    this.promiseHandler();
  }

  if(typeof this.state.markers !== 'undefined'){
  return(
    <View>

    <ScrollView horizontal={true} style={{paddingTop: 20}}>
      <View style={{paddingLeft:10, paddingRight: 10}}>
        <TouchableOpacity style={{backgroundColor: '#FF0000'}} onPress={() => this.resetScrape()}>
          <Text>back</Text>
        </TouchableOpacity>
      </View>

      <View style={{paddingRight: 10}}>
      <TouchableOpacity style={{borderColor: this.state.stateBtnColor, borderWidth: 1}} onPress={() => this.showSelectMarkers(this.state.selectedState, "state")} >
        <Text>load state</Text>
      </TouchableOpacity>
      </View>

      <View style={{paddingRight: 10}}>
      <TouchableOpacity style={{borderColor: this.state.secBtnColor, borderWidth: 1}} onPress={() => this.showSelectMarkers(this.state.selectedSector, "sector")} >
        <Text>load sector</Text>
      </TouchableOpacity>
      </View>

      <View style={{paddingRight: 10}}>
      <TouchableOpacity style={{borderColor: this.state.subBtnColor, borderWidth: 1}} onPress={() => this.showSelectMarkers(this.state.selectedSub, "sub")} >
        <Text>load sub-industry</Text>
      </TouchableOpacity>
      </View>

    </ScrollView>


    <Modal
      transparent={false}
      visible={this.state.showModal}
      onRequestClose={() => {
        this.setState({showModal: false});
      }}>
      <View style={{ flex:1 }}>
          <Text style ={{ textAlign: 'center' }}>{this.state.modalText}</Text>
          <View style={{paddingTop: 30}}>
            <TouchableOpacity
              style={{backgroundColor: "#ff0000"}}
              onPress={() => this.setState({showModal: false})}>
              <Text style={{ textAlign: 'center' }}>make modal disappear</Text>
            </TouchableOpacity>
          </View>
      </View>

    </Modal>




    <View style={{flexDirection: "row", paddingTop: 20}}>

      <View style={{flex: 0.5, paddingTop: 16, paddingLeft: 10}}>
        <Text>state</Text>
      </View>

      <View style={{flex: 1}}>

      <Picker
        style={{width: "100%"}}
        mode="dropdown"
        selectedValue={this.state.selectedState}
        onValueChange={(itemValue, itemIndex) =>
          this.setState({selectedState: itemValue})}>
        {
          this.state.states.map((entry, index) =>{
              if(this.state.states.length != 0){
              return(
                <Picker.Item
                  style={{textAlign: 'center'}}
                  key={index}
                  label={entry.state}
                  value={entry.state}
                />
              )

              }
          })
        }
        </Picker>
      </View>
      </View>


    <View style={{flexDirection: "row", paddingTop: 20}}>

    <View style={{flex: 0.5, paddingTop: 16, paddingLeft: 10}}>
      <Text>GICS Sector</Text>
    </View>

    <View style={{flex: 1}}>
    <Picker
      style={{width: "100%"}}
      mode="dropdown"
      selectedValue={this.state.selectedSector}
      onValueChange={(itemValue, itemIndex) =>
        this.setState({selectedSector: itemValue})}>
      {
        this.state.gics_sectors.map((entry, index) =>{
            if(this.state.gics_sectors.length != 0){
            return(
              <Picker.Item
                style={{textAlign: 'center'}}
                key={index}
                label={entry.sector}
                value={entry.sector}
              />
            )

            }
        })
      }
      </Picker>
    </View>
    </View>

    <View style={{flexDirection: "row", paddingTop: 20}}>

    <View style={{flex: 0.5, paddingTop: 16, paddingLeft: 10}}>
      <Text>GICS Sub-Industry</Text>
    </View>

    <View style={{flex: 1}}>
    <Picker
      style={{width: "100%"}}
      mode="dropdown"
      selectedValue={this.state.selectedSub}
      onValueChange={(itemValue, itemIndex) =>
        this.setState({selectedSub: itemValue})}>
      {
        this.state.gics_subs.map((entry, index) =>{
            if(this.state.gics_subs.length != 0){
            return(
              <Picker.Item
                style={{textAlign: 'center'}}
                key={index}
                label={entry.sub}
                value={entry.sub}
              />
            )

            }
        })
      }
      </Picker>
    </View>
    </View>



    <View style={{paddingTop: 50}}>
    <MapView
      ref={ref=>this.map=ref}
      style={{ width: screen.width, height: screen.height / 2 }}>
      {

      this.state.markers.map((entry, index) =>{
          if(this.state.markers.length != 0){
          return(
            <MapView.Marker
            coordinate={{latitude: entry.latitude, longitude: entry.longitude}}
            key={index}
            title={entry.location}
            description={entry.name}
            onPress={() => this.modal_show(entry.location, entry.name)}/>
          )
          }
      })

      }
      </MapView>

    </View>

    </View>
  )
}

}
}

render () {
var loadMarkers_enable=this.state.loadMarkers_enable;
return(this.loadMarker(loadMarkers_enable));
}

}

function mapsPage(){
app_stuff.navigation.navigate('SP500 HQ locations');
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
 },

})

export default Maps
exports.mapsPage = mapsPage;
