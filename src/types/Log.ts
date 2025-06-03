 

export default class Log   {
 
  declare id: number

 
  declare createdAt: string
 
  declare updatedAt: string

 
  declare type: LogType

 
  declare message: string | null
  
}


export type LogType = 
 | "LOG_IN"
 | "LOG_OUT"
 | "LOG_IN_FAIL"
 | "VIEW_APP"
 | "ERR_LOG"