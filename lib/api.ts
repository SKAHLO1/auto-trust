const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper to get user ID from localStorage
const getUserId = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("userId") || "anonymous";
    }
    return "anonymous";
};

// Helper to create headers with authentication
const createHeaders = (additionalHeaders: Record<string, string> = {}) => {
    return {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
        ...additionalHeaders,
    };
};

export const api = {
    async getTasks() {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
            headers: createHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch tasks");
        return res.json();
    },

    async createTask(taskData: any) {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
            method: "POST",
            headers: createHeaders(),
            body: JSON.stringify(taskData),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || "Failed to create task";
            console.error("Task creation failed:", errorData);
            throw new Error(errorMessage);
        }
        return res.json();
    },

    async depositEscrow(taskId: string, amount: number, transactionHash: string) {
        const res = await fetch(`${API_BASE_URL}/escrow/deposit`, {
            method: "POST",
            headers: createHeaders(),
            body: JSON.stringify({ taskId, amount, transactionHash }),
        });
        if (!res.ok) throw new Error("Failed to record escrow deposit");
        return res.json();
    },

    async getSubmission(submissionId: string) {
        const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
            headers: createHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch submission");
        return res.json();
    },

    async verifySubmission(submissionId: string) {
        const res = await fetch(`${API_BASE_URL}/verify`, {
            method: "POST",
            headers: createHeaders(),
            body: JSON.stringify({ submissionId }),
        });
        if (!res.ok) throw new Error("Failed to verify submission");
        return res.json();
    },

    async getTaskById(taskId: string) {
        const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            headers: createHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch task");
        return res.json();
    },

    async createSubmission(taskId: string, submissionData: any) {
        const res = await fetch(`${API_BASE_URL}/submissions`, {
            method: "POST",
            headers: createHeaders(),
            body: JSON.stringify({ taskId, ...submissionData }),
        });
        if (!res.ok) throw new Error("Failed to create submission");
        return res.json();
    },

    async getTaskSubmissions(taskId: string) {
        const res = await fetch(`${API_BASE_URL}/submissions/task/${taskId}`, {
            headers: createHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch submissions");
        return res.json();
    },

    async releasePayment(submissionId: string, recipientAddress: string, escrowPrivateKey: string) {
        const res = await fetch(`${API_BASE_URL}/escrow/release`, {
            method: "POST",
            headers: createHeaders(),
            body: JSON.stringify({ submissionId, recipientAddress, escrowPrivateKey }),
        });
        if (!res.ok) throw new Error("Failed to release payment");
        return res.json();
    },

    async refundPayment(taskId: string, escrowPrivateKey: string) {
        const res = await fetch(`${API_BASE_URL}/escrow/refund`, {
            method: "POST",
            headers: createHeaders(),
            body: JSON.stringify({ taskId, escrowPrivateKey }),
        });
        if (!res.ok) throw new Error("Failed to refund payment");
        return res.json();
    },

    async getEscrowStatus(taskId: string) {
        const response = await fetch(`${API_BASE_URL}/escrow/status/${taskId}`, {
            headers: createHeaders(),
        });
        if (!response.ok) throw new Error("Failed to get escrow status");
        return response.json();
    },

    // Payment History
    async getPaymentHistory() {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            headers: createHeaders(),
        });
        if (!response.ok) throw new Error("Failed to get payment history");
        return response.json();
    },

    async getPaymentSummary() {
        const response = await fetch(`${API_BASE_URL}/payments/summary`, {
            headers: createHeaders(),
        });
        if (!response.ok) throw new Error("Failed to get payment summary");
        return response.json();
    },
};
