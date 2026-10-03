export const generateEmailDraft = async (
  tenantName: string,
  type: "overdue_rent" | "lease_expiry" | "maintenance_notice" | "welcome",
  details: string,
): Promise => {
  try {
    const token = localStorage.getItem("propMinds_token");
    const res = await fetch(
      "http://localhost:3001/api/ai/draft-communication",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tenantName, type, details }),
      },
    );

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data.draft || "Unable to generate draft.";
  } catch (error) {
    console.error("AI Proxy Error:", error);
    return "Error generating draft. Please ensure the backend is running and the API key is configured in the server's .env file.";
  }
};
