import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type ViolationType =
  | 'Nudez'
  | 'Exploração/abuso sexual'
  | 'Assédio'
  | 'Impersonação'
  | 'Outros'

type InvolvesMinor = 'sim' | 'não' | 'não_sei'

type CaseRecord = {
  id: string
  title: string
  instagramUsername: string
  profileUrl: string
  postUrls: string[]
  violationTypes: ViolationType[]
  involvesMinor: InvolvesMinor
  observedAt: string
  notes: string
  createdAt: string
  updatedAt: string
}

type CaseDraft = Omit<CaseRecord, 'id' | 'createdAt' | 'updatedAt'>

type FieldErrors = Partial<Record<keyof CaseDraft, string>>

const STORAGE_KEY = 'report-insta.cases'

const violationOptions: ViolationType[] = [
  'Nudez',
  'Exploração/abuso sexual',
  'Assédio',
  'Impersonação',
  'Outros',
]

const emptyDraft: CaseDraft = {
  title: '',
  instagramUsername: '',
  profileUrl: '',
  postUrls: [],
  violationTypes: [],
  involvesMinor: 'não_sei',
  observedAt: '',
  notes: '',
}

const parseCases = (): CaseRecord[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is CaseRecord => {
      return (
        typeof item?.id === 'string' &&
        typeof item?.title === 'string' &&
        typeof item?.instagramUsername === 'string' &&
        typeof item?.profileUrl === 'string' &&
        Array.isArray(item?.postUrls) &&
        Array.isArray(item?.violationTypes) &&
        typeof item?.involvesMinor === 'string' &&
        typeof item?.observedAt === 'string' &&
        typeof item?.notes === 'string' &&
        typeof item?.createdAt === 'string' &&
        typeof item?.updatedAt === 'string'
      )
    })
  } catch {
    return []
  }
}

const toDraft = (record: CaseRecord): CaseDraft => ({
  title: record.title,
  instagramUsername: record.instagramUsername,
  profileUrl: record.profileUrl,
  postUrls: record.postUrls,
  violationTypes: record.violationTypes,
  involvesMinor: record.involvesMinor,
  observedAt: record.observedAt,
  notes: record.notes,
})

const normalizeLineList = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const validateDraft = (draft: CaseDraft): FieldErrors => {
  const errors: FieldErrors = {}

  if (!draft.title.trim()) {
    errors.title = 'Título é obrigatório.'
  }

  if (!/^[A-Za-z0-9._]{1,30}$/.test(draft.instagramUsername.trim())) {
    errors.instagramUsername = 'Use apenas letras, números, ponto e sublinhado, sem @.'
  }

  if (!isHttpUrl(draft.profileUrl.trim())) {
    errors.profileUrl = 'Informe uma URL válida (http/https).'
  }

  if (draft.postUrls.length === 0) {
    errors.postUrls = 'Adicione pelo menos 1 URL de post.'
  } else if (draft.postUrls.some((url) => !isHttpUrl(url))) {
    errors.postUrls = 'Todas as URLs de post devem ser válidas (http/https).'
  }

  if (draft.violationTypes.length === 0) {
    errors.violationTypes = 'Selecione ao menos um tipo de violação.'
  }

  if (!draft.observedAt) {
    errors.observedAt = 'Informe data e hora observadas.'
  }

  return errors
}

const reportPtBr = (record: CaseDraft) => {
  const links = record.postUrls.map((url) => `- ${url}`).join('\n')

  return `Assunto: Relato de possível violação no Instagram\n\nOlá,\n\nGostaria de reportar o perfil @${record.instagramUsername} (${record.profileUrl}).\n\nPossíveis violações observadas: ${record.violationTypes.join(', ')}.\nEnvolve menor: ${record.involvesMinor}.\nData/hora observada: ${record.observedAt}.\n\nLinks relacionados:\n${links}\n\nResumo objetivo:\n${record.notes || 'Sem observações adicionais.'}\n\nSolicito análise conforme as políticas da plataforma e legislação aplicável. Obrigado(a).`
}

const reportEn = (record: CaseDraft) => {
  const links = record.postUrls.map((url) => `- ${url}`).join('\n')

  return `Subject: Report of potential policy violation on Instagram\n\nHello,\n\nI would like to report the account @${record.instagramUsername} (${record.profileUrl}).\n\nPossible violations observed: ${record.violationTypes.join(', ')}.\nInvolves minor: ${record.involvesMinor}.\nObserved at: ${record.observedAt}.\n\nRelated links:\n${links}\n\nObjective summary:\n${record.notes || 'No additional notes.'}\n\nPlease review this content under platform policies and applicable law. Thank you.`
}

const asJson = (payload: unknown) => JSON.stringify(payload, null, 2)

