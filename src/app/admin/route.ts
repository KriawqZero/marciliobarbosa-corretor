import { NextResponse } from 'next/server'

const DEFAULT_TEMPLATE = {
  // Importante: esta estrutura é o "payload" que vai para o POST /api/imovel.
  // Você pode copiar e colar na IA para ela gerar um JSON bem completo.
  // O POST aceita payload mínimo, mas quanto mais campos você enviar, melhor o resultado.
  title: '',
  // Opcional: slug pode ser gerado automaticamente pelo backend
  slug: '',

  // Enumerados
  purpose: 'venda', // 'venda' | 'aluguel'
  type: 'casa', // 'casa' | 'apartamento' | 'terreno' | 'rural' | 'comercial'
  city: 'corumba', // 'corumba' | 'ladario'

  // Opcional: pode ser derivado; no banco existe citySlug (sem depender do enum)
  citySlug: '',
  neighborhood: '',

  // Preço (o backend usa inteiro; ex: 380000 = R$ 380.000)
  price: 0,
  priceSuffix: null, // '/mês' | 'à vista' | etc
  priceNote: null, // texto livre (ex: "Aceita financiamento")

  shortDescription: '',
  longDescription: '',

  bedrooms: null,
  bathrooms: null,
  parkingSpaces: null,

  // Áreas (o backend tem fallback)
  totalArea: 0,
  builtArea: null,

  // Banners/flags
  featured: false,
  specialOpportunity: false,
  tags: [],

  // Estado do imóvel (controla disponibilidade)
  status: 'disponivel', // 'disponivel' | 'reservado' | 'vendido' | 'alugado'

  // Opcional: se vazio, o admin tenta derivar de images[0].src;
  // e o backend também aplica fallback.
  coverImageUrl: '',

  // Opcional: se vazio, o backend gera uma mensagem padrão com link do imóvel.
  whatsappMessage: '',

  // Galeria
  images: [
    {
      src: 'https://SEU_BUCKET_URL/properties/temp/SEU_TEMP_ID/image-xxxxx.png',
      alt: 'Foto 1',
      width: 1200,
      height: 800,
      // Opcional: se não vier, o backend usa o índice.
      sortOrder: 0,
    },
  ],

  // Só para facilitar a IA (não é usado pelo backend)
  _meta: {
    requiredForMinimalPost: ['title', 'price', 'city', 'type', 'purpose'],
    enums: {
      purpose: ['venda', 'aluguel'],
      type: ['casa', 'apartamento', 'terreno', 'rural', 'comercial'],
      city: ['corumba', 'ladario'],
      status: ['disponivel', 'reservado', 'vendido', 'alugado'],
    },
    notes: [
      'tags deve ser um array de strings (ex: ["financiamento","quintal"]).',
      'images é opcional no sentido de "aceitar", mas sem imagens o frontend mostra fallback.',
      'coverImageUrl pode ser omitido; prefira deixar em branco e manter images[0] como primeira imagem.',
    ],
  },
}

const TEMPLATE_JSON = JSON.stringify(DEFAULT_TEMPLATE, null, 2)

