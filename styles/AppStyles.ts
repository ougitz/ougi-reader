import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";
import { wp } from "@/helpers/util";


export const AppStyle = StyleSheet.create({
    textRegular: {
        fontSize: 16,
        color: 'white',
        fontFamily: 'LeagueSpartan_400Regular'
    },
    textHeader: {
        fontSize: 26,
        color: 'white',
        fontFamily: 'LeagueSpartan_400Regular'
    },
    textLink: {
        fontSize: 16,
        color: Colors.white,
        textDecorationLine: "underline",
        fontFamily: 'LeagueSpartan_400Regular'
    },
    safeArea: {
        width: '100%', 
        flex: 1, 
        padding: wp(5), 
        backgroundColor: Colors.backgroundColor
    }
})