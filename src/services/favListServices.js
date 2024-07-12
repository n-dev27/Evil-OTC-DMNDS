import axios from "axios";
import backend_port from "../constants/configs";

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: `${backend_port}/api/favList`, // move common part of url here
  headers: { 'Content-Type': 'application/json' } // set common headers here, if any
});

const createList = async (data) => {
  try {
    const response = await axiosInstance.post(`/create`, data);
    return response;
  } catch (error) {
    // Perhaps log this error somewhere for debugging or analysis
    console.error('Failed to create list:', error);
    return null;
  }
};

const getAllList = async () => {
  try {
    const response = await axiosInstance.get();
    return response;
  } catch (error) {
    console.error('Failed to get all lists:', error);
    return null;
  }
};

const getOneList = async (userWalletAddr) => {
  try {
    const response = await axiosInstance.get(`/${userWalletAddr}`);
    return response;
  } catch (error) {
    console.error(`Failed to get list for wallet ${userWalletAddr}:`, error);
    return null;
  }
};

const deleteList = async (userWalletAddr, tokenAddr, poolAddr) => {
  try {
    const response = await axiosInstance.delete(`/delete/${userWalletAddr}`, {
      params: {
        tokenAddr: tokenAddr,
        poolAddr: poolAddr
      }
    });
    return response;
  } catch (error) {
    console.error(`Failed to delete list for wallet ${userWalletAddr}:`, error);
    return null;
  }
};

// Export individual items instead of a single default object
// It leads to a more clear and explicit import structure in consuming modules
export {
  createList,
  getAllList,
  getOneList,
  deleteList,
};