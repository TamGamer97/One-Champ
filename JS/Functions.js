import AsyncStorage from "@react-native-async-storage/async-storage";

export const save = async(key, value) => {
    try{
        await AsyncStorage.setItem(key, value)
        console.log('Saved')
    } catch (err) {
      //console.log(err)
    }
}

export const load = async(key) => {
    try{
        let value = await AsyncStorage.getItem(key)

        return value
    } catch(err) {
    //   console.log(err)
    }
}
export const clearAll = async() => {
    AsyncStorage.clear()
}



// supabase
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
        console.log(data)
    }
}

const sendData = async () => {
    console.log('sending data')

    const {data, error} = await supabase
        .from('accounts')
        .insert([{'email': 'newemail@gmail.com', 'password': 'newpass', 'username': 'newuser'}])
    
    if(error)
    {
        console.log(error)
    }
    if(data)
    {
        console.log(data)
    }
}