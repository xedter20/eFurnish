import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { BsFillPeopleFill, BsFillPersonFill } from "react-icons/bs";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
/* images */
import logo from "../../../assets/logo/logo.png";
import googleLogo from "../../../assets/logo/google-logo.png";
import loginImg from "../../../assets/images/authentication/login.jpg";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
  const recaptchaRef = React.useRef();
  const { signIn, googleSignIn, loading, setLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email format").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await signIn(values.email, values.password);
        toast.success('Login successful!');

        if (values.email === 'admin-efurnish@gmail.com') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }

      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
  });

  // google login
  const handleGoogleLogin = () => {
    googleSignIn()
      .then((res) => {
        const loggedUser = res.user;
        if (loggedUser) {
          toast.success("Welcome back!");
          navigate(from, { replace: true });
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Login failed. Please try again later.");
        const errCode = err.code;
        const errMessage = err.message;
        console.error(errCode, errMessage);
      });
  };

  return (
    <section className="flex items-center justify-center min-h-screen w-full px-4 py-10 font-Poppins
    bg-gradient-to-r from-white to-orange-50
    ">
      <Helmet>
        <title>Login</title>
      </Helmet>
      {/* Form container */}
      <div className="w-full max-w-md shadow-2xl p-5 bg-white rounded-lg">
        {/* Logo */}
        {/* <Link to="/" className="inline-flex items-center justify-center mb-6">
          <img className="w-20 h-20" src={logo} alt="urbanAura logo" loading="lazy" />
        </Link> */}
        {/* Form */}
        <form onSubmit={formik.handleSubmit}>
          <h1 className="text-2xl font-semibold text-center mb-6">Sign in to your account</h1>
          <label
            htmlFor="email"
            className="text-cadetGray mb-2 block w-full"
          >
            {formik.touched.email && formik.errors.email ? (
              <span className="text-red-500">{formik.errors.email}</span>
            ) : (
              "Email"
            )}
          </label>
          <input
            className={`block w-full rounded-[5px] border px-3 py-2 text-md outline-none focus:border-gray-500 ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
            type="email"
            id="email"
            {...formik.getFieldProps("email")}
          />
          <label
            htmlFor="password"
            className="text-cadetGray mb-2 mt-6 block w-full"
          >
            {formik.touched.password && formik.errors.password ? (
              <span className="text-sm text-red-500">
                {formik.errors.password}
              </span>
            ) : (
              "Password"
            )}
          </label>
          <div className="relative">
            <input
              className={`block w-full rounded-[5px] border px-3 py-2 text-md outline-none focus:border-gray-500 ${formik.touched.password && formik.errors.password ? 'border-red-500' : ''}`}
              type={showPassword ? "text" : "password"}
              id="password"
              {...formik.getFieldProps("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {/* <div className="flex justify-center mb-4 mt-4">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LcGF14qAAAAAAYOOPRg8WJe2Dsn1QwyOISdcUin"
            />
          </div> */}
          <p className="text-cadetGray mb-6 text-right text-sm mt-2">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-medium text-primary">
              Register
            </Link>
          </p>
          <button
            disabled={loading}
            type="submit"
            className={`block w-full rounded-[10px] py-2 text-sm text-white 
              bg-[#BA8A5B] hover:bg-[#7B5733] transition-all
              `}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
