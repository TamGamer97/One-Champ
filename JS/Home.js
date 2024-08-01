import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, ScrollView } from 'react-native';
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

    const LiveMatchScore = () => {
        return(
            
            <View style={{width: 320, height: 160, borderRadius: 10, backgroundColor: '#16B2CA', marginTop: 30, flexGrow: 1}}>
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', top: -33, left: 0, width: 120}} >Live Scores</Text>
                <TouchableOpacity style={{ top: -33, right: 0, position: 'absolute'}}>
                    <Text style={{fontFamily: RighteousFont, color: '#18A5C2', fontSize: 13, marginTop: 7}} >View All</Text>
                </TouchableOpacity>
            </View>
        
        )
    }

    const FTMatches = ({title}) => {
        return(
            
            <View style={{width: 340, height: 200, borderRadius: 10, marginTop: 50, display: 'flex', alignItems: 'center', gap: 8, flexGrow: 1}}>
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: -33, left: 10}} >{title}</Text>
                <TouchableOpacity style={{ top: -33, right: 10, position: 'absolute'}}>
                    <Text style={{fontFamily: RighteousFont, color: '#18A5C2', fontSize: 13, marginTop: 7}} >View All</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10}}>

                </TouchableOpacity>
                <TouchableOpacity style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10}}>

                </TouchableOpacity>
                <TouchableOpacity style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10}}>

                </TouchableOpacity>
            </View>
        
        )
    }

    return (
        <ScrollView>
            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 30, width: 90}} >One Champ</Text>
            <TouchableOpacity>
                <Image source={require('../Images/tokenIcon.png')} style={{width: 65, height: 65, position: 'absolute', right: 10, top: 60}} />
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 78, right: 70, width: 90, width: 50, textAlign: 'right'}} >0</Text>
            </TouchableOpacity>

            
            

            <View style={{width: '100%', position: 'relative', marginTop: 160, display: 'flex', alignItems: 'center', paddingBottom: 150}}>
                <LiveMatchScore />
                <FTMatches title={'Todays Matches'} />
                <FTMatches title={'Watching'} />
            </View>

        </ScrollView>
    )
}