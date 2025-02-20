import { useState, useRef } from 'react';
import { useLocation } from "react-router-dom";

import InputText from '../../../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import PageBanner from "../../../components/PageBanner/PageBanner";
import img1 from "../../../assets/images/about/about-1.jpg";
import img2 from "../../../assets/images/about/about-2.jpg";
import img3 from "../../../assets/images/about/about-3.jpg";

const About = () => {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);


  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Example photos
  const photos = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/ratan-eccomerce.appspot.com/o/PERMIT1.jpg?alt=media&token=8ca75d96-d29c-4dcf-b243-99fdad648274', label: 'Photo 1' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/ratan-eccomerce.appspot.com/o/PERMIT2.jpg?alt=media&token=288bf3d4-6a87-4167-b1e4-3c3abd1ae735', label: 'Photo 2' },

  ];


  const formikConfig = {
    initialValues: {
      email: '',
      password: ''
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
  };


  return (
    <section>
      <div>  </div>
    </section>
  );
};

export default About;
