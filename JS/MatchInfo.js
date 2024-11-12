import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { vw, vh } from 'react-native-expo-viewport-units';

import SwitchSelector from 'react-native-switch-selector';

import { useIsFocused } from "@react-navigation/native";

import AsyncStorage from '@react-native-async-storage/async-storage';


import { createClient } from '@supabase/supabase-js'

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


    const storeData = async (key, value) => {
        try {
          await AsyncStorage.setItem(key, value);
          // console.log('Data saved successfully');
        } catch (e) {
          // saving error
          // console.error('Failed to save the data to the storage');
        }
      };

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


    const [teamImage, setTeamImage] = useState([])
    const [teamNames, setTeamNames] = useState([])
    
    var currentDBMatchID;

    const [predictChoice, setPredictChoice] = useState(3)

    const [currentMatchID, setCurrentMatchID] = useState('')

    const [canPredict, setCanPredict] = useState(true)

    // Supabase
    const supabaseUrl = 'https://nxnlueqwonfremybejbm.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bmx1ZXF3b25mcmVteWJlamJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE2NzAzODcsImV4cCI6MjAwNzI0NjM4N30.6cfViULSoEKQi0ImV8xTFwMoGL0uSy31aPRU-yUBFZ4'
    const supabase = createClient(supabaseUrl, supabaseKey, {
         auth: {
           persistSession: false,
         }})
    

    const fetchData = async (tableName) => {
      const {data, error} = await supabase
          .from(tableName) // table name
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

    const createActiveMatch = async (leagueCode, team1, team2, startTime, predictions, matchId) => {
        console.log('sending data')

        const {data, error} = await supabase
            .from('activeMatches')
            .insert([{'League': leagueCode, 'Team1': team1, 'Team2': team2, 'StartTime': startTime, 'Predictions': predictions, 'matchID': matchId}])
        
        if(error)
        {
            console.log(error)
        }
        if(data)
        {
            return data
        }
    }

    const updatePredictionDB = async (predictionData) => {
        // console.log('sending data')
        // console.log(currentMatchID)

        const {data, error} = await supabase
            .from('activeMatches')
            .update({
              'Predictions': predictionData
          })
          .eq('matchID', currentMatchID); // Match the row with the specific matchId

        if(error)
        {
            console.log(error)
        }
        if(data)
        {
          console.log(data)
            return data
        }
    }

    const updatePredictionDBAccounts = async (predictionData) => {
      // console.log('sending data')
      // console.log(currentMatchID)

      var login = await getData('login')
      login = JSON.parse(login)
      
      // console.log(predictionData)

      const {data, error} = await supabase
          .from('accounts')
          .update({
            'predictedMatches': predictionData
        })
        .eq('username', login[2]); // Match the row with the specific matchId

      if(error)
      {
          console.log(error)
      }
      if(data)
      {
          console.log(data)
          return data
      }
  }

    const isFocused = useIsFocused();
    useEffect(() => {


        setPredictChoice(3) // 3 so neither teams are selected at start
        setSelectedIndex(0) // resets about and predict to start at about


        const match = getData('match')
        .then((data) => {
            data = JSON.parse(data)
                // console.log(match)
        
                setTeamImage([data.team1[1], data.team2[1]])
                setTeamNames([data.team1[0], data.team2[0]])

                getMatchStats(data.time, data.league, [data.team1[1], data.team2[1]], [data.team1[0], data.team2[0]])
            })
    
        
    }, [isFocused])

    async function getFriendsList(accountData)
    {

        for (usersIndx in accountData)
        {
            const user = accountData[usersIndx]

            var loginInfo = await getData('login')
            loginInfo = JSON.parse(loginInfo)
            if(user.email == loginInfo[0])
            {
                // found account
                return user.friendsList
            }
        }

    }


    async function getMatchStats(timeInfo, leagueName, imagesTeam, nameTeams)
    {
        const activeMatchesData = await fetchData('activeMatches')

        const leagueCodes = {'pm': '1', 'cl': '2', 'wc': '3'}

        // console.log('images')
        // console.log(imagesTeam)
        // console.log(timeInfo)

        // console.log(leagueCodes[leagueName])

        const matchId = leagueCodes[leagueName] +
        (imagesTeam[0].split('.org/')[1].split('.p')[0]).padStart(4, '0') +
        (imagesTeam[1].split('.org/')[1].split('.p')[0]).padStart(4, '0') +
        timeInfo[0].split('/')[0] + timeInfo[0].split('/')[1] + timeInfo[0].split('/')[2] +
        timeInfo[1].split(':')[0] + timeInfo[1].split(':')[1]

        // console.log(matchId)
        // console.log('updateingMatchID: ' + matchId)
        setCurrentMatchID(matchId)

        const accountData = await fetchData('accounts')
        checkIfCanPredict(matchId)

        const friendsList = await getFriendsList(accountData)

        var totalPredictionsCount = {'1': 0, '2': 0}
        var friendsPredictionsCount = {'1': 0, '2': 0}
        var friendsPredictionsInfo = []

        var matchPredictStarted = false
        for (var activeMatchIndex in activeMatchesData)
        {
            const activeMatch = activeMatchesData[activeMatchIndex]

            if(activeMatch.matchID == matchId)
            {
                // match prediction has started
                matchPredictStarted = true


                for (var userPredictionIndx in activeMatch.Predictions)
                {
                    var userPrediction = activeMatch.Predictions[userPredictionIndx]

                    totalPredictionsCount[userPrediction.team] += 1

                    if(friendsList != null )
                    {
                      if(friendsList.includes(userPrediction.username))
                      {
                        friendsPredictionsCount[userPrediction.team] += 1
                        friendsPredictionsInfo.push( {'username': userPrediction.username, 'time': userPrediction.time, 'team': userPrediction.team} )
                      }
                    }

                }


                break
            }
        }

        if(matchPredictStarted == false)
        {
          // console.log('create match')
          createActiveMatch(leagueCodes[leagueName], nameTeams[0], nameTeams[1], timeInfo, [ {'default': 'default'} ], matchId)
        }

        // console.log(totalPredictionsCount)
        // console.log(friendsPredictionsCount)
        // console.log(friendsPredictionsInfo)

        // console.log(matchId)
    }

    async function checkIfCanPredict(matchId)
    {
      // two conditions, match must have not started, and prediction must nto already be placed
      // maybe included boolean diagram to show conditions

      console.log('checking if can predict')

      const activeMatchesData = await fetchData('activeMatches')

      var matchStartTime = []

      var placedPrediction = false
      for (var activeMatchIndex in activeMatchesData)
      {
          const activeMatch = activeMatchesData[activeMatchIndex]

          if(activeMatch.matchID == matchId)
          {
              for (var predictionIndx in activeMatch.Predictions)
              {
                  var predictionItem = activeMatch.Predictions[predictionIndx]

                  matchStartTime = activeMatch.StartTime

                  console.log(predictionItem)

                  var login = await getData('login')
                  login = JSON.parse(login)

                  if(predictionItem.username == login[2])
                  {
                      placedPrediction = true
                      // console.log('prediction already placed')
                      break
                  }

              }
          }
      }

      // check match start date

      const targetDate = new Date(`${matchStartTime[0].split('/').reverse().join('-')}T${matchStartTime[1]}:00`);
      const currentTime = new Date();
      var timePassed = false

      if (currentTime > targetDate) {
        timePassed = true
      }



      if(placedPrediction == true || timePassed == true)
      {
          setCanPredict(false)
      }else{
        setCanPredict(true)
      }
      
    }


    async function placePrediction()
    {

      if(canPredict == false) {return}
      
      if(predictChoice == 1 || predictChoice == 0)
      {
          // one team is selected   
          // console.log('placing prediction')

          const activeMatchesData = await fetchData('activeMatches')

          var login = await getData('login')
          login = JSON.parse(login)

          // console.log('logine')
          // console.log(login)


          const nowTime = Date.now();
          var predictionItem = {username: login[2], team: predictChoice + 1, time: nowTime, matchID: currentMatchID}

          var predictionList = []

          for (var matchIndx in activeMatchesData)
          {
              var matchItem = activeMatchesData[matchIndx]

              if(matchItem.matchID == currentMatchID)
              {
                  // found correct match
                  predictionList = matchItem.Predictions
                  break
              }
          }

          console.log(predictionList)

          predictionList.push(predictionItem)

          console.log(updatePredictionDB(predictionList))


          // update account profile with prediction
          
          const userAccounts = await fetchData('accounts')
          
          var userPredictionsList = []

          for (var accountIndx in userAccounts)
          {
              var userItem = userAccounts[accountIndx]

              // console.log(userItem.username)
              // console.log(login[2])
              if(userItem.username == login[2])
              {
                // console.log('useritem')
                // console.log(userItem)
                  userPredictionsList = userItem.predictedMatches
              }
          }

          userPredictionsList.push(predictionItem)

          updatePredictionDBAccounts(userPredictionsList)


          // console.log('prediction placed!')
          setCanPredict(false)
          setSelectedIndex(0)

      }
    }





    return (
        <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {/* <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 30, width: 120}} >Account</Text> */}
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
            fontFamily: 'RighteousFont', // Replace with your font
            fontSize: 16,
          }}
          selectedTextStyle={{
            fontFamily: 'RighteousFont', // Replace with your font
            fontSize: 16,
          }}
        />)
        : (<View></View>)
          
          }
            {selectedIndex === 0 ? (
                <ScrollView style={{marginTop: 10, width: vw(90), height: vh(65)}}>
                    <Text style={{ color: 'white', fontSize: 17, fontFamily: RighteousFont, marginTop: 10 }}>Total predictions:</Text>
                    <Text style={{ color: 'white', fontSize: 17, textAlign: 'center', fontFamily: RighteousFont, marginTop: 20, opacity: 0.7 }}>N/A</Text>

                    <Text style={{ color: 'white', fontSize: 17, fontFamily: RighteousFont, marginTop: 50 }}>Friends Predictions:</Text>
                    <Text style={{ color: 'white', fontSize: 17, textAlign: 'center', fontFamily: RighteousFont, marginTop: 20, opacity: 0.7 }}>N/A</Text>
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