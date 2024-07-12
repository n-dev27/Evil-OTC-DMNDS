import axios from "axios";
import backend_port from '../constants/configs';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: `${backend_port}/api/subgraph`, // move common part of url here
  headers: { 'Content-Type': 'application/json' } // set common headers here, if any
});

const fetchPoolDataFromSubgraph = async () => {
  try {
    const response = await axiosInstance.get(`/poolList`);
    return response;
  } catch (error) {
    console.error('Failed to get list of pool from subgraph:', error);
    return null;
  }
};

const fetchPurchaseDataFromSubgraph = async (userWalletAddr) => {
  try {
    const response = await axiosInstance.get(`/purchaseList`);
    return response;
  } catch (error) {
    console.error(`Failed to get list of purchaseData from subgraph:`, error);
    return null;
  }
};

// Export individual items instead of a single default object
// It leads to a more clear and explicit import structure in consuming modules
export {
  fetchPoolDataFromSubgraph,
  fetchPurchaseDataFromSubgraph,
};