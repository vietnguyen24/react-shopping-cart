import { useEffect } from 'react';

import Loader from 'components/Loader';
import Filter from 'components/Filter';
import Products from 'components/Products';
import Cart from 'components/Cart';
import LoginButton from 'components/LoginButton';
import Search from 'components/Search';

import { useProducts } from 'contexts/products-context';

import * as S from './style';
import { useUserContext } from 'contexts/user-context/UserContext';

function Main() {
  const { tokenId } = useUserContext();
  const { isFetching, products, fetchProducts } = useProducts();
  
  // Only fetch products once when component mounts
  useEffect(() => {
    // This will only execute the actual fetch if initialFetchDone.current is false
    fetchProducts();
  }, [fetchProducts]);

  return (
    <S.Container>
      {isFetching && <Loader />}
      <S.TwoColumnGrid>
        <S.Side>
          <Filter />
          <Search />
        </S.Side>
        <S.Main>
          <S.MainHeader>
            <p>{products?.length} Product(s) found</p>
          </S.MainHeader>
          <Products products={products} />
        </S.Main>
      </S.TwoColumnGrid>
      {tokenId ? <Cart /> : <LoginButton />}
    </S.Container>
  );  
}

export default Main;
