import React, { useState, useEffect, useRef } from 'react';
import { useProducts } from 'contexts/products-context';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';

// Define a wrapper component for FaSearch with explicit typing
const SearchIcon: React.FC = () => {
  // Type assertion to ensure FaSearch is treated as a valid JSX component
  const Icon = FaSearch as unknown as React.ComponentType<{ size?: number; color?: string; 'data-testid'?: string }>;
  return <Icon data-testid="search-icon" size={18} color="currentColor" />;
};

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  margin: 20px 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => (theme.colors ? theme.colors.secondary : '#1b1a20')};
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  right: 15px;
  color: #999;
  font-size: 18px;
`;

const Search = () => {
  const { searchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const isInitialRender = useRef(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    // Skip the effect on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only trigger search if user has typed something or is clearing the search
    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
    </SearchContainer>
  );
};

export default Search;