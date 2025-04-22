import { useProducts } from 'contexts/products-context';

import * as S from './style';
import { useEffect, useState } from 'react';
import axios from 'axios';


const Filter = () => {
  const { filters, filterProducts } = useProducts();
  const [categories, setCategories] = useState<string[]>([])
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_GATEWAY_ORIGIN}/products/categories`)
        setCategories(res.data)
      } catch (err) {
        console.log(err)
      }
    })()
  }, [])

  const selectedCheckboxes = new Set(filters);

  const toggleCheckbox = (label: string) => {
    if (selectedCheckboxes.has(label)) {
      selectedCheckboxes.delete(label);
    } else {
      selectedCheckboxes.add(label);
    }

    const filters = Array.from(selectedCheckboxes) as [];
    filterProducts(filters);
  };

  const createCheckbox = (label: string) => (
    <S.Checkbox label={label} handleOnChange={toggleCheckbox} key={label} />
  );

  const createCheckboxes = () => categories? categories.map(createCheckbox): '';

  return (
    <S.Container>
      <S.Title>Categories:</S.Title>
      {createCheckboxes()}
    </S.Container>
  );
};

export default Filter;
