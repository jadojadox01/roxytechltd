"use client";
import { ModalContext } from "@/app/context/QuickViewModalContext";
import { EyeIcon } from "@/assets/icons";
import { useCart } from "@/hooks/useCart";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch } from "@/redux/store";
import { Product } from "@/types/product";
import { calculateDiscountPercentage } from "@/utils/calculateDiscountPercentage";
import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import CheckoutBtn from "../Shop/CheckoutBtn";
import WishlistButton from "../Wishlist/AddWishlistButton";
import Tooltip from "./Tooltip";
import { useContext } from "react";

type Props = {
  bgClr?: string;
  item: Product;
};
// add updated the type here
const ProductItem = ({ item, bgClr = "[#F6F7FB]" }: Props) => {
  const defaultVariant = item?.productVariants?.find(
    (variant) => variant.isDefault
  );
  const modalContext = useContext(ModalContext);
  const openModal = modalContext?.openModal;
  // const [product, setProduct] = useState({});
  const dispatch = useDispatch<AppDispatch>();

  const { addItem, cartDetails } = useCart();

  const pathUrl = usePathname();

  const isAlradyAdded = Object.values(cartDetails ?? {}).some(
    (cartItem) => cartItem.id === item.id
  );

  const fallbackImage = "/images/products/product-placeholder.svg";
  const productImage = defaultVariant?.image && defaultVariant.image.trim()
    ? defaultVariant.image
    : item?.images?.find((image) => image?.trim()) || fallbackImage;

  const cartItem = {
    id: item.id,
    name: item.title,
    price: item.discountedPrice ? item.discountedPrice : item.price,
    currency: "usd",
    image: productImage,
    slug: item?.slug,
    availableQuantity: item.quantity,
    color: defaultVariant?.color ? defaultVariant.color : "",
    size: defaultVariant?.size ? defaultVariant.size : "",
  };

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    const serializableItem = {
      ...item,
      // Convert any Date/Decimal objects to plain serializable values
      price: typeof item.price === "object" ? Number(item.price) : item.price,
      discountedPrice: item.discountedPrice != null
        ? (typeof item.discountedPrice === "object" ? Number(item.discountedPrice) : item.discountedPrice)
        : null,
      updatedAt: item.updatedAt instanceof Date
        ? item.updatedAt.toISOString()
        : item.updatedAt ?? null,
    };
    dispatch(updateQuickView(serializableItem as any));
  };

  // add to cart
  const handleAddToCart = (item: Product) => {
    if (item.quantity > 0) {
      // @ts-ignore
      addItem(cartItem);
      toast.success("Product added to cart!");
    } else {
      toast.error("This product is out of stock!");
    }
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        id: item.id,
        title: item.title,
        slug: item.slug,
        image: productImage,
        price: item.discountedPrice ? item.discountedPrice : item.price,
        quantity: item.quantity,
        color: defaultVariant?.color ? defaultVariant.color : "",
      })
    );
  };

  return (
    <div className="group">
      <div
        className={`relative overflow-hidden border border-gray-3 flex items-center justify-center rounded-xl bg-${bgClr} min-h-[270px] mb-4`}
      >
        <Link
          href={`${pathUrl.includes("products")
            ? `${item?.slug}`
            : `products/${item?.slug}`
            }`}
        >
          <Image
            src={productImage}
            alt={item.title || "product-image"}
            width={250}
            height={250}
            style={{ width: "auto", height: "auto" }}
          />
        </Link>
        <div className="absolute top-2 right-2">
          {item.quantity < 1 ? (
            <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
              Out of Stock
            </span>
          ) : item?.discountedPrice && item?.discountedPrice > 0 ? (
            <span className="px-2 py-1 text-xs font-semibold text-dark rounded-full bg-yellow">
              {calculateDiscountPercentage(item.discountedPrice, item.price)}%
              OFF
            </span>
          ) : null}
        </div>

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <Tooltip content="Quick View" placement="top">
            <button
              className="border border-gray-3 h-[38px] w-[38px] rounded-lg flex items-center justify-center text-dark bg-white hover:text-teal"
              onClick={() => {
                if (openModal) {
                  openModal();
                }
                handleQuickViewUpdate();
              }}
            >
              <EyeIcon />
            </button>
          </Tooltip>

          {isAlradyAdded ? (
            <CheckoutBtn />
          ) : (
            <button
              onClick={() => handleAddToCart(item)}
              disabled={item.quantity < 1}
              className="inline-flex px-5 py-2 font-medium h-[38px] text-white duration-200 ease-out rounded-lg text-custom-sm bg-teal hover:bg-teal-dark"
            >
              {item.quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          )}
          {/* wishlist button */}
          <WishlistButton
            item={item}
            handleItemToWishList={handleItemToWishList}
          />
        </div>
      </div>

      <h3 className="font-semibold text-dark ease-out text-base duration-200 hover:text-teal mb-1.5 line-clamp-1">
        <Link
          href={`${pathUrl.includes("products")
            ? `${item?.slug}`
            : `products/${item?.slug}`
            }`}
        >
          {" "}
          {item.title}{" "}
        </Link>
      </h3>

      <span className="flex items-center gap-2 text-base font-medium">
        {item.discountedPrice && (
          <span className="line-through text-dark-4">
            {formatPrice(item.price)}
          </span>
        )}
        <span className="text-dark">
          {formatPrice(item.discountedPrice || item.price)}
        </span>
      </span>
    </div>
  );
};

export default ProductItem;
