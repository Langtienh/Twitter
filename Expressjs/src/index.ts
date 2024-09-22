import { config } from 'dotenv'
import express from 'express'
import { defaultErrorHandler } from './middlewares/error.middleware'
import usersRouter from './routes/users.routes'
import databaseServices from './services/database.servicers'

config()
const app = express()
// port
const port = process.env.PORT

// cái này phải để trước các middleware nhận json từ body khác nếu không sẽ bị lỗi
app.use(express.json())

databaseServices.connect()

app.use('/api/v1/users', usersRouter)

// cái này phải để dưới mới nhận được error từ các router
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
