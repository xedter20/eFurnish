import { useState, useRef, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import Dropdown from '../../../components/Input/Dropdown';
import InputText from '../../../components/Input/InputText';
import { Formik, useField, useFormik, Form, Field } from 'formik';
import * as Yup from 'yup';

import PageBanner from "../../../components/PageBanner/PageBanner";
import img1 from "../../../assets/images/about/about-1.jpg";
import img2 from "../../../assets/images/about/about-2.jpg";
import img3 from "../../../assets/images/about/about-3.jpg";

import useAxiosSecure from "../../../hooks/useAxiosSecure";

import axios from "axios";
import { getFirestore, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';
import SignatureCanvas from 'react-signature-canvas'
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import { set } from 'date-fns';
const db = getFirestore();
const Alert = ({ type, message, onClose }) => {
  const alertTypes = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg shadow-lg ${alertTypes[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
    </div>
  );
};

const About = ({ myScore, quizItemTotal }) => {

  console.log({ myScore })
  const { axiosSecure } = useAxiosSecure();
  const sigCanvas = useRef(null);  // Create a ref for the canvas
  const clearSignature = () => {
    sigCanvas.current.clear();
  };
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);

  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);
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
  const { user } = useAuth();

  const [activeMembership, setActiveMembership] = useState([]);


  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
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
    setIsLoaded(true)

  }, []);


  const listActiveMembership = async () => {
    let res = await axios({
      method: 'POST',
      url: `users/getMembership`,
      data: {
        email: user.email
      }
    }).then(async (res) => {
      let data = res.data.data;


      console.log({ data })
      setActiveMembership(data)

    });




  };
  useEffect(() => {
    listActiveMembership();
  }, []);





  const formikConfig = (selected) => {


    console.log({ selected })

    return {
      initialValues: {
        firstName: 'dex',
        lastName: selected.lastName,
        address_region: currentUser.address_region,
        address_province: currentUser.address_province,
        address_city: currentUser.address_city,
        address_barangay: currentUser.address_barangay,
        streetAddress: selected.streetAddress,
        email: user.email,
        zipCode: selected.zipCode,
        homeNumber: '',
        cellularNumber: selected.mobileNumber,
        workNumber: '',
        website: '',
        membershipTerm: '',
        membershipLevel: '',
        signDate: '',
        myScore: myScore,
        events: [],
        membershipType: '',
        services: [],
        others: '',
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
        cellularNumber: Yup.string().required('Required field'),

        website: Yup.string().required('Required field'),
        membershipTerm: Yup.string().required('Required field'),
        membershipLevel: Yup.string().required('Required field'),
        email: Yup.string().required('Required field'),


      }),
      onSubmit: async (
        values,
        { setSubmitting, setFieldValue, setErrorMessage, setErrors }
      ) => {

        try {

          const memberInfo = {
            ...values

          };




          const signatureImage = sigCanvas.current.toDataURL("image/png");


          // Convert Base64 to Blob
          const blob = await (await fetch(signatureImage)).blob();



          // Create a FormData object
          const formData = new FormData();



          // Use forEach to append each field to FormData
          Object.entries(memberInfo).forEach(([key, value]) => {


            formData.append(key, value);
          });

          formData.append('file', blob, 'signature.png');  // Append the blob as 'file'
          console.log({ formData })
          // Upload the signature using axios


          await axiosSecure
            .post("/users/membership/create", formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              params: { userEmail: user.email }
            },)
            .then((res) => {

              if (res.data.success === false) {
                toast.error("You have pending membership application for approval.");
              } else {
                toast.success("Submitted successfully.");
              }

            })
          listActiveMembership()

        } catch (error) {

          toast.error("Something went wrong.");
          // toast.error(error);
        }

      }
    }
  };



  return isLoaded && (
    <section>
      {/* <PageBanner pathname={pathname} /> */}
      <div className="flex items-center justify-center mb-8 mt-4">


        {/* <Alert
          type="warning" // Change to error, warning, or info as needed
          message={`Your score on the quiz is ${myScore} / ${quizItemTotal}.`} // Dynamic message

        /> */}

        {/* You can open the modal using document.getElementById('ID').showModal() method */}
        {/* <button className="btn bg-green-500 text-white" onClick={() => document.getElementById('my_modal_3').showModal()}>Join Us Today</button> */}
        <dialog id="my_modal_3" className="modal">



        </dialog>

      </div>
      <div className="px-[4%] pb-32 md:px-[7%]">
        {/* Our values section */}

        {activeMembership?.status === 'FOR_APPROVAL' && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">PENDING!</strong>
            <span className="block sm:inline"> The membership is subject for FOR_APPROVAL.</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => setMembershipStatus(null)}
            >
              <svg
                className="fill-current h-6 w-6 text-yellow-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M14.348 14.849a1 1 0 01-1.414 0L10 11.914l-2.936 2.935a1 1 0 11-1.414-1.414L8.586 10.5 5.65 7.565a1 1 0 011.414-1.414L10 8.086l2.936-2.935a1 1 0 111.414 1.414L11.414 10.5l2.935 2.935a1 1 0 010 1.414z" />
              </svg>
            </span>
          </div>
        )}

        {activeMembership?.status === 'APPROVED' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Approved!</strong>
            <span className="block sm:inline"> Congrats.Your membership has been approved.</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => setMembershipStatus(null)}
            >
              <svg
                className="fill-current h-6 w-6 text-green-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M14.348 14.849a1 1 0 01-1.414 0L10 11.914l-2.936 2.935a1 1 0 11-1.414-1.414L8.586 10.5 5.65 7.565a1 1 0 011.414-1.414L10 8.086l2.936-2.935a1 1 0 111.414 1.414L11.414 10.5l2.935 2.935a1 1 0 010 1.414z" />
              </svg>
            </span>
          </div>
        )}
        {activeMembership?.status === 'REJECTED' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Rejected!</strong>
            <span className="block sm:inline"> The membership has been rejected.</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => setMembershipStatus(null)}
            >
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M14.348 14.849a1 1 0 01-1.414 0L10 11.914l-2.936 2.935a1 1 0 11-1.414-1.414L8.586 10.5 5.65 7.565a1 1 0 011.414-1.414L10 8.086l2.936-2.935a1 1 0 111.414 1.414L11.414 10.5l2.935 2.935a1 1 0 010 1.414z" />
              </svg>
            </span>
          </div>
        )}

        {currentUser.lastName && !activeMembership?.status && <div className="">
          <Formik {...formikConfig(currentUser)}>
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

              return <div >
                < form method="dialog" >
                  {/* if there is a button in form, it will close the modal */}
                  < button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" >✕</button>
                </form>
                <h3 className="font-bold text-lg text-yellow-700">Member Registration</h3>



                <Form className="">
                  <InputText
                    // icons={mdiAccount}
                    label="Email"
                    labelColor="text-white"
                    name="email"
                    type="email"
                    placeholder=""
                    value={values.email}
                    disabled
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">

                    <InputText
                      // icons={mdiAccount}
                      label="First Name"
                      isDisabled={true}
                      disabled
                      labelColor="text-white"
                      name="firstName"
                      type="text"
                      placeholder=""
                      value={values.firstName}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                    <InputText
                      // icons={mdiAccount}
                      label="Last Name"
                      isDisabled={true}
                      disabled
                      labelColor="text-white"
                      name="lastName"
                      type="text"
                      placeholder=""
                      value={values.lastName}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />


                  </div>

                  <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-4 ">
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
                    <Dropdown
                      className="z-50"
                      isDisabled
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
                      isDisabled
                      disabled
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
                      isDisabled
                      disabled
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

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-4">

                    <InputText
                      isDisabled
                      disabled
                      // icons={mdiAccount}
                      label="Cellular Number"
                      labelColor="text-white"
                      name="cellularNumber"
                      type="number"
                      placeholder=""
                      value={values.cellularNumber}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </div>


                  <div>
                    <label className="text-lg font-semibold">Which events would you like to present?</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <Field type="checkbox" name="events" value="carnival" />
                        <span className="ml-2">Carnival</span>
                      </label>
                      <label className="flex items-center">
                        <Field type="checkbox" name="events" value="farmersMarket" />
                        <span className="ml-2">Farmer's Market</span>
                      </label>
                      <label className="flex items-center">
                        <Field type="checkbox" name="events" value="craftFair" />
                        <span className="ml-2">Craft Fair</span>
                      </label>
                    </div>
                  </div>

                  {/* Membership Type */}
                  <div className='mt-4'>
                    <label className="text-lg font-semibold">Choose Membership Type</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <Field type="radio" name="membershipType" value="regular" />
                        <span className="ml-2">Regular Member</span>
                      </label>
                      <label className="flex items-center">
                        <Field type="radio" name="membershipType" value="premium" />
                        <span className="ml-2">Premium Member</span>
                      </label>
                      <label className="flex items-center">
                        <Field type="radio" name="membershipType" value="platinum" />
                        <span className="ml-2">Platinum Member</span>
                      </label>
                    </div>
                  </div>

                  {/* Services Provided */}
                  <div className='mt-4 mb-4'>
                    <label className="text-lg font-semibold">What do you sell or what services do you provide?</label>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center">
                        <Field type="checkbox" name="services" value="accessories" />
                        <span className="ml-2">Accessories/Jewelry</span>
                      </label>
                      <label className="flex items-center">
                        <Field type="checkbox" name="services" value="crochet" />
                        <span className="ml-2">Crochet/Needlecraft</span>
                      </label>
                      <label className="flex items-center">
                        <Field type="checkbox" name="services" value="basketWeaving" />
                        <span className="ml-2">Basket Weaving</span>
                      </label>
                      <label className="flex items-center">
                        <Field type="checkbox" name="services" value="woodCrafting" />
                        <span className="ml-2">Wood Crafting</span>
                      </label>
                      <label className="flex items-center">
                        <Field type="checkbox" name="services" value="decoupage" />
                        <span className="ml-2">Decoupage</span>
                      </label>
                      <label className="flex items-center">
                        <Field type="checkbox" name="services" value="others" />
                        <span className="ml-2">Others</span>
                      </label>
                      <Field
                        id="others"
                        name="others"
                        placeholder="Specify other services"
                        className="border border-gray-300 rounded p-2 mt-2 mb-4"
                      />
                    </div>
                  </div>


                  <InputText
                    // icons={mdiAccount}
                    label="Website"
                    labelColor="text-white"
                    name="website"
                    type="text"
                    placeholder=""
                    value={values.website}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                    <InputText
                      // icons={mdiAccount}
                      label="Membership Term"
                      labelColor="text-white"
                      name="membershipTerm"
                      type="text"
                      placeholder=""
                      value={values.membershipTerm}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                    <InputText
                      // icons={mdiAccount}
                      label="Membership Level"
                      labelColor="text-white"
                      name="membershipLevel"
                      type="text"
                      placeholder=""
                      value={values.membershipLevel}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </div>
                  <label className={`mt-0 font-bold text-neutral-600  block mb-0 `}>
                    Signature</label>
                  <div className="flex flex-col p-4 border border-gray-300 rounded-lg w-full">
                    {/* Signature Canvas */}
                    <SignatureCanvas
                      ref={sigCanvas}  // Attach the ref
                      penColor="black"  // Pen color
                      canvasProps={{ className: 'border border-gray-500 rounded-lg w-full h-48' }}
                    />

                    {/* Button to clear the signature aligned to the right */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={clearSignature}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Clear Signature
                      </button>
                    </div>
                  </div>
                  <InputText
                    // icons={mdiAccount}
                    label="Signing Date"
                    labelColor="text-white"
                    name="signDate"
                    type="date"
                    placeholder=""
                    value={values.signDate}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <div className="modal-action mt-12">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={
                        'btn mt-2 bg-yellow-500 text-white font-bold' +
                        (loading ? ' loading' : '')
                      }>
                      Submit
                    </button>
                  </div>
                </Form>

              </div>

            }}
          </Formik>
        </div >
        }


      </div >
    </section >
  );
};

export default About;
