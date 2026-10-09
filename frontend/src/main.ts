import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // 👈 ใช้ './app/app' ให้ตรงกับไฟล์ app.ts

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));