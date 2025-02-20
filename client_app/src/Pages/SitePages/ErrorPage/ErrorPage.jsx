import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./errorPage.css";
import { useNavigate } from "react-router-dom";
const ErrorPage = () => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1); // Navigate to the previous route
  };
  return (
    <section className="page_404">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 ">
            <div className="col-sm-10 col-sm-offset-1  text-center">
              <div className="">

              </div>

              <div className="contant_box_404">
                <h3 className="h2">Page</h3>

                <p>Under Construction</p>

                <motion.button whileTap={{ scale: 0.9 }} onClick={goBack}>
                  <Link
                    className="link_404"
                    onClick={() => goBack()}
                  >
                    Back
                  </Link>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ErrorPage;
