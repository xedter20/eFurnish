import { useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useCart from "../../../hooks/useCart";

const sizes = ["l", "xl", "xs"];
const colors = ["#816dfa", "black", "#b88e2f"];

const AddToCartModal = ({ isOpen, setIsOpen, selectedProduct }) => {
  const { _id, title, thumbnail, price } = selectedProduct;
  const { user } = useAuth();

  console.log({ user })
  const { handleCartItemSave } = useCart();

  const [size, setSize] = useState("l");
  const [color, setColor] = useState("#816dfa");
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const item = {
    user_email: user.email,
    product_id: _id,
    title,
    price: price.discounted ? price.discounted : price.original,
    thumbnail,
    quantity,
    size,
    color,
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-black/30 backdrop-blur-sm">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              <div className="flex items-start justify-between mb-6">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Add to Cart
                </DialogTitle>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-6">
                {/* Product Image */}
                <div className="w-1/3">
                  <img
                    className="w-full h-auto rounded-lg object-cover"
                    src={thumbnail}
                    alt={title}
                    loading="lazy"
                  />
                </div>

                {/* Product Details */}
                <div className="w-2/3 flex flex-col">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {title}
                  </h3>

                  <div className="text-[#BA8A5B] font-semibold mb-4">
                    {price.discounted
                      ? `₱${price.discounted}`
                      : `₱${price.original}`
                    }
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                      <button
                        onClick={decreaseQuantity}
                        className="text-gray-500 hover:text-[#BA8A5B] transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={increaseQuantity}
                        className="text-gray-500 hover:text-[#BA8A5B] transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-lg font-semibold text-[#BA8A5B]">
                      ₱{(price.discounted || price.original) * quantity}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleCartItemSave(item, setIsOpen)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#BA8A5B] hover:bg-[#7B5733] 
                      text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <ShoppingBag size={18} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddToCartModal;
