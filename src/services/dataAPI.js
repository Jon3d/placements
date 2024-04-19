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

  async getData(options) {
    const response = await this.client('/data');
    console.info('response', response);
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