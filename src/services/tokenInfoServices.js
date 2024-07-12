import axios from 'axios';
import backend_port from '../constants/configs';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: `${backend_port}/api/token`, // move common part of url here
  headers: { 'Content-Type': 'application/json' } // set common headers here, if any
});

const getTokenMeta = async (tokenContract) => {
  try {
    const response = await axiosInstance.get(`/metaData/${tokenContract}`);
    return response.data; // Might need to adjust based on API response structure
  } catch (error) {
    console.error(`Error in getTokenMeta: ${error}`);
  }
}

const getTokenPrice1 = async (tokenContract, chainID) => {
  try {
    const response = await axiosInstance.get(`/price1/${tokenContract}`, {
      params: {
        chainID,
      },
    });
    return response.data; // Might need to adjust based on API response structure
  } catch (error) {
    console.error(`Error in getTokenPrice1: ${error}`);
  }
}

const getTokenPrice2 = async (tokenSymbol) => {
  try {
    const response = await axiosInstance.get(`/price2/${tokenSymbol}`);
    return response.data; // Might need to adjust based on API response structure
  } catch (error) {
    console.error(`Error in getTokenPrice2: ${error}`);
  }
}

const getTokenPair = async (tokenContract) => {
  try {
    const response = await axiosInstance.get(`/pair/${tokenContract}`);
    return response.data; // Might need to adjust based on API response structure
  } catch (error) {
    console.error(`Error in getTokenPair: ${error}`);
  }
}

export {
  getTokenMeta,
  getTokenPrice1,
  getTokenPrice2,
  getTokenPair,
};