import { Link } from "react-router-dom";
import { BiSolidTrashAlt } from "react-icons/bi";
import { motion } from "framer-motion";
import { ShoppingCart, DollarSign, Percent, CheckCircle, PhilippinePeso } from "lucide-react";
import FixedLoader from "../../../../components/Loaders/Loader/FixedLoader";
import { calculateTotalPrice } from "../../../../utils/calculateTotalPrice";
import { formatPrice } from "../../../../utils/formatPrice";
import "./cartDetails.css";
import useCart from "../../../../hooks/useCart";
import CustomAlert from "../../../../components/Alerts/CustomAlert";

const CartDetails = () => {
  const { cart, cartLoading, handleQuantity, handleCartItemDel } = useCart();
  const totalPrice = calculateTotalPrice(cart);
  const discount = 0; // Example discount value
  const taxes = 0;
  const finalTotal = totalPrice + taxes - discount;

  const increaseQuantity = (quantity, product_id) => {
    handleQuantity(quantity + 1, product_id);
  };

  const decreaseQuantity = (quantity, product_id) => {
    if (quantity > 1) {
      handleQuantity(quantity - 1, product_id);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white px-4 py-8 md:px-16">
      {cart && cart.length > 0 ? (
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <div className="w-full lg:flex-1">
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr className="text-left text-base font-medium text-gray-700">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Quantity</th>
                    <th className="py-4 px-6">Subtotal</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6 flex items-center">
                        <img
                          className="h-16 w-16 rounded-lg object-cover mr-4"
                          src={item.thumbnail}
                          alt={item.title}
                          loading="lazy"
                        />
                        <Link to={`/products/${item.product_id}`} className="text-gray-800">
                          {item.title}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{formatPrice(item.price)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <button
                            disabled={cartLoading}
                            onClick={() => decreaseQuantity(item.quantity, item.product_id)}
                            className="px-2 py-1 border rounded-l-md hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="px-3">{item.quantity}</span>
                          <button
                            disabled={cartLoading}
                            onClick={() => increaseQuantity(item.quantity, item.product_id)}
                            className="px-2 py-1 border rounded-r-md hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{formatPrice(item.quantity * item.price)}</td>
                      <td className="py-4 px-6">
                        <BiSolidTrashAlt
                          onClick={() => handleCartItemDel(item.product_id)}
                          size={20}
                          className="cursor-pointer text-red-500 hover:text-red-700"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="max-w-[600px] bg-white mt-8 lg:mt-0 lg:ml-8 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <ShoppingCart className="mr-2" /> Cart Summary
            </h2>
            <div className="flex justify-between mb-4">
              <span className="text-lg text-gray-700 flex items-center">
                <PhilippinePeso className="mr-1" /> Subtotal
              </span>
              <span className="text-lg text-gray-800">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg text-gray-700 flex items-center">
                <PhilippinePeso className="mr-1" /> Taxes
              </span>
              <span className="text-lg text-gray-800">{formatPrice(taxes)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-4">
                <span className="text-lg text-gray-700 flex items-center">
                  <Percent className="mr-1" /> Discount
                </span>
                <span className="text-lg text-gray-800">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-md mb-8">
              <span className="flex items-center">
                <CheckCircle className="mr-1" /> Total
              </span>
              <span>{formatPrice(finalTotal)}</span>
            </div>

            {/* <Link
              to="/checkout"
              className="w-full"
            >

            </Link> */}

            <button

              type="submit"
              className={`block w-full rounded-[10px] py-2 text-sm text-white 
              bg-[#BA8A5B] hover:bg-[#7B5733] transition-all
              `}
            >
              Checkout
            </button>

          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <CustomAlert type="info" message="You have not added any items to the cart." />
          <Link to="/shop" className="mt-4 text-primary hover:underline">
            Browse our catalog
          </Link>
        </div>
      )
      }
      {cartLoading && <FixedLoader />}
    </div >
  );
};

export default CartDetails;
