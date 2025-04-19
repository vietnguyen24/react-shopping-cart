import axios from 'axios';
import { IGetProductsResponse } from 'models';


export const getProducts = async (categories:string[] = []) => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_GATEWAY_ORIGIN}/products/${generateParams(categories)}`)
    console.log("products:", res.data.body)
    return res.data.body
  } catch(err) {
    console.log(err)
    return []
  }
}


const generateParams = (categories:string[]) => {
  if (categories.length === 0){
    return ""
  }
  return `?category=${categories.join(',')}`
  
}

