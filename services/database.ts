import "dotenv/config"

import mysql from "mysql"
import process from "process"

const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}

function queryDatabase(query: string, ...args: any[]) {
  const connection = mysql.createConnection(connectionConfig)

  return new Promise<any>((resolve, reject) => {
    connection.connect(function(err) {
      if (err) reject(err)
  
      connection.query(query, args, function(err, result) {
        if (err) reject(err)

        resolve(result)
      })
    })
  })
}

export default queryDatabase
