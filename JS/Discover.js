import React, {useEffect, useState, useRef} from 'react';
import { StyleSheet, Text, View, Image, Appearance, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Font from "expo-font";
import { vw, vh } from 'react-native-expo-viewport-units';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { load, save, fetchData, sendData, supabase } from './Functions';

import { Snackbar } from 'react-native-paper';





export default function App({navigation}) {

    const fetchFont = async () => {
        await Font.loadAsync({
            'RighteousFont': require('../Fonts/Righteous/Righteous-Regular.ttf'),
        });

        setRighteousFont('RighteousFont')
    }

    fetchFont()

    const [RighteousFont, setRighteousFont] = useState('')

    const [searchTypeSelected, setSearchType] = useState() // 1, 2, 3

    const PreviousMatchScore = () => {
        return(
            
            <View style={{width: 320, height: 160, borderRadius: 10, backgroundColor: '#8616CA', marginTop: 30, flexGrow: 1, display: 'flex', alignItems: 'center'}}>
                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'relative', top: -33, left: -70, width: 170}} >Previous Games</Text>
                <TouchableOpacity style={{ top: -33, right: 0, position: 'absolute'}}>
                    <Text style={{fontFamily: RighteousFont, color: '#18A5C2', fontSize: 13, marginTop: 7}} >View All</Text>
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



    const matchesRef = useRef(null);
    const leaguesRef = useRef(null);
    const usersRef = useRef(null);

    const [visible, setVisible] = useState(false);
    const [snackTxt, setSnackText] = useState('.')
    const onToggleSnackBar = () => setVisible(!visible);
    const onDismissSnackBar = () => setVisible(false);

    const [recentMatch, setRecentMatch] = useState({team1: [], team2: [], time: '', date: '', score: ''}) // { team1: [name, url] ], team2: [name, url], time: '', date: ''} 
    
    async function fetchPremierLeagueFixtures() {
        
        console.log('finding pm fixtures')
        
        var pmFixtures = await fetch('https://onechamp-api.onrender.com/Premier-League-Fixtures', {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mac OS',
            }
        })
        pmFixtures = await pmFixtures.json()

        return pmFixtures
    }

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

    async function getRecentMatch(pmMatches)
    {
        console.log('recent match')
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
            

        const formattedMatch = await formatMatch(recentMatchObj)

        // console.log(formattedMatch)
        setRecentMatch(formattedMatch)

    }

    var runTodayMatches = false

    async function populateData()
    {
        if (runTodayMatches === true) { 
        }else{
            console.log('searching')
            const pmMatches = await fetchPremierLeagueFixtures();

            getRecentMatch(pmMatches)
            
            runTodayMatches = true;
        }
    }

    



    async function searchInput()
    {
        
        if(searchValue == '')
        {
            console.log('e')
            setSnackText('Nothing to search')
            onToggleSnackBar()
            return
        }
        if(searchTypeSelected == undefined)
        {
            setSnackText('Select a filter')
            onToggleSnackBar()
            return
        }
                
        console.log('serachng')
        console.log(searchValue)

        var {data} = await supabase.rpc("search_users", {query_input: searchValue })


        console.log(data)
        
        setSearchResults(data)
    }

    function changeSearchType(searchType)
    {
        console.log('Changing serach type to: ' + searchType)
        setSearchType(searchType)
        
        matchesRef.current.setNativeProps({
            style: { opacity: 0.6 },
        });
        leaguesRef.current.setNativeProps({
            style: { opacity: 0.6 },
        });
        usersRef.current.setNativeProps({
            style: { opacity: 0.6 },
        });

        if(searchType == 1)
        {
            matchesRef.current.setNativeProps({
                style: { opacity: 1 },
              });
        }
        if(searchType == 2)
        {
            leaguesRef.current.setNativeProps({
                style: { opacity: 1 },
            });
        }
        if(searchType == 3)
        {
            usersRef.current.setNativeProps({
                style: { opacity: 1 },
            });
        }
        
    }


    const [searchResults, setSearchResults] = useState([])

    const [searchValue, setSearch] = useState('')

    useEffect(() => {
        if(searchValue == '')
        {
            setSearchResults([])
        }
    }, [searchValue])

    useEffect(() => {
        populateData()
    }, [])

    const FTMatches = ({title}) => {
        
        const shouldDisplayMatches = title === "Leagues";

        return(
            
            <View>

                {shouldDisplayMatches ? 
                <View style={{width: 340, height: 200, borderRadius: 10, marginTop: 50, display: 'flex', alignItems: 'center', gap: 8, flexGrow: 1}}>

                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, position: 'absolute', top: -33, left: 10}} >{title}</Text>
                    <TouchableOpacity style={{ top: -33, right: 10, position: 'absolute'}}>
                        <Text style={{fontFamily: RighteousFont, color: '#18A5C2', fontSize: 13, marginTop: 7}} >View All</Text>
                    </TouchableOpacity>

                        <TouchableOpacity onPress={() => {navigation.navigate('LeagueInfo')}}
                            style={{position: 'relative', width: '95%', height: 60, backgroundColor:'#222232', borderRadius: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}
                            >
                            <Image source={{uri: 'https://b.fssta.com/uploads/application/soccer/competition-logos/EnglishPremierLeague.png'}}  style={{width: 30, height: 30, left: 20}} />

                        
                            <Text style={{textAlign: 'center', color: 'white', fontFamily: RighteousFont, fontSize: 15, marginLeft: 30}}>Premiure League</Text>


                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{position: 'relative', width: '95%', height: 60, opacity: 0.3, backgroundColor:'#222232', borderRadius: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}
                            >
                            <Image source={{uri: 'https://static.wikia.nocookie.net/fifa/images/a/ad/ChampionsLeagueLogo.png/revision/latest/scale-to-width-down/250?cb=20180912190604'}}  style={{width: 30, height: 30, left: 20}} />

                        
                            <Text style={{textAlign: 'center', color: 'white', fontFamily: RighteousFont, fontSize: 15, marginLeft: 30}}>Champions League</Text>


                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{position: 'relative', width: '95%', height: 60, opacity: 0.3, backgroundColor:'#222232', borderRadius: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}
                            >
                            <Image source={{uri: 'https://www.citypng.com/public/uploads/preview/qatar-2022-fifa-world-cup-logo-hd-png-701751694776730e3cup6kwl4.png'}}  style={{width: 30, height: 30, left: 20}} />

                        
                            <Text style={{textAlign: 'center', color: 'white', fontFamily: RighteousFont, fontSize: 15, marginLeft: 30}}>World Cup</Text>


                        </TouchableOpacity>
                    </View>

                    : // otherwise display search results
                    <ScrollView >
                        

                        {searchResults.map((match, index) => (
                            <TouchableOpacity onPress={() => { save('PlayerInfoParams', JSON.stringify({'returnPage': 'Discover', 'userID': match.id, 'username': match.username, 'userInfo': {'wins': match.userInfo.wins, 'loss': match.userInfo.loss, 'score': match.userInfo.score}}) ); navigation.navigate('PlayerInfo')}}  key={index} style={{width: vw(90), height: 70, backgroundColor: '#222232', borderRadius: 20, marginTop: 10, position: 'relative', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row'}}>
                                <Image source={{uri: match.preferences.profile}} style={{width: 40, height: 40, left: 20, top: 13}} />
                                
                                <View style={{display: 'flex', flexDirection: 'column'}}>
                                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 13, left: 30, top: 12}} >{match.userInfo.wins}-{match.userInfo.loss}</Text>
                                    <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 18, left: 30, top: 12}} >{match.username}</Text>
                                </View>
                    
                                <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, right: 30, top: 17, position: 'absolute'}} >{match.userInfo.score}</Text>
                            </TouchableOpacity>
                        ))}
                

                    </ScrollView>
                }
            </View>
        
        )
    }

    return (
        <View>
            <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        duration={3000} // duration in milliseconds
        action={{   
          label: 'dismiss',
          onPress: () => {},
        }}
        style={{ backgroundColor: '#181C25', borderColor: '#222232', borderWidth: 1, zIndex: 100, elevation: 5, marginBottom: 100 }} // customize background color
      >
        {snackTxt}
      </Snackbar>
            <Text style={{fontFamily: RighteousFont, color: 'white', fontSize: 25, position: 'absolute', top: 60, left: 30, width: 110}} >Discover</Text>

            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{ position: 'absolute', top: 130, width: vw(90), display: 'flex', flexDirection: 'row' }}>

                    <TextInput style={{width: vw(70), height: 40, backgroundColor: '#222232', borderRadius: 10, fontFamily: RighteousFont, paddingLeft: 15, color: 'white'}} onChangeText={setSearch} value={searchValue} onSubmitEditing={searchInput} placeholder={'Search...'} placeholderTextColor={'grey'} />

                    <TouchableOpacity onPress={searchInput} style={{width: 70, height: 40, borderRadius: 10, marginLeft: 5, backgroundColor: '#222232', opacity: searchValue && searchTypeSelected ? 1 : 0.6}}>
                        <Text style={{fontFamily: RighteousFont, color: 'white', textAlign: 'center', marginTop: 11, fontSize: 12}}>Search</Text>
                    </TouchableOpacity>

                </View>
            </View>

            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 30}}>
                <View style={{ position: 'absolute', top: 150, width: vw(90), display: 'flex', flexDirection: 'row' }}>

                    <TouchableOpacity onPress={() => {changeSearchType(1)}}>
                        <View ref={matchesRef} style={{width: 90, height: 30, borderRadius: 20, backgroundColor: '#222232', opacity: 0.6}}>
                            <Text style={{fontFamily: RighteousFont, color: 'white', textAlign: 'center', marginTop: 8, fontSize: 10}}>Matches</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {changeSearchType(2)}}>
                        <View ref={leaguesRef} style={{width: 90, height: 30, borderRadius: 20, marginLeft: 5, backgroundColor: '#222232', opacity: 0.6}}>
                            <Text style={{fontFamily: RighteousFont, color: 'white', textAlign: 'center', marginTop: 8, fontSize: 10}}>Leagues</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {changeSearchType(3)}}>
                        <View ref={usersRef} style={{width: 90, height: 30, borderRadius: 20, marginLeft: 5, backgroundColor: '#222232', opacity: 0.6}}>
                            <Text style={{fontFamily: RighteousFont, color: 'white', textAlign: 'center', marginTop: 8, fontSize: 10}}>Users</Text>
                        </View>
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
                    <FTMatches title={'Search'} />
                </View>
                }
                
            </View>
        </View>
    )
}