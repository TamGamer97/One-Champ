import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, ScrollView } from 'react-native';
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

    
    const [upcomingMatches, setUpcomingMatches] = useState([]) // [  { team1: [name, url] ], team2: [name, url], time: '', date: ''}  ]
    const [recentMatch, setRecentMatch] = useState({team1: [], team2: [], time: '', date: '', score: ''}) // { team1: [name, url] ], team2: [name, url], time: '', date: ''} 

    async function formatMatch(matchObj)
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
        
        // Get the current date and time
        const currentDate = new Date(); //currentDate.setDate(currentDate.getDate() - 1);
        
        // Filter, sort, and slice the matches
        const upcomingMatches = pmMatches
        .filter((match) => new Date(`${match.Date}T${match.Time + ':00'}`) > currentDate)
        .sort((a, b) => new Date(`${a.Date}T${a.Time}`) - new Date(`${b.Date}T${b.Time}`))
        .slice(0, 3);

        for (const match of upcomingMatches) {
            
            const formattedMatch = await formatMatch(match)

            // Add the match details to the tempUpcoming array
            tempUpcoming.push(formattedMatch);

        }

        setUpcomingMatches(tempUpcoming);
    }

    async function fetchPremierLeagueFixtures() {
        
        var pmFixtures = await fetch('https://onechamp-api.onrender.com/Premier-League-Fixtures', {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mac OS',
            }
        })
        pmFixtures = await pmFixtures.json()

        return pmFixtures
    }
    
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
                // Replace the target word with replacement word
                return word === targetWord ? replacementWord : word;
            });
        
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
            if(score == 'not played' && pmMatches[matchIndx - -1].Score == 'not played') // Also check if the next match hasnt been played for confirmation incase of a postponed match
            {
                recentMatchObj = pmMatches[matchIndx-1]
                break
            }
        }


        const formattedMatch = await formatMatch(recentMatchObj)

        setRecentMatch(formattedMatch)

    }


    async function updateMatchesResult(pmMatches) // Uses the API data and compares to the database to see of any matches has new scores
    {
        var { data, error } = await supabase
            .from('activeMatches')
            .select('Team1, Team2, StartTime, matchID')
            .is('match_score', null); // Filter rows where match_score is NULL

        if (error) {
            console.error('Error fetching db matches:', error);
            return null;
        }

        var updatedMatches = []

        for (var dbMatchIndx in data) // DB Matches
        {
            var matchDBItem = data[dbMatchIndx]

            for (var matchInfoIndx in pmMatches) // API Matches
            {
                var matchInfo = pmMatches[matchInfoIndx]


                var matchesDate = matchInfo.Date.split('-') // Format date DD/MM/YY
                matchesDate = matchesDate[2] + '/' + matchesDate[1] + '/' + matchesDate[0]

                if(matchesDate == matchDBItem['StartTime'][0] && matchInfo.Time == matchDBItem['StartTime'][1] && matchInfo.Team1 == matchDBItem['Team1'] && matchInfo.Team2 == matchDBItem['Team2'])
                {

                    if(matchInfo.Score != 'not played')
                    {
                        // New match score that should be updated to db
                        var matchScore = matchInfo.Score.replace(/[^0-9\-]/g, '').split('')
                        const formattedMatchScore = {'team1': JSON.parse(matchScore[0]), 'team2': JSON.parse(matchScore[1]) }
                        updatedMatches.push({'matchID': matchDBItem.matchID, match_score: formattedMatchScore})
                    }
                }
            }

        }

        var { data, error } = await supabase
            .from('activeMatches')
            .upsert(updatedMatches, { onConflict: 'matchID' }); // Use of unique identifier for conflict resolution

        if (error) {
            console.error('Error updating match scores:', error);
            return null;
        }

    }
      

    async function populatePage()
    {
        if (runTodayMatches === true) { 
        }else{
            const pmMatches = await fetchPremierLeagueFixtures();

            getTodayMatches(pmMatches)
            getRecentMatch(pmMatches)
            updateMatchesResult(pmMatches)
            
            runTodayMatches = true;
        }
        
    }

    async function updateUserInfo()
    {
        // Checks for updated predictions so then can update own profile with updated score

        var loginInfo = await load('login')
        loginInfo = JSON.parse(loginInfo)

        var {data} = await supabase.rpc("update_user_info_with_predictions", { user_id_input: loginInfo[2]})

    }

    useEffect(() => {

        updateUserInfo()

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

                {shouldDisplayMatches && upcomingMatches.map((match, index) => (
                    <TouchableOpacity
                    onPress={async() => { await save('match', JSON.stringify(match)); navigation.navigate('MatchInfo')}} 
                    key={index}
                    style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}
                    >
                    
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
                <Image source={require('../Images/OneChampIconTransparent.png')} style={{width: 65, height: 65, position: 'absolute', right: 30, top: 70}} />
            </TouchableOpacity>

            
            

            <View style={{width: '100%', position: 'relative', marginTop: 160, display: 'flex', alignItems: 'center', paddingBottom: 150}}>
                <RecentMatchScore />
                <FTMatches title={'Upcoming Matches'} />
            </View>

        </ScrollView>
    )
}