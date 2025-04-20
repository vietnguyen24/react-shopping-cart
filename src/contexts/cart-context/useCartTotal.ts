import { useCartContext } from './CartContextProvider';
import { ICartProduct } from 'models';

const useCartTotal = () => {
  const { total, setTotal } = useCartContext();

  const updateCartTotal = (products: ICartProduct[]) => {
    const productQuantity = products.reduce(
      (sum: number, product: ICartProduct) => {
        sum += product.quantity;
        return sum;
      },
      0
    );

    const totalPrice = products.reduce((sum: number, product: ICartProduct) => {
      sum += product.price * product.quantity;
      return sum;
    }, 0);


    const total = {
      productQuantity,
      totalPrice,
      installments: 0, // Assuming you want to set this to 0 for now
      currencyId: 'USD',
      currencyFormat: '$',
    };

    setTotal(total);
  };

  return {
    total,
    updateCartTotal,
  };
};

export default useCartTotal;
