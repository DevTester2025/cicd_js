import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import * as Sentry from '@sentry/browser';

if (environment.production) {
  enableProdMode();
}

Sentry.init({
  dsn: "https://fc970faec312d0a956dce4db864ac497@sentry.napps.cloud/10",
  // integrations: [
  //   Sentry.browserTracingIntegration(),
  //   Sentry.replayIntegration(),
  // ],
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1.0,
});
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));
