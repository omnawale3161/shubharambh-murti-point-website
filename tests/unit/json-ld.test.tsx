import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JsonLd } from "@/components/JsonLd";

describe("JsonLd", () => {
  it("renders each schema as an individual object script", () => {
    const schemas = [
      { "@context": "https://schema.org", "@type": "Store" },
      { "@context": "https://schema.org", "@type": "WebSite" }
    ];

    const markup = renderToStaticMarkup(<JsonLd data={schemas} />);

    expect(markup.match(/application\/ld\+json/g)).toHaveLength(2);
    expect(markup).not.toContain('[{"@context"');
    expect(markup).toContain('{"@context":"https://schema.org","@type":"Store"}');
    expect(markup).toContain('{"@context":"https://schema.org","@type":"WebSite"}');
  });

  it("escapes markup-sensitive characters", () => {
    const markup = renderToStaticMarkup(
      <JsonLd data={{ "@context": "https://schema.org", description: "</script>" }} />
    );

    expect(markup).toContain("\\u003c/script>");
    expect(markup).not.toContain("</script></script>");
  });
});
