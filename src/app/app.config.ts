import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ErrorHandler } from '@angular/core';

class CustomErrorHandler implements ErrorHandler {
  handleError(error: any) {
    console.error('Global error:', error);
  }
}

export const appConfig = {
  providers: [
    provideRouter(routes),
    { provide: ErrorHandler, useClass: CustomErrorHandler }
  ]
};