import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MarkdownModule ,MarkedOptions} from 'ngx-markdown';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,   // enables GitHub Flavored Markdown (tables, strikethrough, etc.)
  breaks: true // line breaks support
});

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      MarkdownModule.forRoot()
    )
    ]
        },
      );
