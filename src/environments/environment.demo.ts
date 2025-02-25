const baseURL ="https://api.opsmaster.ai/cloudmatiq";
const webURL = "https://app.opsmaster.ai";
const dashboardURL = "https://dashboard.opsmaster.ai";
const dashboardAPIURL = "https://dashboardapi.opsmaster.ai";
const webHooksBaseUrl = "http://16.171.60.199:5000";
const orchURL = "https://api.opsmaster.ai/cloudmatiq";
export const environment = {
  production: false,
  baseURL: baseURL,
  weburl: webURL,
  dashboardURL,
  dashboardAPIURL,
  webHooksBaseUrl: webHooksBaseUrl,
  orchURL: orchURL
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
