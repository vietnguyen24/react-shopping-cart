import { useProducts } from 'contexts/products-context';
import * as S from './style';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Filter = () => {
  const { filters, filterProducts } = useProducts();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch categories only once
  useEffect(() => {
    const fetchCategories = async () => {
      if (isLoading || categories.length > 0) return;
      
      setIsLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_GATEWAY_ORIGIN}/products/categories`);
        setCategories(res.data.body);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const selectedCheckboxes = new Set(filters);

  const toggleCheckbox = (label: string) => {
    // Create a new Set to avoid mutating the original
    const updatedFilters = new Set(selectedCheckboxes);
    
    if (updatedFilters.has(label)) {
      updatedFilters.delete(label);
    } else {
      updatedFilters.add(label);
    }

    filterProducts(Array.from(updatedFilters));
  };

  const createCheckbox = (label: string) => (
    <S.Checkbox 
      label={label} 
      handleOnChange={toggleCheckbox} 
      key={label} 
      // Only pass isChecked if your Checkbox component supports it
      // isChecked={selectedCheckboxes.has(label)}
    />
  );

  const createCheckboxes = () => categories.length > 0 ? categories.map(createCheckbox) : null;

  return (
    <S.Container>
      <S.Title>Categories:</S.Title>
      {createCheckboxes()}
    </S.Container>
  );
};

export default Filter;
