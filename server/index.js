require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;
const socketIo = require('socket.io');
const { initializeSocket } = require('./socket.js');
// middleware

const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

const { ref, uploadBytes, getDownloadURL } = require('@firebase/storage');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const admin = require('firebase-admin');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const firebaseConfig = {
  apiKey: 'AIzaSyARm6p7lyxocvpX6IeNcx3HxSWsZRqJ5so',
  authDomain: 'efurnish-b44f7.firebaseapp.com',
  projectId: 'efurnish-b44f7',
  storageBucket: 'efurnish-b44f7.firebasestorage.app',
  messagingSenderId: '332603753573',
  appId: '1:332603753573:web:ad5dce4ab71c466b79328c',
  measurementId: 'G-43NGJQELRD'
};
const appFirebase = initializeApp(firebaseConfig);
let firebaseStorage = getStorage(appFirebase);

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);
const storage = getStorage(appFirebase);

app.use(cors());
app.use(express.json());
//
// MongoDB Atlas Conntection URL
const uri = `mongodb+srv://dextermiranda441:ZTKQ94nSwtW81tcW@cluster0.swfod.mongodb.net/ratan`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

// Routes import
const productRoutes = require('./routes/products');
const shippingfeesRoutes = require('./routes/shipping_fee.js');
const reviewRoutes = require('./routes/reviews');
const cartRoutes = require('./routes/carts');
const favouriteRoutes = require('./routes/favourites');

const orderRoutes = require('./routes/orders');

const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const paypal = require('paypal-rest-sdk');

// Configure PayPal SDK
paypal.configure({
  mode: 'sandbox', // Use 'live' for production
  client_id:
    'AaKrK9r6rk6KZX3McNtTA0UWsYVAZAJQqSvc5I8cZFM5PpbxE1wDoZ3_CHq-NOxh_OIrUq9IwfzwneP9',
  client_secret:
    'EAUNgaQfc5NMFS31x02M6ysk23W5yeK30WCpS5rPE8fn9m4l51tbbbmgvZFc6ar9Sa9VRJn7gqNvXpUP'
});

