const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function apiCall(endpoint, options = {}) {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "anonymous" : "anonymous"

  const headers = {
    "Content-Type": "application/json",
    "x-user-id": userId,
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "API call failed")
  }

  return response.json()
}

// Tasks API
export const tasksAPI = {
  create: (data) =>
    apiCall("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: () => apiCall("/api/tasks"),

  getById: (id) => apiCall(`/api/tasks/${id}`),

  update: (id, data) =>
    apiCall(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
}

// Submissions API
export const submissionsAPI = {
  create: (data) =>
    apiCall("/api/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getByTaskId: (taskId) => apiCall(`/api/submissions/task/${taskId}`),

  getById: (id) => apiCall(`/api/submissions/${id}`),
}

// Verification API
export const verifyAPI = {
  verify: (submissionId) =>
    apiCall("/api/verify", {
      method: "POST",
      body: JSON.stringify({ submissionId }),
    }),

  getResult: (submissionId) => apiCall(`/api/verify/${submissionId}`),
}

// Escrow API
export const escrowAPI = {
  deposit: (data) =>
    apiCall("/api/escrow/deposit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  release: (submissionId) =>
    apiCall("/api/escrow/release", {
      method: "POST",
      body: JSON.stringify({ submissionId }),
    }),
}

// Health check
export const healthAPI = {
  check: () => apiCall("/api/health"),
}
