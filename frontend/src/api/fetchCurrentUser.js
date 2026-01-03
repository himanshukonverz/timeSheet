import { toast } from "sonner"
import api from "./axios"

export const fetchCurrentLoggedInUser = async (setUser, setLoading) => {
    setLoading(true)
    try {
        const res = await api.get("/auth/me")
        console.log("res - ", res)

        if(res.data){
            setUser(res.data.user)
        }
    } catch (error) {
        console.log("error - ",error)
        toast.error(error?.response?.data?.message || "Login and try again Please!!!")
        setUser(null)
    } finally {
        setLoading(false)
    }
}