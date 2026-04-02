const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function enhanceTaskAI(title, description) {
  try {
    if (!API_BASE) {
      console.error("Missing VITE_API_BASE_URL");
      return null;
    }

    const res = await fetch(`${API_BASE}/api/enhance-task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("AI backend error:", errorText);
      throw new Error("AI request failed");
    }

    const data = await res.json();

    return {
      improved_title: data.improved_title,
      improved_description: data.improved_description,
      suggested_priority: data.suggested_priority,
      suggested_due_date: data.suggested_due_date,
      recommended_status: data.recommended_status,
      coaching_recommendation: data.coaching_recommendation,
    };
  } catch (error) {
    console.error("AI error:", error);
    return null;
  }
}