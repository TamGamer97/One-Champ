import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { TextInput } from 'react-native-paper';

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
    

    return (
        <View>
            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 30, width: 90}} >Social</Text>
            <TouchableOpacity>
                <Image source={require('../Images/tokenIcon.png')} style={{width: 65, height: 65, position: 'absolute', right: 10, top: 60}} />
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 78, right: 70, width: 90, width: 50, textAlign: 'right'}} >0</Text>
            </TouchableOpacity>

            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 150, left: 30, width: 250}} >Profile Score</Text>
            
            <View style={{width: vw(100), height: vh(60), top: 190, display: 'flex', alignItems: 'center'}}>
                <View style={{width: vw(90), height: 80, backgroundColor: '#CA162C', borderRadius: 20}}>
                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 13, textAlign: 'center', marginTop: 5}} >TamGamer97</Text>


                    <View style={{display: 'flex', flexDirection: 'row', gap: 20, position: 'relative', flexDirection: 'center'}}>
                    
                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 30, textAlign: 'center'}} >300</Text>

                        <View style={{position: 'absolute', top: 0, left: 50}}>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center'}} >5</Text>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center'}} >wins</Text>

                        </View>


                        <View style={{position: 'absolute', top: 0, right: 50}}>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center'}} >5</Text>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center'}} >Loss</Text>

                        </View>

                    </View>

                </View>

                
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 100, left: 30, width: 250}} >Friends Scores</Text>
                
                    <View style={{width: vw(90), height: 80, backgroundColor: '#16CA9F', borderRadius: 20, marginTop: 60, position: 'relative'}}>
                        <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 13, textAlign: 'center', marginTop: 5}} >TamGamer97</Text>


                        <View style={{display: 'flex', flexDirection: 'row', gap: 20, position: 'relative', flexDirection: 'center'}}>
                        
                        <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 30, textAlign: 'center'}} >300</Text>

                            <View style={{position: 'absolute', top: 0, left: 50}}>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center'}} >5</Text>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center'}} >wins</Text>

                            </View>


                            <View style={{position: 'absolute', top: 0, right: 50}}>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center'}} >5</Text>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center'}} >Loss</Text>

                            </View>

                        </View>

                    </View>
                    <View style={{width: vw(90), height: 80, backgroundColor: '#C616CA', borderRadius: 20, marginTop: 10, position: 'relative'}}>
                        <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 13, textAlign: 'center', marginTop: 5}} >TamGamer97</Text>


                        <View style={{display: 'flex', flexDirection: 'row', gap: 20, position: 'relative', flexDirection: 'center'}}>
                        
                        <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 30, textAlign: 'center'}} >300</Text>

                            <View style={{position: 'absolute', top: 0, left: 50}}>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center'}} >5</Text>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center'}} >wins</Text>

                            </View>


                            <View style={{position: 'absolute', top: 0, right: 50}}>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center'}} >5</Text>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center'}} >Loss</Text>

                            </View>

                        </View>

                    </View>
                    <View style={{width: vw(90), height: 80, backgroundColor: '#1633CA', borderRadius: 20, marginTop: 10, position: 'relative'}}>
                        <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 13, textAlign: 'center', marginTop: 5}} >TamGamer97</Text>


                        <View style={{display: 'flex', flexDirection: 'row', gap: 20, position: 'relative', flexDirection: 'center'}}>
                        
                        <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 30, textAlign: 'center'}} >300</Text>

                            <View style={{position: 'absolute', top: 0, left: 50}}>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center'}} >5</Text>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center'}} >wins</Text>

                            </View>


                            <View style={{position: 'absolute', top: 0, right: 50}}>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center'}} >5</Text>
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center'}} >Loss</Text>

                            </View>

                        </View>

                    </View>
                </View>
            </View>


    )
}