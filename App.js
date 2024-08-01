import React, {useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Appearance } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeIcon from './Images/HomeIcon.png'
import DiscoverIcon from './Images/discoverIcon.png'
import WatchingIcon from './Images/TrackIcon.png'
import AccountIcon from './Images/AccountIcon.png'

import Home from './JS/Home'
import Discover from './JS/Discover'
import Watching from './JS/Watching'
import Account from './JS/Account'
import StartPage from './JS/StartPage'
import SignUp from './JS/Signup'

import { load, save } from './JS/Functions';



// eas build -p android --profile preview 
// for apk build

// npx expo install --check
// Expo doctor or something

// npx expo prebuild --platform android
// for prebuilding android files
const Tab = createBottomTabNavigator();




export default function App() {

  
  const colorScheme = 'dark'

  let MyTheme = {
    dark: false,
    colors: {
      primary: '#FFFFFF',
      background: colorScheme == 'light'? '#FFFFFF' :'#101319', // 3A4147
      card: colorScheme == 'light'? '#FFFFFF' :'#171D27',
      text: '#00BA9D',
      border: colorScheme == 'light'? '#FFFFFF' :'#101319',
      notification: '#FFFFFF',
    },
  };

  function StartFunction({navigation})
  {
      return <StartPage navigation={navigation} />
  }
  function SignUpFunction({navigation})
  {
      return <SignUp navigation={navigation} />
  }

  function HomeFunction({navigation})
  {
      return <Home navigation={navigation} />
  }
  function DiscoverFunction({navigation})
  {
      return <Discover navigation={navigation} />
  }
  function WatchingFunction({navigation})
  {
      return <Watching navigation={navigation} />
  }
  function AccountFunction({navigation})
  {
      return <Account navigation={navigation} />
  }
  

  return (
    <NavigationContainer theme={MyTheme} >
      <Tab.Navigator>
        <Tab.Screen name="Start" component={StartFunction} options={{ tabBarStyle: { display: 'none'}, tabBarButton: (props) => null, tabBarShowLabel: true, headerShown: false }} />
        <Tab.Screen name="SignUp" component={SignUpFunction} options={{ tabBarStyle: { display: 'none'}, tabBarButton: (props) => null, tabBarShowLabel: true, headerShown: false }} />
        
        <Tab.Screen name="Home" component={HomeFunction} options={{ tabBarStyle: { height: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderLeftWidth: 0.2, borderRightWidth: 0.2, position: 'absolute', overflow: 'hidden', borderColor: 'transparent' }, headerShown: false, tabBarShowLabel: false, tabBarIcon: ({ color, size, focused }) => (<Image style={[{width :23, height: 23, marginTop: 5, opacity: focused ? 0.8 : 0.4 }]} source={HomeIcon} />), }} />
        <Tab.Screen name="Discover" component={DiscoverFunction} options={{ tabBarStyle: { height: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderLeftWidth: 0.2, borderRightWidth: 0.2, position: 'absolute', overflow: 'hidden', borderColor: 'transparent' }, headerShown: false, tabBarShowLabel: false, tabBarIcon: ({ color, size, focused }) => (<Image style={[{width :23, height: 23, marginTop: 5, opacity: focused ? 0.8 : 0.4 }]} source={DiscoverIcon} />), }} />
        <Tab.Screen name="Watching" component={WatchingFunction} options={{ tabBarStyle: { height: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderLeftWidth: 0.2, borderRightWidth: 0.2, position: 'absolute', overflow: 'hidden', borderColor: 'transparent' }, headerShown: false, tabBarShowLabel: false, tabBarIcon: ({ color, size, focused }) => (<Image style={[{width :23, height: 23, marginTop: 5, opacity: focused ? 0.8 : 0.4 }]} source={WatchingIcon} />), }} />
        <Tab.Screen name="Account" component={AccountFunction} options={{ tabBarStyle: { height: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderLeftWidth: 0.2, borderRightWidth: 0.2, position: 'absolute', overflow: 'hidden', borderColor: 'transparent' }, headerShown: false, tabBarShowLabel: false, tabBarIcon: ({ color, size, focused }) => (<Image style={[{width :23, height: 23, marginTop: 5, opacity: focused ? 0.8 : 0.4 }]} source={AccountIcon} />), }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
