const express = require('express');
const { ObjectId } = require('mongodb');
const verifyJWT = require('../middlewares/verifyJWT');
const verifyAdmin = require('../middlewares/verifyAdmin');
const moment = require('moment-timezone');

const { initializeSocket, getSocketInstance } = require('./../socket.js');

module.exports = (
  ordersCollection,
  productsCollection,
  notificationCollection
) => {
  const router = express.Router();

  // Get all orders
  router.get(
    '/orders',
    // verifyJWT, verifyAdmin,
    async (req, res) => {
      try {
        const result = await ordersCollection
          .find()
          .sort({ date: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        console.log('error getting all orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  // Update order status
  router.put(
    '/orders/:orderId/status',
    // verifyJWT,
    // verifyAdmin,
    async (req, res) => {
      try {
        const { orderId } = req.params;
        const { status } = req.body;

        switch (status) {
          case 'pending':
            message = 'Your order is pending and will be processed soon.';
            break;
          case 'processing':
            message = 'Your order is currently being processed.';
            break;
          case 'delivered':
            message =
              'Your order has been delivered. Thank you for shopping with us!';
            break;
          case 'cancelled':
            message =
              'Your order has been cancelled. If you have any questions, please contact support.';
            break;
          default:
            message = 'Your order status has been updated.';
            break;
        }

        const result = await ordersCollection.updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { status: status } }
        );

        const orderInfo = await ordersCollection.findOne({
          _id: new ObjectId(orderId)
        });
        await notificationCollection.insertOne({
          senderEmail: orderInfo.email,
          recieverEmail: orderInfo.email,
          senderId: '',
          receiverId: '',
          message: message, // Dynamically set message
          relatedEntityName: 'order',
          relatedEntityId: orderInfo._id,
          forAdmin: false,
          dateCreated: new Date() // MongoDB will use the current date and time
        });

        await notificationCollection.insertOne({
          senderEmail: orderInfo.email,
          recieverEmail: null,
          senderId: '',
          receiverId: '',
          message: ``,
          relatedEntityName: 'order',
          relatedEntityId: orderInfo._id,
          forAdmin: true,
          dateCreated: new Date() // MongoDB will use the current date and time
        });
        const io = getSocketInstance();
        io.emit('receiveNotification', {
          relatedEntityId: orderInfo._id,
          recieverEmail: orderInfo.email
        });

        res.send(result);
      } catch (err) {
        console.log('error updating order status:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  router.post('/order/cancel/:orderId', async (req, res) => {
    try {
      const orderId = req.params.orderId;

      const reason = req.body.reason;
      console.log({ reason });

      const result = await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status: 'cancelled', reason: reason } }
      );

      res.send(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add a new product
  router.post(
    '/products',
    // verifyJWT, verifyAdmin,
    async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await productsCollection.insertOne(newProduct);
        res.send(result);
      } catch (err) {
        console.log('Error adding new product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  // Update a single product
  router.put(
    '/products/:id',
    //  verifyJWT, verifyAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        const updatedProduct = req.body;
        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedProduct }
        );
        res.send(result);
      } catch (err) {
        console.log('Error updating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  // Delete a single product from the products
  router.delete(
    '/products/:id',
    // verifyJWT, verifyAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.log('Error deleting product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  // Get all orders
  router.post(
    '/orders/report',
    // verifyJWT, verifyAdmin,
    async (req, res) => {
      const { startDate, endDate } = req.body.selectedDate;

      try {
        const filter = {};

        // Add date range filter if provided
        if (startDate && endDate) {
          // Set startDate to midnight (beginning of the day)
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0); // Set to 12:00 AM

          // Set endDate to the end of the day (just before midnight)
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Set to 11:59:59 PM

          filter.date = {
            $gte: start,
            $lte: end
          };
        }

        const totalOrders = await ordersCollection.countDocuments(filter);
        const totalArraySale = await ordersCollection
          .aggregate([
            {
              $match: {
                ...filter,
                status: { $in: ['processing', 'shipped', 'delivered'] }
              }
            }, // Filter by date range
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$date' }
                }, // Assuming 'createdAt' is your date field
                total: { $sum: '$totalPrice' }
              }
            },
            {
              $sort: { _id: 1 } // Sorting by date in ascending order
            }
          ])
          .toArray();

        console.log({ totalArraySale });
        let totalSales =
          totalArraySale.length > 0 ? totalArraySale[0].total : 0;

        let minus = totalArraySale.length * 120;

        res.json({
          success: true,
          data: {
            totalOrders,
            totalSales: totalSales - minus,
            totalArraySales: totalArraySale.map(v => {
              return {
                ...v,
                date: v._id,
                totalSales: v.total - 120
              };
            })
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  return router;
};
