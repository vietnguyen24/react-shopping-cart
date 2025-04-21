import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';

export const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  margin-bottom: 20px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 35px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #888;
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 16px;
  
  & > svg {
    display: block;
  }
`;