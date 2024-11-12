import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';


import { DOMParser } from 'react-native-dom-parser';

import AsyncStorage from '@react-native-async-storage/async-storage';


import * as Font from "expo-font";

export default function App({navigation}) {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }

    fetchFont()

    const [RighteousFont, setRighteousFont] = useState('')

    
    const [upcomingMatches, setUpcomingMatches] = useState([]) // [  { team1: [name, url] ], team2: [name, url], time: '', date: ''}  ]
    const [recentMatch, setRecentMatch] = useState({team1: [], team2: [], time: '', date: '', score: ''}) // { team1: [name, url] ], team2: [name, url], time: '', date: ''} 


    async function formitizeMatch(matchObj)
    {
        const homeTeam = matchObj.Team1;
        const awayTeam = matchObj.Team2;
        const matchDate = new Date(matchObj.Date);


        // Extract day, month, and year
        const day = String(matchDate.getDate()).padStart(2, '0');
        const month = String(matchDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = matchDate.getFullYear();
        const datePart = `${day}/${month}/${year}`;

        // Extract time in HH:MM format
        const timePart = matchObj.Time;

        const homeImage = await getTeamIcon(homeTeam);
        const awayImage = await getTeamIcon(awayTeam);

        // console.log(matchObj.Score)
        // Add the match details to the tempUpcoming array
        return ({
            team1: [homeTeam, homeImage],
            team2: [awayTeam, awayImage],
            time: [datePart, timePart],
            league: 'pm',
            score: matchObj.Score
        })
    }


    var runTodayMatches = false
    async function getTodayMatches(pmMatches)
    {
        
        var tempUpcoming = [];

        
        // console.log(pmMatches.length)
        
        // Get the current date and time
        const currentDate = new Date();
        
        // Filter, sort, and slice the matches
        const upcomingMatches = pmMatches
        .filter((match) => new Date(match.Date) > currentDate)
        .sort((a, b) => new Date(a.Date) - new Date(b.Date))
        .slice(0, 3);
        // fix this code to show todays matches too not just the day afters 

        // Process each match asynchronously
        for (const match of upcomingMatches) {
            
            const formattedMatch = await formitizeMatch(match)

            // Add the match details to the tempUpcoming array
            tempUpcoming.push(formattedMatch);

        }

        // Code to run after the loop completes
        console.log('All matches processed');
        // console.log(tempUpcoming);

        setUpcomingMatches(tempUpcoming);
    }

    async function fetchPremierLeagueFixtures() {
        
        console.log('finding pm fixtures')
        
        var pmFixtures = await fetch('https://one-champ-api-1.onrender.com/Premier-League-Fixtures', {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mac OS',
            }
        })
        pmFixtures = await pmFixtures.json()
        // console.log(pmFixtures)

        return pmFixtures
    }
    
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
            // console.log(targetTeam + ' & ' + team.name)
            // if(team.name == targetTeam || team.shortName == targetTeam || targetTeam == team.shortName.split(' ')[0])
            // {
            //     // console.log(team.crestUrl)
            //     return team.crestUrl
            // }
            if(team.name == targetTeam)
            {
                return team.crestUrl
            }
        }
    }

    async function getRecentMatch(pmMatches)
    {
        var recentMatchObj = {}

        for (const matchIndx in pmMatches) {
            const match = pmMatches[matchIndx]
            const homeTeam = match.Team1;
            const awayTeam = match.Team2;
            const matchDate = new Date(match.Date);
            const score = match.Score

            // Search for the first match that hasnt been played
            // then find the match before that by subtracting the index by 1
            // This will give the most recent fully played match
            if(score == 'not played')
            {
                recentMatchObj = pmMatches[matchIndx-1]
                break
            }
        }


        const formattedMatch = await formitizeMatch(recentMatchObj)

        setRecentMatch(formattedMatch)

    }

    const storeData = async (key, value) => {
        try {
          await AsyncStorage.setItem(key, value);
          console.log('Data saved successfully');
        } catch (e) {
          // saving error
          console.error('Failed to save the data to the storage');
        }
      };

      const getData = async (key) => {
        try {
          const token = await AsyncStorage.getItem(key);
          if(token !== null) {
            console.log('Token retrieved:', token);
            return token
          } else {
            console.log('No token found');
          }
        } catch (e) {
          // error reading value
          console.error('Failed to fetch the data from storage');
        }
      };
      

    async function populatePage()
    {
        if (runTodayMatches === true) { 
        }else{
            console.log('searching')
            const pmMatches = await fetchPremierLeagueFixtures();

            getTodayMatches(pmMatches)
            getRecentMatch(pmMatches)
            
            runTodayMatches = true;
        }
        
    }

    useEffect(() => {
        populatePage()
    }, [])

    const RecentMatchScore = () => {
        return(
            
            <View style={{width: 320, height: 160, borderRadius: 10, backgroundColor: '#16B2CA', marginTop: 30, flexGrow: 1, display: 'flex', alignItems: 'center'}}>
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', top: -33, left: -70, width: 170}} >Recent Scores</Text>
                <TouchableOpacity style={{ top: -33, right: 0, position: 'absolute'}}>
                    {/* <Text style={{fontFamily: RighteousFont, color: '#18A5C2', fontSize: 13, marginTop: 7}} >View All</Text> */}

                </TouchableOpacity>

                <Image style={{width: 50, height: 50, position: 'absolute', left: 30, top: 50}} source={{uri: recentMatch.team1[1]}}></Image>
                <Image style={{width: 50, height: 50, position: 'absolute', right: 30, top: 50}} source={{uri: recentMatch.team2[1]}}></Image>

                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 10, marginTop: 7,  position: 'absolute', left: 30 - 5, top: 100, textAlign: 'center', width: 60}} >{recentMatch.team1[0]}</Text>
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 10, marginTop: 7,  position: 'absolute', right: 30 - 5, top: 100, textAlign: 'center', width: 60}} >{recentMatch.team2[0]}</Text>

                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 13, marginTop: 7,  position: 'absolute', top: 20, textAlign: 'center'}} >Full Time</Text>

                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 35, marginTop: 7,  position: 'absolute', top: 50, textAlign: 'center', letterSpacing: 15}} >{recentMatch.score}</Text>

            </View>
        
        )
    }

    const FTMatches = ({title}) => {
        
        const shouldDisplayMatches = title === "Upcoming Matches";

        return(
            
            <View style={{width: 340, height: 200, borderRadius: 10, marginTop: 50, display: 'flex', alignItems: 'center', gap: 8, flexGrow: 1}}>
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: -33, left: 10}} >{title}</Text>
                <TouchableOpacity style={{ top: -33, right: 10, position: 'absolute'}}>
                    <Text style={{fontFamily: RighteousFont, color: '#18A5C2', fontSize: 13, marginTop: 7}} >View All</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10}}>

                </TouchableOpacity>
                <TouchableOpacity style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10}}>

                </TouchableOpacity> */}
                {shouldDisplayMatches && upcomingMatches.map((match, index) => (
                    <TouchableOpacity
                    onPress={async() => { await storeData('match', JSON.stringify(match)); navigation.navigate('MatchInfo')}} 
                    key={index}
                    style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}
                    >
                    {/* You can add content inside the TouchableOpacity here if needed */}
                    
                    <Image source={{uri: match.team1[1]}} style={{width: 30, height: 30, left: 30, position: 'absolute'}} />

                    <Image source={{uri: match.team2[1]}} style={{width: 30, height: 30, position: 'absolute', right: 30}} />
                    
                    <Text style={{position: 'absolute', textAlign: 'center', color: 'white', fontFamily: RighteousFont, top: 6, fontSize: 8}}>{match.time[0]}</Text>
                    <Text style={{position: 'absolute', textAlign: 'center', color: 'white', fontFamily: RighteousFont, fontSize: 22, top: 20}}>{match.time[1]}</Text>


                    </TouchableOpacity>
                ))}
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
                <RecentMatchScore />
                <FTMatches title={'Upcoming Matches'} />
                {/* <FTMatches title={'Watching'} /> */}
            </View>

        </ScrollView>
    )
}