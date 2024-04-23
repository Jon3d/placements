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

  /**
   * Aggregate fetch
   * @params
   *  url params object, valid params are
   *  size: default 10
   *  start: default 0
   *  aggregate_on: default campaign_id
   *  sort: column name to sort on, default actual_amount
   *  reverse: reverse sort direction, default false
   * @returns [lineItemObj] Returns array of line items
   */
  async getAggregations(params = {}) {
    const queryString = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    const response = await this.client(`/data/aggregate?${queryString}`);
    return response.data;
  }

  /**
   * Fetch line item object by id
   * @params
   *  id: lineitem id
   * @returns lineItemObj
   */
  async getLineItemById(id) {
    const response = await this.client.get(`/data/${id}`);
    return response.data;
  }

  /**
    * Save Adjustment By Line Item ID
    * @params
    *  id: lineitem id
    *  adjustments: currency adjustment
    * @returns success: true on succesful save
    */
  async saveAdjustmentById(id, adjustments) {
    const data = {
      adjustments,
    };
    const response = await this.client.put(`/data/${id}`, data);
    return response.data;
  }

  /**
  * Find Query
  * @params
  *  search: searchText
  * @returns [lineItemObj]
  */
  async query(query) {
    const data = {
      query,
    };
    const response = await this.client.post(`/data/query`, data);
    return response.data;
  }

  /**
    * Export data to file
    * @params
    *  type: csv|xlsx are supported
    */
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
}