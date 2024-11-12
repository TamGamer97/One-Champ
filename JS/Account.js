import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { vw, vh } from 'react-native-expo-viewport-units';


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
    const toggleSwitch = () => setIsEnabledNotifications((previousState) => !previousState);

    return (
        <View>
            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 30, width: 120}} >Account</Text>
            {/* <TouchableOpacity>
                <Image source={require('../Images/tokenIcon.png')} style={{width: 65, height: 65, position: 'absolute', right: 10, top: 60}} />
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 78, right: 70, width: 90, width: 50, textAlign: 'right'}} >0</Text>
            </TouchableOpacity> */}

            <View style={{width: vw(100), height: 80, backgroundColor: '#222232', position: 'relative', top: 120, display: 'flex', justifyContent: 'center'}}>
                
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 10, position: 'absolute', left: 30, width: 300, top: 20}} >Won 5 Games</Text>

                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'relative', left: 30, width: 300, marginTop: 10}} >TamGamer97</Text>

            </View>

            <View style={{width: vw(100), height: vh(50), position: 'relative', top: 150, display: 'flex', alignItems: 'center'}}>
                
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 21, position: 'relative', left: -15, width: 300}} >Settings</Text>

                <TouchableOpacity style={{width: vw(90), height: 55, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                    
                    <Image source={require('../Images/AccountIcon.png')} style={{width: 20, height: 20, left: 20}} />
                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', left: 35, width: 300}} >Account</Text>

                    <Image source={require('../Images/arrowIcon.png')} style={{width: 20, height: 20, right: 15, transform: [ {rotate: '270deg'} ]}} />


                </TouchableOpacity>

                <View style={{width: vw(90), height: 55, borderRadius: 15, backgroundColor: '#222232', position: 'relative', top: 10, display: 'flex', alignItems: 'center', flexDirection: 'row', marginTop: 10}}>
                    
                    <Image source={require('../Images/NotificationIcon.png')} style={{width: 20, height: 20, left: 20}} />
                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', left: 35, width: 300}} >Notifications</Text>

                    {/* <Image source={require('../Images/arrowIcon.png')} style={{width: 20, height: 20, right: 15, transform: [ {rotate: '270deg'} ]}} /> */}
                    <Switch
                        trackColor={{ false: '#CCCCCC', true: '#CCCCCC' }} // Color when switch is off/on
                        thumbColor={isEnabledNotifications ? '#16B2CA' : '#f4f3f4'} // Thumb color when on/off
                        ios_backgroundColor="#3e3e3e" // iOS background color
                        onValueChange={toggleSwitch} // Function to run when value changes
                        value={isEnabledNotifications} // Current state of the switch

                        style={{right: 35}}
                    />

                </View>

                {/* <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 10, position: 'absolute', left: 30, width: 300, top: 20}} >Won 5 Games</Text>

                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'relative', left: 30, width: 300, marginTop: 10}} >TamGamer97</Text> */}

            </View>





        </View>
    )
}