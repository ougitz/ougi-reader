import { AppRelease, ChapterImage, DonateMethod, Genre, OugiUser, Recommendation } from '@/helpers/types'
import { createClient, Session, AuthError } from '@supabase/supabase-js'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from 'react-native'
import { Manhwa } from '@/helpers/types'
import { Chapter } from '@/helpers/types';


// All tables in supabase have RLS
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


export async function spFetchUser(
    user_id: string, 
    update_login_time: boolean = true
): Promise<OugiUser | null> {

    const { data, error } = await supabase
        .from("users")
        .select("username, image_id, images (width, height, image_url)")
        .eq("user_id", user_id)
        .single()

    if (error) {
        console.log("error spFetchUser", error)
        return null
    }

    if (update_login_time) {
        spUpdateUserLastLogin(user_id)
    }

    return {
        username: data.username,
        image: data.images ? {
            image_id: data.image_id,
            width: (data.images as any).width,
            height: (data.images as any).height,
            image_url: (data.images as any).image_url
        } : null,
        user_id
    }
}

export async function spCreateUser(
    email: string, 
    password: string, 
    username: string
): Promise<AuthError | null> {
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
    })
    return error
}


export async function spFetchChapterImages(chapter_id: number): Promise<ChapterImage[]> {
    const { data, error } = await supabase
        .from("chapter_images")
        .select("image_url, width, height")
        .eq("chapter_id", chapter_id)
        .order('index', {ascending: true})

    if (error) {
        console.log("error spFetchChapterImages", error)
        return []
    }

    return data
}


export async function spFetchChapterList(manhwa_id: number): Promise<Chapter[]> {
    
    const { data, error } = await supabase
        .from("chapters")
        .select("chapter_id, manhwa_id, chapter_num, created_at")
        .eq("manhwa_id", manhwa_id)
        .order("chapter_num", {ascending: true})

    if (error) {
        console.log("error spFetchChapterList", error)
        return []
    }

    return data
}


export async function spUpdateManhwaViews(p_manhwa_id: number) {
    const { error } = await supabase
        .rpc('increment_manhwa_views', { p_manhwa_id  });

    if (error) {
        console.error('error updateManhwaViews', error);
        return null;
    }  
}


export async function spFetchManhwaRecommendations(
    p_offset: number = 0,
    p_limit: number = 25,
    p_num_chapters: number = 3
): Promise<Recommendation[]> {
    const { data, error } = await supabase
        .rpc("get_manhwa_recommendations", {p_offset, p_limit, p_num_chapters})    

    if (error) {
        console.log("error spFetchManhwaRecommendations", error)
        return []
    }

    return data.map((item: any) => {return {
        manhwa: item,
        image: {
            width: item.width,
            height: item.height,
            image_url: item.image_url,
            image_id: item.image_id
        }
    }})
}


export async function spGetManhwas(p_offset: number | null = null, p_limit: number | null = null): Promise<Manhwa[]> {
    const { data, error } = await supabase
        .rpc("get_manhwas", { p_limit, p_offset })
    
    if (error) {
        console.log("error spGetManhwas", error)
        return []
    }
    
    return data
}


export async function spUpdateManhwaReadingStatus(
    p_user_id: string,
    p_manhwa_id: number, 
    p_status: string
) {      
    const { error } = await supabase
        .rpc("upsert_reading_status", {p_user_id, p_manhwa_id, p_status})

    if (error) {
        console.log("error spUpdateManhwaReadingStatus", error)
    }
}


export async function spFetchUserReadingStatus(
    user_id: string
): Promise<{manhwa_id: number, status: string}[]> {
    const { data, error } = await supabase
        .from('reading_status')
        .select("manhwa_id, status")
        .eq("user_id", user_id)

    if (error) {
        console.log("error spFetchUserReadingStatus", error)
        return []
    }

    return data
}

export async function spReportBug(title: string, descr: string | null, bug_type: string): Promise<boolean> {
    const { error } = await supabase
        .from("bug_reports")
        .insert([{title, descr, bug_type}])
    
    if (error) {
        console.log("error spReportBug", error)
        return false
    }
    return true
}


export async function spGetDonationMethods(): Promise<DonateMethod[]> {
    const { data, error } = await supabase
        .from("donate_methods")
        .select("method, value, action")

    if (error) {
        console.log("error spGetDonationMethods", error)
        return []
    }

    return data
}


export async function spRequestManhwa(manhwa_title: string, message: string | null) {
    const { error } = await supabase
        .from("manhwa_requests")
        .insert([{manhwa_title, message}])

    if (error) {
        console.log("error spRequestManhwa")
    }
}


export async function spGetReleases(): Promise<AppRelease[]> {
    const { data, error } = await supabase
        .from("releases")
        .select("version, url, descr")
        .order("created_at", {ascending: false})
        
    if (error) { 
        console.log("error spGetAllAppVersions", error)
        return [] 
    }    

    return data as any
}
