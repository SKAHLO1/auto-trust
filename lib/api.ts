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
        if (!res.ok) throw new Error("Failed to create task");
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
    }
};
