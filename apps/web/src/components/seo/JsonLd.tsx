/**
 * Renders one or more schema.org objects as `<script type="application/ld+json">`
 * tags. Kept tiny and dependency-free so it can be used from both server and
 * client components.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
