import { useEffect, useMemo, useState } from 'react'
import './App.css'

const api = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.message || data?.error || 'Não foi possível concluir a operação.'
    const validationErrors = data?.errors?.map((e) => e.defaultMessage || e.message).filter(Boolean) || []
    throw new Error(validationErrors.length ? validationErrors.join(' · ') : message)
  }

  return data
}

const moneyDate = (value) => {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR')
}

function App() {
  const [livros, setLivros] = useState([])
  const [leitores, setLeitores] = useState([])
  const [emprestimos, setEmprestimos] = useState([])
  const [atrasados, setAtrasados] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState(null)
  const [erro, setErro] = useState(null)

  const [livroForm, setLivroForm] = useState({ titulo: '', autor: '', ano: '', exemplares: '' })
  const [leitorForm, setLeitorForm] = useState({ nome: '', email: '' })
  const [emprestimoForm, setEmprestimoForm] = useState({ livroId: '', leitorId: '' })

  const carregar = async () => {
    setLoading(true)
    try {
      const [livrosData, leitoresData, emprestimosData, atrasadosData] = await Promise.all([
        api('/livros'),
        api('/leitores'),
        api('/emprestimos'),
        api('/emprestimos/atrasados'),
      ])
      setLivros(livrosData)
      setLeitores(leitoresData)
      setEmprestimos(emprestimosData)
      setAtrasados(atrasadosData)
      setErro(null)
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const resumo = useMemo(() => ({
    livros: livros.length,
    leitores: leitores.length,
    ativos: emprestimos.filter((e) => e.ativo).length,
    atrasados: atrasados.length,
  }), [livros, leitores, emprestimos, atrasados])

  const submitLivro = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setMensagem(null)
    setErro(null)
    try {
      await api('/livros', { method: 'POST', body: JSON.stringify({
        titulo: livroForm.titulo,
        autor: livroForm.autor,
        ano: Number(livroForm.ano),
        exemplares: Number(livroForm.exemplares),
      }) })
      setLivroForm({ titulo: '', autor: '', ano: '', exemplares: '' })
      setMensagem('Livro cadastrado com sucesso.')
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  const submitLeitor = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setMensagem(null)
    setErro(null)
    try {
      await api('/leitores', { method: 'POST', body: JSON.stringify(leitorForm) })
      setLeitorForm({ nome: '', email: '' })
      setMensagem('Leitor cadastrado com sucesso.')
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  const submitEmprestimo = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setMensagem(null)
    setErro(null)
    try {
      await api('/emprestimos', { method: 'POST', body: JSON.stringify({ livroId: Number(emprestimoForm.livroId), leitorId: Number(emprestimoForm.leitorId) }) })
      setEmprestimoForm({ livroId: '', leitorId: '' })
      setMensagem('Empréstimo registrado. A devolução vence em 14 dias.')
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  const devolver = async (id) => {
    setSalvando(true)
    setMensagem(null)
    setErro(null)
    try {
      await api(`/emprestimos/${id}/devolucao`, { method: 'PATCH' })
      setMensagem('Devolução registrada com sucesso.')
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Biblioteca digital</p>
          <h1>Controle livros, leitores e empréstimos em um só lugar.</h1>
          <p className="hero-text">Cadastre acervo e leitores, registre empréstimos, acompanhe devoluções e veja os atrasos em tempo real.</p>
        </div>
        <div className="stats-grid">
          <article><span>Livros</span><strong>{resumo.livros}</strong></article>
          <article><span>Leitores</span><strong>{resumo.leitores}</strong></article>
          <article><span>Ativos</span><strong>{resumo.ativos}</strong></article>
          <article><span>Atrasados</span><strong>{resumo.atrasados}</strong></article>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <div className="panel-header"><h2>Cadastrar livro</h2></div>
          <form className="form-grid" onSubmit={submitLivro}>
            <input placeholder="Título" value={livroForm.titulo} onChange={(e) => setLivroForm({ ...livroForm, titulo: e.target.value })} required />
            <input placeholder="Autor" value={livroForm.autor} onChange={(e) => setLivroForm({ ...livroForm, autor: e.target.value })} required />
            <input placeholder="Ano" type="number" value={livroForm.ano} onChange={(e) => setLivroForm({ ...livroForm, ano: e.target.value })} required />
            <input placeholder="Exemplares" type="number" min="0" value={livroForm.exemplares} onChange={(e) => setLivroForm({ ...livroForm, exemplares: e.target.value })} required />
            <button disabled={salvando}>{salvando ? 'Salvando...' : 'Cadastrar livro'}</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header"><h2>Cadastrar leitor</h2></div>
          <form className="form-grid" onSubmit={submitLeitor}>
            <input placeholder="Nome" value={leitorForm.nome} onChange={(e) => setLeitorForm({ ...leitorForm, nome: e.target.value })} required />
            <input placeholder="E-mail" type="email" value={leitorForm.email} onChange={(e) => setLeitorForm({ ...leitorForm, email: e.target.value })} required />
            <button disabled={salvando}>{salvando ? 'Salvando...' : 'Cadastrar leitor'}</button>
          </form>
        </section>

        <section className="panel panel-wide">
          <div className="panel-header"><h2>Registrar empréstimo</h2></div>
          <form className="loan-form" onSubmit={submitEmprestimo}>
            <select value={emprestimoForm.livroId} onChange={(e) => setEmprestimoForm({ ...emprestimoForm, livroId: e.target.value })} required>
              <option value="">Selecione um livro</option>
              {livros.map((livro) => <option key={livro.id} value={livro.id}>{livro.titulo} — disponíveis: {livro.exemplaresDisponiveis}</option>)}
            </select>
            <select value={emprestimoForm.leitorId} onChange={(e) => setEmprestimoForm({ ...emprestimoForm, leitorId: e.target.value })} required>
              <option value="">Selecione um leitor</option>
              {leitores.map((leitor) => <option key={leitor.id} value={leitor.id}>{leitor.nome} ({leitor.email})</option>)}
            </select>
            <button disabled={salvando}>{salvando ? 'Registrando...' : 'Emprestar livro'}</button>
          </form>
        </section>

        <section className="panel panel-wide">
          <div className="panel-header"><h2>Empréstimos ativos e histórico</h2></div>
          {loading ? <p className="empty-state">Carregando dados...</p> : emprestimos.length === 0 ? <p className="empty-state">Nenhum empréstimo registrado.</p> : (
            <div className="table-list">
              {emprestimos.map((item) => (
                <article key={item.id} className={`loan-card ${item.ativo ? 'active' : 'closed'} ${item.atrasado ? 'late' : ''}`}>
                  <div>
                    <strong>{item.livroTitulo}</strong>
                    <p>{item.leitorNome}</p>
                    <small>Empréstimo: {moneyDate(item.dataEmprestimo)} · Prevista: {moneyDate(item.dataPrevistaDevolucao)} · Devolução: {moneyDate(item.dataDevolucao)}</small>
                  </div>
                  <div className="loan-actions">
                    {item.atrasado && <span className="badge danger">Atrasado</span>}
                    {item.ativo ? <button onClick={() => devolver(item.id)} disabled={salvando}>Registrar devolução</button> : <span className="badge success">Devolvido</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel panel-wide">
          <div className="panel-header"><h2>Empréstimos atrasados</h2></div>
          {atrasados.length === 0 ? <p className="empty-state">Nenhum empréstimo atrasado no momento.</p> : (
            <div className="table-list">
              {atrasados.map((item) => (
                <article key={item.id} className="loan-card late">
                  <div>
                    <strong>{item.livroTitulo}</strong>
                    <p>{item.leitorNome}</p>
                    <small>Venceu em {moneyDate(item.dataPrevistaDevolucao)}</small>
                  </div>
                  <span className="badge danger">Atrasado</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel panel-wide">
          <div className="panel-header"><h2>Acervo</h2></div>
          {livros.length === 0 ? <p className="empty-state">Ainda não há livros cadastrados.</p> : (
            <div className="cards-grid">
              {livros.map((livro) => (
                <article key={livro.id} className="info-card">
                  <strong>{livro.titulo}</strong>
                  <p>{livro.autor}</p>
                  <small>{livro.ano} · {livro.exemplaresDisponiveis}/{livro.exemplaresTotal} disponíveis</small>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {(mensagem || erro) && <div className={`toast ${erro ? 'error' : 'success'}`}>{erro || mensagem}</div>}
    </div>
  )
}

export default App
