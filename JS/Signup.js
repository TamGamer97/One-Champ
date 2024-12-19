import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, ImageBackground, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { vw, vh } from 'react-native-expo-viewport-units';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { load, save, fetchData, sendData, supabase } from './Functions';

import { Snackbar } from 'react-native-paper';
import 'react-native-url-polyfill/auto'




 
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

    function validateEmail(email) {
        // Check basic email format with regex
        const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!basicRegex.test(email)) {
            return false;
        }
    
        // Split email into local part and domain part
        const [localPart, domainPart] = email.split("@");
    
        // Validate allowed characters in local part
        const allowedLocalRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
        if (!allowedLocalRegex.test(localPart)) {
            return false;
        }
    
        // Validate domain format (subdomains and main domain)
        const domainParts = domainPart.split(".");
        if (domainParts.some(part => part.length < 2 || part.length > 63)) {
            return false;
        }
    
        // Check domain characters (letters, digits, hyphens, no consecutive hyphens)
        const allowedDomainRegex = /^[a-zA-Z0-9-]+$/;
        if (!domainParts.every(part => allowedDomainRegex.test(part))) {
            return false;
        }
    
        // Check for valid TLD (length 2-24, alphanumeric only)
        const tld = domainParts[domainParts.length - 1];
        if (tld.length < 2 || tld.length > 24 || !/^[a-zA-Z0-9]+$/.test(tld)) {
            return false;
        }
    
        // All checks passed
        return true;
    }

    async function startApp()
    {
        console.log('Starting')

        if(isSignupPage)
        {
            console.log('Signing Up')

            console.log('email: ' + emailAdr)
            console.log('pass: ' + password)
            console.log('rePass: ' + rePass)

            // Input Validation
            const isValidEmail = validateEmail(emailAdr)
            
            if(password.length < 8)
            {
                setSnackText('Password must be atleast 8 characters')
                onToggleSnackBar()
                return
            }

            if(isValidEmail == false)
            {
                setSnackText('Invalid email')
                onToggleSnackBar()
                return
            }

            if(password && emailAdr && rePass)
            {
                if(password == rePass)
                {
                    console.log('SIGNING UP')
                    startDatabaseApp('signup')
                }else{
                    console.log('Passwords do not match')
                    setSnackText('Passwords dont match')
                    onToggleSnackBar()
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
    const [userIDState, setUserId] = useState(undefined)

    async function uniqueAccountId(email)
    {
        var USERID = await fetch('https://onechamp-api.onrender.com/generate-user-id/' + email, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mac OS',
            }
        })
        USERID = await USERID.text()
        console.log(USERID)
        console.log('Personal USERID recieved: ' + USERID)

        return USERID


    }

    async function passwordCrypter(pass, isEncrypt)
    {
        var cryptedPass = await fetch('https://onechamp-api.onrender.com/crypt-password/' + pass + '/' + isEncrypt, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mac OS',
            }
        })
        cryptedPass = await cryptedPass.text()

        return cryptedPass
    }


    async function checkEmailExists(email)
    {
        const { data, error } = await supabase
            .from('accounts')
            .select('id')
            .ilike('email', email);

        if (error) {
            console.log("Error checking email:", error);
            setSnackText('Error, Try again later')
            onToggleSnackBar()
        } else if (data.length > 0) {
            console.log("Email exists in the database.");
            setSnackText('Email already exists')
            onToggleSnackBar()
        } else {
            console.log("Email does not exist.");
            return true
        }

        return false
    }

    async function checkEmailPassMatchFound(email, password)
    {
        console.log('---- run login -----')

        var encryptedPassword = await passwordCrypter(password, true)
        console.log(encryptedPassword)

        const { data, error } = await supabase
            .from('accounts')
            .select('id')
            .ilike('email', email)
            .eq('password', encryptedPassword);

        if (error) {
            console.error("Error checking email and password:", error);
            setSnackText('Error, Try again later')
            onToggleSnackBar()
        } else if (data.length > 0) {
            console.log("Email and password match found.");
            return true
        } else {
            console.log("No matching email and password.");
            setSnackText('Incorrect email or password')
            onToggleSnackBar()
        }

        return false
    }

    async function startDatabaseApp(type)
    {

        if(type == 'signup')
        {

            const signupAllowed = await checkEmailExists(emailAdr)

            if(signupAllowed == true)
            {
                console.log('Proceed to creating account ' + emailAdr)

                let userID = await uniqueAccountId(emailAdr)
                console.log('Unique id created')
                let username = userID

                setUserId(username)

                //Encrypt password

                const encryptedPassword = await passwordCrypter(password, true)
                
                const {data, error} = await supabase
                    .from('accounts')
                    .insert([{'email': emailAdr, 'password': encryptedPassword, 'username': username, id: username, friendsList: [ 'default' ], preferences: {'profile': 'https://raw.githubusercontent.com/TamGamer97/One-Champ/refs/heads/main/Images/defaultProfile.png', 'notifications': false}, userInfo: {score: 0, wins: 0, loss: 0}  }])
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

            const loginAllowed = await checkEmailPassMatchFound(emailAdr, password)

            if(loginAllowed == true)
            {    
                console.log('Login Successful. Redirecting')

                console.log('retrieving user id')
                const { data, error } = await supabase
                    .from('accounts')
                    .select('id')
                    .ilike('email', emailAdr);

                const userIdDB = data[0].id
                console.log(userIdDB)
                setUserId(userIdDB)

                const loginInfo = [emailAdr, password, userIdDB]

                await save('login', JSON.stringify(loginInfo))

                navigation.navigate('Home')

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
                : // Otherwise, JSX expression
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
            onPress: () => {},
            }}
            style={{ backgroundColor: '#181C25', borderColor: '#222232', borderWidth: 1 }}
        >
            {snackTxt}
        </Snackbar>


        </ImageBackground>
    )
}