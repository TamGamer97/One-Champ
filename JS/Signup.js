import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, ImageBackground, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { vw, vh } from 'react-native-expo-viewport-units';

import * as Font from "expo-font";

import Swiper from 'react-native-swiper'

import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'
 
export default function App({navigation}) {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }

    fetchFont()

    const [RighteousFont, setRighteousFont] = useState('')

    function startApp()
    {
        console.log('Starting')

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
            console.log(data)
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
            console.log(data)
        }
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

            let foundEmail = false
            let username = emailAdr.split('@')[0]
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
            }else{
                console.log('Proceed to creating account')
                const {data, error} = await supabase
                    .from('accounts')
                    .insert([{'email': emailAdr, 'password': password, 'username': username, 'id': x+1}])

                console.log('Account Most likely Created')
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

                        navigation.navigate('Home')
                    }else{
                        break
                    }
                }
            }
            if(!emailFound)
            {
                console.log('Email does not exist')
            }
            if(emailFound && !loginSuccess)
            {
                console.log('Password does not match')
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





        </ImageBackground>
    )
}