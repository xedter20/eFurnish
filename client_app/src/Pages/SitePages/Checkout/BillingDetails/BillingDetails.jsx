import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentModal from "../../../../components/Modals/PaymentModal/PaymentModal";
import { calculateTotalPrice } from "../../../../utils/calculateTotalPrice";
import { formatPrice } from "../../../../utils/formatPrice";
import useAuth from "../../../../hooks/useAuth";
import useCart from "../../../../hooks/useCart";
import { productDetails } from "../../../../assets/data/productDetails";
const stripePromise = loadStripe(import.meta.env.VITE_Payment_Gateway_PK);



import Dropdown from '../../../../components/Input/Dropdown';
import InputText from '../../../../components/Input/InputText';
import { Formik, useField, useFormik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { getFirestore, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

import axios from "axios";
const db = getFirestore();
const BillingDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, setCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const { axiosSecure } = useAxiosSecure();
  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [shippingFees, setShippingFees] = useState([]);
  // Fetch shipping fees from backend on mount
  useEffect(() => {
    const fetchShippingFees = async () => {
      try {
        const response = await axios.get('/shipping-fees'); // Adjust the API endpoint as needed
        setShippingFees(response.data);
      } catch (error) {
        console.error('Error fetching shipping fees:', error);
        toast.error('Error fetching shipping fees');
      }
    };

    fetchShippingFees();
  }, []);


  const prepareAddress = async () => {
    await regions().then(region => {
      setRegions(
        region.map(r => {
          return {
            value: r.region_code,
            label: r.region_name
          };
        })
      );
    });
    // await regionByCode('01').then(region => console.log(region.region_name));
    await provinces().then(province => console.log(province));
    // await provincesByCode('01').then(province => console.log(province));
    // await provinceByName('Rizal').then(province =>
    //   console.log(province.province_code)
    // );
    await cities().then(city => console.log(city));
    await barangays().then(barangays => console.log(barangays));
  };
  useEffect(() => {
    prepareAddress();
  }, []);

  const [currentUser, setCurrentUser] = useState([]);
  const fetchUsers = async () => {
    try {



      const userRef = doc(db, "users", user.uid); // Assuming "users" is your collection

      // // Check if the user already exists in the collection
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Document exists, get its data
        const userData = userDoc.data();
        console.log("User Document Data:", userData);
        setCurrentUser(userData)
        await provincesByCode(userData.address_region).then(
          province => {
            setProvince(
              province.map(p => {
                return {
                  value: p.province_code,
                  label: p.province_name
                };
              })
            );
          }
        );

        await cities(userData.address_province).then(cities => {
          setCity(
            cities.map(p => {
              return {
                value: p.city_code,
                label: p.city_name
              };
            })
          );
        });

        await barangays(userData.address_city).then(cities => {
          setBarangay(
            cities.map(p => {

              return {
                value: p.brgy_code,
                label: p.brgy_name
              };
            })
          );
        });


      } else {
        // Document does not exist
        console.log("No such document!");

      }


      setIsLoaded(true);

    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  useEffect(() => {
    fetchUsers();

  }, []);

  console.log({ user: user.uid })
  const [billingData, setBillingData] = useState({});
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm();

  // Total price of the cart items
  const [cityShipp, setShippCity] = useState(120);

  const totalPrice = parseFloat(calculateTotalPrice(cart, cityShipp));

  // Handle billing details form
  const onSubmit = (data) => {
    if (data) {
      // setIsOpen(true);
      setBillingData(data);
    }
  };

  // Trigger billing details form
  const triggerFormSubmit = async () => {
    const isValid = await trigger();
    if (isValid) {
      handleSubmit(onSubmit)();
    }
    return isValid;
  };





  const formikConfig = {
    initialValues: {
      firstName: currentUser.name,
      lastName: currentUser.lastName,
      address_region: currentUser.address_region,
      address_province: currentUser.address_province,
      address_city: currentUser.address_city,
      address_barangay: currentUser.address_barangay,
      streetAddress: currentUser.streetAddress,
      zipCode: currentUser.zipCode,
      mobileNumber: currentUser.mobileNumber
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('Required field'),
      lastName: Yup.string().required('Required field'),
      address_region: Yup.string().required('Required field'),
      address_province: Yup.string().required('Required field'),
      address_city: Yup.string().required('Required field'),
      address_barangay: Yup.string().required('Required field'),
      streetAddress: Yup.string().required('Required field'),
      zipCode: Yup.string().required('Required field'),
      mobileNumber: Yup.string()
        .matches(/^9\d{9}$/, "Must be a valid PH mobile number (9xxxxxxxxx)")
        .required("Mobile number is required"),

    }),
    onSubmit: async (
      values,
      { setSubmitting, setFieldValue, setErrorMessage, setErrors }
    ) => {

      // console.log({ values })

      let { address_region, address_province, address_city, address_barangay, streetAddress } = values;


      let address_region_value = await regionByCode(address_region)
      let address_province_value = await provincesByCode(address_region).then((data) => {
        return data.find(p => p.province_code === address_province)
      })



      let address_cities_value = await cities(address_province).then((data) => {
        return data.find(p => p.city_code === address_city)
      })


      let address_barangay_value = await barangays(address_city).then((data) => {
        return data.find(p => p.brgy_code === address_barangay)
      })



      const orderInfo = {
        email: user.email,
        transactionId: '',
        totalPrice,
        quantity: cart.length,
        date: new Date(),
        status: "pending",
        billingData: {
          ...values, complete_address: `${streetAddress}, ${address_barangay_value?.brgy_name}, 
          ${address_cities_value?.city_name}, ${address_province_value.province_name}, ${address_region_value.region_name}`
        },
        items: cart,
      };

      console.log({ orderInfo })
      await axiosSecure
        .post("/orders", orderInfo, { params: { userEmail: user.email } })
        .then((res) => {

          setIsOpen(false);
          toast.success("Payment successful! Thank you for your purchase.");
          setCart([]);
          navigate("/my-orders");

        })
        .catch((err) => {
          console.log(err);
        });




    }
  };





  return isLoaded && (
    <div className="mb-12 mt-16 px-[4%] md:px-[7%]">
      <Formik {...formikConfig}>
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
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            const getCity = async () => {
              if (values.address_province && values.address_city) {
                const data = await cities(values.address_province);
                const selectedCity = data.find(p => p.city_code === values.address_city);


                const searchString = selectedCity.city_name; // The string to search for

                // Extract the base part of the search string (e.g., "Legazpi City")
                const baseSearchString = searchString.split(" (")[0].toLowerCase();

                // Filter municipalities that contain the base of the search string
                const match = shippingFees.flatMap(province =>
                  province.municipalities.filter(municipality =>
                    municipality.name.toLowerCase().includes(baseSearchString)
                  )
                );





                setShippCity(match[0].fee)
                // setFieldValue('address_city_name', selectedCity ? selectedCity.name : ''); // Set the city name in the form field
              }
            };

            getCity();
          }, [values.address_province, values.address_city, setFieldValue]); // Depend on these fields





          return <div>
            <h1 className="my-9 pl-16 text-4xl font-semibold">Billing details</h1>
            <div className="flex flex-col gap-x-6 gap-y-16 md:flex-row">
              {/* User info form */}
              {/* <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-9 md:w-1/2 md:px-16"
          >
            <div className="">
              <div className="mb-3">
                <label
                  htmlFor="firstName"
                  className={`${errors.firstName && "text-red-600"} font-medium mb-5 inline-block`}
                >
                  First Name {errors.firstName && "*"}
                </label>
                <br />
                <input
                  className="border-cadetGray h-[50px] w-full rounded-[10px] border px-5 outline-none"
                  type="text"
                  id="firstName"
                  {...register("firstName", { required: true })}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="lastName"
                  className={`${errors.lastName && "text-red-600"} font-medium" mb-5 inline-block`}
                >
                  Last Name {errors.lastName && "*"}
                </label>
                <br />
                <input
                  className="border-cadetGray h-[50px] w-full rounded-[10px] border px-5 outline-none"
                  type="text"
                  id="lastName"
                  {...register("lastName", { required: true })}
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="complete_address"
                  className={`${errors.complete_address && "text-red-600"} font-medium" mb-5 inline-block`}
                >
                  Complete Address {errors.complete_address && "*"}
                </label>
                <br />
                <input
                  className="border-cadetGray h-[50px] w-full rounded-[10px] border px-5 outline-none"
                  type="text"
                  id="complete_address"
                  {...register("complete_address", { required: true })}
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="phone"
                  className={`${errors.phone && "text-red-600"} font-medium" mb-5 inline-block`}
                >
                  Phone {errors.phone && "*"}
                </label>
                <br />
                <input
                  className="border-cadetGray h-[50px] w-full rounded-[10px] border px-5 outline-none"
                  type="tel"
                  id="phone"
                  {...register("phone", { required: true })}
                />
              </div>
              <div className="mt-4">
                <textarea
                  rows="10"
                  className="border-cadetGray h-[50px] w-full rounded-[10px] border px-5 py-6 outline-none"
                  id="add_info"
                  placeholder="Additional information"
                  {...register("add_info")}
                ></textarea>
              </div>   </div>
          </form> */}


              <Form className="w-full space-y-9 md:w-1/2 md:px-16">
                <div className="mb-3">
                  <InputText
                    isDisabled={true}
                    disabled
                    // icons={mdiAccount}
                    label="First Name"
                    labelColor="text-white"
                    name="firstName"
                    type="text"
                    placeholder=""
                    value={values.firstName}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText
                    isDisabled
                    disabled
                    // icons={mdiAccount}
                    label="Last Name"
                    labelColor="text-white"
                    name="lastName"
                    type="text"
                    placeholder=""
                    value={values.lastName}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />

                </div>
                <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">
                  <Dropdown
                    className="z-50"
                    isDisabled
                    label="Region"
                    name="address_region"
                    value={values.address_region}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={addressRegions}
                    affectedInput="address_province"
                    allValues={values}
                    functionToCalled={async regionCode => {
                      if (regionCode) {
                        setFieldValue('address_province', '');
                        await provincesByCode(regionCode).then(
                          province => {
                            setProvince(
                              province.map(p => {
                                return {
                                  value: p.province_code,
                                  label: p.province_name
                                };
                              })
                            );
                          }
                        );
                      }
                    }}
                  />

                  <Dropdown
                    className="z-50"
                    isDisabled
                    label="Province"
                    name="address_province"
                    value={values.address_province}
                    d
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={addressProvince}
                    affectedInput="address_city"
                    functionToCalled={async code => {
                      if (code) {
                        await cities(code).then(cities => {
                          setCity(
                            cities.map(p => {
                              return {
                                value: p.city_code,
                                label: p.city_name
                              };
                            })
                          );
                        });
                      }
                    }}
                  />

                </div>
                <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">
                  <Dropdown
                    isDisabled
                    className="z-50"
                    disabled
                    label="City"
                    name="address_city"
                    // value={values.civilStatus}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={addressCity}
                    affectedInput="address_barangay"
                    functionToCalled={async code => {
                      if (code) {
                        await barangays(code).then(cities => {
                          setBarangay(
                            cities.map(p => {
                              console.log({ p });
                              return {
                                value: p.brgy_code,
                                label: p.brgy_name
                              };
                            })
                          );
                        });
                      }
                    }}
                  />


                  <Dropdown
                    className="z-50"
                    isDisabled
                    label="Barangay"
                    name="address_barangay"
                    value={values.address_barangay}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={addressBarangay}
                    affectedInput=""
                    functionToCalled={async code => { }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                  <InputText
                    disabled
                    isDisabled
                    // icons={mdiAccount}
                    label="Street Address"
                    labelColor="text-white"
                    name="streetAddress"
                    type="text"
                    placeholder=""
                    value={values.streetAddress}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText
                    disabled
                    isDisabled
                    // icons={mdiAccount}
                    label="Zip Code"
                    labelColor="text-white"
                    name="zipCode"
                    type="text"
                    placeholder=""
                    value={values.zipCode}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />


                </div>
                {/* <InputText
                  // icons={mdiAccount}
                  label="Mobile Number"
                  labelColor="text-white"
                  name="mobileNumber"
                  type="text"
                  placeholder="09xxxxxxxxx"
                  onChange={(e) => {
                    // Prevent user from removing +63 and limit input to 13 characters
                    if (e.target.value.startsWith("+63") && e.target.value.length <= 13) {
                      setFieldValue("mobileNumber", e.target.value);
                    }
                  }}
                  value={values.mobileNumber}
                  onBlur={handleBlur} // This apparently updates `touched`?
                /> */}


                <div className="relative">
                  <label
                    className={`block mb-2 text-neutral-900 text-left `}>
                    Mobile Number</label>
                  <div className="flex items-center border border-gray-300 rounded-md shadow-sm px-3 py-2 max-w-full
                   border-gray-100 rounded w-full dark:placeholder-gray-400">
                    <span className="inline-flex items-center px-3  text-gray-500 text-sm border-r border-gray-100">
                      +63
                    </span>
                    <Field
                      isDisabled
                      name="mobileNumber"
                      render={({ field }) => (
                        <input
                          disabled
                          {...field}
                          type="text"
                          value={values.mobileNumber}
                          onChange={(e) => {
                            // Limit input to 10 digits (9xxxxxxxxx format)
                            const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                            if (value.length <= 10) {
                              setFieldValue("mobileNumber", value);
                            }
                          }}
                          placeholder="9123456789"
                          className={`block w-full 
                          px-4 py-2 text-white-900 
                          focus:outline-none focus:ring-1 
                          focus:ring-white-500 rounded-r-md
                          border-0
                          `}
                        />
                      )}
                    />
                  </div>
                  {touched.mobileNumber && errors.mobileNumber ? (
                    <div className="text-xs text-left text-red-500 dark:text-red-400 mt-1">
                      {errors.mobileNumber}
                    </div>
                  ) : null}
                </div>
                {/* <button
                  type="submit"
                  disabled={isSubmitting}
                  className={
                    'btn mt-2 bg-yellow-500 text-white font-bold'

                  }>
                  Submit
                </button> */}
              </Form>

              {/* Cart Items and Price Details */}
              <div className="w-full md:w-1/2">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-2xl font-medium">Product</p>
                  <p className="text-2xl font-medium">Cuztomization</p>
                  <p className="text-2xl font-medium">Subtotal</p>
                </div>
                <ul className="mb-6 space-y-2">
                  {cart &&
                    cart.length > 0 &&
                    cart.map((item, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <p className="text-cadetGray">{item.title}</p>
                          <p className="text-xs font-medium">X</p>
                          <p className="text-xs font-medium">{item.quantity}</p>
                        </div>
                        <div className="">

                          <div className="flex space-x-2">
                            {(item.customizeDesignImagesLinks || []).map((thumbnail, index) => (
                              <div className="w-24 h-24 overflow-hidden rounded-lg shadow-md">
                                <img
                                  src={thumbnail}
                                  alt={`preview-${index}`}
                                  className="w-full h-auto rounded-lg shadow-md" // Tailwind classes for styling
                                />

                              </div>
                            ))}
                          </div>

                          {
                            console.log(item.customizeDesignImages)
                          }
                          {
                            item.color !== 'transparent' && <p className="text-cadetGray text-center">Color:{item.color}</p>
                          }



                        </div>
                        <p className="font-light">
                          {formatPrice(item.quantity * item.price)}
                        </p>
                      </li>
                    ))}
                </ul>
                {/* <div className="mb-4 flex items-center justify-between">
              <p>Subtotal</p>
              <p className="font-light">
                {formatPrice(calculateTotalPrice(cart))}
              </p>
            </div> */}
                <div className="mb-4 flex items-center justify-between">
                  <p>Shipping Fee</p>
                  <p className="font-light">

                    {formatPrice(cityShipp)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p>Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(totalPrice)}
                  </p>
                </div>

                <p className="border-paleGray mt-8 border-t pt-6 font-light">
                  Your personal data will be used to support your experience
                  throughout this website, to manage access to your account, and for
                  other purposes described in our{" "}
                  <span className="cursor-pointer font-semibold">
                    privacy policy.
                  </span>
                </p>

                <Elements stripe={stripePromise}>
                  <PaymentModal
                    {...{
                      isOpen,
                      setIsOpen,
                      user,
                      totalPrice,
                      billingData,
                      triggerFormSubmit: handleSubmit,
                    }}
                  />
                </Elements>
              </div>
            </div>
          </div>
        }}
      </Formik>
    </div>
  );
};

export default BillingDetails;
