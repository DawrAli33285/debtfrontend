const BASE_URL = 'https://debtbackend.vercel.app/api';

const getToken = () => localStorage.getItem('token');
const getAgencyToken = () => localStorage.getItem('agencyToken');

// =====================
// AUTH
// =====================
export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// =====================
// CLAIMS
// =====================
export const createClaim = async (data) => {
  const res = await fetch(`${BASE_URL}/claims/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getClaims = async () => {
  const res = await fetch(`${BASE_URL}/claims`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const getClaimById = async (id) => {
  const res = await fetch(`${BASE_URL}/claims/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

// =====================
// AGENCIES
// =====================
export const getAgencies = async () => {
  const res = await fetch(`${BASE_URL}/agencies`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const getAgencyById = async (id) => {
  const res = await fetch(`${BASE_URL}/agencies/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

// =====================
// ASSIGNMENTS
// =====================
export const createAssignment = async (data) => {
  const res = await fetch(`${BASE_URL}/assignments/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const closeClaim = async (data) => {
  const res = await fetch(`${BASE_URL}/assignments/close`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMe = async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const acceptTerms = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/accept-terms`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// =====================
// AGENCY AUTH
// =====================
export const registerAgency = async (data) => {
  const res = await fetch(`${BASE_URL}/agencies/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginAgency = async (data) => {
  const res = await fetch(`${BASE_URL}/agencies/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getAgencyMe = async () => {
  const res = await fetch(`${BASE_URL}/agencies/me`, {
    headers: { Authorization: `Bearer ${getAgencyToken()}` },
  });
  return res.json();
};

export const getAgencyAssignments = async () => {
  const res = await fetch(`${BASE_URL}/agencies/assignments`, {
    headers: { Authorization: `Bearer ${getAgencyToken()}` },
  });
  return res.json();
};

export const updateAssignmentStatus = async (data) => {
  const res = await fetch(`${BASE_URL}/agencies/assignments/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// =====================
// CHAT — USER
// =====================
export const getChatRooms = async () => {
  const res = await fetch(`${BASE_URL}/chat/rooms`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const getChatMessages = async (roomId) => {
  const res = await fetch(`${BASE_URL}/chat/${roomId}/messages`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const sendMessage = async (roomId, text) => {
  const res = await fetch(`${BASE_URL}/chat/${roomId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ text }),
  });
  return res.json();
};

export const createChatRoom = async (data) => {
  const res = await fetch(`${BASE_URL}/chat/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// =====================
// CHAT — AGENCY
// =====================
export const getAgencyChatRooms = async () => {
  const res = await fetch(`${BASE_URL}/chat/agency/rooms`, {
    headers: { Authorization: `Bearer ${getAgencyToken()}` },
  });
  return res.json();
};

export const getAgencyChatMessages = async (roomId) => {
  const res = await fetch(`${BASE_URL}/chat/agency/${roomId}/messages`, {
    headers: { Authorization: `Bearer ${getAgencyToken()}` },
  });
  return res.json();
};

export const sendAgencyMessage = async (roomId, text) => {
  const res = await fetch(`${BASE_URL}/chat/agency/${roomId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAgencyToken()}`,
    },
    body: JSON.stringify({ text }),
  });
  return res.json();
};