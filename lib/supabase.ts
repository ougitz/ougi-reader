import { createClient, PostgrestError, Session, AuthError } from '@supabase/supabase-js'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChapterImage } from '@/helpers/types'
import { AppState } from 'react-native'
import { Manhwa } from '@/model/Manhwa';
import { Chapter } from '@/model/Chapter';


const supabaseUrl = 'https://wevyvylwsfcxgbuqawuu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indldnl2eWx3c2ZjeGdidXFhd3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTUyMDMsImV4cCI6MjA1ODU5MTIwM30.EXGkpsPue5o2OD5WOpu4IfOZEgqo3FYKV2QDLNW7P6g'


export const supabase = createClient(supabaseUrl, supabaseKey as any, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
});


AppState.addEventListener(
'change', (state) => {  
    if (state === 'active') {    
        supabase.auth.startAutoRefresh()  
    } else {    
        supabase.auth.stopAutoRefresh()
    }
}
)


export async function spGetSession(): Promise<Session | null> {
    const { data: {session} } = await supabase.auth.getSession()
    return session
}


export async function spUpdateUserLastLogin(user_id: string) {
    const { error } = await supabase
        .from("users")
        .update({'last_login_at': 'now()'})
        .eq("user_id", user_id)
    
    if (error) {
        console.log("error spUpdateUserLastLogin", error)
    }
}


export async function spFetchUser(user_id: string, update_login_time: boolean = false): Promise<string | null> {
    const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("user_id", user_id)
        .single()

    if (error) {
        console.log("error spFetchUser", error)
        return null
    }

    if (update_login_time) {
        await spUpdateUserLastLogin(user_id)
    }

    return data.username
}

export async function spCreateUser(
    email: string, 
    password: string, 
    username: string
): Promise<AuthError | null> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    })    

    if (data.session) {
        const { error: err } = await supabase
            .from("users")
            .insert({username, user_id: data.session.user.id})

        if (err) {
            console.log("error spCreateUser", err)
        }
    }

    return error
}


export async function spFetchChapterImages(chapter_id: number): Promise<ChapterImage[]> {
    const { data, error } = await supabase
        .from("chapter_images")
        .select("image_url, width, height")
        .eq("chapter_id", chapter_id)
        .order('index', {ascending: true})
        .overrideTypes<ChapterImage[]>()

    if (error) {
        console.log("error spFetchChapterImages", error)
        return []
    }

    return data
}



export async function spFetchRandomManhwa(
    p_offset: number = 0,
    p_limit: number = 30, 
    p_num_chapters: number = 3
): Promise<Manhwa[]> {
    const { data, error } = await supabase
        .rpc('get_random_manhwas', { p_offset, p_limit, p_num_chapters });

    if (error) {
        console.log("error fetchRandomManhwa", error)
        return []
    }

    return data
}


export async function spFetchGenres(): Promise<string[]> {
    
    const { data, error } = await supabase.rpc('get_genres');

    if (error) {
        console.error('error fetchGenres', error);
        return [];
    }

    return data.map((item: {genre: string}) => item.genre)
}


export async function spFetchAllManhwas(
    p_num_chapters: number = 3
): Promise<Manhwa[]> {
    const { data, error } = await supabase
        .rpc('get_manhwas', { p_num_chapters });

    if (error) {
        console.error('error spFetchAllManhwas', error);
        return [];
    }

    return data
}

export async function spFetchChapterList(manhwa_id: number): Promise<Chapter[]> {
    
    const { data, error } = await supabase
        .from("chapters")
        .select("chapter_id, manhwa_id, chapter_num, created_at")
        .eq("manhwa_id", manhwa_id)
        .order("chapter_num", {ascending: true})        
        .overrideTypes<Chapter[]>()    

    if (error) {
        console.log("error spFetchChapterList", error)
        return []
    }

    return data
}


export async function spGetCacheUrl(): Promise<Map<string, string>> {
    const { data, error } = await supabase
        .from("cache")
        .select("name, url")
        .overrideTypes<{name: string, url: string}[]>()
    
    if (error) {
        console.log("error spGetCacheUrl", error)
        return new Map()
    }

    const m = new Map()
    data?.forEach(item => m.set(item.name, item.url))

    return m
}


export async function spUpdateManhwaViews(p_manhwa_id: number) {
    const { error } = await supabase
        .rpc('increment_manhwa_views', { p_manhwa_id  });

    if (error) {
        console.error('error updateManhwaViews', error);
        return null;
    }  
}