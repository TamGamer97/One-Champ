import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";

import { vw, vh } from 'react-native-expo-viewport-units';

import { createClient } from '@supabase/supabase-js'

import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }
    fetchFont()

    // Supabase
    const supabaseUrl = 'https://nxnlueqwonfremybejbm.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bmx1ZXF3b25mcmVteWJlamJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE2NzAzODcsImV4cCI6MjAwNzI0NjM4N30.6cfViULSoEKQi0ImV8xTFwMoGL0uSy31aPRU-yUBFZ4'
    const supabase = createClient(supabaseUrl, supabaseKey, {
         auth: {
           persistSession: false,
         }})

    const [RighteousFont, setRighteousFont] = useState('')

    const [friendsInfo, setFriendsInfo] = useState([])
    
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

    const getData = async (key) => {
        try {
          const token = await AsyncStorage.getItem(key);
          if(token !== null) {
            // console.log('Token retrieved:', token);
            return token
          } else {
            // console.log('No token found');
          }
        } catch (e) {
          // error reading value
          // console.error('Failed to fetch the data from storage');
        }
      };

    async function getFriendsInfo()
    {
        const accountData = await fetchData()

        var login = await getData('login')
        login = JSON.parse(login)

        var friendsInfoList = []

        for (var usersIndx in accountData)
        {
            var userItem = accountData[usersIndx]

            if(userItem.id == login[2])
            {
                // found our user

                for (var friendsIndx in userItem.friendsList)
                {
                    // searching thorugh friends list
                    var friendId = userItem.friendsList[friendsIndx]

                    if(friendId == 'default') { continue }
                    
                    // find friendsInfo
                    var friendData = {username: '', win: '', loss: '', score: '', profileImage: 'https://crests.football-data.org/1044.png'}

                    for (var otherUsersIndx in accountData)
                    {
                        // searching through all users to find friends data
                        var otherUserItem = accountData[otherUsersIndx]

                        if(otherUserItem.id == friendId)
                        {
                            friendData['win'] = otherUserItem.userInfo.wins
                            friendData['loss'] = otherUserItem.userInfo.loss
                            friendData['score'] = otherUserItem.userInfo.score
                            friendData['username'] = otherUserItem.username

                            break
                        }
                    }

                    friendsInfoList.push(friendData)


                }

            }
        }


        setFriendsInfo(friendsInfoList)
        console.log(friendsInfoList)

    }

    useEffect(() => {
        getFriendsInfo()
    }, [])

    return (
        <View>
            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 30, width: 90}} >Social</Text>
            <TouchableOpacity>
                <Image source={require('../Images/tokenIcon.png')} style={{width: 65, height: 65, position: 'absolute', right: 10, top: 60}} />
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 78, right: 70, width: 90, width: 50, textAlign: 'right'}} >0</Text>
            </TouchableOpacity>

            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 150, left: 30, width: 250}} >Profile Score</Text>
            
            <View style={{width: vw(100), height: vh(60), top: 190, display: 'flex', alignItems: 'center'}}>
                <View style={{width: vw(90), height: 80, backgroundColor: '#222232', borderRadius: 20, marginBottom: 50}}>
                    <Text style={{fontFamily: RighteousFont, color: '#FF6E6E', fontSize: 13, textAlign: 'center', marginTop: 5}} >TamGamer97</Text>


                    <View style={{display: 'flex', flexDirection: 'row', gap: 20, position: 'relative', flexDirection: 'center'}}>
                    
                        <Text style={{fontFamily: RighteousFont, color: '#FF6E6E', fontSize: 30, textAlign: 'center', marginTop: 5}} >300</Text>

                        <View style={{position: 'absolute', top: 0, left: 50}}>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center', color: '#FF6E6E'}} >5</Text>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center', color: '#FF6E6E'}} >wins</Text>

                        </View>


                        <View style={{position: 'absolute', top: 0, right: 50}}>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 23, textAlign: 'center', color: '#FF6E6E'}} >5</Text>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 11, textAlign: 'center', color: '#FF6E6E'}} >Loss</Text>

                        </View>

                    </View>

                </View>
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'absolute', top: 100, left: 30, width: 250}} >Friends Scores</Text>

                {friendsInfo.map((match, index) => (
                    <TouchableOpacity key={index} style={{width: vw(90), height: 70, backgroundColor: '#222232', borderRadius: 20, marginTop: 10, position: 'relative', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row'}}>
                        <Image source={{uri: match.profileImage}} style={{width: 40, height: 40, left: 20, top: 13}} />
                        
                        <View style={{display: 'flex', flexDirection: 'column'}}>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 13, left: 30, top: 12}} >{match.win}-{match.loss}</Text>
                            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, left: 30, top: 12}} >{match.username}</Text>
                        </View>

                        <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, right: 30, top: 17, position: 'absolute'}} >{match.score}</Text>
                    </TouchableOpacity>
                ))}



            </View>



            </View>


    )
}