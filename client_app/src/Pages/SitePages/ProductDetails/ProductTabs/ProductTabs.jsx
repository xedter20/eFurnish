import { useState } from "react";
import InfoTab from "../../../../components/InfoTab/InfoTab";
import Reviews from "../../../../components/Reviews/Reviews";

const ProductTabs = ({ gallery, productId, reviews, setReviews }) => {
  const [activeTab, setActiveTab] = useState("des");

  const description = (
    <div className="text-cadetGray">
      <div className="px-[10%]">
        <p className="mb-7">
          Additional Description
        </p>
        <p>
          {/* Additional Description */}
        </p>
      </div>
      {/* <div className="mt-9 gap-7 md:flex">
        <img
          className="h-full max-h-[348px] w-full rounded-[10px] object-cover object-center md:w-1/2"
          src={gallery[0]}
          alt="sofa three seated"
          loading="lazy"
        />
        <img
          className="h-full max-h-[348px] w-full rounded-[10px] object-cover object-center md:w-1/2"
          src={gallery[1]}p
          alt="sofa three seated"
          loading="lazy"
        />
      </div> */}
    </div>
  );

  return (
    <div className="pt-12">
      {/* tab buttons */}
      <div className="mb-9 flex items-center justify-center space-x-2 sm:space-x-7 md:gap-12">
        <button
          onClick={() => setActiveTab("des")}
          className={`text-cadetGray text-base md:text-lg lg:text-xl xl:text-2xl ${activeTab === "des" && "font-medium text-black"}`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("addInfo")}
          className={`text-cadetGray text-base md:text-lg lg:text-xl xl:text-2xl ${activeTab === "addInfo" && "font-medium text-black"}`}
        >
          Additional <span className="sm:hidden">Info</span>
          <span className="hidden sm:inline-block">Information</span>
        </button>
        <button
          onClick={() => setActiveTab("rev")}
          className={`text-cadetGray text-base md:text-lg lg:text-xl xl:text-2xl ${activeTab === "rev" && "font-medium text-black"}`}
        >
          Reviews [{reviews.length}]
        </button>
      </div>

      {/* render active tab content */}
      {activeTab === "des" && description}
      {activeTab === "addInfo" && <InfoTab />}
      {activeTab === "rev" && (
        <Reviews
          productId={productId}
          reviews={reviews}
          setReviews={setReviews}
        />
      )}
    </div>
  );
};

export default ProductTabs;
