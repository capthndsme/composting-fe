import type Log from "@/types/Log";

import { useQuery } from "@tanstack/react-query";
import { baseApi } from "./baseApi";
 
 

export function useGetLog() {
 
 
  return useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await baseApi.get<Log[]>(`/logs`)
      return response.data
    },
  })
}