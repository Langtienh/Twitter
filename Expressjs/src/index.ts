import { config } from 'dotenv'
import express from 'express'
import usersRouter from './routes/users.routes'
import databaseServices from './services/database.servicers'

config()
const app = express()
// port
const port = process.env.PORT

// cái này phải để trước các middleware nhận json từ body khác nếu không sẽ bị lỗi
app.use(express.json())

app.use('/api/v1/users', usersRouter)

databaseServices.connect()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
