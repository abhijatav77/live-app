import { createContext, useContext, useEffect, useState } from "react"
import api from "../services/api"
import { API_ENDPOINTS } from "../utils/constants"

const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)


    //check if user is authenticated on mount

    useEffect(() => {
        const checkAuth = async() => {
            const token = localStorage.getItem('token')
            if(!token){
                setLoading(false)
                return;
            }
            try {
                const response = await api.get(API_ENDPOINTS.AUTH.ME)
                setUser(response.data?.data?.user)
            } catch (error) {
                localStorage.removeItem('token')
                setUser(null);
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    },[])

    const register = async(name, email, password) => {
        try {
            setError(null)
            setLoading(true)
            const response = await api.post(API_ENDPOINTS.AUTH.REGISTER,{
                name,
                email,
                password
            })
            const {user, token} = response?.data?.data
            //set token to localstrong
            localStorage.setItem('token', token)
            console.log("Register :", token)
            //update user state
            setUser(user)

            return {success: true, user}
        } catch (error) {
            const errorMessage = error?.response?.data?.error || "Registration failed"
            setError(errorMessage)
            return {success: false, error:errorMessage}
        } finally {
            setLoading(false)
        }
    }


    const login = async(email, password) => {
        try {
            setError(null)
            setLoading(true)
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN,{
                email,
                password
            })
            const {user, token} = response.data.data
            console.log("Login :", token)
            //set token to localstrong
            localStorage.setItem('token', token)

            //update user state
            setUser(user)

            return {success: true, user}
        } catch (error) {
            const errorMessage = error?.response?.data?.error || "Login failed"
            setError(errorMessage)
            return {success: false, error:errorMessage}
        } finally {
            setLoading(false)
        }
    }
    
    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        setError(null)
    }

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        setError
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

//useAuth hook

//custom hook to access auth context

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext;