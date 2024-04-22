import axios from 'axios';

export default class {
  constructor(basePath = 'http://127.0.0.1:3001') {
    // this.api_key = api_key;
    this.basePath = basePath;

    const axiosConfig = {
      baseURL: `${this.basePath}/api`,
      timeout: 300,
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

  getArticleById(id) {
    // 1. Build endpoint based on id
    // 2. return this.request
  }

  createArticle(body) {
    // 1. Build endpoint
    // 2. return this.request with body attached
  }
}