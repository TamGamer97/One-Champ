import AsyncStorage from "@react-native-async-storage/async-storage";

import { createClient } from '@supabase/supabase-js'

// Local Storage
export const save = async(key, value) => {
    try{
        await AsyncStorage.setItem(key, value)
        console.log('Saved')
    } catch (err) {
    }
}
export const load = async(key) => {
    try{
        let value = await AsyncStorage.getItem(key)

        return value
    } catch(err) {
    }
}
export const clearAll = async() => {
    AsyncStorage.clear()
}

// Supabase
const supabaseUrl = 'https://nxnlueqwonfremybejbm.supabase.co' // HIDE THESE
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bmx1ZXF3b25mcmVteWJlamJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE2NzAzODcsImV4cCI6MjAwNzI0NjM4N30.6cfViULSoEKQi0ImV8xTFwMoGL0uSy31aPRU-yUBFZ4'
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
    persistSession: false,
    }
})

export const fetchData = async () => {
    const {data, error} = await supabase
        .from('accounts') // table name
        .select()
    
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

export const sendData = async (table, row) => {
    console.log('sending data')

    const {data, error} = await supabase
        .from(table)
        .insert([row])
    
    if(error)
    {
        console.log(error)
    }
    if(data)
    {
        console.log(data)
    }
}