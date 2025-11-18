const API = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path, method = "GET", body = null) {
  const token = getToken();
  const headers = {};
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };
  const res = await fetch(`${API}${path}`, config);
  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, message: data.message || "Request error" };
  }
  return data;
}

export async function apiPost(path, body) {
  return apiFetch(path, "POST", body);
}

export async function deleteInvalidPengaduan(id) {
  const path = `/pengaduan/${id}/delete-invalid`;
  try {
    const result = await apiFetch(path, "DELETE");
    return result;
  } catch (error) {
    throw error;
  }
}
