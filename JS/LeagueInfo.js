import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { vw, vh } from 'react-native-expo-viewport-units';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { load, save, fetchData, sendData, supabase } from './Functions';

export default function App({navigation}) {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }

    fetchFont()

    const [RighteousFont, setRighteousFont] = useState('')


  const [pmTable, setPmTable] = useState([])
  
  var teamsInfo = []
  async function getTeamIcon(targetTeam)
  {
      // console.log('finding team icon')
      async function loadTeamInfo()
      {
          var informationAboutTeamsFromApi = await fetch('https://one-champ-api-1.onrender.com/Team-Info')  
          informationAboutTeamsFromApi = await informationAboutTeamsFromApi.json()
          // console.log(informationAboutTeamsFromApi)
          return informationAboutTeamsFromApi
      }
      if(teamsInfo.length < 1)
      {
          teamsInfo = await loadTeamInfo()
      }

      function replaceWord(inputString, targetWord, replacementWord) {
          // Split the string into an array of words
          const words = inputString.split(' ');
      
          // Map over each word in the array
          const updatedWords = words.map(word => {
              // Replace the target word with the replacement word
              return word === targetWord ? replacementWord : word;
          });
      
          // Join the array of words back into a single string
          return updatedWords.join(' ');
      }

      targetTeam = replaceWord(targetTeam, 'Utd', 'United FC')

      for (teamIndx in teamsInfo)
      {
          var team = teamsInfo[teamIndx]
          if(team.name == targetTeam)
          {
              return team.crestUrl
          }
      }
  }

       

  async function getPMTable()
  {
    
      console.log('getting pm table data')
      var pmTableData = await fetch('https://onechamp-api.onrender.com/premier-league-table') 
      pmTableData = await pmTableData.json()
      console.log('through')
      console.log(pmTableData)

      for (var teamIndx in pmTableData)
      {
          var teamInfo = pmTableData[teamIndx]

          const imgURL = await getTeamIcon(teamInfo.teamName)

          pmTableData[teamIndx].crestURL = imgURL
      }


      setPmTable(pmTableData)
      console.log(pmTableData)
  }

  useEffect(() => {
    getPMTable()
  }, [])




    return (
        <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            
            <TouchableOpacity onPress={() => {navigation.navigate('Discover')}} style={{position: 'absolute', top: 65, left: 0, width: 40, height: 40, opacity: 0.7}}>
                <Image source={require('../Images/arrowIcon.png')} style={{width: 23, height: 23, transform: [{rotate: '90deg'}], left: 20 }} />
            </TouchableOpacity>

            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 60, width: 250}} >Premier League</Text>

            <View style={{width: vw(85), height: 450, borderRadius: 10, backgroundColor: '#222232', top: 150,}}>
              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'relative', top: 20, left: 25, width: 250,marginBottom: 70}} >Table standings</Text>

              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: 70, left: 25, width: 250}} >Club</Text>
              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: 70, right: 130}} >W</Text>
              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: 70, right: 100}} >D</Text>
              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: 70, right: 70}} >L</Text>
              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: 70, right: 20}} >pts</Text>
              
              <ScrollView style={{height: 300}} contentContainerStyle={{paddingBottom: 20}}>
                {pmTable.map((team, index) => (

                  <View key={index} style={{borderColor: '#32374D', borderWidth: 1, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, width: vw(75), marginTop: 10, left: 25, flexDirection: 'row'}}>
                      <Image source={{uri: team.crestURL}} style={{width: 25, height: 25, marginTop: 7}} />
                      
                      <View style={{ width: 110, overflow: 'hidden', marginLeft: 10, marginTop: 7,}}>
                        <Text style={{ fontFamily: 'RighteousFont', color: 'white',  fontSize: 15,  whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} numberOfLines={1} ellipsizeMode="tail"> {team.teamName} </Text>
                      </View>

                      <Text style={{fontFamily: RighteousFont, color: 'white', opacity: 0.6, fontSize: 15, marginLeft: 0, marginTop: 7, position: 'absolute', right: 114, textAlign: 'center', width: 20}} >{team.wins}</Text>
                      <Text style={{fontFamily: RighteousFont, color: 'white', opacity: 0.6, fontSize: 15, marginLeft: 0, marginTop: 7, position: 'absolute', right: 90}} >{team.draws}</Text>
                      <Text style={{fontFamily: RighteousFont, color: 'white', opacity: 0.6, fontSize: 15, marginLeft: 0, marginTop: 7, position: 'absolute', right: 54, textAlign: 'center', width: 20}} >{team.losses}</Text>
                      <Text style={{fontFamily: RighteousFont, color: 'white', opacity: 0.6, fontSize: 15, marginLeft: 0, marginTop: 7, position: 'absolute', right: 10, textAlign: 'center', width: 20}} >{team.points}</Text>
                  </View>
                
                ))}
              
              </ScrollView>


            </View>


        </View>
    )
}