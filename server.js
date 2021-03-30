const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS
const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.kxnwf.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


var serviceAccount = require("./configs/burj-al-arab-76c3c-firebase-adminsdk-16830-dc4950eec4.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/booking', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    if (tokenEmail === req.query.email) {
                        bookings.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.send(documents)
                            })
                    }
                })
                .catch((error) => {
                    //...
                });
        }


    })

});

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`app listening on ${port} port!`))