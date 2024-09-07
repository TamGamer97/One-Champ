import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, TextInput } from 'react-native';
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

    const PreviousMatchScore = () => {
        return(
            
            <View style={{width: 320, height: 160, borderRadius: 10, backgroundColor: '#8616CA', marginTop: 30, flexGrow: 1}}>
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', top: -33, left: 0, width: 170}} >Previous Games</Text>
                <TouchableOpacity style={{ top: -33, right: 0, position: 'absolute'}}>
                    <Text style={{fontFamily: RighteousFont, color: '#18A5C2', fontSize: 13, marginTop: 7}} >View All</Text>
                </TouchableOpacity>
            </View>
        
        )
    }


    const [searchResults, setSearchResults] = useState([])

    const FTMatches = ({title}) => {
        
        const shouldDisplayMatches = title === "Leagues";

        return(
            
            <View style={{width: 340, height: 200, borderRadius: 10, marginTop: 50, display: 'flex', alignItems: 'center', gap: 8, flexGrow: 1}}>
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: -33, left: 10}} >{title}</Text>
                <TouchableOpacity style={{ top: -33, right: 10, position: 'absolute'}}>
                    <Text style={{fontFamily: RighteousFont, color: '#18A5C2', fontSize: 13, marginTop: 7}} >View All</Text>
                </TouchableOpacity>

                    <TouchableOpacity 
                        style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}
                        >
                        {/* You can add content inside the TouchableOpacity here if needed */}
                        
                        <Image source={{uri: 'https://b.fssta.com/uploads/application/soccer/competition-logos/EnglishPremierLeague.png'}}  style={{width: 30, height: 30, left: 20}} />

                    
                        <Text style={{textAlign: 'center', color: 'white', fontFamily: RighteousFont, fontSize: 15, marginLeft: 30}}>Premiure League</Text>


                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}
                        >
                        {/* You can add content inside the TouchableOpacity here if needed */}
                        
                        <Image source={{uri: 'https://static.wikia.nocookie.net/fifa/images/a/ad/ChampionsLeagueLogo.png/revision/latest/scale-to-width-down/250?cb=20180912190604'}}  style={{width: 30, height: 30, left: 20}} />

                    
                        <Text style={{textAlign: 'center', color: 'white', fontFamily: RighteousFont, fontSize: 15, marginLeft: 30}}>Champions League</Text>


                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}
                        >
                        {/* You can add content inside the TouchableOpacity here if needed */}
                        
                        <Image source={{uri: 'https://www.citypng.com/public/uploads/preview/qatar-2022-fifa-world-cup-logo-hd-png-701751694776730e3cup6kwl4.png'}}  style={{width: 30, height: 30, left: 20}} />

                    
                        <Text style={{textAlign: 'center', color: 'white', fontFamily: RighteousFont, fontSize: 15, marginLeft: 30}}>World Cup</Text>


                    </TouchableOpacity>
            </View>
        
        )
    }

    return (
        <View>
            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 30, width: 110}} >Discover</Text>
            {/* <TouchableOpacity>
                <Image source={require('../Images/tokenIcon.png')} style={{width: 65, height: 65, position: 'absolute', right: 10, top: 60}} />
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 78, right: 70, width: 90, width: 50, textAlign: 'right'}} >0</Text>
            </TouchableOpacity> */}

            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{ position: 'absolute', top: 130, width: vw(90), display: 'flex', flexDirection: 'row' }}>

                    <TextInput style={{width: vw(70), height: 40, backgroundColor: '#222232', borderRadius: 10, fontFamily: RighteousFont, paddingLeft: 15, color: 'white'}} placeholder={'Search...'} placeholderTextColor={'grey'} />

                    <TouchableOpacity style={{width: 70, height: 40, borderRadius: 10, marginLeft: 5, backgroundColor: '#222232'}}>
                        <Text style={{fontFamily: RighteousFont, color: 'white', textAlign: 'center', marginTop: 11, fontSize: 12}}>Filter</Text>
                    </TouchableOpacity>

                </View>
            </View>

            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 30}}>
                <View style={{ position: 'absolute', top: 150, width: vw(90), display: 'flex', flexDirection: 'row' }}>

                    <TouchableOpacity style={{width: 90, height: 30, borderRadius: 20, backgroundColor: '#222232'}}>
                        <Text style={{fontFamily: RighteousFont, color: 'white', textAlign: 'center', marginTop: 8, fontSize: 10}}>Matches</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{width: 90, height: 30, borderRadius: 20, marginLeft: 5, backgroundColor: '#222232'}}>
                        <Text style={{fontFamily: RighteousFont, color: 'white', textAlign: 'center', marginTop: 8, fontSize: 10}}>Leagues</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{width: 90, height: 30, borderRadius: 20, marginLeft: 5, backgroundColor: '#222232'}}>
                        <Text style={{fontFamily: RighteousFont, color: 'white', textAlign: 'center', marginTop: 8, fontSize: 10}}>Users</Text>
                    </TouchableOpacity>

                </View>
            </View>

            <View style={{width: '100%', position: 'relative', marginTop: 220, display: 'flex', alignItems: 'center', paddingBottom: 150}}>
                {searchResults.length < 1 ?
                <View style={{ display: 'flex', alignItems: 'center'}}>
                    <PreviousMatchScore />
                    <FTMatches title={'Leagues'} />
                </View>
                :
                <View style={{ display: 'flex', alignItems: 'center'}}>
                    <FTMatches title={'Leagues'} />
                </View>
                


                }
                
            </View>

            
        </View>
    )
}