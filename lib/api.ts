const API_BASE_URL = "http://localhost:5000/api";

export const api = {
    async getTasks() {
        const res = await fetch(`${API_BASE_URL}/tasks`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        return res.json();
    },

    async createTask(taskData: any) {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData),
        });
        if (!res.ok) throw new Error("Failed to create task");
        return res.json();
    },

    async getSubmission(submissionId: string) {
        // This endpoint might need to be created in backend if it doesn't exist specifically for fetching one submission
        // But we have /api/verify/:submissionId which returns verification status
        // Let's assume we can fetch submission details. 
        // If not, we might need to rely on what we have or add an endpoint.
        // Looking at backend routes, we have /api/submissions (POST) but maybe not GET one.
        // For now, let's assume we can get verification status.
        const res = await fetch(`${API_BASE_URL}/verify/${submissionId}`);
        if (!res.ok) throw new Error("Failed to fetch submission");
        return res.json();
    },

    async verifySubmission(submissionId: string) {
        const res = await fetch(`${API_BASE_URL}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionId }),
        });
        if (!res.ok) throw new Error("Failed to verify submission");
        return res.json();
    }
};
