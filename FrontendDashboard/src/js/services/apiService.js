export class ApiService {
  static _getBaseUrl() {
    return 'http://localhost:5001/api'; // Change this if your backend URL or port changes
  }

  static async _fetch(endpoint, options = {}) {
    try {
      const url = `${this._getBaseUrl()}/${endpoint.replace(/^\//, '')}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        },
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ✅ Chatbot: Ask a free-form question
  static async sendChatMessage(message) {
    return this._fetch('chat/chatbot', {
      method: 'POST',
      body: JSON.stringify({ text: message })
    });
  }

  // ✅ Generate Gemini report in the chatbot
  static async generateAnalyticsReport() {
    return this._fetch('chat/report', {
      method: 'POST'
    });
  }

  // ✅ Send Gemini-generated report to email
  static async sendReportToEmail(email) {
    return this._fetch('report/send-now', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // ✅ Chatbot session history (optional if implemented)
  static async getChatHistory() {
    return this._fetch('chat/history');
  }

  static async clearChatHistory() {
    return this._fetch('chat/clear', {
      method: 'POST'
    });
  }

  // ✅ Aggregation analytics endpoints
  static async getAverageTimeSpent() {
    return this._fetch('aggregation/average-time-spent');
  }

  static async getEventCounts() {
    return this._fetch('aggregation/event-counts');
  }

  static async getActiveUsers() {
    return this._fetch('aggregation/active-users');
  }

  static async getDeviceCounts() {
    return this._fetch('aggregation/device-counts');
  }

  static async getBrowserCounts() {
    return this._fetch('aggregation/browser-counts');
  }

  static async getReferringSources() {
    return this._fetch('aggregation/referring-sources');
  }

  static async getTimeDistribution() {
    return this._fetch('aggregation/time-distribution');
  }

  static async getUserActivity() {
    return this._fetch('aggregation/user-activity');
  }

  // ✅ Sentiment analysis endpoints
  static async getSentimentData() {
    return this._fetch('sentiment/data');
  }

  static async analyzeSentiment(text) {
    return this._fetch('sentiment/analyze', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }
}
