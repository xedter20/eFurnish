import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
/* images */
import logo from "../../../assets/logo/logo.png";
import signupImg from "../../../assets/images/authentication/signup.jpg";
import useAuth from "../../../hooks/useAuth";
import ReCAPTCHA from 'react-google-recaptcha';

import { Formik, useField, useFormik, Form, Field } from 'formik';
import * as Yup from 'yup';
import InputText from '../../../components/Input/InputText';
import Dropdown from '../../../components/Input/Dropdown';
import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  // Auth Context for user creation
  const { createUser, updateUserProfile, loading, setLoading } = useAuth();

  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

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

    await provincesByCode('05').then(
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
  };

  useEffect(() => {
    prepareAddress();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const recaptchaRef = useRef();

  const onSubmit = (data) => {
    const recaptchaValue = recaptchaRef.current.getValue();
    if (!recaptchaValue) {
      alert('Please complete the reCAPTCHA challenge.');
      return;
    }

    console.log({ data });
  };

  const formikConfig = {
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      lastName: '',
      address_region: '05',
      address_province: '',
      address_city: '',
      address_barangay: '',
      streetAddress: '',
      zipCode: '',
      mobileNumber: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Required field'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        )
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      name: Yup.string().required('Required field'),
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
      console.log({ values });

      await createUser(values.email, values.password, values)
        .then((result) => {
          const loggedUser = result.user;
        })
        .catch((error) => {
          setLoading(false);
          if (error.message === "Firebase: Error (auth/email-already-in-use).") {
            return toast.error("Email already exists.");
          }
          toast.error("Sign-up failed. Please try again later.");
          console.error(error.message);
        });
    }
  };

  return (
    <section className=" bg-gradient-to-r from-base-200 to-orange-50 flex items-center justify-center min-h-screen bg-gray-100">
      <Helmet>
        <title>Sign Up - EFurnish</title>
      </Helmet>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl w-full min-h-screen ">
        {/* <Link to="/" className="inline-flex items-center mb-6">
          <img className="w-20 h-20" src={logo} alt="urbanAura logo" loading="lazy" />
        </Link> */}
        <Formik {...formikConfig}>
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
            setFieldValue,
            isSubmitting
          }) => (
            <Form className="space-y-4">
              <h1 className="text-2xl font-semibold mb-2 text-center">Create an account</h1>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputText
                  label="First Name"
                  name="name"
                  type="text"
                  value={values.name}
                  onBlur={handleBlur}
                />
                <InputText
                  label="Last Name"
                  name="lastName"
                  type="text"
                  value={values.lastName}
                  onBlur={handleBlur}
                />
              </div>
              <InputText
                label="Email"
                name="email"
                type="text"
                value={values.email}
                onBlur={handleBlur}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative">
                  <InputText
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="relative">
                  <InputText
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={values.confirmPassword}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Dropdown
                  label="Region"
                  name="address_region"
                  value={'05'}
                  setFieldValue={setFieldValue}
                  onBlur={handleBlur}
                  options={addressRegions}
                  affectedInput="address_province"
                  functionToCalled={async regionCode => {
                    if (regionCode) {
                      setFieldValue('address_province', '');
                      await provincesByCode(regionCode).then(
                        province => {
                          setProvince(
                            province.map(p => ({
                              value: p.province_code,
                              label: p.province_name
                            }))
                          );
                        }
                      );
                    }
                  }}
                />
                <Dropdown
                  label="Province"
                  name="address_province"
                  value={values.address_province}
                  setFieldValue={setFieldValue}
                  onBlur={handleBlur}
                  options={addressProvince}
                  affectedInput="address_city"
                  functionToCalled={async code => {
                    if (code) {
                      await cities(code).then(cities => {
                        setCity(
                          cities.map(p => ({
                            value: p.city_code,
                            label: p.city_name
                          }))
                        );
                      });
                    }
                  }}
                />
                <Dropdown
                  label="City"
                  name="address_city"
                  setFieldValue={setFieldValue}
                  onBlur={handleBlur}
                  options={addressCity}
                  affectedInput="address_barangay"
                  functionToCalled={async code => {
                    if (code) {
                      await barangays(code).then(cities => {
                        setBarangay(
                          cities.map(p => ({
                            value: p.brgy_code,
                            label: p.brgy_name
                          }))
                        );
                      });
                    }
                  }}
                />
                <Dropdown
                  label="Barangay"
                  name="address_barangay"
                  value={values.address_barangay}
                  setFieldValue={setFieldValue}
                  onBlur={handleBlur}
                  options={addressBarangay}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputText
                  label="Street Address"
                  name="streetAddress"
                  type="text"
                  value={values.streetAddress}
                  onBlur={handleBlur}
                />
                <InputText
                  label="Zip Code"
                  name="zipCode"
                  type="text"
                  value={values.zipCode}
                  onBlur={handleBlur}
                />
              </div>
              <div className="relative">
                <label className="block mb-2 text-neutral-900 text-left">
                  Mobile Number
                </label>
                <div className="flex items-center border border-gray-300 rounded-md shadow-sm px-3 py-2">
                  <span className="inline-flex items-center px-3 text-gray-500 text-sm border-r border-gray-300">
                    +63
                  </span>
                  <Field
                    name="mobileNumber"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        value={values.mobileNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 10) {
                            setFieldValue("mobileNumber", value);
                          }
                        }}
                        placeholder="9123456789"
                        className="block w-full px-4 py-2 text-black focus:outline-none focus:ring-1 focus:ring-white-500 rounded-r-md"
                      />
                    )}
                  />
                </div>
                {touched.mobileNumber && errors.mobileNumber ? (
                  <div className="text-xs text-left text-red-500 mt-1">
                    {errors.mobileNumber}
                  </div>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn mt-4 bg-base text-white font-bold w-full"
              >
                Create Account
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
};

export default Signup;
