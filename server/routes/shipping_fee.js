const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = shippingFeeCollection => {
  const router = express.Router();

  // Get all provinces with municipalities and fees
  router.get('/', async (req, res) => {
    try {
      const provinces = await shippingFeeCollection.find().toArray();
      res.json(provinces);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });
  // Add a new province with its municipalities
  router.post('/', async (req, res) => {
    const { fee, municipality, province } = req.body; // Extract data from the request body

    try {
      // Update the document for the specified province, adding the new municipality and fee
      const result = await shippingFeeCollection.updateOne(
        { province }, // Find the document with the specified province
        {
          $push: {
            municipalities: {
              name: municipality,
              fee: fee
            }
          }
        },
        { upsert: true } // If no document exists for the province, create a new one
      );

      // Return a success response
      res
        .status(200)
        .json({ message: 'Municipality added successfully', result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Update a specific municipality's fee in a province
  router.put('/:province', async (req, res) => {
    const { province } = req.params;
    const { municipality, fee } = req.body;

    try {
      // Find the province
      const provinceData = await shippingFeeCollection.findOne({ province });

      if (!provinceData) {
        return res.status(404).json({ error: 'Province not found' });
      }

      // Find the municipality in the province
      const municipalityIndex = provinceData.municipalities.findIndex(
        m => m.name === municipality
      );

      if (municipalityIndex === -1) {
        return res.status(404).json({ error: 'Municipality not found' });
      }

      // Update the municipality fee
      provinceData.municipalities[municipalityIndex].fee = fee;

      // Update the document in the database
      const result = await shippingFeeCollection.updateOne(
        { province },
        {
          $set: { municipalities: provinceData.municipalities }
        }
      );

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Delete a municipality from a province
  router.delete('/:province/:municipality', async (req, res) => {
    const { province, municipality } = req.params;

    try {
      // Find the province
      const provinceData = await shippingFeeCollection.findOne({ province });

      console.log({ provinceData });
      if (!provinceData) {
        return res.status(404).json({ error: 'Province not found' });
      }

      // Find and remove the municipality
      const municipalityIndex = provinceData.municipalities.findIndex(
        m => m.name === municipality
      );

      if (municipalityIndex === -1) {
        return res.status(404).json({ error: 'Municipality not found' });
      }

      // Remove the municipality from the array
      provinceData.municipalities.splice(municipalityIndex, 1);

      // Update the document in the database
      const result = await shippingFeeCollection.updateOne(
        { province },
        {
          $set: { municipalities: provinceData.municipalities }
        }
      );

      res
        .status(200)
        .json({ message: 'Municipality deleted successfully', result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
