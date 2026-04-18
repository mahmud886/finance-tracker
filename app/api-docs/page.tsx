'use client';

import SwaggerUIComponent from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  return (
    <div className="swagger-light-mode">
      <style>{`
        .swagger-light-mode,
        .swagger-light-mode .swagger-ui {
          color-scheme: light;
          background: #ffffff;
          color: #111827;
        }

        .swagger-light-mode .swagger-ui .topbar,
        .swagger-light-mode .swagger-ui .scheme-container {
          background: #ffffff;
          box-shadow: none;
        }

        .swagger-light-mode .swagger-ui .opblock,
        .swagger-light-mode .swagger-ui .responses-inner,
        .swagger-light-mode .swagger-ui .model-box,
        .swagger-light-mode .swagger-ui table,
        .swagger-light-mode .swagger-ui .info,
        .swagger-light-mode .swagger-ui .wrapper {
          background: #ffffff;
          color: #111827;
        }

        .swagger-light-mode .swagger-ui .opblock-description-wrapper p,
        .swagger-light-mode .swagger-ui .response-col_description,
        .swagger-light-mode .swagger-ui .parameter__name,
        .swagger-light-mode .swagger-ui .parameter__type,
        .swagger-light-mode .swagger-ui .markdown p,
        .swagger-light-mode .swagger-ui .info p,
        .swagger-light-mode .swagger-ui .info li,
        .swagger-light-mode .swagger-ui label,
        .swagger-light-mode .swagger-ui span,
        .swagger-light-mode .swagger-ui div,
        .swagger-light-mode .swagger-ui td,
        .swagger-light-mode .swagger-ui th {
          color: #111827;
        }
      `}</style>
      <SwaggerUIComponent
        url="/api/v1/openapi.json"
        deepLinking
        defaultModelsExpandDepth={1}
        docExpansion="list"
      />
    </div>
  );
}

