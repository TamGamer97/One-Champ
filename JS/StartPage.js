import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { vw, vh } from 'react-native-expo-viewport-units';

import * as Font from "expo-font";

import Swiper from 'react-native-swiper'



export default function App({navigation}) {
    
  
  const fetchFont = async () => {
      await Font.loadAsync({
          'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
      });

      setRighteousFont('RighteousFont')
  }

  fetchFont()


    const [RighteousFont, setRighteousFont] = useState('')

    function loadSignup()
    {
        navigation.navigate('SignUp')
    }

    return (
    <View style={{width: vw(100), height: vh(100)}}>
      
      <TouchableOpacity onPress={() => {loadSignup()}} style={{ position: 'absolute', width: 30, height: 30, top: 50, right: 30, zIndex: 5000}}>
        <Image source={require('../Images/closeBtn.png')} style={{position: 'absolute', width: 20, height: 20, right: 0, opacity: 0.8}} />
      </TouchableOpacity>
      
      <Swiper activeDotColor='white' dotColor='grey' bounces={false} loop={false} index={0}>
        <View style={{width: vw(100), height: vh(100)}}>
          <Text style={{fontFamily: RighteousFont, fontSize: 25, color: 'white', position: 'absolute', bottom: 140, textAlign: 'center', width: vw(100) }}>
            Hello Swiper 1
          </Text>
        </View>
        <View style={{width: vw(100), height: vh(100)}}>
          <Text style={{fontFamily: RighteousFont, fontSize: 25, color: 'white', position: 'absolute', bottom: 140, textAlign: 'center', width: vw(100) }}>
            Hello Swiper 2
          </Text>
        </View>
        <View style={{width: vw(100), height: vh(100)}}>
          <Text style={{fontFamily: RighteousFont, fontSize: 25, color: 'white', position: 'absolute', bottom: 140, textAlign: 'center', width: vw(100) }}>
            Hello Swiper 3
          </Text>
        </View>
        <View style={{width: vw(100), height: vh(100)}}>
          <Text style={{fontFamily: RighteousFont, fontSize: 25, color: 'white', position: 'absolute', bottom: 140, textAlign: 'center', width: vw(100) }}>
            Hello Swiper 4
          </Text>
        </View>
        <View style={{width: vw(100), height: vh(100), display: 'flex', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => {loadSignup()}} style={{width: 300, height: 50, backgroundColor: '#16B2CA', position: 'absolute', bottom: 70, borderRadius: 10, shadowColor: "cyan", shadowOffset: { width: 0, height: 50, }, shadowOpacity: 0.55, shadowRadius: 14.78, elevation: 22,}}>
            <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', textAlign: 'center', marginTop: 13}}>
                Start
            </Text>
          </TouchableOpacity>
          <Text style={{fontFamily: RighteousFont, fontSize: 25, color: 'white', position: 'absolute', bottom: 190, textAlign: 'center', width: vw(100) }}>
            Hello Swiper 5
          </Text>
        </View>
      </Swiper>
    </View>
    )
}