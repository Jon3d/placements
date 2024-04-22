import axios from 'axios';

export default class {
  constructor(basePath = 'http://127.0.0.1:3001') {
    // this.api_key = api_key;
    this.basePath = basePath;

    const axiosConfig = {
      baseURL: `${this.basePath}/api`,
      timeout: 1000,
    };

    this.client = axios.create(axiosConfig);
  }

  /**
   * Data fetch
   * @params
   *  url params object, valid params are
   *  size: default 10
   *  start: default 0
   *  sort: column name to sort on, default campaign_id
   *  reverse: reverse sort direction, default false
   * @returns [lineItemObj] Returns array of line items
   */
  async getData(params = {}) {
    const queryString = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    const response = await this.client(`/data?${queryString}`);
    return response.data;
  }

  async exportFile(type = 'csv') {
    const config = { responseType: 'blob' };
    const response = await this.client.get(`/data/export?type=${type}`, config);
    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `campaign_data_${new Date().toISOString()}.${type}`;
    link.click();
    link.remove();
  }

  getArticleById(id) {
    // 1. Build endpoint based on id
    // 2. return this.request
  }

  createArticle(body) {
    // 1. Build endpoint
    // 2. return this.request with body attached
  }
}