const BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },
  
  async register(userData) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return response.json();
  },
  
  async getPrescriptions(token) {
    const response = await fetch(`${BASE_URL}/prescriptions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch prescriptions');
    }
    
    return response.json();
  },
  
  async uploadSession(token, prescriptionId, videoFile) {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('prescription_id', prescriptionId);
    
    const response = await fetch(`${BASE_URL}/sessions/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },
  
  async getSession(token, sessionId) {
    const response = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }
    
    return response.json();
  },
  
  async getReport(token, sessionId) {
    const response = await fetch(`${BASE_URL}/reports/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch report');
    }
    
    return response.json();
  },
  
  async approveReport(token, reportId, approved, notes) {
    const response = await fetch(`${BASE_URL}/reports/${reportId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        approved,
        notes,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to approve report');
    }
    
    return response.json();
  },
};