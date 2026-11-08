import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, CalendarClock, CirclePlus, Users, RefreshCw, RotateCcw, LibraryBig } from 'lucide-react';

const api = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message = payload && typeof payload === 'object'
      ? payload.message || payload.error || JSON.stringify(payload)
      : payload || `Erro HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
};

const fmtDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
};

const getBookAvailability = (book) => book.disponiveis ?? book.quantidadeDisponivel ?? book.quantidadeExemplares ?? 0;

const Layout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
    </div>
    <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
            <LibraryBig className="h-4 w-4" />
            Biblioteca Viva
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">{subtitle}</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {[
            ['/', 'Início', CirclePlus],
            ['/livros', 'Livros', BookOpen],
            ['/leitores', 'Leitores', Users],
            ['/emprestimos', 'Empréstimos', CalendarClock],
            ['/atrasados', 'Atrasados', AlertCircle],
          ].map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${isActive ? 'border-cyan-400/40 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20' : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/30 hover:bg-white/10'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</main>
  </div>
);

const Card = ({ children, className = '' }) => (
  <section className={`rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur ${className}`}>{children}</section>
);

function useResource(loader) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loader();
      setData(Array.isArray(result) ? result : result?.content ?? result ?? []);
    } catch (e) {
      setError(e.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  return { data, loading, error, reload, setData };
}

const EmptyState = ({ title, description }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-slate-300">
    <p className="text-lg font-semibold text-white">{title}</p>
    <p className="mt-2 text-sm leading-6">{description}</p>
  </div>
);

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
    {children}
    {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
  </label>
);

const inputClass = 'w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60';

function BooksPage() {
  const { data: books, loading, error, reload } = useResource(() => api('/livros'));
  const [form, setForm] = useState({ titulo: '', autor: '', ano: '', quantidadeExemplares: '' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      await api('/livros', { method: 'POST', body: JSON.stringify({ ...form, ano: Number(form.ano), quantidadeExemplares: Number(form.quantidadeExemplares) }) });
      setForm({ titulo: '', autor: '', ano: '', quantidadeExemplares: '' });
      setFeedback('Livro cadastrado com sucesso.');
      await reload();
    } catch (e2) {
      setFeedback(e2.message);
    } finally {
      setSaving(false);
    }
  };

  return <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
    <Card>
      <h2 className="text-xl font-bold">Cadastrar livro</h2>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <Field label="Título"><input className={inputClass} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required placeholder="Ex.: Dom Casmurro" /></Field>
        <Field label="Autor"><input className={inputClass} value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} required placeholder="Ex.: Machado de Assis" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ano"><input className={inputClass} type="number" value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} required /></Field>
          <Field label="Exemplares"><input className={inputClass} type="number" min="1" value={form.quantidadeExemplares} onChange={(e) => setForm({ ...form, quantidadeExemplares: e.target.value })} required /></Field>
        </div>
        {feedback ? <div className={`rounded-2xl px-4 py-3 text-sm ${feedback.includes('sucesso') ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200'}`}>{feedback}</div> : null}
        <button className={buttonClass} disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar livro'}</button>
      </form>
    </Card>
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Livros cadastrados</h2>
          <p className="mt-1 text-sm text-slate-400">Controle de acervo e disponibilidade.</p>
        </div>
        <button className={secondaryButtonClass} onClick={reload}><RefreshCw className="h-4 w-4" />Atualizar</button>
      </div>
      <div className="mt-5">
        {loading ? <p className="text-slate-300">Carregando...</p> : error ? <div className="rounded-2xl bg-rose-400/15 p-4 text-rose-200">{error}</div> : books.length === 0 ? <EmptyState title="Nenhum livro cadastrado" description="Use o formulário ao lado para incluir o primeiro título do acervo." /> : <div className="grid gap-4">
          {books.map((book) => (
            <article key={book.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{book.titulo}</h3>
                  <p className="text-sm text-slate-400">{book.autor} • {book.ano}</p>
                </div>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-sm font-medium text-cyan-200">{getBookAvailability(book)} disponíveis</span>
              </div>
            </article>
          ))}
        </div>}
      </div>
    </Card>
  </div>;
}

function ReadersPage() {
  const { data: readers, loading, error, reload } = useResource(() => api('/leitores'));
  const [form, setForm] = useState({ nome: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      await api('/leitores', { method: 'POST', body: JSON.stringify(form) });
      setForm({ nome: '', email: '' });
      setFeedback('Leitor cadastrado com sucesso.');
      await reload();
    } catch (e2) {
      setFeedback(e2.message);
    } finally { setSaving(false); }
  };

  return <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
    <Card>
      <h2 className="text-xl font-bold">Cadastrar leitor</h2>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <Field label="Nome"><input className={inputClass} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required placeholder="Ex.: Ana Silva" /></Field>
        <Field label="E-mail"><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="ana@email.com" /></Field>
        {feedback ? <div className={`rounded-2xl px-4 py-3 text-sm ${feedback.includes('sucesso') ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200'}`}>{feedback}</div> : null}
        <button className={buttonClass} disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar leitor'}</button>
      </form>
    </Card>
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Leitores cadastrados</h2>
          <p className="mt-1 text-sm text-slate-400">Cadastro e consulta da base de leitores.</p>
        </div>
        <button className={secondaryButtonClass} onClick={reload}><RefreshCw className="h-4 w-4" />Atualizar</button>
      </div>
      <div className="mt-5">
        {loading ? <p className="text-slate-300">Carregando...</p> : error ? <div className="rounded-2xl bg-rose-400/15 p-4 text-rose-200">{error}</div> : readers.length === 0 ? <EmptyState title="Nenhum leitor cadastrado" description="Cadastre o primeiro leitor para registrar empréstimos." /> : <div className="grid gap-4">
          {readers.map((reader) => (
            <article key={reader.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <h3 className="text-lg font-semibold text-white">{reader.nome}</h3>
              <p className="text-sm text-slate-400">{reader.email}</p>
            </article>
          ))}
        </div>}
      </div>
    </Card>
  </div>;
}

function LoansPage() {
  const livros = useResource(() => api('/livros'));
  const leitores = useResource(() => api('/leitores'));
  const emprestimos = useResource(() => api('/emprestimos'));
  const [form, setForm] = useState({ livroId: '', leitorId: '' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const activeByReader = useMemo(() => {
    const map = new Map();
    (emprestimos.data || []).forEach((loan) => {
      if (!loan.dataDevolucao) {
        const leitorId = loan.leitor?.id ?? loan.leitorId;
        map.set(leitorId, (map.get(leitorId) || 0) + 1);
      }
    });
    return map;
  }, [emprestimos.data]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      await api('/emprestimos', { method: 'POST', body: JSON.stringify({ livroId: Number(form.livroId), leitorId: Number(form.leitorId) }) });
      setForm({ livroId: '', leitorId: '' });
      setFeedback('Empréstimo registrado com sucesso.');
      await emprestimos.reload();
      await livros.reload();
    } catch (e2) {
      setFeedback(e2.message);
    } finally { setSaving(false); }
  };

  const devolver = async (id) => {
    setFeedback('');
    try {
      await api(`/emprestimos/${id}/devolucao`, { method: 'PATCH' });
      setFeedback('Devolução registrada com sucesso.');
      await emprestimos.reload();
      await livros.reload();
    } catch (e) {
      setFeedback(e.message);
    }
  };

  return <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
    <Card>
      <h2 className="text-xl font-bold">Registrar empréstimo</h2>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <Field label="Livro">
          <select className={inputClass} value={form.livroId} onChange={(e) => setForm({ ...form, livroId: e.target.value })} required>
            <option value="">Selecione um livro</option>
            {livros.data.map((book) => {
              const disponiveis = getBookAvailability(book);
              return (
                <option key={book.id} value={book.id} disabled={disponiveis <= 0}>
                  {book.titulo} {disponiveis <= 0 ? '(sem exemplares)' : `(${disponiveis} disponíveis)`}
                </option>
              );
            })}
          </select>
        </Field>
        <Field label="Leitor">
          <select className={inputClass} value={form.leitorId} onChange={(e) => setForm({ ...form, leitorId: e.target.value })} required>
            <option value="">Selecione um leitor</option>
            {leitores.data.map((reader) => {
              const emprestimosAtivos = activeByReader.get(reader.id) || 0;
              return (
                <option key={reader.id} value={reader.id} disabled={emprestimosAtivos >= 3}>
                  {reader.nome} {emprestimosAtivos >= 3 ? '(limite atingido)' : emprestimosAtivos > 0 ? `(${emprestimosAtivos}/3 ativos)` : ''}
                </option>
              );
            })}
          </select>
        </Field>
        {feedback ? <div className={`rounded-2xl px-4 py-3 text-sm ${feedback.includes('sucesso') ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200'}`}>{feedback}</div> : null}
        <button className={buttonClass} disabled={saving}>{saving ? 'Registrando...' : 'Registrar empréstimo'}</button>
      </form>
      <div className="mt-6 rounded-2xl bg-cyan-400/10 p-4 text-sm text-cyan-100">
        Dica: a devolução pode ser feita direto na lista de empréstimos ativos.
      </div>
    </Card>
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Empréstimos</h2>
          <p className="mt-1 text-sm text-slate-400">Acompanhe status, datas e devoluções.</p>
        </div>
        <button className={secondaryButtonClass} onClick={() => { emprestimos.reload(); livros.reload(); leitores.reload(); }}><RefreshCw className="h-4 w-4" />Atualizar</button>
      </div>
      <div className="mt-5">
        {emprestimos.loading ? <p className="text-slate-300">Carregando...</p> : emprestimos.error ? <div className="rounded-2xl bg-rose-400/15 p-4 text-rose-200">{emprestimos.error}</div> : emprestimos.data.length === 0 ? <EmptyState title="Nenhum empréstimo registrado" description="Após cadastrar livros e leitores, registre o primeiro empréstimo aqui." /> : <div className="grid gap-4">
          {emprestimos.data.map((loan) => {
            const ativo = !loan.dataDevolucao;
            return <article key={loan.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{loan.livro?.titulo || `Livro #${loan.livroId}`}</h3>
                  <p className="text-sm text-slate-400">Leitor: {loan.leitor?.nome || `Leitor #${loan.leitorId}`}</p>
                  <p className="mt-2 text-sm text-slate-300">Empréstimo: {fmtDate(loan.dataEmprestimo)} • Previsto: {fmtDate(loan.dataPrevistaDevolucao)}</p>
                  {loan.dataDevolucao ? <p className="mt-1 text-sm text-emerald-200">Devolvido em {fmtDate(loan.dataDevolucao)}</p> : <p className="mt-1 text-sm text-amber-200">Em aberto</p>}
                </div>
                {ativo ? <button className={buttonClass} onClick={() => devolver(loan.id)}><RotateCcw className="h-4 w-4" />Devolver</button> : <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-200">Concluído</span>}
              </div>
            </article>;
          })}
        </div>}
      </div>
    </Card>
  </div>;
}

function OverduePage() {
  const { data, loading, error, reload } = useResource(() => api('/emprestimos/atrasados'));
  return <Card>
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold">Empréstimos atrasados</h2>
        <p className="mt-1 text-sm text-slate-400">Empréstimos ativos com data prevista vencida.</p>
      </div>
      <button className={secondaryButtonClass} onClick={reload}><RefreshCw className="h-4 w-4" />Atualizar</button>
    </div>
    <div className="mt-5">
      {loading ? <p className="text-slate-300">Carregando...</p> : error ? <div className="rounded-2xl bg-rose-400/15 p-4 text-rose-200">{error}</div> : data.length === 0 ? <EmptyState title="Nenhum empréstimo atrasado" description="Quando um empréstimo ativo vencer, ele aparecerá aqui." /> : <div className="grid gap-4">
        {data.map((loan) => (
          <article key={loan.id} className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{loan.livro?.titulo || `Livro #${loan.livroId}`}</h3>
                <p className="text-sm text-amber-100/90">Leitor: {loan.leitor?.nome || `Leitor #${loan.leitorId}`}</p>
                <p className="mt-2 text-sm text-slate-200">Previsto para {fmtDate(loan.dataPrevistaDevolucao)}</p>
              </div>
              <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-semibold text-slate-950">Atrasado</span>
            </div>
          </article>
        ))}
      </div>}
    </div>
  </Card>;
}

function HomePage() {
  const navigate = useNavigate();
  return <div className="grid gap-6 lg:grid-cols-3">
    <Card className="lg:col-span-2">
      <h2 className="text-2xl font-bold">Painel da biblioteca</h2>
      <p className="mt-3 max-w-3xl text-slate-300 leading-7">
        Cadastre livros e leitores, registre empréstimos, acompanhe devoluções e veja os atrasos em tempo real.
        A interface foi pensada para reduzir erros: os formulários mostram o retorno das operações e exibem mensagens claras quando alguma regra de negócio impede a ação.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ['Cadastro de livros', 'Título, autor, ano e exemplares disponíveis.'],
          ['Cadastro de leitores', 'Nome e e-mail com validação visual.'],
          ['Empréstimos e devoluções', 'Fluxo simples com feedback imediato.'],
        ].map(([t, d]) => <div key={t} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><h3 className="font-semibold text-white">{t}</h3><p className="mt-2 text-sm text-slate-400">{d}</p></div>)}
      </div>
    </Card>
    <Card>
      <h2 className="text-xl font-bold">Atalhos</h2>
      <div className="mt-4 grid gap-3">
        {[
          ['Cadastrar livro', '/livros'],
          ['Cadastrar leitor', '/leitores'],
          ['Registrar empréstimo', '/emprestimos'],
          ['Ver atrasados', '/atrasados'],
        ].map(([label, to]) => <button key={to} onClick={() => navigate(to)} className={secondaryButtonClass + ' justify-start'}>{label}</button>)}
      </div>
    </Card>
  </div>;
}

export default function App() {
  return <HashRouter>
    <Routes>
      <Route path="/" element={<Layout title="Sistema de Biblioteca" subtitle="Gestão de acervo, leitores, empréstimos e devoluções em uma interface limpa e objetiva."><HomePage /></Layout>} />
      <Route path="/livros" element={<Layout title="Livros" subtitle="Cadastre títulos, autores, anos e quantidade de exemplares. Os itens ficam disponíveis para empréstimo conforme o estoque."><BooksPage /></Layout>} />
      <Route path="/leitores" element={<Layout title="Leitores" subtitle="Cadastre leitores e mantenha a base pronta para empréstimos e devoluções."><ReadersPage /></Layout>} />
      <Route path="/emprestimos" element={<Layout title="Empréstimos" subtitle="Registre empréstimos e devoluções, observando a disponibilidade dos livros e o limite de 3 empréstimos ativos por leitor."><LoansPage /></Layout>} />
      <Route path="/atrasados" element={<Layout title="Atrasados" subtitle="Consulta dos empréstimos ativos que já passaram da data prevista de devolução."><OverduePage /></Layout>} />
    </Routes>
  </HashRouter>;
}
