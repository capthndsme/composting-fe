import { type AxiosResponse } from "axios";
import { baseApi } from "./baseApi";

export const validateToken = () => 
  baseApi.post("/auth/check")

export const login = async ( username: string, password: string): Promise<AxiosResponse<{
  token: string,
  userId: number
}>> =>
  baseApi.post("/auth/login", {
    username,
    password
  });

export const logout = () =>
  baseApi.post("/auth/logout");



/**
 * Change passwrod:
 *     const { userId, oldPassword, newPassword } = request.body()
 */

export const changePassword = async (oldPassword: string, newPassword: string)  => {
  return baseApi.post(`/auth/change`, {
    oldPassword,
    newPassword,
    userId: localStorage.getItem("_COMP_USER_ID")
  })
}

export default {
  validateToken,
  login,
  changePassword,
  logout
}