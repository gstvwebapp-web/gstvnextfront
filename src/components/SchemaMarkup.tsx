/**
 * SchemaMarkup Component
 * Renders JSON-LD structured data in the document head
 * This component should be used in page components to add schema.org markup
 */

import { schemaToJSON } from '@/utils/schemaMarkup';

interface SchemaMarkupProps {
  schema: any;
}

export default function SchemaMarkup({ schema }: SchemaMarkupProps) {
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: schemaToJSON(schema)
      }}
    />
  );
}
