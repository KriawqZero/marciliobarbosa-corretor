interface JsonLdProps {
  data: Record<string, unknown>
}

/// Serializa e escapa o JSON-LD. O escape de `<` não é decoração: uma descrição
/// de imóvel contendo `</script>` encerraria a tag e injetaria HTML na página.
/// U+2028/U+2029 são separadores de linha válidos em JSON mas inválidos dentro
/// de um literal de JavaScript, e quebram o parser quando vêm colados de texto.
function serialize(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  )
}
