import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

/**
 * Отказ подъёма не перехватывается: перехваченный, он превращается в строку журнала браузера и
 * пустую страницу, а неперехваченный доходит до слушателей ошибок, объявленных в настройке
 * приложения, и виден целиком — со стеком и причиной.
 */
void bootstrapApplication(App, appConfig);
