const express = require('express')
const bodyParser = require('body-parser')
const admin = require("firebase-admin")
const OneSignal = require('onesignal')
const _ = require('lodash')

const app = express()
const oneSignal = new OneSignal('NWVlYWVmODItM2VlMS00MWI2LTg1ZDEtYWY0MThhNzk2OTkz', 'ee39b3fd-581b-4c8c-bf57-548f625b3ded')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.post('/notification/followers/:userId', (req, res) => {
  let { userId } = req.params
  let {
    message,
    type
  } = req.body
  let db = admin.database()

  db.ref(`users-followers/${userId}`)
    .once('value', followersSnap => {
      _.each(_.keys(followersSnap.val()), (id) => {
        db.ref(`users/${id}`)
          .on('value', userSnap => {
            let { pushToken } = userSnap.val()
            oneSignal.createNotification(message, {
              type,
              userId
            }, [pushToken])

            res.json({success: true})
          })
      })
    })
})



app.listen(process.env.PORT, _ => {
  console.log('Server started.')

  admin.initializeApp({
    credential: admin.credential.cert(require('./fliptrip-dev-firebase-adminsdk-config.json')),
    databaseURL: 'https://fliptrip-dev.firebaseio.com'
  })
})
