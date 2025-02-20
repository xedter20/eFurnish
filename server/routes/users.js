const express = require('express');
const verifyJWT = require('../middlewares/verifyJWT');
const verifyUser = require('../middlewares/verifyUser');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const moment = require('moment-timezone');
// Require the functions you need from the SDKs
const { initializeApp, getApp, getApps } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const { getAnalytics } = require('firebase/analytics');

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
//as
// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use the existing app instance if already initialized
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

//
const upload = multer({ storage: multer.memoryStorage() });
//

// Initialize Firebase Admin SDK
//ssewcrer
const serviceAccount = require('././../ratan-eccomerce-21833d459a09.json');
//e

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ratan-eccomerce-default-rtdb.firebaseio.com'
});
//sss
module.exports = (membershipCollection, ordersCollection, cartsCollection) => {
  const router = express.Router();

  router.get(
    '/admin/:email',
    // verifyJWT, verifyUser,
    async (req, res) => {
      try {
        const email = req.params.email;
        console.log({ email });
        // const decodedEmail = req.decoded.email;

        // if (decodedEmail !== email) {
        //   return res.send({ admin: false });
        // }

        const adminEmail = 'admin-efurnish@gmail.com';
        const isAdmin = email === adminEmail;

        res.send({ admin: isAdmin });
      } catch (err) {
        console.log('error getting users:', err);
        res.status(500).send('Internal Server Error');
      }
    }
  );

  router.post(
    '/membership/create',
    // verifyJWT, verifyUser,
    upload.single('file'),
    async (req, res) => {
      try {
        const file = req.file;

        const membershipInfo = req.body;
        const authEmail = req.query.userEmail || req.body.userEmail;

        // check if have pending application
        const existingItem = await membershipCollection.findOne({
          authEmail
        });

        if (existingItem?._id) {
          console.log('her');
          res.json({
            success: false,
            message: 'You have already applied for membership'
          });
        } else {
          //Save the orderInfo into the orders collection
          const insertResult = await membershipCollection.insertOne({
            ...membershipInfo,
            status: 'FOR_APPROVAL',
            authEmail
          });

          const objectId = insertResult.insertedId;

          // Extract the ID as a string
          const membershipId = objectId.toString(); // This will give you the ObjectId in string format

          const storageRef = ref(
            firebaseStorage,
            `membership/${membershipId}/e-sign/${file.originalname}`
          );
          const metadata = { contentType: file.mimetype };

          // Upload the file to Firebase Storage
          await uploadBytes(storageRef, file.buffer, metadata);

          // Get the file's download URL
          const downloadURL = await getDownloadURL(storageRef);

          const result = await membershipCollection.updateOne(
            { _id: objectId },
            { $set: { downloadURL: downloadURL } }
          );

          res.send(result);
        }
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    }
  );

  router.post('/listMembers', async (req, res) => {
    try {
      const result = await membershipCollection
        .find()
        // .sort({ _id: -1 })
        .toArray();

      console.log({ result });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/getMember/:membershipId', async (req, res) => {
    try {
      const membershipId = req.params.membershipId;

      const result = await membershipCollection.findOne({
        _id: new ObjectId(membershipId)
      });

      // console.log({ result });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/membership/:membershipId/:status', async (req, res) => {
    try {
      const membershipId = req.params.membershipId;
      const status = req.params.status;
      const result = await membershipCollection.updateOne(
        { _id: new ObjectId(membershipId) },
        { $set: { status: status } }
      );
      console.log({ result });
      // console.log({ result });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/getMembership', async (req, res) => {
    try {
      const email = req.body.email;

      console.log({ email });
      const result = await membershipCollection
        .find({
          authEmail: email
        })
        .toArray();

      res.status(200).json({ success: true, data: result[0] });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post(
    '/order/payment/create',
    // verifyJWT, verifyUser,
    upload.single('file'),
    async (req, res) => {
      try {
        const file = req.file;
        let orderInfo = req.body.orderInfo;
        let referenceNumber = req.body.referenceNumber;
        const authEmail = req.query.userEmail || req.body.userEmail;
        orderInfo = JSON.parse(orderInfo);
        orderInfo.date = moment.tz('Asia/Manila').toDate();
        let updatedInfo = {
          ...orderInfo,
          referenceNumber,
          status: 'pending'
        };

        //Save the orderInfo into the orders collection
        const insertResult = await ordersCollection.insertOne(updatedInfo);

        if (insertResult.insertedId) {
          const objectId = insertResult.insertedId;

          // Extract the ID as a string
          const membershipId = objectId.toString(); // This will give you the ObjectId in string format

          const storageRef = ref(
            firebaseStorage,
            `order/${objectId}/payments/${file.originalname}`
          );
          const metadata = { contentType: file.mimetype };

          // Upload the file to Firebase Storage
          await uploadBytes(storageRef, file.buffer, metadata);

          // Get the file's download URL
          const downloadURL = await getDownloadURL(storageRef);

          const result = await ordersCollection.updateOne(
            { _id: objectId },
            { $set: { payment_prof: downloadURL } }
          );

          const deleteResult = await cartsCollection.deleteMany({
            user_email: orderInfo.email
          });
          res.json({
            success: true,
            message: ''
          });

          // res.send({ insertResult, deleteResult });
        } else {
          throw new Error('Failed to insert payment');
        }
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    }
  );

  router.post('/order/:orderId', async (req, res) => {
    try {
      const orderId = req.params.orderId;

      const result = await ordersCollection.findOne({
        _id: new ObjectId(orderId)
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post(
    '/cart/create_custom_design',
    // verifyJWT, verifyUser,
    upload.array('files'),
    async (req, res) => {
      try {
        const files = req.files;

        let cartId = req.body.cartId;

        await Promise.all(
          files.map(async file => {
            if (cartId) {
              const objectId = cartId;

              // Extract the ID as a string
              cartId = objectId.toString(); // This will give you the ObjectId in string format

              const storageRef = ref(
                firebaseStorage,
                `cart/${objectId}/custom_design/${file.originalname}`
              );
              const metadata = { contentType: file.mimetype };

              // Upload the file to Firebase Storage
              await uploadBytes(storageRef, file.buffer, metadata);

              // Get the file's download URL
              const downloadURL = await getDownloadURL(storageRef);

              // const update = {
              //   $push: { customizeDesignImagesLinks: downloadURL } // Replace with your array property and the string to push
              // };

              const filter = { _id: new ObjectId(cartId) };
              const result = await cartsCollection.updateOne(filter, {
                $push: { customizeDesignImagesLinks: downloadURL }
              });

              // const result = await cartsCollection.updateOne(
              //   { _id: objectId },
              //   { $set: { payment_prof: downloadURL } }
              // );

              // res.json({
              //   success: true,
              //   message: ''
              // });

              // res.send({ insertResult, deleteResult });
            } else {
              throw new Error('Failed to insert payment');
            }
          })
        );
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    }
  );

  // router.get('/getAllUsers', async (req, res) => {
  //   let users = [];
  //   let nextPageToken;

  //   do {
  //     try {
  //       const listUsersResult = await admin
  //         .auth()
  //         .listUsers(1000, nextPageToken);
  //       users = users.concat(listUsersResult.users);
  //       nextPageToken = listUsersResult.pageToken;
  //     } catch (error) {
  //       console.error('Error fetching users:', error);
  //       return res.status(500).send('Error fetching users');
  //     }
  //   } while (nextPageToken);

  //   res.json(users);
  // });

  router.get('/getAllUsers', async (req, res) => {
    let users = [];
    let nextPageToken;

    do {
      try {
        const listUsersResult = await admin
          .auth()
          .listUsers(1000, nextPageToken);
        users = users.concat(listUsersResult.users);

        // for (const userRecord of listUsersResult.users) {
        //   const uid = userRecord.uid;
        //   const email = userRecord.email;

        //   // Check if the user is online
        //   const isOnline = await checkUserOnlineStatus(email);

        //   userRecord.is_online = isOnline;
        // }

        nextPageToken = listUsersResult.pageToken;
      } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).send('Error fetching users');
      }
    } while (nextPageToken);

    //console.log({ users });
    res.json(users);
  });

  return router;
};