async function run() {
  try {
    const initialData = [
      {
        province: 'Albay',
        municipalities: [
          { name: 'Bacacay', fee: 50 },
          { name: 'Camalig', fee: 50 },
          { name: 'Daraga', fee: 50 },
          { name: 'Guinobatan', fee: 50 },
          { name: 'Jovellar', fee: 50 },
          { name: 'Legazpi City', fee: 50 },
          { name: 'Libon', fee: 50 },
          { name: 'Ligao City', fee: 50 },
          { name: 'Malilipot', fee: 50 },
          { name: 'Malinao', fee: 50 },
          { name: 'Manito', fee: 50 },
          { name: 'Oas', fee: 50 },
          { name: 'Pio Duran', fee: 50 },
          { name: 'Polangui', fee: 50 },
          { name: 'Rapu-Rapu', fee: 50 },
          { name: 'Santo Domingo', fee: 50 },
          { name: 'Tabaco City', fee: 50 },
          { name: 'Tiwi', fee: 50 }
        ]
      },
      {
        province: 'Camarines Norte',
        municipalities: [
          { name: 'Basud', fee: 50 },
          { name: 'Capalonga', fee: 50 },
          { name: 'Daet', fee: 50 },
          { name: 'Jose Panganiban', fee: 50 },
          { name: 'Labo', fee: 50 },
          { name: 'Mercedes', fee: 50 },
          { name: 'Paracale', fee: 50 },
          { name: 'San Lorenzo Ruiz', fee: 50 },
          { name: 'San Vicente', fee: 50 },
          { name: 'Santa Elena', fee: 50 },
          { name: 'Talisay', fee: 50 },
          { name: 'Vinzons', fee: 50 }
        ]
      },
      {
        province: 'Camarines Sur',
        municipalities: [
          { name: 'Baao', fee: 50 },
          { name: 'Balatan', fee: 50 },
          { name: 'Bato', fee: 50 },
          { name: 'Bombon', fee: 50 },
          { name: 'Buhi', fee: 50 },
          { name: 'Bula', fee: 50 },
          { name: 'Cabusao', fee: 50 },
          { name: 'Calabanga', fee: 50 },
          { name: 'Camaligan', fee: 50 },
          { name: 'Canaman', fee: 50 },
          { name: 'Caramoan', fee: 50 },
          { name: 'Del Gallego', fee: 50 },
          { name: 'Gainza', fee: 50 },
          { name: 'Garchitorena', fee: 50 },
          { name: 'Goa', fee: 50 },
          { name: 'Iriga City', fee: 50 },
          { name: 'Lagonoy', fee: 50 },
          { name: 'Libmanan', fee: 50 },
          { name: 'Lupi', fee: 50 },
          { name: 'Magarao', fee: 50 },
          { name: 'Milaor', fee: 50 },
          { name: 'Minalabac', fee: 50 },
          { name: 'Nabua', fee: 50 },
          { name: 'Naga City', fee: 50 },
          { name: 'Ocampo', fee: 50 },
          { name: 'Pamplona', fee: 50 },
          { name: 'Pasacao', fee: 50 },
          { name: 'Pili', fee: 50 },
          { name: 'Presentacion', fee: 50 },
          { name: 'Ragay', fee: 50 },
          { name: 'Sagnay', fee: 50 },
          { name: 'San Fernando', fee: 50 },
          { name: 'San Jose', fee: 50 },
          { name: 'Sipocot', fee: 50 },
          { name: 'Siruma', fee: 50 },
          { name: 'Tigaon', fee: 50 },
          { name: 'Tinambac', fee: 50 }
        ]
      },
      {
        province: 'Catanduanes',
        municipalities: [
          { name: 'Bagamanoc', fee: 50 },
          { name: 'Baras', fee: 50 },
          { name: 'Bato', fee: 50 },
          { name: 'Caramoran', fee: 50 },
          { name: 'Gigmoto', fee: 50 },
          { name: 'Pandan', fee: 50 },
          { name: 'Panganiban', fee: 50 },
          { name: 'San Andres', fee: 50 },
          { name: 'San Miguel', fee: 50 },
          { name: 'Viga', fee: 50 },
          { name: 'Virac', fee: 50 }
        ]
      },
      {
        province: 'Masbate',
        municipalities: [
          { name: 'Aroroy', fee: 50 },
          { name: 'Baleno', fee: 50 },
          { name: 'Balud', fee: 50 },
          { name: 'Batuan', fee: 50 },
          { name: 'Cataingan', fee: 50 },
          { name: 'Cawayan', fee: 50 },
          { name: 'Claveria', fee: 50 },
          { name: 'Dimasalang', fee: 50 },
          { name: 'Esperanza', fee: 50 },
          { name: 'Mandaon', fee: 50 },
          { name: 'Masbate City', fee: 50 },
          { name: 'Milagros', fee: 50 },
          { name: 'Mobo', fee: 50 },
          { name: 'Monreal', fee: 50 },
          { name: 'Palanas', fee: 50 },
          { name: 'Pio V. Corpuz', fee: 50 },
          { name: 'Placer', fee: 50 },
          { name: 'San Fernando', fee: 50 },
          { name: 'San Jacinto', fee: 50 },
          { name: 'San Pascual', fee: 50 },
          { name: 'Uson', fee: 50 }
        ]
      },
      {
        province: 'Sorsogon',
        municipalities: [
          { name: 'Barcelona', fee: 50 },
          { name: 'Bulan', fee: 50 },
          { name: 'Bulusan', fee: 50 },
          { name: 'Casiguran', fee: 50 },
          { name: 'Castilla', fee: 50 },
          { name: 'Donsol', fee: 50 },
          { name: 'Gubat', fee: 50 },
          { name: 'Irosin', fee: 50 },
          { name: 'Juban', fee: 50 },
          { name: 'Magallanes', fee: 50 },
          { name: 'Matnog', fee: 50 },
          { name: 'Pilar', fee: 50 },
          { name: 'Prieto Diaz', fee: 50 },
          { name: 'Santa Magdalena', fee: 50 },
          { name: 'Sorsogon City', fee: 50 }
        ]
      }
    ];

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Database
    const db = client.db('eFurnish');

    // // Get a list of all collections in the old database
    // const collections = await oldDb.listCollections().toArray();

    // // Loop through the collections and copy them to the new database
    // for (const collection of collections) {
    //   const oldCollection = oldDb.collection(collection.name);
    //   const newCollection = newDb.collection(collection.name);

    //   // Copy documents from old collection to new collection
    //   const documents = await oldCollection.find({}).toArray();
    //   if (documents.length > 0) {
    //     await newCollection.insertMany(documents);
    //   }
    // }

    // console.log(
    //   `Successfully renamed database from ${oldDbName} to ${newDbName}`
    // );

    // Database Collections
    const productsCollection = db.collection('products');
    const cartsCollection = db.collection('carts');
    const favouritesCollection = db.collection('favourites');
    const ordersCollection = db.collection('orders');
    const reviewsCollection = db.collection('reviews');
    const membershipCollection = db.collection('membership');
    // Routes`

    const notificationCollection = db.collection('notifications');
    const shippingFeeCollection = db.collection('shipping_fee');

    //const result = await shippingFeeCollection.insertMany(initialData);

    // console.log(`Inserted ${result.insertedCount} documents successfully.`);

    app.use('/api/shipping-fees', shippingfeesRoutes(shippingFeeCollection));

    app.use('/api/products', productRoutes(productsCollection));

    app.use('/api/reviews', reviewRoutes(reviewsCollection));
    app.use('/api/carts', cartRoutes(cartsCollection));
    app.use('/api/favourites', favouriteRoutes(favouritesCollection));
    app.use(
      '/api/orders',
      orderRoutes(ordersCollection, cartsCollection, notificationCollection)
    );
    app.use(
      '/api/admin',
      adminRoutes(ordersCollection, productsCollection, notificationCollection)
    );
    app.use(
      '/api/users',
      userRoutes(membershipCollection, ordersCollection, cartsCollection)
    );
    app.use('/api/payments', paymentRoutes());

    app.post('/webhook/paymongo', (req, res) => {
      // The event data will be in req.body
      const event = req.body;

      // Process the event based on its type
      if (event.type === 'source.chargeable') {
        // Handle the event when a source becomes chargeable
        console.log('Source is chargeable:', event.data);
      } else if (event.type === 'payment.paid') {
        // Handle successful payment event
        console.log('Payment is successful:', event.data);
      }

      // Respond with a 200 status code to acknowledge receipt of the event
      res.status(200).send({ received: true });
    });

    // JWT Token API
    app.post('/api/jwt', (req, res) => {
      const user = req.body;

      console.log({ user });
      const token = jwt.sign(user, 'secret', {
        expiresIn: '30d'
      });
      res.send({ token });
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Middleware for Socket.io connection

app.get('/', (req, res) => {
  res.send('Real-time notification server running');
});

// Create PayPal order
app.post('/create-order', (req, res) => {
  // console.log('dex');
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    transactions: [
      {
        amount: {
          currency: 'PHP',
          total: '500.00'
        },
        description: 'Payment description'
      }
    ],
    redirect_urls: {
      return_url: 'http://localhost:5000/success',
      cancel_url: 'http://localhost:5000/cancel'
    }
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json({ id: payment.id });
    }
  });
});

// Capture PayPal order
app.post('/capture-order', (req, res) => {
  const { orderID } = req.body;

  paypal.payment.execute(orderID, {}, (error, payment) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(payment);
    }
  });
});

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', socket => {
  console.log('A user connected');

  // Listen for new notifications
  socket.on('newNotification', async data => {
    // const newNotification = new Notification(data);
    // await newNotification.save();
    // // Emit the notification to all connected clients
    // io.emit('receiveNotification', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

initializeSocket(server);
server.listen(port, async () => {
  let nextPageToken;
  // await admin
  //   .auth()
  //   .listUsers(100, nextPageToken)
  //   .then(async listUsersResult => {
  //     let uids = listUsersResult.users.map(userRecord => userRecord.uid);

  //     let filtered = uids.filter(u => {
  //       return u !== 'c47KAojxACYzdNT31zfNhu6OBuQ2';
  //     });

  //     if (filtered.length > 0) {
  //       await admin
  //         .auth()
  //         .deleteUsers(uids)
  //         .then(() => {
  //           console.log('Successfully deleted users:', uids);
  //         })
  //         .catch(error => {
  //           console.error('Error deleting users:', error);
  //         });
  //     }
  //   })
  //   .catch(error => {
  //     console.log('Error listing users:', error);
  //   })
  //   .finally(() => {
  //     // admin.auth().deleteUsers(uids)
  //   });

  console.log(` server is running on port: ${port}`);
});
