import { useState } from "react";
import { Link } from "react-router-dom";
import { BsFillHeartFill, BsHeart } from "react-icons/bs";
import { Star } from "lucide-react";
import LoginModal from "../../Modals/LoginModal/LoginModal";
import AddToCartModal from "../../Modals/AddToCartModal/AddToCartModal";
import { formatPrice } from "../../../utils/formatPrice";
import useAuth from "../../../hooks/useAuth";
import useFavourite from "../../../hooks/useFavourite";

const Card = ({ product }) => {
  const { _id, title, price, thumbnail, is_new, category } = product;
  const { user } = useAuth();
  const { favouriteItems, addToFavourite, deleteFavouriteItem } = useFavourite();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});

  const handleModal = () => {
    if (!user) {
      return setIsOpen(true);
    }
    setIsOpen(true);
    setSelectedProduct(product);
  };

  const isFavourite = favouriteItems.some((item) => item.product_id === _id);

  const toggleFavourite = () => {
    if (isFavourite) {
      deleteFavouriteItem(_id, user?.email);
    } else {
      addToFavourite(_id, title, price, thumbnail);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        {/* Product Image Section */}
        <div className="relative">
          <Link to={`/products/${_id}`}>
            <div className="aspect-square overflow-hidden">
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                src={thumbnail}
                alt={title}
                loading="lazy"
              />
            </div>
          </Link>

          {/* New/Discount Tag */}
          {/* {(price.discount_percent || is_new) && (
            <div className={`
              absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white
              ${is_new ? "bg-green-500" : "bg-red-500"}
            `}>
              {is_new ? "New" : `-${price.discount_percent}%`}
            </div>
          )} */}

          <div className={`
              absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white
             bg-base-dark uppercase
            `}>
            {category}
          </div>

          {/* Favorite Button */}
          <button
            onClick={toggleFavourite}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-white shadow-md hover:scale-110 transition-transform duration-200"
          >
            {isFavourite ? (
              <BsFillHeartFill className="text-red-500" size={18} />
            ) : (
              <BsHeart className="text-gray-600" size={18} />
            )}
          </button>
        </div>

        {/* Product Info Section */}
        <div className="p-4">
          {/* Title */}
          <Link to={`/products/${_id}`}>
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
              {title}
            </h3>
          </Link>

          {/* Rating Stars */}
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className="fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-semibold text-[#BA8A5B]">
              {price.discounted
                ? formatPrice(price.discounted)
                : formatPrice(price.original)
              }
            </span>
            {price.discounted && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(price.original)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleModal}
            className="w-full py-2.5 rounded-lg bg-[#BA8A5B] text-white hover:bg-[#a67b4d] 
              transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Modals */}
      {isOpen && user ? (
        <AddToCartModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          selectedProduct={selectedProduct}
        />
      ) : (
        <LoginModal isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </>
  );
};

export default Card;
