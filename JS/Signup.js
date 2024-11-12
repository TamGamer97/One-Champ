import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, ImageBackground, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { vw, vh } from 'react-native-expo-viewport-units';
import { Snackbar } from 'react-native-paper';


import * as Font from "expo-font";

import Swiper from 'react-native-swiper'

import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'

import AsyncStorage from '@react-native-async-storage/async-storage';

 
export default function App({navigation}) {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }

    fetchFont()

    const [RighteousFont, setRighteousFont] = useState('')

    const [visible, setVisible] = useState(false);
    const [snackTxt, setSnackText] = useState('.')
    const onToggleSnackBar = () => setVisible(!visible);
    const onDismissSnackBar = () => setVisible(false);

    async function startApp()
    {
        console.log('Starting')

        // const loginInfo = await getData('login')

        // if(loginInfo != undefined)
        // {
        //     navigation.navigate('Home')
        // }

        if(isSignupPage)
        {
            console.log('Signing Up')

            console.log('email: ' + emailAdr)
            console.log('pass: ' + password)
            console.log('rePass: ' + rePass)

            if(password && emailAdr && rePass)
            {
                if(password == rePass)
                {
                    startDatabaseApp('signup')
                }else{
                    console.log('Passwords do not match')
                }
            }else{
                console.log('fill in all forms')
            }

        }else{
            console.log('Loging In')

            console.log('email: ' + emailAdr)
            console.log('pass: ' + password)
            startDatabaseApp('login', emailAdr, password)
        }
    }

    function SwitchLogin(type)
    {
        if(type == 'signup')
        {
            setIsSignupPage(true)
        }else{
            setIsSignupPage(false)
        }
    }

    const [isSignupPage, setIsSignupPage] = useState(true)

    const [emailAdr, setEmailAdr] = useState('')
    const [password, setPass] = useState('')
    const [rePass, setRePass] = useState('')
    const [userIDState, setUserId] = useState('')


    // Supabase

    const supabaseUrl = 'https://nxnlueqwonfremybejbm.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bmx1ZXF3b25mcmVteWJlamJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE2NzAzODcsImV4cCI6MjAwNzI0NjM4N30.6cfViULSoEKQi0ImV8xTFwMoGL0uSy31aPRU-yUBFZ4'
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
        }})


    const fetchData = async () => {
        const {data, error} = await supabase
            .from('accounts') // table name
            .select()
        
        if(error)
        {
            console.log(error)
        }

        if(data)
        {
            return data
        }
    }

    const sendData = async () => {
        console.log('sending data')

        const {data, error} = await supabase
            .from('accounts')
            .insert([{'email': 'newemail@gmail.com', 'password': 'newpass', 'username': 'newuser'}])
        
        if(error)
        {
            console.log(error)
        }
        if(data)
        {
            return data
        }
    }

    const storeData = async (key, value) => {
        try {
          await AsyncStorage.setItem(key, value);
          console.log('Data saved successfully');
        } catch (e) {
          // saving error
          console.error('Failed to save the data to the storage');
        }
      };

      const getData = async (key) => {
        try {
          const token = await AsyncStorage.getItem(key);
          if(token !== null) {
            console.log('Token retrieved:', token);
            return token
          } else {
            console.log('No token found');
          }
        } catch (e) {
          // error reading value
          console.error('Failed to fetch the data from storage');
        }
      };
      

    function uniqueAccountId(email) // replace this function with an API request to the server /unique-user-id
    {
        // Get the first 4 characters of the username (or less if the username is shorter)
        let shortUsername = email.substring(0, 4);

        // Get the current date and time
        let now = new Date();
        
        // Extract time (in milliseconds) and date components
        let timeInMillis = now.getTime(); // Returns the time in milliseconds since Jan 1, 1970

        // Combine the shortUsername, timeInMillis, and year to form the userId
        let userId = `${shortUsername}${timeInMillis}`;

        console.log('OFFICAL USERID: ' + userId)
        return userId;
    }

    async function startDatabaseApp(type)
    {
        if(type == 'signup')
        {
            // check if email exists
            const {data, error} = await supabase
                .from('accounts') // table name
                .select()
            
            console.log(data)

            let userID = uniqueAccountId(emailAdr.split('@')[0])
            // let username = emailAdr.split('@')[0]
            let username = userID

            setUserId(username)
            
            let foundEmail = false
            var x = 0
            for (x = 0; x < data.length; x++)
            {
                const row = data[x]
                if(row.email == emailAdr)
                {
                    foundEmail = true
                    break
                }
            }
            if(foundEmail)
            {
                console.log('Email already exists')
                setSnackText('Email already exists')
                onToggleSnackBar()
            }else{
                console.log('Proceed to creating account')
                const {data, error} = await supabase
                    .from('accounts')
                    .insert([{'email': emailAdr, 'password': password, 'username': username, id: username, name: '', friendsList: [ 'default' ], preferences: {'default': 'default'}, predictedMatches: [ {'default': 'default'} ], userInfo: {score: 0, wins: 0, loss: 0}  }])
                    .select() // needed or else data is not returned, but insertion still works

                    if(data)
                    {
                        console.log('Account Most likely Created')
                        console.log(data)
                        SwitchLogin('login')
                        setSnackText('Account created, Login.')
                        onToggleSnackBar()
                    }
                    if(error)
                    {
                        console.log('error')
                        console.log(error)
                        setSnackText('Error: ' + error)
                        onToggleSnackBar()
                    }
            }

        }
        if(type == 'login')
        {
            const {data, error} = await supabase
                .from('accounts') // table name
                .select()

            console.log(data)

            let emailFound = false
            let loginSuccess = false
            for (var x = 0; x < data.length; x++)
            {
                const row = data[x] 
                if(row.email == emailAdr)
                {
                    console.log('Email Found')
                    emailFound = true
                    
                    if(row.password == password)
                    {
                        console.log('Password Matches')

                        console.log('Login Successful. Redirecting')
                        loginSuccess = true

                        const loginInfo = [emailAdr, password, userIDState]

                        await storeData('login', JSON.stringify(loginInfo))
                        

                        navigation.navigate('Home')
                    }else{
                        break
                    }
                }
            }
            if(!emailFound)
            {
                console.log('Email does not exist')
                setSnackText('Incorrect email or password')
                onToggleSnackBar()
            }
            if(emailFound && !loginSuccess)
            {
                console.log('Password does not match')
                setSnackText('Incorrect email or password')
                onToggleSnackBar()
            }

        }
    }


    return (
        <ImageBackground source={require('../Images/signupBg.png')} style={{width: vw(100), height: vh(100), position: 'absolute', top: -50}}>
            <StatusBar translucent={true} />
            <Text style={{fontFamily: RighteousFont, fontSize: 38, color: '#101319', position: 'absolute', top: 100, left: 30, width: 150 }}>
                One{"\n"}Champ
            </Text>

            <TouchableOpacity onPress={() => {SwitchLogin('signup')}} style={{position: 'absolute', top: 110, right: 40, width: 80, height: 30}}>
                <Text style={{fontFamily: RighteousFont, opacity: isSignupPage ? 1 : 0.4, fontSize: 23, color: 'white', position: 'absolute', textAlign: 'right', width: 90, textShadowColor: 'white', textShadowRadius: 8, elevation: 20, shadowColor: 'white'}}>
                    Signup
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {SwitchLogin('login')}} style={{position: 'absolute', top: 140, right: 40, width: 80, height: 30}}>
                <Text style={{fontFamily: RighteousFont, opacity: !isSignupPage ? 1 : 0.4, fontSize: 23, color: 'white', position: 'absolute', textAlign: 'right', width: 90, textShadowColor: 'white', textShadowRadius: 8, elevation: 20, shadowColor: 'white'}}>
                    Login
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {navigation.navigate('Start')}} style={{position: 'absolute', top: 185, right: 30, width: 40, height: 40, opacity: 0.7}}>
                <Image source={require('../Images/arrowIcon.png')} style={{width: 23, height: 23, transform: [{rotate: '90deg'}], left: 20 }} />
            </TouchableOpacity>

            {!isSignupPage ? 
            
                <KeyboardAvoidingView behavior={'padding'} style={{width: vw(100), height: 300, display: 'flex', alignItems: 'center', position: 'absolute', bottom: 10}}>
                    <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', position: 'absolute', top: 60, left: 30}}>
                        Email Address
                    </Text>
                    <TextInput value={emailAdr} onChangeText={setEmailAdr} style={{width: vw(85), height: 50, backgroundColor: '#222232', position: 'absolute', top: 90, left: 30, borderRadius: 10, fontFamily: RighteousFont, paddingLeft: 15, color: 'white'}} placeholder={'Enter your email'} placeholderTextColor={'grey'} />

                    <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', position: 'absolute', top: 160, left: 30}}>
                        Password
                    </Text>
                    <TextInput value={password} onChangeText={setPass} secureTextEntry={true} style={{width: vw(85), height: 50, backgroundColor: '#222232', position: 'absolute', top: 190, left: 30, borderRadius: 10, fontFamily: RighteousFont, paddingLeft: 15, color: 'white'}} placeholder={'Enter your password'} placeholderTextColor={'grey'} />
                    
                    
                    <TouchableOpacity onPress={() => { startApp()}} style={{width: vw(70), height: 45, backgroundColor: '#16B2CA', position: 'absolute', top: 270, borderRadius: 10, shadowColor: "cyan", shadowOffset: { width: 0, height: 0, }, shadowOpacity: 0.55, shadowRadius: 14.78, elevation: 22,}}>
                        <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', textAlign: 'center', marginTop: 10}}>
                            Login
                        </Text>
                    </TouchableOpacity>

                </KeyboardAvoidingView>
                : 
                    <KeyboardAvoidingView behavior={'padding'} style={{width: vw(100), height: 300, display: 'flex', alignItems: 'center', position: 'absolute', bottom: 10}}>
                        <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', position: 'absolute', top: -10, left: 30}}>
                            Email Address
                        </Text>
                        <TextInput value={emailAdr} onChangeText={setEmailAdr} style={{width: vw(85), height: 50, backgroundColor: '#222232', position: 'absolute', top: 20, left: 30, borderRadius: 10, fontFamily: RighteousFont, paddingLeft: 15, color: 'white'}} placeholder={'Enter your email'} placeholderTextColor={'grey'} />

                        <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', position: 'absolute', top: 80, left: 30}}>
                            Password
                        </Text>
                        <TextInput value={password} onChangeText={setPass} secureTextEntry={true} style={{width: vw(85), height: 50, backgroundColor: '#222232', position: 'absolute', top: 110, left: 30, borderRadius: 10, fontFamily: RighteousFont, paddingLeft: 15, color: 'white'}} placeholder={'Enter your password'} placeholderTextColor={'grey'} />

                        <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', position: 'absolute', top: 170, left: 30}}>
                            Re-Password
                        </Text>
                        <TextInput value={rePass} onChangeText={setRePass} secureTextEntry={true} style={{width: vw(85), height: 50, backgroundColor: '#222232', position: 'absolute', top: 200, left: 30, borderRadius: 10, fontFamily: RighteousFont, paddingLeft: 15, color: 'white'}} placeholder={'Confirm your password'} placeholderTextColor={'grey'} />
                        
                        
                        <TouchableOpacity onPress={() => { startApp()}} style={{width: vw(70), height: 45, backgroundColor: '#16B2CA', position: 'absolute', top: 270, borderRadius: 10, shadowColor: "cyan", shadowOffset: { width: 0, height: 0, }, shadowOpacity: 0.55, shadowRadius: 14.78, elevation: 22,}}>
                            <Text style={{fontFamily: RighteousFont, fontSize: 20, color: 'white', textAlign: 'center', marginTop: 10}}>
                                SignUp
                            </Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
            }



        <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        duration={5000} // duration in milliseconds
        action={{   
          label: 'dismiss',
          onPress: () => {
            // Do something if the user presses the action button
          },
        }}
        style={{ backgroundColor: '#181C25', borderColor: '#222232', borderWidth: 1 }} // customize background color
      >
        {snackTxt}
      </Snackbar>


        </ImageBackground>
    )
}