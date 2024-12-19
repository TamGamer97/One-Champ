import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { vw, vh } from 'react-native-expo-viewport-units';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { load, save, fetchData, sendData } from './Functions';

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

    async function findLoginInfo()
    {
      console.log('Finding login info')
      var loginInfo = await load('login')
      try{
        loginInfo = JSON.parse(loginInfo)
        // save('login', '') // enable to logout
        if(loginInfo != null)
        {
          console.log('loged in, redirecting')
          navigation.navigate('Home')
        }

      }catch{
        console.log('no login info found')
      }
    }

    useEffect(() => {
      findLoginInfo()
    }, [])

    return (
    <View style={{width: vw(100), height: vh(100)}}>
      
      <TouchableOpacity onPress={() => {loadSignup()}} style={{ position: 'absolute', width: 30, height: 30, top: 50, right: 30, zIndex: 5000}}>
        <Image source={require('../Images/closeBtn.png')} style={{position: 'absolute', width: 20, height: 20, right: 0, opacity: 0.8}} />
      </TouchableOpacity>
      
      <Swiper activeDotColor='white' dotColor='grey' bounces={true} loop={false} index={0}>
        
        <View style={{width: vw(100), height: vh(100), display: 'flex', justifyContent: 'center', alignItems: 'center'}}>

          <Image source={require('../Images/Slider1Image.png')} style={{position: 'relative', width: 636 /1.7, height: 569 /1.7,}} />    

          <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', position: 'absolute', bottom: 100, textAlign: 'center', width: vw(100) }}>
            View upcoming{"\n"}matches
          </Text>
        </View>

        <View style={{width: vw(100), height: vh(100), display: 'flex', justifyContent: 'center', alignItems: 'center'}}>

          <Image source={require('../Images/Slider2Image.png')} style={{position: 'relative', width: 437 /1.6, height: 350 /1.6,}} />    

          <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', position: 'absolute', bottom: 100, textAlign: 'center', width: vw(80) }}>
            Earn points for correct predictions <Text style={{textDecorationLine: 'underline'}}>without betting</Text>
          </Text>

        </View>

        <View style={{width: vw(100), height: vh(100), display: 'flex', justifyContent: 'center', alignItems: 'center'}}>

          <Image source={require('../Images/Slider3Image.png')} style={{position: 'relative', width: 501 /1.6, height: 638 /1.6,}} />    

          <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', position: 'absolute', bottom: 80, textAlign: 'center', width: vw(90) }}>
          Earn more points when the overall prediction for your team to win is low
          </Text>

        </View>

        <View style={{width: vw(100), height: vh(100), display: 'flex', justifyContent: 'center', alignItems: 'center'}}>

          <Image source={require('../Images/Slider4Image.png')} style={{position: 'relative', width: 538 /1.6, height: 327 /1.6,}} />    

          <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', position: 'absolute', bottom: 80, textAlign: 'center', width: vw(90) }}>
          Connect with friends and challenge them
          </Text>

         </View>

        <View style={{width: vw(100), height: vh(100), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          
        <Image source={require('../Images/Slider5Image.png')} style={{position: 'relative', width: 538 /1.6, height: 327 /1.6,}} />    
          
          <TouchableOpacity onPress={() => {loadSignup()}} style={{width: 300, height: 50, backgroundColor: '#16B2CA', position: 'absolute', bottom: 70, borderRadius: 10, shadowColor: "cyan", shadowOffset: { width: 0, height: 50, }, shadowOpacity: 0.55, shadowRadius: 14.78, elevation: 22,}}>
            <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', textAlign: 'center', marginTop: 13}}>
                Start
            </Text>
          </TouchableOpacity>
          <Text style={{fontFamily: RighteousFont, fontSize: 25, color: 'white', position: 'absolute', bottom: 190, textAlign: 'center', width: vw(100) }}>
            Signup Now!
          </Text>
        </View>
      </Swiper>
    </View>
    )
}