import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { BsPlus } from "react-icons/bs";
import { FaBoxOpen } from "react-icons/fa";
import { useLoaderData, useParams } from "react-router-dom";
import { scrollToTop } from "../../../../utils/scrollUtils";
import Pagination from "../../../../components/Pagination/Pagination";
import ProductListAdmin from "../../../../components/ProductListAdmin/ProductListAdmin";

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../../../components/DataTables/Table'; // new

import Dropdown from '../../../../components/Input/Dropdown';
import InputText from '../../../../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import { regions, provinces, cities, barangays, regionByCode, provincesByCode, provinceByName } from "select-philippines-address";

import toast from "react-hot-toast";
import { formatPrice } from "../../../../utils/formatPrice";
import { dateFormatMDY } from "../../../../utils/dateFormatMDY";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";



import React from 'react';
import ReactToPrint from 'react-to-print';
import jsPDF from 'jspdf';

import Invoice from './Invoice';

import { Check } from "lucide-react";

function PaymentReceipt({ billingData, items, totalPrice }) {
  const generateReceiptNumber = () => {
    const base = 6000000; // Starting number
    const randomOffset = Math.floor(Math.random() * 1000); // Random offset (0 to 999)
    return `No. ${base + randomOffset}`;
  };

  const handlePrint = () => {
    const printContents = document.getElementById("receipt").innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  };
  const printStyles = `
  @media print {
    .timestamp, .page-title {
      display: none !important;
    }
  }
`;


  return (
    <div>


      <div className="flex justify-between">
        <div></div>
        <button className="btn btn-sm ml-auto flex" onClick={handlePrint}>
          Download Receipt
        </button>
      </div>


      <div className="min-h-screen bg-base-100 flex items-center 
    justify-center p-4" id="receipt">

        <div className="w-full max-w-md bg-white border border-gray-200 p-4 text-xs">
          {/* Header */}
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <div className="w-12 h-12">
                <img
                  src="/src/assets/logo/logo.png"
                  alt="Sandbox logo"
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h1 className="font-bold text-sm">EFurnish</h1>
                {/* <p className="font-semibold">CRIS P. BACON - PROPRIETOR</p> */}
                <p className="text-gray-600">REG TIN 123-456-789-00000</p>
                <p className="text-gray-600">
                  Zone 2, San Jose, Alanao Lupi Camarines Sur
                </p>
              </div>
            </div>
            <div className="text-red-600 font-semibold"> {generateReceiptNumber()}</div>
          </div>

          {/* Receipt Title */}
          <h2 className="text-base font-semi-bold mb-4 text-start">PAYMENT RECEIPT</h2>

          {/* Payment Method */}
          <div className="flex justify-between ">
            <div className="gap-4 mb-4">
              {["CASH", "CREDIT CARD"].map((method) => {

                let isonline = method === 'CASH';

                return <label key={method} className="flex items-center gap-1">
                  <div className="w-3 h-3 border border-gray-400 flex items-center justify-center">
                    <Check

                      className={`w-3 h-3  ${!!isonline ? "" : "hidden"}`} // Show check if selected
                    />
                  </div>
                  {method}
                </label>
              })}
            </div>

            {/* Payment Details */}
            <div className="gap-4 mb-4 col ">
              {["Payment Date", "Account No"].map((label) => {

                let mapped = {
                  "Payment Date":
                    new Date(billingData.paymentDetails?.create_time).toLocaleDateString()

                }

                let value = mapped[label] || 'N/A';
                return <div key={label} className="flex ">
                  <label className="block text-gray-700">{label}:</label>
                  <span className=" ml-2 text-gray-700">{value}</span>
                </div>
              })}
            </div>
          </div>

          {/* Received From Section */}
          <div className="border border-gray-900 p-2 mb-4">
            <h3 className="font-bold mb-2 border-b border-gray-900">RECEIVED FROM:</h3>
            {["Registered Name", "TIN", "Business Address"].map((field) => {

              let mapped = {
                "Registered Name": `${billingData.firstName} ${billingData.lastName}`
              }

              let value = mapped[field] || 'N/A';
              return <div key={field} className="mb-2">
                <div className="flex justify-between">
                  <label className="text-gray-700">{field}:</label>
                  <span className="text-gray-900">{value}</span>
                </div>
              </div>
            })}
          </div>

          {/* Transaction Table */}
          <div className="mb-4">
            <table className="w-full border border border-gray-900 text-left">
              <thead className="border border-gray-900 ">
                <tr className="bg-base-300 ">
                  <th className="p-2">
                    <span className="font-semibold">Description of Transaction/Nature of Service</span>
                  </th>
                  <th className=" p-2 text-right">

                    <span className="font-semibold">


                      Amount


                    </span>

                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 1 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="border-b border-gray-900 p-2">
                      {idx === 0 ? `Payment for 
                    
                    ${items.map(item => item.title).join(', ')}
                    
                    ` : ""}
                    </td>
                    <td className="border-b border-gray-900 p-2 text-right">

                      {formatPrice(totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Warning and Total */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-red-600 font-bold max-w-[200px] text-center">
              "THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAX."
            </div>
            <div className="border border-gray-900 p-0 w-[350px]">
              <div className="flex justify-between mb-2  border-gray-900 p-1 border-b border-gray-900 ">
                <label className="block text-gray-700 mb-1 font-bold 

           order-r border-gray-900 

              ">TOTAL PAID AMOUNT</label>

                <label className="block text-gray-700 ">
                  {formatPrice(totalPrice)}
                </label>

                {/* <input
                type="text"
                value={formatPrice(totalPrice)}
                className="block w-full border-none border-gray-300 rounded px-2 py-1"
              /> */}
              </div>

              <div className="flex justify-between mb-2 p-1">
                <label className="text-gray-700 font-bold">Invoice Reference No.:</label>
                {/* <input
                type="text"
                value={billingData.paymentDetails.id}
                className="block w-full border-none border-gray-300 rounded px-2 py-1"
              /> */}
                <label className="text-gray-700 font-bold">{billingData.paymentDetails?.id}</label>

              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="text-gray-600 border-t border-gray-900 pt-2 text-xxs">
            <div className="flex justify-between border-b border-gray-900 ">
              <div>
                <div>PERMIT TO USE LOOSE LEAF NO.: LLSI040224-00027</div>
                <div>DATE ISSUED: 31-FEB-2024</div>
              </div>
              <div className="text-right">
                <div>BIR AUTHORITY TO PRINT NO.: 4AU0000807820</div>
                <div>APPROVED SERIES: 5000001 - 5000500 10BKLTS (3X)</div>
              </div>
            </div>
          </div>

        </div>
      </div >
    </div>
  );
}





const PaymentDetailsTable = ({ data }) => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Receipt</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Field</th>
            <th className="border border-gray-300 px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {/* Customer Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Customer Email</td>
            <td className="border border-gray-300 px-4 py-2">{data.email}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">First Name</td>
            <td className="border border-gray-300 px-4 py-2">{data.firstName}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Last Name</td>
            <td className="border border-gray-300 px-4 py-2">{data.lastName}</td>
          </tr>

          {/* Payment Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payment ID</td>
            <td className="border border-gray-300 px-4 py-2">{data.paymentDetails.id}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payment Intent</td>
            <td className="border border-gray-300 px-4 py-2">{data.paymentDetails.intent}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payment Status</td>
            <td className="border border-gray-300 px-4 py-2">{data.paymentDetails.status}</td>
          </tr>

          {/* Purchase Unit Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Purchase Amount</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].amount.value}{" "}
              {data.paymentDetails.purchase_units[0].amount.currency_code}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payee Email</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].payee.email_address}
            </td>
          </tr>

          {/* Shipping Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Shipping Name</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].shipping.name.full_name}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Shipping Address</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].shipping.address.address_line_1},
              {data.paymentDetails.purchase_units[0].shipping.address.admin_area_2},
              {data.paymentDetails.purchase_units[0].shipping.address.admin_area_1},
              {data.paymentDetails.purchase_units[0].shipping.address.postal_code},
              {data.paymentDetails.purchase_units[0].shipping.address.country_code}
            </td>
          </tr>

          {/* Payer Info */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payer Name</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.payer.name.given_name}{" "}
              {data.paymentDetails.payer.name.surname}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payer Email</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.payer.email_address}
            </td>
          </tr>

          {/* Transaction Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Transaction ID</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].payments.captures[0].id}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Transaction Status</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].payments.captures[0].status}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Transaction Amount</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].payments.captures[0].amount.value}{" "}
              {data.paymentDetails.purchase_units[0].payments.captures[0].amount.currency_code}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Capture Time</td>
            <td className="border border-gray-300 px-4 py-2">
              {new Date(
                data.paymentDetails.purchase_units[0].payments.captures[0].create_time
              ).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
const ProductManagement = () => {
  const { axiosSecure } = useAxiosSecure();
  const [products, setProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortValue, setSortValue] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  // products pagination start index and end index
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;
  const params = useParams()

  let orderId = params.id;



  console.log({ orderId })


  const [orderDetails, setOrderDetails] = useState({});
  const [address_region, setaddress_region] = useState('');
  const [address_province, setaddress_province] = useState('');
  const [address_city, setaddress_cities] = useState('');
  const [address_barangay, setaddress_barangay] = useState('');
  const fetchDetails = async () => {

    let res = await axios({
      method: 'POST',
      url: `users/order/${orderId}`
    })

    setOrderDetails(res.data.data)

    setIsLoaded(true)

  };
  useEffect(() => {
    fetchDetails();

  }, []);




  let status = orderDetails.status;
  const steps = [
    { label: 'Order Placed', completed: status },
    { label: 'Admin Confirmed', completed: status === 'processing' || status === 'shipped' || status === 'delivered' },
    { label: 'In Transit', completed: status === 'shipped' || status === 'delivered' },
    { label: 'Delivered', completed: status === 'delivered' },
  ];

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axiosSecure.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (res.data.modifiedCount > 0) {
        fetchDetails()
        toast.success("Order status updated successfully");
      } else {
        toast.error("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    }
  };


  const formikConfig = () => {

    return {
      initialValues: {

      },
      validationSchema: Yup.object({
        email: Yup.string().required('Required field'),
        password: Yup.string()
          .min(8, 'Minimun of 8 character(s)')
          .required('Required field')
      }),
      onSubmit: async (
        values,
        { setSubmitting, setFieldValue, setErrorMessage, setErrors }
      ) => {

      }
    }
  }


  const handleApproveRequest = async (membershipId, status) => {

    console.log({ membershipId })
    let res = await axios({
      method: 'POST',
      url: `users/membership/${membershipId}/${status}`
    });

    fetchDetails()

    if (status === 'REJECTED') {
      toast.error("Rejected");
      document.getElementById('rejectModal').close();

    } else {
      document.getElementById('approveModal').close();
      document.getElementById('approveModal').close();
      toast.success("Success");
    }



  };

  const componentRef = useRef();

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.html(componentRef.current, {
      callback: () => {
        doc.save('invoice.pdf');
      },
      x: 10,
      y: 10,
    });
  };


  return (
    <section className="product-management">
      {/* Change page title */}
      <Helmet>
        <title>Manage Products - EFurnish</title>
      </Helmet>
      {/* Total products and new product button */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 bg-white px-[4%] py-7 shadow-sm md:px-5">
        <h3 className="flex items-center gap-1 font-semibold sm:text-xl">
          Order Details
        </h3>




        {/* <ReactToPrint
          trigger={() => (
            <button
              onClick={handleDownloadPDF}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Download Receipt
            </button>
          )}
          content={() => componentRef.current}
        /> */}
        {/* <Link
          to="/dashboard/add-product"
          className="flex items-center gap-0.5 rounded-md border border-primary bg-primary px-5 py-2 text-xs font-medium text-white transition-all hover:bg-[#967426]"
        >
          <BsPlus size={22} />
          Add
        </Link> */}
      </div>
      {/* Products list container */}
      {isLoaded &&
        <div className="mt-6 divide-y ">
          <div className="">
            <div className="max-w-md mx-auto mt-4">

              {/* <div style={{ display: 'none' }}>
                <Invoice ref={componentRef} />
              </div> */}
              {/* <Invoice orderDetails={orderDetails} /> */}
              {/* <div className="bg-yellow-200 border border-yellow-400 text-yellow-800 px-4 py-3 rounded flex items-center" role="alert">
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M12 4h.01M12 20h.01M4.293 4.293a1 1 0 010 1.414L12 12l7.707-7.293a1 1 0 10-1.414-1.414L12 10.586 4.293 4.293z"
                  />
                </svg>
                <span>Please double-check the payment proof and receipt before changing the status to Processing.</span>
              </div> */}
            </div>


            <div className="">
              <Formik {...formikConfig()}>
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur, // handler for onBlur event of form elements
                  values,
                  touched,
                  errors,
                  setFieldValue,
                  isSubmitting
                }) => {

                  return <div className="flex flex-col md:flex-row">
                    <div className=" flex-1  max-w-3xl mx-4 p-8 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {/* Header Section */}


                      {/* Billing and Client Info */}
                      <div className="flex justify-between mb-6">
                        <div>
                          <StatusPill value={orderDetails.status} />
                          {/* <StatusPill value={orderDetails.status !== 'pending' && orderDetails.payment_prof ? 'PAID' : orderDetails.status} /> */}
                          <h3 className="text-lg font-bold mt-2">Billed To:</h3>
                          <p className="text-gray-700">{
                            `${orderDetails.billingData.firstName} ${orderDetails.billingData.lastName}`
                          }</p>
                          <p className="text-gray-700">{
                            `${orderDetails.billingData.complete_address}`
                          }</p>
                        </div>
                        {/* <div>
                          <h3 className="text-lg font-bold">Company Info:</h3>
                          <p className="text-gray-700">Company Name</p>
                          <p className="text-gray-700">123 Business Rd, City, Country</p>
                        </div> */}
                      </div>

                      {/* Table Section */}
                      <table className="w-full mb-6 border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Item</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Quantity</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Price</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Total</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Image</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Customization</th>
                          </tr>
                        </thead>
                        <tbody>

                          {
                            orderDetails.items.map((item) => {
                              return <tr>
                                <td className="border px-4 py-2">{item.title}</td>
                                <td className="border px-4 py-2">{item.quantity}</td>
                                <td className="border px-4 py-2">{formatPrice(item.price)}</td>
                                <td className="border px-4 py-2">{formatPrice(item.price * item.quantity)}</td>
                                <td className="border px-4 py-2">
                                  <img src={item.thumbnail} alt="Proof of Payment 2" className="w-12 h-12 object-cover" />
                                </td>
                                <td className="border px-4 py-2">
                                  <div
                                    style={{ backgroundColor: item.color }} // Use inline style for hex color
                                    className="w-20 h-18 inline-block m-2 flex items-center justify-center"
                                  >
                                    {/* Optional: Display the hex code */}
                                    <span className="text-white font-bold">{item.color}</span>
                                  </div>
                                </td>
                              </tr>

                            })
                          }


                        </tbody>
                      </table>

                      {/* Summary Section */}
                      <div className="flex justify-end mb-6">
                        <div className="w-full sm:w-1/3">
                          <div className="flex justify-between py-2">
                            <span className="font-bold">Subtotal:</span>
                            <span>
                              {formatPrice(orderDetails.totalPrice)}</span>
                          </div>

                          <div className="flex justify-between py-2 border-t-2 border-gray-200 pt-2">
                            <span className="font-bold">Total:</span>
                            <span>    {formatPrice(orderDetails.totalPrice)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <h1 className="text-xl font-bold mt-10">Tracking</h1>


                      {
                        orderDetails.status === 'cancelled' && <div className="bg-red-200 
  border border-red-400 text-red-800 px-4 py-3 rounded flex items-center" role="alert">
                          <svg
                            className="w-5 h-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M12 4h.01M12 20h.01M4.293 4.293a1 1 0 010 1.414L12 12l7.707-7.293a1 1 0 10-1.414-1.414L12 10.586 4.293 4.293z"
                            />
                          </svg>
                          <span>Cancellation Reason: {orderDetails.reason}</span>
                        </div>
                      }

                      {
                        orderDetails.status !== 'cancelled' && <div className="flex justify-between items-center my-10">
                          {steps.map((step, index) => (
                            <div key={index} className="flex items-center w-full">
                              {/* Step Indicator */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center 
${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                  {step.completed ? (
                                    <svg
                                      className="w-5 h-5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <span className="text-gray-600">{index + 1}</span>
                                  )}
                                </div>
                                <span className="mt-2 text-sm text-gray-700">{step.label}</span>
                              </div>

                              {/* Step Connector */}
                              {index < steps.length - 1 && (
                                <div className="flex-1 h-1 relative">
                                  <div
                                    className={`absolute inset-0 h-full 
${steps[index + 1].completed ? 'bg-green-500' : 'bg-gray-300'}`}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      }

                    </div>

                    <div className=" flex-1  max-w-3xl mx-4 p-8 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <h1 className="text-xl font-bold">Payment</h1>
                      <PaymentReceipt
                        items={orderDetails.items}
                        totalPrice={orderDetails.totalPrice}
                        billingData={orderDetails.billingData} />
                      <div className="p-4 flex flex-col items-center">


                        {
                          orderDetails.payment_prof && <img
                            src={orderDetails.payment_prof}
                            alt="Placeholder"
                            className="mt-4 w-20 h-100"
                          />
                        }
                        {
                          (!orderDetails.billingData.paymentDetails && !orderDetails.payment_prof) && <h1 className="text-xl font-bold text-green-500">Cash on Delivery</h1>
                        }
                      </div>

                      {/* {
                        orderDetails.billingData.paymentDetails &&
                        <div ref={componentRef} >
                          <PaymentDetailsTable data={orderDetails.billingData} />
                        </div>
                      } */}



                      {orderDetails.referenceNumber && <div>
                        <h1 className="text-xl font-bold mb-2">Reference #</h1>
                        <p>{orderDetails.referenceNumber}</p>
                      </div>}



                    </div>

                  </div>

                }}
              </Formik>
            </div >


            {/* <p className="w-full text-sm font-medium text-gray-700">
            Manage all of your products
          </p>
          <div className="flex w-full items-center justify-end gap-2">
            <p className="text-sm font-medium text-gray-700">Sort By:</p>
            <select
              onChange={handleSort}
              id="product_order_list"
              className="rounded bg-[#ffe5a8] px-2 py-1 text-sm outline-none"
            >
              <option value="desc" className="bg-[#ffe5a8]">
                Latest (desc)
              </option>
              <option value="asc" className="bg-[#ffe5a8]">
                Oldest (asc)
              </option>
            </select>
          </div> */}
          </div>

          <dialog id="approveModal" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-lg">Approval Confirmation</h3>
              <p className="py-4">Are you sure you want to approve this request?</p>
              <div className="modal-action">
                <button
                  type="submit"
                  onClick={async () => {
                    await handleApproveRequest(membershipId, 'APPROVED');
                  }}
                  className={
                    'btn mt-2 bg-green-500 text-white font-bold'

                  }>
                  Approve
                </button>
              </div>
            </div>
          </dialog>
          <dialog id="rejectModal" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-lg"> Confirmation</h3>
              <p className="py-4">Are you sure you want to reject this request?</p>
              <div className="modal-action">
                <button
                  type="submit"
                  onClick={async () => {
                    await handleApproveRequest(membershipId, 'REJECTED');
                  }}
                  className={
                    'btn mt-2 bg-red-500 text-white font-bold'

                  }>
                  Reject
                </button>
              </div>
            </div>
          </dialog>

        </div >
      }
    </section >
  );
};

export default ProductManagement;
