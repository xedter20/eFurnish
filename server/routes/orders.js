const express = require('express');
const verifyJWT = require('../middlewares/verifyJWT');
const verifyUser = require('../middlewares/verifyUser');
const moment = require('moment-timezone');
const {
  startOfMonth,
  endOfMonth,
  format,
  startOfYear,
  endOfYear
} = require('date-fns');

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

const app = initializeApp(firebaseConfig);
let firebaseStorage = getStorage(app);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const getCurrentMonthDates = () => {
  const now = new Date();
  const start = startOfYear(now); // Get the start of the current month
  const end = endOfYear(now); // Get the end of the current month
  return { start, end };
};

const { initializeSocket, getSocketInstance } = require('./../socket.js');

module.exports = (
  ordersCollection,
  cartsCollection,
  notificationCollection
) => {
  const router = express.Router();

  // Get all orders of a user
  router.get(
    '/:email',
    // verifyJWT,
    // verifyUser,
    async (req, res) => {
      try {
        const email = req.params.email;

        if (!email) {
          return res.status(400).json({ error: 'invalid email' });
        }

        const query = { email: email };
        const result = await ordersCollection
          .find(query)
          .sort({ date: -1 })
          .toArray();

        res.send(result);
      } catch (err) {
        console.log('error getting all orders of a user :', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  // Save successful paymented order and delete the cart items
  router.post(
    '/',
    // verifyJWT, verifyUser,
    async (req, res) => {
      try {
        const orderInfo = req.body;
        orderInfo.date = moment.tz('Asia/Manila').toDate();

        //Save the orderInfo into the orders collection
        const insertResult = await ordersCollection.insertOne(orderInfo);

        if (insertResult.insertedId) {
          const deleteResult = await cartsCollection.deleteMany({
            user_email: orderInfo.email
          });

          await notificationCollection.insertOne({
            senderEmail: orderInfo.email,
            recieverEmail: orderInfo.email,
            senderId: '',
            receiverId: '',
            message: `We have recieved your order. Please wait while we process your request.`,
            relatedEntityName: 'order',
            relatedEntityId: insertResult.insertedId,
            forAdmin: false,
            dateCreated: new Date() // MongoDB will use the current date and time
          });

          await notificationCollection.insertOne({
            senderEmail: orderInfo.email,
            recieverEmail: null,
            senderId: '',
            receiverId: '',
            message: `New Order Alert: A new order has been placed. Please review the order details and proceed with the necessary actions`,
            relatedEntityName: 'order',
            relatedEntityId: insertResult.insertedId,
            forAdmin: true,
            dateCreated: new Date() // MongoDB will use the current date and time
          });
          const io = getSocketInstance();
          io.emit('receiveNotification', {
            relatedEntityId: insertResult.insertedId,
            recieverEmail: orderInfo.email
          });

          res.send({ insertResult, deleteResult });
        } else {
          throw new Error('Failed to insert payment');
        }
      } catch (err) {
        console.log('Error saving payments and deleting cart items:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  router.post('/notifications/all', async (req, res) => {
    try {
      const { recieverEmail } = req.body; // Get the email from query params

      // if (!recieverEmail) {
      //   return res.status(400).json({ message: 'recieverEmail is required' });
      // }

      // Query to find notifications

      let notifications = [];
      if (recieverEmail) {
        notifications = await notificationCollection
          .find({ recieverEmail })
          .toArray();
      } else {
        notifications = await notificationCollection
          .find({
            forAdmin: true
          })
          .toArray();
      }

      console.log({ notifications });
      res.status(200).json({ notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/stats/sales-overview', async (req, res) => {
    try {
      let { startDate, endDate } = req.query; // Get date range from query parameters

      if (!startDate || !endDate) {
        const { start, end } = getCurrentMonthDates();
        startDate = format(start, 'yyyy-MM-dd'); // Format the date to 'yyyy-MM-dd'
        endDate = format(end, 'yyyy-MM-dd');
      }

      // Perform the aggregation query to get sales data
      const salesData = await ordersCollection
        .aggregate([
          {
            $match: {
              date: {
                $gte: new Date(startDate), // Filter orders after startDate
                $lte: new Date(endDate) // Filter orders before endDate
              }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, // Group by date
              totalSales: { $sum: '$totalPrice' }, // Sum the quantities (total items sold)
              totalQuantity: { $sum: '$quantity' } // Sum the quantities (total items sold)
            }
          },
          {
            $project: {
              date: '$_id', // Rename _id field to date
              totalSales: 1,
              totalQuantity: 1 // Include totalQuantity
              // totalQuantity: 1
              // _id: 0,
              // dex: 'jhams',
              // totalQuantity: '$_totalQuantity'
            }
          },
          {
            $sort: { date: 1 } // Sort by date ascending
          }
        ])
        .toArray(); // Convert the aggregation result to an array

      // Fetch all orders within the date range
      const query3 = {
        date: {
          $gte: new Date(startDate), // Filter orders after startDate
          $lte: new Date(endDate) // Filter orders before endDate
        }
      };

      const orders = await ordersCollection.find(query3).toArray();

      console.log({ orders });
      // Initialize a dictionary to store total quantity and value for each item
      const salesByItem = {};

      // Loop through the orders and accumulate the sales data by item
      orders.forEach(order => {
        order.items.forEach(item => {
          if (salesByItem[item.title]) {
            salesByItem[item.title].totalQuantitySold += item.quantity;
            salesByItem[item.title].totalValueSold +=
              item.quantity * item.price;
          } else {
            salesByItem[item.title] = {
              totalQuantitySold: item.quantity,
              totalValueSold: item.quantity * item.price
            };
          }
        });
      });

      // Convert the salesByItem object to an array of objects
      const salesByItemArray = Object.keys(salesByItem).map(itemTitle => ({
        name: itemTitle,
        value: salesByItem[itemTitle].totalQuantitySold,
        revenue: salesByItem[itemTitle].totalValueSold
      }));

      console.log({ salesByItemArray });
      // Send the result as a response
      res.json({
        salesData,
        salesByItemArray: salesByItemArray.sort((a, b) => b.value - a.value)
      });
    } catch (err) {
      console.error('Error fetching sales data:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/stats/main-overview', async (req, res) => {
    try {
      let { startDate, endDate } = req.query; // Get date range from query parameters
      let nextPageToken;
      let users = [];
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      let customers = users.concat(listUsersResult.users);

      const query = {
        // $or: [{ status: 'delivered' }]
        date: {
          $gte: new Date(startDate), // Filter orders after startDate
          $lte: new Date(endDate) // Filter orders before endDate
        }
      };

      const completedOrders = await ordersCollection
        .find(query)
        .sort({ date: -1 })
        .toArray();

      const query2 = {
        $or: [{ status: 'pending' }, { status: 'processing' }],
        date: {
          $gte: new Date(startDate), // Filter orders after startDate
          $lte: new Date(endDate) // Filter orders before endDate
        }
      };

      const pendingOrders = await ordersCollection
        .find(query2)
        .sort({ date: -1 })
        .toArray();

      const totalOversales = completedOrders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );

      console.log({ totalOversales });
      res.json({
        success: true,
        data: {
          totalCustomers: customers.length,
          completedOrders: completedOrders.length,
          pendingOrders: pendingOrders.length,
          totalOversales: totalOversales
        }
      });
    } catch (err) {
      console.error('Error fetching sales data:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
