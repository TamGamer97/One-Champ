import React, {useEffect, useState, useRef} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, Switch, Animated, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { vw, vh } from 'react-native-expo-viewport-units';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { load, save, fetchData, sendData, supabase } from './Functions';

import { Snackbar } from 'react-native-paper';
import * as Updates from 'expo-updates';




export default function App() {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }

    fetchFont()

    const [RighteousFont, setRighteousFont] = useState('')

    const [isEnabledNotifications, setIsEnabledNotifications] = useState(false);

    // Function to handle the toggle
    const toggleSwitch = () => {setIsEnabledNotifications((previousState) => !previousState); updateNotificationSettings()}

    // Popup
    const [visible, setVisible] = useState(false);
    const [snackTxt, setSnackText] = useState('.')
    const onToggleSnackBar = () => setVisible(!visible);
    const onDismissSnackBar = () => setVisible(false);


    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [profile, setProfile] = useState()
    const [wins, setWins] = useState('')
    const [userID, setUserId] = useState('')

    var newUsername = ''
    
    function runLogout()
    {
        save('login', '') // overwrites session
        Updates.reloadAsync()

    }

    const positionView1 = new Animated.ValueXY({x:0,y:0})
    const positionView2 = new Animated.ValueXY({x:0,y:0})

    function animateViewLeft()
    {
        Animated.spring(positionView1, {
            toValue:{x: -vw(100), y: 0},
            useNativeDriver: true,
        }).start()

        Animated.spring(positionView2, {
            toValue:{x: -vw(100), y: 0},
            useNativeDriver: true,
        }).start()
    }

    function animateViewRight()
    {
        Animated.spring(positionView1, {
            toValue:{x: 0, y: 0},
            useNativeDriver: true,
        }).start()

        Animated.spring(positionView2, {
            toValue:{x: 0, y: 0},
            useNativeDriver: true,
        }).start()

    }

    async function getAccountInformation()
    {
        // Returns email, username, password, preferences, userInfo

        var loginInfo = await load('login')
        loginInfo = JSON.parse(loginInfo)

        const userID = loginInfo[2]

        setUserId(userID)

        const { data, error } = await supabase
            .from('accounts')
            .select('email, username, password, preferences, userInfo')
            .eq('id', userID);
        
        if(data)
        {
            console.log(data)
            const userInformation = data[0]

            //Decrypt password
            var decryptedPass = await fetch('https://one-champ-api-1.onrender.com/crypt-password/'+userInformation.password+'/false')  
            decryptedPass = await decryptedPass.text()

            setEmail(userInformation.email)
            setUsername(userInformation.username)
            setPassword(decryptedPass)

            setProfile(userInformation.preferences.profile)
            setWins(userInformation.userInfo.wins)

            if(userInformation.preferences.notifications == null)
            {
                userInformation.preferences.notifications = false
            }
            setIsEnabledNotifications(userInformation.preferences.notifications)

            newUsername = userInformation.username
        }
    }

    useEffect(() => {
        getAccountInformation()
    }, [])

    async function updateUsername()
    {
        console.log(newUsername)

        // USERNAME CHECK

        // Check if username is acceptable
        const bannedUsernames = [
            // Data specific erorrs
            'default',

            // Common SQL Injection Attempts
            "' OR '1'='1",
            "' OR 1=1 --",
            "' DROP TABLE",
            "' UNION SELECT",
            "' AND '1'='1",
            "; DROP TABLE",
            "';--",
            "1; DROP",
            "admin' --",
            "0 OR 1=1",
            "1' AND 1=1",

            // Common XSS Injection Attempts
            "<script>",
            "<img src=x>",
            "<body onload>",
            "alert('x')",
            "<svg onload>",
            "<iframe>",
            "javascript:",
            "onerror=",
            "<marquee>",
            "<input>",

            // Reserved or Dangerous Terms
            "admin",
            "root",
            "sysadmin",
            "null",
            "undefined",
            "NaN",
            "moderator",
            "support",
            "helpdesk",
            "owner",
            "master",
            "test",
            "guest",
            "superuser",
            "system",
            "api",
            "config",
            "token",
            "debug",
            "console",
            "user"

        ]

        if(bannedUsernames.includes(newUsername) || newUsername.length > 15)
        {
            setSnackText('Username is either not appropriate or too long')
            onToggleSnackBar()
            return
        }

        // Check if the username already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('accounts')
            .select('id')
            .eq('username', newUsername)
            .maybeSingle()

        if (checkError) {
            console.log('Error checking username availability:', checkError);
            return 
        }

        if (existingUser) {
            setSnackText('Username is taken')
            onToggleSnackBar()
            return
        }

        // Passed all conditions, username is acceptable and unique

        const { data, error } = await supabase
            .from('accounts')
            .update({ username: newUsername })
            .eq('id', userID)

        console.log('Updated username')

        setSnackText('Username updated')
        onToggleSnackBar()

        setUsername(newUsername)
    }

    async function updateNotificationSettings()
    {
        const { data: user, error: fetchError } = await supabase
            .from('accounts')
            .select('preferences')
            .eq('id', userID)
            .single();

            if (fetchError) {
                console.error('Error fetching user preferences:', fetchError);
                return;
            }

            // Update the notifications field without overwriting other fields
            const updatedPreferences = {
                ...user.preferences, // Keep existing fields
                notifications: !isEnabledNotifications, // Update or add
            };

            //  Write back the updated preferences to the database
            const { data, error: updateError } = await supabase
                .from('accounts')
                .update({ preferences: updatedPreferences })
                .eq('id', userID);

            if (updateError) {
                console.error('Error updating preferences:', updateError);
                return;
            }

            console.log('Preferences updated successfully:', data);
    }

    return (
        <View>

            <Snackbar
                visible={visible} 
                onDismiss={onDismissSnackBar}
                duration={5000} // duration in milliseconds
                action={{   
                label: 'dismiss',
                onPress: () => {},
                }}
                style={{ backgroundColor: '#181C25', borderColor: '#222232', borderWidth: 1, position: 'absolute', bottom: -vh(85)}} // customize background color
            >
                {snackTxt}
            </Snackbar>


            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 30, width: 120}}>Account</Text>

            <View style={{width: vw(100), height: 80, backgroundColor: '#222232', position: 'relative', top: 120, display: 'flex', justifyContent: 'center'}}>
                
                {profile ? (
                        <Image style={{position: 'absolute', left: 30, width: 40, height: 40, top: 20}} source={{uri: profile}} />
                    )
                    : (
                        <View></View>
                    )
                }
                

                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 10, position: 'absolute', left: 80, width: 300, top: 20}} >Won {wins} Games</Text>

                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'relative', left: 80, width: 300, marginTop: 10}} >{username}</Text>

            </View>

            <Animated.View style={{transform: [{translateX:positionView1.x}], marginLeft: 0, width: vw(100), height: vh(50), position: 'absolute', top: 240, display: 'flex', alignItems: 'center'}}>
                
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 21, position: 'relative', left: -15, width: 300}} >Settings</Text>

                <TouchableOpacity onPress={() => {animateViewLeft()}} style={{width: vw(90), height: 55, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                    
                    <Image source={require('../Images/AccountIcon.png')} style={{width: 20, height: 20, left: 20}} />
                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', left: 35, width: 300}} >Account</Text>

                    <Image source={require('../Images/arrowIcon.png')} style={{width: 20, height: 20, right: 15, transform: [ {rotate: '270deg'} ]}} />


                </TouchableOpacity>

                <View style={{width: vw(90), height: 55, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, display: 'flex', alignItems: 'center', flexDirection: 'row', marginTop: 10}}>
                    
                    <Image source={require('../Images/NotificationIcon.png')} style={{width: 20, height: 20, left: 20}} />
                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', left: 35, width: 300}} >Notifications</Text>

                    <Switch
                        trackColor={{ false: '#CCCCCC', true: '#CCCCCC' }} // Color when switch is off/on
                        thumbColor={isEnabledNotifications ? '#16B2CA' : '#f4f3f4'} // Thumb color when on/off
                        ios_backgroundColor="#3e3e3e" // iOS background color
                        onValueChange={toggleSwitch} // Function to run when value changes
                        value={isEnabledNotifications} // Current state of the switch

                        style={{right: 35}}
                    />

                </View>

                <TouchableOpacity onPress={() => {runLogout()}} style={{width: vw(90), height: 55, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, marginTop: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                    
                    <Image source={require('../Images/logoutIcon.png')} style={{width: 20, height: 20, left: 23}} />
                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', left: 35, width: 300}} >Logout</Text>


                </TouchableOpacity>


            </Animated.View>

            {/* Account Settings: */}
            

                <Animated.View style={{ transform: [{translateX:positionView1.x}], marginLeft: vw(100), width: vw(100), height: vh(50), position: 'absolute', top: 240, display: 'flex', alignItems: 'center'}}>
            

                        <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 21, position: 'relative', left: -15, width: 300}} >Account</Text>

                        <TouchableOpacity onPress={() => {animateViewRight()}} style={{width: vw(90), height: 40, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                            
                            <Image source={require('../Images/arrowIcon.png')} style={{width: 20, height: 20, left: 20, transform: [{rotateZ: '90deg'}]}} />
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', left: 35, width: 300}} >Back</Text>

                        </TouchableOpacity>
                        
                        
                        <View style={{width: vw(90), height: 55, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, display: 'flex', alignItems: 'center', flexDirection: 'row', marginTop: 40}}>
                            
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 14, position: 'absolute', left: 5, width: 300, top: -25}} >Username</Text>
                            
                            <TextInput onChangeText={(text) => {newUsername = text}} style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', right: 35, width: 300, color: 'white', opacity: 0.6}} >{username}</TextInput>

                        </View>

                        <View style={{width: vw(90), height: 55, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, display: 'flex', alignItems: 'center', flexDirection: 'row', marginTop: 40}}>
                            
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 14, position: 'absolute', left: 5, width: 300, top: -25}} >Email</Text>
                                
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', right: 35, width: 300, color: 'white', opacity: 0.6}} >{email}</Text>

                        </View>

                        <View style={{width: vw(90), height: 55, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, display: 'flex', alignItems: 'center', flexDirection: 'row', marginTop: 40}}>
                            
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 14, position: 'absolute', left: 5, width: 300, top: -25}} >Password</Text>
                                
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', right: 35, width: 300, color: 'white', opacity: 0.6}} >{password}</Text>

                        </View>

                        <TouchableOpacity onPress={() => {updateUsername()}} style={{width: vw(90), height: 40, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, display: 'flex', alignItems: 'center', flexDirection: 'row', marginTop: 40}}>
                            
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, width: vw(90), color: 'white', textAlign: 'center'}} >Update</Text>

                        </TouchableOpacity>

                </Animated.View>

        </View>
    )
}