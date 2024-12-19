import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { vw, vh } from 'react-native-expo-viewport-units';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { load, save, fetchData, sendData, supabase } from './Functions';

import { useIsFocused } from "@react-navigation/native";
import SwitchSelector from 'react-native-switch-selector';
import { PieChart } from "react-native-gifted-charts";






export default function App({navigation}) {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }

    fetchFont()

    const [RighteousFont, setRighteousFont] = useState('')

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [teamImage, setTeamImage] = useState([])
    const [teamNames, setTeamNames] = useState([])


    const [predictChoice, setPredictChoice] = useState(3)

    const [currentMatchID, setCurrentMatchID] = useState('')

    const [canPredict, setCanPredict] = useState(true)

    const [myUserId, setMyUserId] = useState('')

    const createAndManageActiveMatches = async (leagueCode, team1, team2, startTime, matchId) => {
        
      var {data} = await supabase.rpc("check_or_create_active_match", {match_id_input: matchId, league_input: leagueCode, team1_input: team1, team2_input: team2, start_time_input: startTime })
        
    }

    const isFocused = useIsFocused();
    
    useEffect(() => {

        setPredictChoice(3) // 3 so neither teams are selected at start
        setSelectedIndex(0) // resets about and predict to start at about

        load('match')
          .then((data) => {
              data = JSON.parse(data)
          
                  setTeamImage([data.team1[1], data.team2[1]])
                  setTeamNames([data.team1[0], data.team2[0]])

                  getMatchStats(data.time, data.league, [data.team1[1], data.team2[1]], [data.team1[0], data.team2[0]])
              })
    
        
    }, [isFocused])


    async function getMatchStats(timeInfo, leagueName, imagesTeam, nameTeams)
    {
        const activeMatchesData = await fetchData('activeMatches')

        const leagueCodes = {'pm': '1', 'cl': '2', 'wc': '3'}

        var login = await load('login')
        login = JSON.parse(login)
        const MYUSERID = login[2]

        setMyUserId(MYUSERID)

        const matchId = leagueCodes[leagueName] +
        (imagesTeam[0].split('.org/')[1].split('.p')[0]).padStart(4, '0') +
        (imagesTeam[1].split('.org/')[1].split('.p')[0]).padStart(4, '0') +
        timeInfo[0].split('/')[0] + timeInfo[0].split('/')[1] + timeInfo[0].split('/')[2] +
        timeInfo[1].split(':')[0] + timeInfo[1].split(':')[1]

        setCurrentMatchID(matchId)

        checkIfCanPredict(matchId)

        createAndManageActiveMatches(leagueCodes[leagueName], nameTeams[0], nameTeams[1], timeInfo, matchId) // checks if there is an active row for the current match in the activeMatches, if not then creates

        var {data} = await supabase.rpc("get_match_predictions", {p_user_id: MYUSERID, p_match_id: matchId })

        console.log(data)

        try{ var totalResult1Length = data.total_result.total1.length }
        catch{ var totalResult1Length = 0 }

        try{ var totalResult2Length = data.total_result.total2.length }
        catch{ var totalResult2Length = 0 }

        const totalPredictionsCount = totalResult1Length + totalResult2Length

        if(totalPredictionsCount == 0)
        {
          
          setTotalPredictions([])
        }else{
          setTotalPredictions([{value: JSON.parse(((totalResult1Length / totalPredictionsCount)* 100).toFixed(0)), color: '#16B2CA', text: nameTeams[0]}, {value: JSON.parse(((totalResult2Length / totalPredictionsCount)* 100).toFixed(0)), color: '#235D92', text: nameTeams[1]}])
        }

        if(data.friends_list.length > 0)
        {
          var greatestTotalPredictions = totalResult1Length

          var friendsResult1 = 0
          var friendsResult2 = 0
  
          if(totalResult2Length > totalResult1Length) { greatestTotalPredictions = totalResult2Length}
  
          for (var i = 0; i < greatestTotalPredictions; i++ )
          {
              for (var j = 0; j < data.friends_list.length; j++)
              {

                const friendId = (data.friends_list[j]).replace(/[/\\*"]/g, "");
                console.log(friendId)
                try{
                  const userVoted1 = data.total_result.total1[i]
                  console.log(userVoted1)
                  if(userVoted1 == friendId)
                  {
                      friendsResult1 += 1
                  }
                }catch{}

                try{
                  const userVoted2 = data.total_result.total2[i]
                  if(userVoted2 == friendId)
                  {
                      friendsResult2 += 1
                  }
                }catch{}

              }
          }

          const totalFriendsResult = friendsResult1 + friendsResult2
          if(totalFriendsResult == 0)
          {
            setFriendsPredictions([])
          }else{
            setFriendsPredictions([{value: JSON.parse(((friendsResult1 / (totalFriendsResult))* 100).toFixed(0)), color: '#16B2CA', text: nameTeams[0]}, {value: JSON.parse(((friendsResult2 / (totalFriendsResult))* 100).toFixed(0)), color: '#235D92', text: nameTeams[1]}])
          }


        }


    }

    async function checkIfCanPredict(matchId)
    {
      // two conditions, match must have not started, and prediction must nto already be placed
      // maybe included boolean diagram to show conditions

      var placedPrediction = false
      var futureStartTime = false

      var {data} = await supabase.rpc("check_user_prediction", {match_id_input: matchId, user_id_input: myUserId })
      placedPrediction = data // IF true, user has already placed prediction on the match
      
      if(placedPrediction == false) // Dont need to call second check if first is already an overriding factor (check Prediction Boolean Logic diagram)
      {
        var {data} = await supabase.rpc("check_match_start_time", {match_id_input: matchId })
        futureStartTime = data // IF true, start time is in the future
      }
      
      if(!placedPrediction && futureStartTime) // AND LOGIC
      {
        setCanPredict(true)
      }else{
        setCanPredict(false)
      }
      
    }


    async function placePrediction()
    {

      if(canPredict == false) {return}
      
      if(predictChoice == 1 || predictChoice == 0)
      {
          // one team is selected   

          // RPC that appends to the table accountsMatches or updates an existing data inside of accountsMatches

          setCanPredict(false)
          try{
            setSelectedIndex(0)
          }catch{
            
          }

          (async() => { // modularization to avoid variable identifier issues
            const {data} = await supabase.rpc("place_prediction", {match_id_input: currentMatchID, team_input: predictChoice + 1, user_id_input: myUserId })
          })()

          const { data: user, error: fetchError } = await supabase
            .from('accounts')
            .select('preferences')
            .eq('id', myUserId)
            .single();

            if (fetchError) {
                console.error('Error fetching user preferences:', fetchError);
                return;
            }

            // Update the notifications field without overwriting other fields
            const updatedPreferences = {
                ...user.preferences, // Keep existing fields
                profile: teamImage[predictChoice], // Update or add
            };

            // Write back the updated preferences to the database
            const { data, error: updateError } = await supabase
                .from('accounts')
                .update({ preferences: updatedPreferences })
                .eq('id', myUserId);

            if (updateError) {
                console.error('Error updating preferences:', updateError);
                return;
            }

            console.log('Preferences updated successfully:', data);
      }
    }

    const [totalPredictions, setTotalPredictions] = useState([{value: 90, color: '#16B2CA', text: 'Liverpool'}, {value: 10, color: '#235D92', text: 'Barcelona'}])

    const [friendsPredictions, setFriendsPredictions] = useState([{value: 52, color: '#16B2CA', text: 'Liverpool'}, {value: 48, color: '#235D92', text: 'Barcelona'}])

    return (
        <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <View style={{width: vw(100), height: 180, backgroundColor: 'red'}}>

                <View style={{width: vw(50), height: 180, backgroundColor: '#222232', position: 'absolute', left: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={{uri: teamImage[0]}} style={{width: 50, height: 50, marginTop: 20}} />
                    <Text style={{color: 'white', fontFamily: RighteousFont, fontSize: 12}}>{teamNames[0]}</Text>
                </View>
                <View style={{width: vw(50), height: 180, backgroundColor: '#1A1A29', position: 'absolute', right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={{uri: teamImage[1]}} style={{width: 50, height: 50, marginTop: 20}} />
                    <Text style={{color: 'white', fontFamily: RighteousFont, fontSize: 12}}>{teamNames[1]}</Text>
                </View>
                <Text style={{color: 'white', fontSize: 30, top: 70, textAlign: 'center', fontFamily: RighteousFont}}>VS</Text>
            </View>

            <TouchableOpacity onPress={() => {navigation.navigate('Home')}} style={{position: 'absolute', top: 40, left: -10, width: 40, height: 40, opacity: 0.7}}>
                <Image source={require('../Images/arrowIcon.png')} style={{width: 23, height: 23, transform: [{rotate: '90deg'}], left: 20 }} />
            </TouchableOpacity>

          {canPredict ? 
          (<SwitchSelector
          options={[
            { label: 'About', value: 0 },
            { label: 'Predict', value: 1 },
          ]}
          initial={0}
          value={selectedIndex}
          onPress={(value) => { setTimeout(() => {setSelectedIndex(value)}, 150);} }
          buttonColor="#1F2937"
          borderColor="#161B22"
          textColor="#FFFFFF"
          selectedColor="#FFFFFF"
          backgroundColor='#171D27'
          animationDuration={150}
          height={57}
          style={{
            height: 40,
            borderRadius: 20,
            borderWidth: 0,
            marginBottom: 20,
            marginTop: 20,
            width: vw(90),
            backgroundColor: '#171D27'
          }}
          textStyle={{
            fontFamily: 'RighteousFont',
            fontSize: 16,
          }}
          selectedTextStyle={{
            fontFamily: 'RighteousFont',
            fontSize: 16,
          }}
        />)
        : (<View></View>)
          
          }
            {selectedIndex === 0 ? (
                <ScrollView style={{marginTop: 10, width: vw(90), height: vh(65), position: 'relative'}}>
                    <Text style={{ color: 'white', fontSize: 17, fontFamily: RighteousFont, marginTop: 10 }}>Total predictions:</Text>

                    {totalPredictions.length ? 
                    
                    (
                      <View>
                        <Text style={{ color: 'white', fontSize: 17, textAlign: 'center', fontFamily: RighteousFont, marginTop: 60, opacity: 1, position: 'absolute', color: '#16B2CA' }}>{totalPredictions[0].text} <Text style={{color: 'white'}}>{totalPredictions[0].value}%</Text> </Text>
                        <Text style={{ color: 'white', fontSize: 17, textAlign: 'center', fontFamily: RighteousFont, marginTop: 100, opacity: 1, position: 'absolute', color: '#378BD8' }}>{totalPredictions[1].text} <Text style={{color: 'white'}}>{totalPredictions[1].value}%</Text></Text>
                        
                        <View style={{ left: 180}}>
                          <PieChart  radius={80} data={totalPredictions} />
                        </View>
                      </View>

                    ) : (

                      <Text style={{ color: 'white', fontSize: 17, textAlign: 'center', fontFamily: RighteousFont, marginTop: 20, opacity: 0.7 }}>N/A</Text>
                    )}

                    <Text style={{ color: 'white', fontSize: 17, fontFamily: RighteousFont, marginTop: 50 }}>Friends Predictions:</Text>
                    {friendsPredictions.length ? 
                    
                    (
                      <View>
                        <Text style={{ color: 'white', fontSize: 17, textAlign: 'center', fontFamily: RighteousFont, marginTop: 60, opacity: 1, position: 'absolute', color: '#16B2CA' }}>{friendsPredictions[0].text} <Text style={{color: 'white'}}>{friendsPredictions[0].value}%</Text> </Text>
                        <Text style={{ color: 'white', fontSize: 17, textAlign: 'center', fontFamily: RighteousFont, marginTop: 100, opacity: 1, position: 'absolute', color: '#378BD8' }}>{friendsPredictions[1].text} <Text style={{color: 'white'}}>{friendsPredictions[1].value}%</Text></Text>
                        
                        <View style={{ left: 180}}>
                          <PieChart radius={80} data={friendsPredictions} />
                        </View>
                      </View>

                    ) : (

                      <Text style={{ color: 'white', fontSize: 17, textAlign: 'center', fontFamily: RighteousFont, marginTop: 20, opacity: 0.7 }}>N/A</Text>
                    )}
                </ScrollView>
            ) : (
                <View style={{marginTop: 10, width: vw(90), height: vh(65)}}>
                    <Text style={{ color: 'white', fontSize: 17, fontFamily: RighteousFont, marginTop: 10 }}>Place your prediction</Text>

                    <View style={{ width: vw(90), height: vh(40), display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 50}}>
                        <TouchableOpacity onPress={() => {setPredictChoice(0)}} style={{width: 120, height: 120, opacity: predictChoice == 1 ? 0.6 : 1, borderRadius: 20, backgroundColor: 'blue', marginBottom: 150, backgroundColor: '#171D27', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Image source={{uri: teamImage[0]}} style={{width: 60, height: 60}} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {setPredictChoice(1)}} style={{width: 120, height: 120, opacity: predictChoice == 0 ? 0.6 : 1, borderRadius: 20, backgroundColor: 'blue', marginBottom: 150, backgroundColor: '#171D27', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Image source={{uri: teamImage[1]}} style={{width: 60, height: 60}} />
                        </TouchableOpacity>
                    </View>

                    <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
                        <Text style={{ color: 'white', fontSize: 17, fontFamily: RighteousFont, opacity: 0.5}}>{teamNames[predictChoice]}</Text>

                        <TouchableOpacity onPress={placePrediction} style={{width: 200, height: 60, borderRadius: 20, backgroundColor: '#1d2430', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: predictChoice == 1 || predictChoice == 0 ? 1 : 0.6}}>
                            <Text style={{ color: 'white', fontSize: 17, fontFamily: RighteousFont}}>Place Prediction</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            )}


        </View>
    )
}