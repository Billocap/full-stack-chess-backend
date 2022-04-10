import express from "express"
import bcrypt from "bcrypt"
import crypto from "crypto"

import uuid from "../utils/uuid"
import queryDatabase from "../services/database"

const api = express.Router()

api.post("/login", async (req, res) => {
  const {email, password} = req.body

  const [user] = await queryDatabase(`SELECT * FROM Users WHERE Email=?;`, email)
  
  if (user) {
    const match = await bcrypt.compare(password, user.HASH)

    if (!match) {
      res.status(400).send({
        message: "Wrong password."
      })

      return
    }

    const token = uuid(32)

    await queryDatabase(`UPDATE Users SET token=? WHERE ID=?;`, token, user.ID)

    res.send({
      token,
      id: user.ID,
      username: user.Username
    })

    return
  }

  res.status(400).send({
    message: "User not found."
  })
})

api.post("/register", async (req, res) => {
  const {username, email, password} = req.body

  const users = await queryDatabase(`SELECT * FROM Users WHERE Username=? OR Email=?;`, username, email)
  
  if (users.length) {
    res.status(400).send({
      message: "User already registered."
    })

    return
  }

  let id = crypto.randomUUID()
  let token = uuid(32)

  const ids: any[] = await queryDatabase("SELECT ID AND token FROM Users;")

  while (ids.filter(user => user.ID == id).length) id = crypto.randomUUID()
  while (ids.filter(user => user.token == token).length) token = uuid(32)

  const hash = await bcrypt.hash(password, 15)

  await queryDatabase(`INSERT INTO Users VALUES (?, ?, ?, ?, ?);`, id, username, email, hash, token)

  res.send({id, token, username})
})

export default api
