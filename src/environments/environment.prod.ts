const baseURL =
  "https://api-esko.cloudmatiq.com/cloudmatiq";
const webURL = "https://stats.esko-saas.com";
const dashboardURL = "https://stats.esko-saas.com";
const dashboardAPIURL = "https://cda-api.cloudmatiq.com";
const webHooksBaseUrl = "https://webhook-esko.cloudmatiq.com";
const orchURL ="https://api-esko.cloudmatiq.com/cloudmatiq";
export const environment = {
  production: true,
  baseURL: baseURL,
  dashboardURL,
  weburl: webURL,
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