function html(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin — Cadastrar Imóvel</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem 1rem;
    }

    .container {
      max-width: 860px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 2rem;
      border-bottom: 1px solid #2d3748;
      padding-bottom: 1.25rem;
    }

    header h1 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #f7fafc;
      letter-spacing: -0.01em;
    }

    header p {
      margin-top: 0.25rem;
      font-size: 0.8rem;
      color: #718096;
    }

    .field {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }

    input[type="password"], input[type="text"] {
      width: 100%;
      background: #1a202c;
      border: 1px solid #2d3748;
      border-radius: 6px;
      color: #e2e8f0;
      font-size: 0.875rem;
      padding: 0.6rem 0.75rem;
      outline: none;
      transition: border-color 0.15s;
    }

    input[type="password"]:focus, input[type="text"]:focus {
      border-color: #4a90d9;
    }

    .editor-wrapper {
      border: 1px solid #2d3748;
      border-radius: 8px;
      overflow: hidden;
      background: #1a202c;
    }

    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: #171e2e;
      border-bottom: 1px solid #2d3748;
    }

    .editor-toolbar span {
      font-size: 0.7rem;
      color: #718096;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      flex: 1;
    }

    #editor-host {
      min-height: 480px;
      font-size: 13px;
    }

    .cm-editor {
      background: #1a202c !important;
    }
    .cm-editor.cm-focused { outline: none !important; }
    .cm-gutters {
      background: #171e2e !important;
      border-right: 1px solid #2d3748 !important;
      color: #4a5568 !important;
    }
    .cm-activeLineGutter { background: #202838 !important; }
    .cm-activeLine { background: #202838 !important; }
    .cm-selectionBackground, .cm-focused .cm-selectionBackground {
      background: #2a4365 !important;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    button {
      cursor: pointer;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.55rem 1.1rem;
      transition: opacity 0.15s, background 0.15s;
    }

    button:hover { opacity: 0.88; }
    button:active { opacity: 0.75; }

    #btn-submit {
      background: #2b6cb0;
      color: #fff;
      padding: 0.6rem 1.4rem;
    }

    #btn-format {
      background: #2d3748;
      color: #a0aec0;
    }

    #btn-reset {
      background: #2d3748;
      color: #a0aec0;
    }

    .drop-zone {
      margin-top: 1rem;
      border: 2px dashed #4a5568;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      background: #1a202c;
      transition: all 0.2s;
    }

    .drop-zone.drag-over {
      border-color: #4a90d9;
      background: #202838;
    }

    .drop-zone p {
      font-size: 0.85rem;
      color: #718096;
      margin: 0;
    }

    .drop-zone p strong {
      color: #a0aec0;
    }

    .image-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .image-thumb {
      position: relative;
      aspect-ratio: 4/3;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #2d3748;
      background: #171e2e;
    }

    .image-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-thumb .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      border: none;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      line-height: 1;
    }

    .image-thumb .info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 4px 6px;
      background: rgba(0, 0, 0, 0.7);
      font-size: 0.65rem;
      color: #a0aec0;
      text-align: center;
    }

    .uploading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 17, 23, 0.8);
      color: #a0aec0;
      font-size: 0.75rem;
    }

    .limit-warning {
      color: #feb2b2;
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }

    .response-section {
      margin-top: 1.5rem;
    }

    .response-section label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    #status-badge {
      display: inline-block;
      font-size: 0.65rem;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-ok { background: #276749; color: #9ae6b4; }
    .badge-err { background: #742a2a; color: #feb2b2; }
    .badge-idle { background: #2d3748; color: #718096; }

    #response-host {
      margin-top: 0.5rem;
      border: 1px solid #2d3748;
      border-radius: 8px;
      overflow: hidden;
      background: #1a202c;
      min-height: 120px;
    }

    .hint {
      margin-top: 1.25rem;
      padding: 0.75rem 1rem;
      background: #1a2035;
      border: 1px solid #2a3a5c;
      border-radius: 8px;
      font-size: 0.75rem;
      color: #718096;
      line-height: 1.6;
    }

    .hint strong { color: #a0aec0; }

    .hint code {
      background: #2d3748;
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.7rem;
      color: #81e6d9;
    }
  </style>
</head>
<body>
<div class="container">
  <header>
    <h1>Cadastrar Imóvel</h1>
    <p>Preencha o JSON abaixo e clique em Enviar. O cover é automaticamente o primeiro item de <code style="background:#2d3748;padding:1px 5px;border-radius:3px;font-size:0.7rem;color:#81e6d9">images</code>.</p>
  </header>

  <div class="field">
    <label for="api-password">API Password (Bearer token)</label>
    <input type="password" id="api-password" placeholder="Cole o valor de API_PASSWORD aqui" autocomplete="off" />
  </div>

  <div class="field" style="margin-bottom: 0.5rem;">
    <label>Imagens (máx. 30) — Cole (Ctrl+V) ou arraste arquivos</label>
    <div id="image-gallery" class="image-gallery"></div>
    <div id="drop-zone" class="drop-zone">
      <p><strong>Ctrl+V</strong> para colar da área de transferência<br>ou <strong>arraste</strong> arquivos aqui</p>
      <p style="margin-top: 0.5rem; font-size: 0.75rem;">JPG, PNG, WebP — máx. 10MB cada</p>
    </div>
    <div id="limit-warning" class="limit-warning" style="display: none;">Limite de 30 imagens atingido</div>
  </div>

  <div class="field" style="margin-bottom: 0.5rem;">
    <label>Payload JSON</label>
    <div class="editor-wrapper">
      <div class="editor-toolbar">
        <span>JSON</span>
        <button id="btn-format">{ } Formatar</button>
        <button id="btn-reset">↺ Reset</button>
      </div>
      <div id="editor-host"></div>
    </div>
  </div>

  <div class="actions">
    <button id="btn-submit">Enviar para /api/imovel →</button>
  </div>

  <div class="hint">
    <strong>Campos obrigatórios:</strong> <code>title</code>, <code>purpose</code> (venda|aluguel), <code>type</code> (casa|apartamento|terreno|rural|comercial), <code>city</code> (corumba|ladario), <code>price</code>.<br/>
    <strong>Cover:</strong> o campo <code>coverImageUrl</code> é derivado de <code>images[0].src</code> — use o botão "Sync cover" para preencher automaticamente, ou deixe em branco para usar o fallback da API.<br/>
    <strong>Slug:</strong> gerado automaticamente a partir do <code>title</code> se não fornecido.
  </div>

  <div class="response-section">
    <label>
      Resposta da API
      <span id="status-badge" class="badge-idle">aguardando</span>
    </label>
    <div id="response-host"></div>
  </div>
</div>

<script type="module">
  import { EditorView, basicSetup } from 'https://esm.sh/codemirror@6.0.1'
  import { json, jsonLanguage } from 'https://esm.sh/@codemirror/lang-json@6.0.1'
  import { oneDark } from 'https://esm.sh/@codemirror/theme-one-dark@6.1.2'
  import { linter, lintGutter } from 'https://esm.sh/@codemirror/lint@6.8.5'

  const TEMPLATE = ${TEMPLATE_JSON}

  // ---- JSON linter ----
  const jsonLinter = linter((view) => {
    const diagnostics = []
    try {
      JSON.parse(view.state.doc.toString())
    } catch (e) {
      const msg = e.message
      const match = msg.match(/position (\\d+)/)
      const pos = match ? parseInt(match[1], 10) : 0
      diagnostics.push({
        from: Math.min(pos, view.state.doc.length),
        to: Math.min(pos + 1, view.state.doc.length),
        severity: 'error',
        message: msg,
      })
    }
    return diagnostics
  })

  // ---- Image handling ----
  const MAX_IMAGES = 30
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const gallery = document.getElementById('image-gallery')
  const dropZone = document.getElementById('drop-zone')
  const limitWarning = document.getElementById('limit-warning')

  function getImageCount() {
    try {
      const parsed = JSON.parse(getEditorText())
      return parsed?.images?.length || 0
    } catch {
      return 0
    }
  }

  function updateGallery() {
    let images = []
    try {
      const parsed = JSON.parse(getEditorText())
      images = parsed?.images || []
    } catch {
      images = []
    }

    gallery.innerHTML = ''
    images.forEach((img, index) => {
      const thumb = document.createElement('div')
      thumb.className = 'image-thumb'
      thumb.innerHTML = '<img src="' + img.src + '" alt="' + (img.alt || '') + '" loading="lazy">' +
        '<button class="remove-btn" data-index="' + index + '" title="Remover">×</button>' +
        '<div class="info">' + img.width + '×' + img.height + '</div>'
      gallery.appendChild(thumb)
    })

    // Update limit warning visibility
    const count = images.length
    limitWarning.style.display = count >= MAX_IMAGES ? 'block' : 'none'
    dropZone.style.display = count >= MAX_IMAGES ? 'none' : 'block'

    // Bind remove buttons
    gallery.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index)
        try {
          const parsed = JSON.parse(getEditorText())
          if (parsed?.images?.length > idx) {
            parsed.images.splice(idx, 1)
            setEditorText(JSON.stringify(parsed, null, 2))
            updateGallery()
          }
        } catch {}
      })
    })
  }

  async function uploadImage(file) {
    const password = document.getElementById('api-password').value.trim()
    if (!password) {
      alert('Preencha o campo API Password antes de fazer upload.')
      return null
    }

    // Show uploading indicator in gallery
    const thumb = document.createElement('div')
    thumb.className = 'image-thumb'
    thumb.innerHTML = '<div class="uploading-overlay">↑</div>'
    gallery.appendChild(thumb)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + password },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }

      const data = await res.json()

      // Add to JSON
      const parsed = JSON.parse(getEditorText())
      if (!Array.isArray(parsed.images)) parsed.images = []
      parsed.images.push({
        src: data.url,
        alt: file.name,
        width: data.width,
        height: data.height,
      })
      setEditorText(JSON.stringify(parsed, null, 2))
      updateGallery()

      return data
    } catch (err) {
      thumb.remove()
      alert('Erro no upload: ' + err.message)
      return null
    }
  }

  function handleFiles(files) {
    const count = getImageCount()
    const remaining = MAX_IMAGES - count

    if (remaining <= 0) {
      alert('Limite de ' + MAX_IMAGES + ' imagens atingido.')
      return
    }

    const validFiles = Array.from(files)
      .filter(f => ALLOWED_TYPES.includes(f.type))
      .slice(0, remaining)

    if (validFiles.length === 0) {
      alert('Nenhuma imagem válida (JPG, PNG, WebP) encontrada.')
      return
    }

    validFiles.forEach(uploadImage)
  }

  // Paste handler
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    const files = []
    for (const item of items) {
      if (item.kind === 'file' && ALLOWED_TYPES.includes(item.type)) {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    }

    if (files.length > 0) {
      e.preventDefault()
      handleFiles(files)
    }
  })

  // Drag & drop handlers
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropZone.classList.add('drag-over')
  })

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over')
  })

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault()
    dropZone.classList.remove('drag-over')
    handleFiles(e.dataTransfer?.files)
  })

  // ---- Editor principal ----
  const mainEditor = new EditorView({
    doc: JSON.stringify(TEMPLATE, null, 2),
    extensions: [basicSetup, json(), oneDark, jsonLinter, lintGutter()],
    parent: document.getElementById('editor-host'),
  })

  // ---- Editor de resposta (somente leitura) ----
  const responseEditor = new EditorView({
    doc: '',
    extensions: [
      basicSetup,
      json(),
      oneDark,
      EditorView.editable.of(false),
    ],
    parent: document.getElementById('response-host'),
  })

  function setResponseContent(text) {
    responseEditor.dispatch({
      changes: { from: 0, to: responseEditor.state.doc.length, insert: text },
    })
  }

  function getEditorText() {
    return mainEditor.state.doc.toString()
  }

  function setEditorText(text) {
    mainEditor.dispatch({
      changes: { from: 0, to: mainEditor.state.doc.length, insert: text },
    })
  }

  // ---- Format button ----
  document.getElementById('btn-format').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(getEditorText())
      setEditorText(JSON.stringify(parsed, null, 2))
    } catch {
      /* ignore — linter already shows the error */
    }
  })

  // ---- Reset button ----
  document.getElementById('btn-reset').addEventListener('click', () => {
    setEditorText(JSON.stringify(TEMPLATE, null, 2))
    updateGallery()
  })

  // ---- Submit button ----
  document.getElementById('btn-submit').addEventListener('click', async () => {
    const password = document.getElementById('api-password').value.trim()
    if (!password) {
      alert('Preencha o campo API Password antes de enviar.')
      return
    }

    let payload
    try {
      payload = JSON.parse(getEditorText())
    } catch (e) {
      alert('JSON inválido: ' + e.message)
      return
    }

    // Auto-derive coverImageUrl from images[0].src if not explicitly set
    if (!payload.coverImageUrl && Array.isArray(payload.images) && payload.images[0]?.src) {
      payload.coverImageUrl = payload.images[0].src
    }

    const badge = document.getElementById('status-badge')
    badge.textContent = 'enviando…'
    badge.className = 'badge-idle'

    try {
      const res = await fetch('/api/imovel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + password,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      const pretty = JSON.stringify(data, null, 2)
      setResponseContent(pretty)

      if (res.ok) {
        badge.textContent = res.status + ' OK'
        badge.className = 'badge-ok'
      } else {
        badge.textContent = res.status + ' Erro'
        badge.className = 'badge-err'
      }
    } catch (err) {
      setResponseContent(JSON.stringify({ error: err.message }, null, 2))
      badge.textContent = 'Erro de rede'
      badge.className = 'badge-err'
    }
  })
</script>
</body>
</html>`
}

export async function GET() {
  return new NextResponse(html(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
