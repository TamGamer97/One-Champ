import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { vw, vh } from 'react-native-expo-viewport-units';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { load, save, fetchData, sendData, supabase } from './Functions';

import { useIsFocused } from "@react-navigation/native";





export default function App({navigation}) {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }

    fetchFont()

    const [RighteousFont, setRighteousFont] = useState('')

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

    const [matchesPredicted, setMatchesPredicted] = useState([])
    const [userInfo, setUserInfo] = useState({wins: 0, loss: 0, score: 0})
    const [username, setUserName] = useState('')
    const [returnPage, setReturnPage] = useState('DD')
    const [isMyFriend, setIsMyFriend] = useState(false)

    const [MYUSERID, setMYUSERID] = useState('')
    const [playersID, setPlayersID] = useState('') 


    var teamsInfo = []
    async function getTeamIcon(targetTeam)
    {
        async function loadTeamInfo()
        {
            var informationAboutTeamsFromApi = await fetch('https://onechamp-api.onrender.com/Team-Info')  
            informationAboutTeamsFromApi = await informationAboutTeamsFromApi.json()
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

    async function populateMatches()
    {
      var playerInfoParams = await load('PlayerInfoParams')
      playerInfoParams = JSON.parse(playerInfoParams)

      console.log(playerInfoParams)

      setUserInfo(playerInfoParams.userInfo)
      if(playerInfoParams.username.length > 10)
      {
        playerInfoParams.username = playerInfoParams.username.slice(0, 10) + '..'
      }
      setUserName(playerInfoParams.username)
      setReturnPage(playerInfoParams.returnPage)
      setIsMyFriend(false)
      setMatchesPredicted([])

      setPlayersID(playerInfoParams.userID)

      var loginInfo = await load('login')
      loginInfo = JSON.parse(loginInfo)

      setMYUSERID(loginInfo[2])

      var {data} = await supabase.rpc("get_user_matches", { user_id_input: playerInfoParams.userID, my_user_id_input: loginInfo[2] })

      console.log(data)
      var matchesData = data[0]
      var friendsList = data[1] // myFriendsList

      if(matchesData == null)
      {
        console.log('matchesData is null')

      }else{
        // getIcon urls for teams
  
        for (var matchIndx in matchesData)
        {
            var match = matchesData[matchIndx]
            
            const team1Icon = await getTeamIcon(match.team1)
            const team2Icon = await getTeamIcon(match.team2)
  
            console.log(team1Icon, team2Icon)
            
            matchesData[matchIndx]['team1'] = [match.team1, team1Icon]
            matchesData[matchIndx]['team2'] = [match.team2, team2Icon]
  
        }
  
        setMatchesPredicted(matchesData)
      }



      checkIfFriends(friendsList, loginInfo[2], playerInfoParams.userID)
    }

    async function checkIfFriends(friendsList, myid, playerid)
    {
      console.log('Checking if friends ' + myid, playerid)
        if(myid == playerid) // Clicked on own profile
        {
            setIsMyFriend('Own Profile')
        }else{
          for (var userIndx in friendsList)
          {
              var userFriendId = friendsList[userIndx]
  
              if(userFriendId == playerid)
              {
                console.log('My friends list contains their id')
                  setIsMyFriend(true)
                  break
              }
          }
        }
    }

    const isFocused = useIsFocused()

    useEffect(() => {
      console.log('Getting predicted matches for user')

      populateMatches()

    }, [isFocused])

    const MatchPredicted = ({match}) => {

      var team1IconOpacity = 0.6
      var team2IconOpacity = 0.6

      var team1Color = '#A2A3A7'
      var team2Color = '#A2A3A7'

      // Determine the colours depending on which team won
      if(match.score == 'not set')
      {
        match.score = 'N/A'
      }else{
        if( (match.score > 0 && match.predicted == '1') || (match.score < 0 && match.predicted == '2') )
        {
            team1IconOpacity = 1
            team1Color = 'white'
        }
  
        if( (match.score > 0 && match.predicted == '2') || (match.score < 0 && match.predicted == '1') )
        {
            team2IconOpacity = 1
            team2Color = 'white'
        }

        if(match.score > 0)
        {
          if(match.score[0] != '+')
          {
            match.score = '+' + match.score
          }
        }
      }

      // Make name shorter

      if(match.team1[0].length > 7)
      {
          match.team1[0] = match.team1[0].slice(0, 7) + '..'
      }
      if(match.team2[0].length > 7)
      {
          match.team2[0] = match.team2[0].slice(0, 7) + '..'
      }


      return (
        <View style={{borderColor: '#32374D', borderWidth: 1, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, width: vw(75), marginTop: 10, left: 25, flexDirection: 'row'}}>
            <Image source={{uri: match.team1[1]}} style={{opacity: team1IconOpacity, width: 25, height: 25, marginTop: 7}} />
            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 15, marginLeft: 0, marginTop: 9, marginLeft: 10, textAlign: 'center'}}>
              <Text style={{color: team1Color}} >{match.team1[0]}</Text>
              <Text style={{color: '#A2A3A7'}} > vs</Text>
              <Text style={{color: team2Color}} > {match.team2[0]}</Text>
            </Text>
            <Image source={{uri: match.team2[1]}} style={{ opacity: team2IconOpacity, width: 25, height: 25, marginTop: 7, marginLeft: 10}} />

            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 15, marginLeft: 0, marginTop: 9, position: 'absolute', right: 0, width: 50, textAlign: 'center'}}> {match.score} </Text>
        </View>
      )
    }

    async function addUserFriend()
    {
      if(isMyFriend == false)
      {
        setIsMyFriend('ADDED')
        
        var {data} = await supabase.rpc("add_friend_to_list", { user_id_input: MYUSERID, new_friend_id: playersID  })

        if(data) {console.log('FriendAdded')}

      }
    }


    return (
        <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            
            <TouchableOpacity onPress={() => {navigation.navigate(returnPage)}} style={{position: 'absolute', top: 65, left: 0, width: 40, height: 40, opacity: 0.7}}>
                <Image source={require('../Images/arrowIcon.png')} style={{width: 23, height: 23, transform: [{rotate: '90deg'}], left: 20 }} />
            </TouchableOpacity>

            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 60, width: 250}} >{username}</Text>

            <TouchableOpacity onPress={() => {addUserFriend()}} style={{position: 'absolute', top: 60, right: 30, opacity: isMyFriend !== true && isMyFriend !== false && (0) }}>
              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 13,backgroundColor: '#222232', padding: 10, borderRadius: 10}} > { isMyFriend ? 'FRIENDS' : 'ADD FRIEND +' } </Text>
            </TouchableOpacity>

            
            <Text style={{fontFamily: RighteousFont, color: '#FF6E6E', fontSize: 32, position: 'absolute', top: 130, left: 40}} >{userInfo.score}</Text>
            
            <View style={{display: 'flex', flexDirection: 'row', position: 'absolute', right: 0, top: 0}} >
              <View style={{display: 'flex', flexDirection: 'column'}}>
                <Text style={{fontFamily: RighteousFont, color: '#FF6E6E', fontSize: 20, top: 130, right: 40, textAlign: 'center'}}>{userInfo.wins}</Text>
                <Text style={{fontFamily: RighteousFont, color: '#FF6E6E', fontSize: 10, top: 130, right: 40, textAlign: 'center'}}>wins</Text>
              </View> 
              <Text style={{fontFamily: RighteousFont, color: '#FF6E6E', fontSize: 20, top: 130, right: 40, textAlign: 'center'}}> - </Text>
              <View style={{display: 'flex', flexDirection: 'column'}}>
                <Text style={{fontFamily: RighteousFont, color: '#FF6E6E', fontSize: 20, top: 130, right: 40, textAlign: 'center'}}>{userInfo.loss}</Text>
                <Text style={{fontFamily: RighteousFont, color: '#FF6E6E', fontSize: 10, top: 130, right: 40, textAlign: 'center'}}>loss</Text>
              </View> 
            </View>

            
            <View style={{width: vw(85), height: 5, backgroundColor: 'red', top: 180, borderRadius: 10, backgroundColor: '#222232'  }}>
            </View>

            <View style={{width: vw(85), height: 450, borderRadius: 10, backgroundColor: '#222232', top: 200,}}>
              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 20, position: 'relative', top: 20, left: 25, width: 250,marginBottom: 70}} >Matches Predicted</Text>
              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: 70, left: 25, width: 250}} >Club</Text>
              <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: 70, right: 20}} >pts</Text>
              
              <ScrollView style={{height: 300}} contentContainerStyle={{paddingBottom: 20}}>

                  {matchesPredicted.map((match, index) => (

                    <MatchPredicted match={match} key={index} />

                  ))}
              
              </ScrollView>


            </View>


        </View>
    )
}