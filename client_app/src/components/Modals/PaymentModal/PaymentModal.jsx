import { useEffect, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { BsXLg } from "react-icons/bs";
import toast from "react-hot-toast";
import useCart from "../../../hooks/useCart";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { formatPrice } from "../../../utils/formatPrice";
import axios from "axios";
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup'
import InputText from '../../../components/Input/InputText'

import Tesseract from 'tesseract.js';

import PayPalButton from './../../PayPalButton';
import Invoice from './Invoice';
const PaymentModal = ({
  isOpen,
  setIsOpen,
  user,
  totalPrice,
  billingData,
  triggerFormSubmit,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, setCart } = useCart();
  const { axiosSecure } = useAxiosSecure();
  const [cardError, setCardError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const [receiptText, setReceiptText] = useState('');
  const [isValidReceipt, setIsValidReceipt] = useState(true);

  const handleFormModal = async () => {
    if (totalPrice <= 0) {
      return toast.error("Please add some product!");
    } else {
      let isValid = await triggerFormSubmit();

      if (isValid) {
        setIsOpen(true)
      }

    }
  };


  const createOrder = async (paymentDetails) => {
    // e.preventDefault();
    const orderInfo = {
      email: user.email,
      transactionId: '',
      totalPrice,
      quantity: cart.length,
      date: new Date(),
      status: "pending",
      billingData,
      items: cart,
    };


    // console.log(
    //   {
    //     orderInfo,
    //     paymentDetails,

    //   }
    // );

    if (paymentDetails) {
      if (paymentDetails.status === 'COMPLETED') {
        const { payer } = paymentDetails;
        let data = {
          email: payer.email_address,
          firstName: payer.name.given_name,
          lastName: payer.name.surname,
          complete_address: '',
          phone: '',
          add_info: '',
          paymentDetails
        }
        orderInfo.billingData = data;
        orderInfo.status = 'processing';
        await axiosSecure
          .post("/orders", orderInfo, { params: { userEmail: user.email } })
          .then((res) => {

            // setIsOpen(false);
            toast.success("Payment successful! Thank you for your purchase.");
            setCart([]);
            navigate("/my-orders");

          })
          .catch((err) => {
            console.log(err);
          });

      }
    } else {
      await axiosSecure
        .post("/orders", orderInfo, { params: { userEmail: user.email } })
        .then((res) => {

          setIsOpen(false);
          toast.success("Payment successful! Thank you for your purchase.");
          setCart([]);
          navigate("/");

        })
        .catch((err) => {
          console.log(err);
        });
    }




  }
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const orderInfo = {
  //     email: user.email,
  //     // transactionId: paymentIntent.id,
  //     totalPrice,
  //     quantity: cart.length,
  //     date: new Date(),
  //     status: "pending",
  //     billingData,
  //     items: cart,
  //   };



  //   const options = {
  //     method: 'POST',
  //     url: 'https://api.paymongo.com/v1/links',
  //     headers: {
  //       accept: 'application/json',
  //       'content-type': 'application/json',
  //       authorization: 'Basic c2tfdGVzdF9TV0RVZzVjYzNDbnZZd2FnNnpWdGtueXo6'
  //     },
  //     data: {
  //       data: {
  //         attributes: { amount: 10000, description: 'ratan payment', remarks: 'ratan payment' }
  //       }
  //     }
  //   };

  //   let data = await axios
  //     .request(options)
  //     .then(function (response) {
  //       return response.data.data;
  //     })
  //     .catch(function (error) {
  //       console.error(error);
  //     });


  //   const optionsGetLink = {
  //     method: 'GET',
  //     url: `https://api.paymongo.com/v1/links?reference_number=${data.attributes.reference_number}`,
  //     headers: {
  //       accept: 'application/json',
  //       'content-type': 'application/json',
  //       authorization: 'Basic c2tfdGVzdF9TV0RVZzVjYzNDbnZZd2FnNnpWdGtueXo6'
  //     },
  //   };


  //   // console.log({ data })

  //   const result = await axios
  //     .request(optionsGetLink)
  //     .then(function (response) {
  //       return response.data;
  //     })
  //     .catch(function (error) {
  //       console.error(error);
  //     });


  //   console.log(result.data[0].attributes.status)




  //   let { attributes } = data;
  //   let newPageUrl = attributes.checkout_url;

  //   window.open(newPageUrl, "_blank") //to open new page

  //   return true;

  //   if (!stripe || !elements) {
  //     return;
  //   }

  //   const card = elements.getElement(CardElement);
  //   if (card === null) {
  //     return;
  //   }

  //   const { error } = await stripe.createPaymentMethod({
  //     type: "card",
  //     card,
  //   });

  //   if (error) {
  //     console.log("[error]", error);
  //     setCardError(error);
  //   } else {
  //     setCardError(error);
  //   }

  //   setProcessing(true);

  //   const { paymentIntent, error: confirmError } =
  //     await stripe.confirmCardPayment(clientSecret, {
  //       payment_method: {
  //         card: card,
  //         billing_details: {
  //           email: user?.email || "unknown",
  //           name:
  //             `${billingData?.firstName} ${billingData?.lastName}` ||
  //             "anonymous",
  //         },
  //       },
  //     });

  //   if (confirmError) {
  //     console.log("[confirmError]", confirmError);
  //   }

  //   setProcessing(false);

  //   if (paymentIntent.status === "succeeded") {
  //     // save this paymented order info to the server
  //     const orderInfo = {
  //       email: user.email,
  //       transactionId: paymentIntent.id,
  //       totalPrice,
  //       quantity: cart.length,
  //       date: new Date(),
  //       status: "pending",
  //       billingData,
  //       items: cart,
  //     };

  //     axiosSecure
  //       .post("/orders", orderInfo, { params: { userEmail: user.email } })
  //       .then((res) => {
  //         if (
  //           res.data.insertResult.insertedId &&
  //           res.data.deleteResult.deletedCount > 0
  //         ) {
  //           setIsOpen(false);
  //           toast.success("Payment successful! Thank you for your purchase.");
  //           setCart([]);
  //           navigate("/");
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   }
  // };

  useEffect(() => {
    const getClientSecret = async () => {
      try {
        const res = await axiosSecure.post(
          "/payments/create-payment-intent",
          { price: totalPrice },
          { params: { userEmail: user.email } },
        );
        if (res.data.clientSecret) {
          setClientSecret(res.data.clientSecret);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (totalPrice > 0) {
      getClientSecret();
    }
  }, [totalPrice]);


  const [file, setFile] = useState(null);
  const [onlinePaymentModalOpen, setOnlinePaymentModalOpen] = useState(false);



  function validateGCashReceipt(text) {
    // Basic checks based on common GCash receipt fields
    const hasGCash = /GCash/i.test(text);
    const hasReference = /Ref No\./i.test(text);
    const hasAmount = /Amount/i.test(text);
    const hasPhoneNumber = /\+63\s\d{3}\s\d{7}/.test(text);
    const hasDate = /\w{3}\s\d{1,2},\s\d{4}\s\d{1,2}:\d{2}\s(AM|PM)/.test(text);



    // All conditions must be true for it to be considered a valid receipt
    if (hasGCash && hasReference && hasAmount && hasPhoneNumber && hasDate) {
      let refNumber = text.match(/\b\d{4}\s\d{3}\s\d{6}\b/);
      return refNumber[0]
    }
    else {
      return false
    }
  }

  const formikConfigViewReciept = () => {


    let validation = {
      // Proof_Payment: Yup.mixed()
      //   .required('A file is required')
      //   .test(
      //     'fileSize',
      //     'File size is too large',
      //     value => value && value.size <= 2000000 // 2MB
      //   )
      //   .test(
      //     'fileType',
      //     'Unsupported file format',
      //     value => value && ['image/jpeg', 'image/png'].includes(value.type)
      //   ),
      // Comments: Yup.string().required('Required'),
      referenceNumber: Yup.string().required('Required')
    };

    let initialValues = {

      Proof_Payment: '',
      // Comments: '',
      referenceNumber: ''
    }




    return {

      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      validateOnMount: true,
      validateOnChange: true,
      onSubmit: async (values, { setFieldError, setSubmitting, }) => {







        if (!file) {
          setFieldError('Proof_Payment', 'Required');
        }




        if (file && isValidReceipt) {




          const orderInfo = {
            email: user.email,
            transactionId: '',
            totalPrice,
            quantity: cart.length,
            date: new Date(),
            status: "pending",
            billingData,
            items: cart,
          };

          console.log({ orderInfo })
          const formData = new FormData();
          formData.append('file', file);
          formData.append('referenceNumber', values.referenceNumber);
          formData.append('orderInfo', JSON.stringify(orderInfo));



          await axiosSecure
            .post("/users/order/payment/create", formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              params: { userEmail: user.email }
            },)
            .then((res) => {

              if (res.data.success === true) {
                document.getElementById('viewReceipt').close();
                toast.success("Order created successfully.");
                navigate('/my-orders')

              } else {
                toast.error("Something went wrong");
              }

            })

        }




      }
    }
  };

  return (
    <>
      <div className="mt-10 text-center">
        <dialog id="viewReceipt" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 bg-white"
                onClick={() => {
                  //  setisEditModalOpen(false)
                }}>✕</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className='p-2 shadow p-4'>
                <h2 className='text-2xl font-bold mb-2'>
                  Step 1: Pay</h2>

                <div className="p-2 space-y-4 md:space-y-6 sm:p-4">


                  <div className="divider font-bold">Scan QR</div>

                  <p className='text-center'>Please pay  <span className='font-bold text-green-500'>
                    {formatPrice(totalPrice)}
                  </span> using the QR Code below.</p>

                  <div className="flex justify-center items-center p-4">
                    <div className="w-3/4 h-1/2">
                      <img
                        src={'https://firebasestorage.googleapis.com/v0/b/ratan-eccomerce.appspot.com/o/QR.jpg?alt=media&token=4688da21-7b7b-4363-827e-8ebcb9daf8c9'}

                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>





                </div>
              </div>
              <div className='p-2 shadow-2xl p-4'>

                <h2 className='text-2xl font-bold mb-2 '>
                  Step 2: Upload Proof of Payment</h2>

                <div className="p-2 space-y-4 md:space-y-6 sm:p-4">




                  <Formik {...formikConfigViewReciept()}>
                    {({
                      handleSubmit,
                      handleChange,
                      handleBlur, // handler for onBlur event of form elements
                      values,
                      touched,
                      errors,
                      submitForm,
                      setFieldTouched,
                      setFieldValue,
                      setFieldError,
                      setErrors,
                      isSubmitting,

                    }) => {


                      return <Form className="">
                        <div
                        >

                          {
                            console.log({ isValidReceipt })
                          }

                          <div
                            className={
                              !isValidReceipt
                                ? `mt-2 p-2 border-solid border-2 border-red-500`
                                : ``
                            }>

                            {
                              !isValidReceipt && <label className="text-red-500"> Image is not a valid reciept.</label>
                            }


                            <InputText

                              label="Upload"
                              name="Proof_Payment"
                              type="file"
                              accept="image/*"
                              placeholder=""
                              value={values.Proof_Payment}
                              onChange={(e) => {
                                let file = e.target.files[0];
                                setFile(file);

                                // console.log(file.name)
                                if (file) {
                                  Tesseract.recognize(
                                    file,
                                    'eng',

                                  ).then(({ data: { text } }) => {

                                    const refNumber = validateGCashReceipt(text)

                                    if (refNumber) {
                                      // setFieldValue('Proof_Payment', file)
                                      setFieldValue('referenceNumber', refNumber)
                                      setIsValidReceipt(true)
                                    } else {
                                      console.log("dex")
                                      setIsValidReceipt(false)
                                      setFieldValue('referenceNumber', '')
                                      setFieldError('Proof_Payment', 'Invalid Image');
                                      // setErrors({ Proof_Payment_Validation: 'Invalid' });
                                    }




                                  });

                                  let fileDetails = validateGCashReceipt(file)


                                  blah.src = URL.createObjectURL(file);
                                  // setFieldValue('Proof_Payment', file);
                                  // setFieldValue("Proof_Payment", e.currentTarget.files[0]);
                                }
                                else {
                                  setFieldValue('Proof_Payment', '');
                                }

                              }}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                          </div>
                          <div class="flex justify-center items-center">


                            <img id="blah" alt="" preview className='object-fit h-60 w-40 ' />




                          </div>


                          {/* <div
                                                className={
                                                    errors.Comments
                                                        ? `mt - 2 p - 2 border - solid border - 2 border - red - 500`
                                                        : `mt - 2 p - 2 `
                                                }> */}

                          <InputText

                            label="Reference #"
                            name="referenceNumber"
                            type="text"
                            placeholder=""
                            value={values.referenceNumber}

                            onBlur={handleBlur} // This apparently updates `touched`?
                          />

                          {/* <InputText

                            label="Comments"
                            name="Comments"
                            type="text"
                            placeholder=""
                            value={values.Comments}

                            onBlur={handleBlur} // This apparently updates `touched`?
                          /> */}
                          {/* </div> */}
                          <button
                            // type="button"
                            disabled={isSubmitting}
                            type="submit"
                            className={
                              'btn mt-4 shadow-lg w-full bg-green-500 font-bold text-white'
                            }>
                            Submit
                          </button>

                        </div>


                      </Form>
                    }}
                  </Formik>



                </div>
              </div>   </div>
          </div>
        </dialog>


        <PayPalButton amount={totalPrice} createOrder={createOrder} />
        <hr />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.9 }}

          onClick={async () => {
            let isValid = await triggerFormSubmit('onlinePayment');

            // console.log({ billingData })
            // console.log({ isOpen })


            if (isValid) {
              isOpen = false;
              setOnlinePaymentModalOpen(true);
              document.getElementById('viewReceipt').showModal();
            }



            // setSelectedOrder(thisOrder);




          }}

          // onClick={handleSubmit}
          className="rounded-2xl w-full  bg-blue-500 text-white border border-black px-24 py-4 text-xl transition-all hover:border-transparent hover:text-white"
        >
          Gcash
        </motion.button>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.9 }}
          onClick={handleFormModal}
          className="mt-4 rounded-2xl bg-green-500 text-white w-full border border-black px-24 py-4 text-xl transition-all hover:border-transparent hover:bg-primary hover:text-white"
        >
          Cash on Delivery
        </motion.button>
      </div>
      <Transition appear show={isOpen && !onlinePaymentModalOpen}>
        <Dialog
          open={isOpen && !onlinePaymentModalOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50 font-Poppins"
        >
          <div className="fixed inset-0 flex w-screen items-center justify-center overflow-y-auto bg-black/50 px-[4%]">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-300"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="h-fit w-full max-w-2xl space-y-4 rounded-xl border bg-white px-6 py-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Payment details</h3>
                  <BsXLg
                    onClick={() => setIsOpen(false)}
                    className="text-cadetGray cursor-pointer text-xl transition-all hover:text-black"
                  />
                </div>
                <div>
                  {/* <p className="font-semibold text-green-600">Demo Card:</p>
                  <div className="sm:space-x-2">
                    <small>
                      <span className="font-semibold text-green-600">
                        Card Number:{" "}
                      </span>
                      4242 4242 4242 4242
                    </small>
                    <br className="sm:hidden" />
                    <small className="mr-2 sm:mr-0">
                      <span className="font-semibold text-green-600">
                        MM/YY:{" "}
                      </span>
                      12 / 40
                    </small>
                    <small className="mr-2 sm:mr-0">
                      <span className="font-semibold text-green-600">
                        CVC:{" "}
                      </span>
                      123
                    </small>
                    <small>
                      <span className="font-semibold text-green-600">
                        ZIP:{" "}
                      </span>
                      12345
                    </small>
                  </div> */}
                </div>
                <form className="!mt-8">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                        },
                        invalid: {
                          color: "#9e2146",
                        },
                      },
                    }}
                  />
                  {cardError && (
                    <p className="mt-3 text-[13px] text-red-600">
                      {cardError.message}
                    </p>
                  )}

                  <div className="mt-14 space-y-4 border-b pb-2 text-sm">
                    <div className="flex items-center justify-between">
                      <p>Subtotal</p>
                      <p>{formatPrice(totalPrice)}</p>
                    </div>
                    {/* <div className="flex items-center justify-between">
                      <p>Sales tax</p>
                      <p>$0.00</p>
                    </div> */}
                  </div>
                  <div className="mb-10 mt-2 flex items-center justify-between text-sm font-semibold">
                    <p>Total</p>
                    <p>{formatPrice(totalPrice)}</p>
                  </div>

                  <button
                    type="submit"
                    onClick={async () => {
                      await createOrder()
                    }}
                    // disabled={!stripe || !clientSecret || processing}
                    className={`block w-full rounded-md bg-primary px-3 py-2 font-medium text-white transition-all ${!stripe || !clientSecret || (processing && "bg-[#b88f2fc7]")}`}
                  >
                    Place your order
                  </button>

                  <p className="mt-10 text-center text-xs">
                    Review the{" "}
                    <span className="cursor-pointer underline">
                      terms and conditions
                    </span>
                  </p>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default PaymentModal;
