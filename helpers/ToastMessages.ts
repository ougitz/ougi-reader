import Toast from "@/components/Toast"


export const ToastNoInternet = () => Toast.show({
    title: 'Warning', 
    message: 'You dont have connection to internet', 
    type: 'info'
})

export const ToastWeakPassword = () => Toast.show({
    title: "Error", 
    message: "password must contain at least 1 uppercase, 1 lowercase, 1 digit and 1 symbol", 
    type: "error", 
    duration: 3000
})

export const ToastSuccess = (message: string = '') => Toast.show({
    title: "Success!", 
    message, 
    type: 'success'
})


export const ToastError = (message: string = '') => Toast.show({
    title: "Error", 
    message, 
    type: "error"
})


export const ToastWaitDatabase = (secondsUntilRefresh: number) => Toast.show({
    title: "Wait ⌛", 
    message: `You can try again in ${secondsUntilRefresh} seconds`,
    type: "info",
    duration: 3000
})


export const ToastUpdateDatabase = (message: string = '') => Toast.show({
    title: "Downloading database", 
    message: message, 
    type: "info"
})