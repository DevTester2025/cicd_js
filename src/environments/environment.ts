const baseURL ="https://devapi-esko.cloudmatiq.com/cloudmatiq";
const webURL = "http://dev.esko.cloudmatiq.com";
const dashboardURL = "https://stats-dev.cloudmatiq.com";
const dashboardAPIURL = "https://stats-devapi.cloudmatiq.com";
const webHooksBaseUrl = "https://devwebhook-esko.cloudmatiq.com";
const orchURL = "https://devapi-esko.cloudmatiq.com/cloudmatiq";
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
