import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const apiInstance = axios.create({
  baseURL: API_URL,
});


apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Functions ---

async function addPartyDetails(partyData) {
  try {
    const response = await apiInstance.post('/parties', partyData);
    console.log('Party Saved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Saving Party:', error.response?.data || error.message);
    throw error;
  }
}

async function updatePartyDetails(id, partyData) {
  try {
    const response = await apiInstance.put(`/parties/${id}`, partyData);
    console.log('Party Updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Updating Party:', error.response?.data || error.message);
    throw error;
  }
}

async function deletePartyDetails(id) {
  try {
    const response = await apiInstance.delete(`/parties/${id}`);
    console.log('Party Deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Deleting Party:', error.response?.data || error.message);
    throw error;
  }
}

async function getParties(params = {}) {
  try {
    const response = await apiInstance.get('/parties', { params });
    console.log('Parties Retrieved:', response.data);
    return response?.data?.data || {};
  } catch (error) {
    console.error('Error Retrieving Parties:', error.response?.data || error.message);
    throw error;
  }
}

async function searchParties(query) {
  try {
    const response = await apiInstance.get('/parties', { params: { search: query } });
    console.log('Parties Searched:', response.data);
    return response?.data || response?.data?.data || [];
  } catch (error) {
    console.error('Error Searching Parties:', error.response?.data || error.message);
    throw error;
  }
}

async function getPartyLedger(partyId, startDate, endDate) {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiInstance.get(`/parties/ledger/${partyId}`, { params });
    console.log('Party Ledger:', response.data);
    return response?.data || response;
  } catch (error) {
    console.error('Error fetching party ledger:', error.response?.data || error.message);
    throw error;
  }
}

async function getPartySaudaSummary(partyId) {
  try {
    const response = await apiInstance.get(`/sauda/party/${partyId}/summary`);
    console.log('Party Sauda Summary:', response.data);
    return response?.data || {};
  } catch (error) {
    console.error('Error fetching party sauda summary:', error.response?.data || error.message);
    throw error;
  }
}

export default {
  addPartyDetails,
  updatePartyDetails,
  deletePartyDetails,
  getParties,
  searchParties,
  getPartyLedger,
  getPartySaudaSummary
};