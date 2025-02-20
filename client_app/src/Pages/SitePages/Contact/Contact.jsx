import { useLocation } from "react-router-dom";
import PageBanner from "../../../components/PageBanner/PageBanner";
import ContactDetails from "./ContactDetails/ContactDetails";
import ContactForm from "./ContactForm/ContactForm";
import ServicesHighlight from "../../../components/ServicesHighlight/ServicesHighlight";
import { Helmet } from "react-helmet";

const Contact = () => {
  const location = useLocation();
  return (
    <section>
      <Helmet>
        <title>Contact Us - HandiHub Shop</title>
      </Helmet>


    </section>
  );
};

export default Contact;
