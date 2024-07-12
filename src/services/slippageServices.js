import axios from "axios";
import backend_port from "../constants/configs";

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: `${backend_port}/api/slippage`, // move common part of url here
  headers: { 'Content-Type': 'application/json' } // set common headers here, if any
});

const getSlippageValue = async (chainID, sellToken, sellTokenDecimals, buyToken, sellAmount) => {
  try {
      const response = await axiosInstance.get(`/${chainID}`, {
          params: {
          sellToken: sellToken,
          sellTokenDecimals: sellTokenDecimals,
          buyToken: buyToken,
          sellAmount: sellAmount
        }
    });
    return response;
  } catch (error) {
    console.error('Failed to get slippage value:', error);
    return null;
  }
};

// Export individual items instead of a single default object
// It leads to a more clear and explicit import structure in consuming modules
export {
  getSlippageValue,
};