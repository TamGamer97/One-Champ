import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";

export default function App() {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }

    fetchFont()

    const [RighteousFont, setRighteousFont] = useState('')

    return (
        <View>
            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 30, width: 120}} >Account</Text>
            <TouchableOpacity>
                <Image source={require('../Images/tokenIcon.png')} style={{width: 65, height: 65, position: 'absolute', right: 10, top: 60}} />
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 78, right: 70, width: 90, width: 50, textAlign: 'right'}} >0</Text>
            </TouchableOpacity>
        </View>
    )
}