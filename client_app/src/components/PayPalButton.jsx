import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from "axios";
const PayPalComponent = ({ amount, createOrder }) => {


  return (
    <PayPalScriptProvider options={{
      "client-id": "AaKrK9r6rk6KZX3McNtTA0UWsYVAZAJQqSvc5I8cZFM5PpbxE1wDoZ3_CHq-NOxh_OIrUq9IwfzwneP9",
      currency: "PHP"
    }}>
      <PayPalButtons
        fundingSource="paypal" // Restrict to only PayPal as a funding s
        createOrder={async (data, actions) => {

          // Call the back-end to create the order
          // const response = await axios.post('/create-order', {
          //   amount: '500.00'
          // });
          // return response.data.id; // Order ID from the server

          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: `${amount.toFixed(2).toString()}`, // Replace with the actual amount
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then(async (details) => {

            // create the order and set the status to paid
            console.log({ details })
            await createOrder(details)
            // alert(`Transaction completed by ${details.payer.name.given_name}`);
          });
        }}
        onError={(err) => {
          console.error("PayPal Checkout onError", err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalComponent;