const csvEscape = (value: string) => `"${value.replaceAll('"', '""')}"`

const asCsv = (records: CaseRecord[]) => {
  const header = [
    'title',
    'username',
    'profileUrl',
    'postUrls',
    'violationTypes',
    'involvesMinor',
    'observedAt',
    'notes',
  ]

  const rows = records.map((record) =>
    [
      record.title,
      record.instagramUsername,
      record.profileUrl,
      record.postUrls.join(' | '),
      record.violationTypes.join(' | '),
      record.involvesMinor,
      record.observedAt,
      record.notes,
    ]
      .map(csvEscape)
      .join(','),
  )

  return [header.join(','), ...rows].join('\n')
}

const download = (name: string, content: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

const safeFilePart = (value: string) => value.trim().replace(/\s+/g, '-').toLowerCase() || 'caso'

function App() {
  const [cases, setCases] = useState<CaseRecord[]>(() => parseCases())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CaseDraft>(emptyDraft)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [page, setPage] = useState<'cases' | 'guide'>('cases')
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, asJson(cases))
  }, [cases])

  const selectedCase = useMemo(
    () => cases.find((record) => record.id === selectedId) ?? null,
    [cases, selectedId],
  )

  const workingCase = selectedCase ? toDraft(selectedCase) : draft

  const postUrlsText = draft.postUrls.join('\n')

  const resetForm = () => {
    setSelectedId(null)
    setDraft(emptyDraft)
    setErrors({})
  }

  const selectCase = (record: CaseRecord) => {
    setSelectedId(record.id)
    setDraft(toDraft(record))
    setErrors({})
  }

  const saveCase = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedDraft: CaseDraft = {
      ...draft,
      title: draft.title.trim(),
      instagramUsername: draft.instagramUsername.trim(),
      profileUrl: draft.profileUrl.trim(),
      notes: draft.notes.trim(),
      postUrls: draft.postUrls.map((url) => url.trim()),
    }

    const validationErrors = validateDraft(normalizedDraft)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    if (selectedId) {
      setCases((prevCases) =>
        prevCases.map((record) =>
          record.id === selectedId
            ? {
                ...record,
                ...normalizedDraft,
                updatedAt: new Date().toISOString(),
              }
            : record,
        ),
      )
      return
    }

    const now = new Date().toISOString()
    const newRecord: CaseRecord = {
      id: crypto.randomUUID(),
      ...normalizedDraft,
      createdAt: now,
      updatedAt: now,
    }

    setCases((prevCases) => [newRecord, ...prevCases])
    setSelectedId(newRecord.id)
  }

  const deleteCase = () => {
    if (!selectedCase) return

    const confirmed = window.confirm(`Excluir o caso "${selectedCase.title}"?`)
    if (!confirmed) return

    setCases((prevCases) => prevCases.filter((record) => record.id !== selectedCase.id))
    resetForm()
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyMessage('Texto copiado!')
      window.setTimeout(() => setCopyMessage(''), 2000)
    } catch {
      setCopyMessage('Falha ao copiar. Copie manualmente.')
    }
  }

  const exportSingleJson = () => {
    if (!selectedCase) return
    download(`${safeFilePart(selectedCase.title)}.json`, asJson(selectedCase), 'application/json')
  }

  const exportAllJson = () => {
    download('report-insta-cases.json', asJson(cases), 'application/json')
  }

  const exportSingleCsv = () => {
    if (!selectedCase) return
    download(`${safeFilePart(selectedCase.title)}.csv`, asCsv([selectedCase]), 'text/csv;charset=utf-8')
  }

  const exportAllCsv = () => {
    download('report-insta-cases.csv', asCsv(cases), 'text/csv;charset=utf-8')
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Report-Insta</h1>
        <p className="disclaimer-banner">
          Este app não envia denúncias e não automatiza ações no Instagram. Ele apenas organiza
          evidências para uso no fluxo oficial de denúncia.
        </p>
        <nav>
          <button
            className={page === 'cases' ? 'active' : ''}
            type="button"
            onClick={() => setPage('cases')}
          >
            Casos
          </button>
          <button
            className={page === 'guide' ? 'active' : ''}
            type="button"
            onClick={() => setPage('guide')}
          >
            Como denunciar
          </button>
        </nav>
      </header>

      {page === 'guide' ? (
        <main className="guide-page">
          <h2>Como denunciar no Instagram</h2>
          <section>
            <h3>Denunciar um perfil</h3>
            <ol>
              <li>Abra o perfil no Instagram.</li>
              <li>Toque em “⋯” no canto superior.</li>
              <li>Toque em “Denunciar”.</li>
              <li>Selecione a categoria adequada e envie.</li>
            </ol>
          </section>
          <section>
            <h3>Denunciar um post</h3>
            <ol>
              <li>Abra o post específico.</li>
              <li>Toque em “⋯”.</li>
              <li>Toque em “Denunciar”.</li>
              <li>Selecione o motivo e conclua.</li>
            </ol>
          </section>
          <p className="guide-note">
            Dica: denúncias com links diretos, data/hora e descrição objetiva costumam ser mais úteis
            para revisão.
          </p>
        </main>
      ) : (
        <main className="workspace">
          <aside>
            <div className="aside-header">
              <h2>Casos</h2>
              <button type="button" onClick={resetForm}>
                Novo caso
              </button>
            </div>
            <ul className="case-list">
              {cases.length === 0 && <li className="empty">Nenhum caso salvo.</li>}
              {cases.map((record) => (
                <li key={record.id}>
                  <button
                    className={record.id === selectedId ? 'active' : ''}
                    type="button"
                    onClick={() => selectCase(record)}
                  >
                    <strong>{record.title}</strong>
                    <span>@{record.instagramUsername}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="export-group">
              <button type="button" onClick={exportAllJson} disabled={cases.length === 0}>
                Exportar todos (JSON)
              </button>
              <button type="button" onClick={exportAllCsv} disabled={cases.length === 0}>
                Exportar todos (CSV)
              </button>
            </div>
          </aside>

          <section className="editor-panel">
            <form onSubmit={saveCase}>
              <div className="field-grid">
                <label>
                  Título
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  />
                  {errors.title && <small>{errors.title}</small>}
                </label>

                <label>
                  Instagram username (sem @)
                  <input
                    value={draft.instagramUsername}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, instagramUsername: event.target.value }))
                    }
                  />
                  {errors.instagramUsername && <small>{errors.instagramUsername}</small>}
                </label>

                <label>
                  URL do perfil
                  <input
                    value={draft.profileUrl}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, profileUrl: event.target.value }))
                    }
                  />
                  {errors.profileUrl && <small>{errors.profileUrl}</small>}
                </label>

                <label>
                  Data/hora observada
                  <input
                    type="datetime-local"
                    value={draft.observedAt}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, observedAt: event.target.value }))
                    }
                  />
                  {errors.observedAt && <small>{errors.observedAt}</small>}
                </label>
              </div>

              <label>
                URLs dos posts (1 por linha)
                <textarea
                  rows={4}
                  value={postUrlsText}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, postUrls: normalizeLineList(event.target.value) }))
                  }
                />
                {errors.postUrls && <small>{errors.postUrls}</small>}
              </label>

              <fieldset>
                <legend>Tipos de violação</legend>
                <div className="checkbox-grid">
                  {violationOptions.map((option) => (
                    <label key={option} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={draft.violationTypes.includes(option)}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            violationTypes: event.target.checked
                              ? [...prev.violationTypes, option]
                              : prev.violationTypes.filter((value) => value !== option),
                          }))
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.violationTypes && <small>{errors.violationTypes}</small>}
              </fieldset>

              <label>
                Envolve menor?
                <select
                  value={draft.involvesMinor}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      involvesMinor: event.target.value as InvolvesMinor,
                    }))
                  }
                >
                  <option value="sim">sim</option>
                  <option value="não">não</option>
                  <option value="não_sei">não_sei</option>
                </select>
              </label>

              <label>
                Observações
                <textarea
                  rows={5}
                  value={draft.notes}
                  onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </label>

              <div className="actions">
                <button type="submit">{selectedCase ? 'Salvar alterações' : 'Salvar caso'}</button>
                {selectedCase && (
                  <button type="button" className="danger" onClick={deleteCase}>
                    Excluir
                  </button>
                )}
              </div>
            </form>

            <section className="report-panel">
              <h3>Gerador de texto</h3>
              <div className="report-actions">
                <button type="button" onClick={() => copyText(reportPtBr(workingCase))}>
                  Copiar PT-BR
                </button>
                <button type="button" onClick={() => copyText(reportEn(workingCase))}>
                  Copy EN
                </button>
                <button type="button" onClick={exportSingleJson} disabled={!selectedCase}>
                  Exportar caso (JSON)
                </button>
                <button type="button" onClick={exportSingleCsv} disabled={!selectedCase}>
                  Exportar caso (CSV)
                </button>
              </div>
              {copyMessage && <p className="copy-feedback">{copyMessage}</p>}

              <div className="report-previews">
                <article>
                  <h4>Prévia PT-BR</h4>
                  <pre>{reportPtBr(workingCase)}</pre>
                </article>
                <article>
                  <h4>Preview EN</h4>
                  <pre>{reportEn(workingCase)}</pre>
                </article>
              </div>
            </section>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
