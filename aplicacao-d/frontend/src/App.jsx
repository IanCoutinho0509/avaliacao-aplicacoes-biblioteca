import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, CalendarDays, CheckCircle2, ChevronRight, ClipboardList, Loader2, RotateCcw, UserRound, Users, XCircle } from 'lucide-react';

const API = '/api';

const initialLivro = {
  titulo: '',
  autor: '',
  ano: '',
  quantidadeExemplares: '',
};

const initialLeitor = {
  nome: '',
  email: '',
};

const initialEmprestimo = {
  livroId: '',
  leitorId: '',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function parseError(error, fallback = 'Não foi possível concluir a operação.') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return fallback;
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      body?.message ||
      body?.error ||
      (Array.isArray(body?.errors) && body.errors.map((e) => e.defaultMessage || e.message).filter(Boolean).join('; ')) ||
      (typeof body === 'string' && body) ||
      `Erro HTTP ${response.status}`;
    throw new Error(message);
  }

  return body;
}

function Section({ icon: Icon, title, subtitle, children, action }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <Icon className="h-3.5 w-3.5" />
            Biblioteca
          </div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function App() {
  const [livros, setLivros] = useState([]);
  const [leitores, setLeitores] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [atrasados, setAtrasados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [livroForm, setLivroForm] = useState(initialLivro);
  const [leitorForm, setLeitorForm] = useState(initialLeitor);
  const [emprestimoForm, setEmprestimoForm] = useState(initialEmprestimo);

  const stats = useMemo(() => [
    { label: 'Livros cadastrados', value: livros.length, icon: BookOpen },
    { label: 'Leitores cadastrados', value: leitores.length, icon: Users },
    { label: 'Empréstimos ativos', value: emprestimos.filter((e) => !e.dataDevolucao).length, icon: ClipboardList },
    { label: 'Atrasados', value: atrasados.length, icon: CalendarDays },
  ], [livros, leitores, emprestimos, atrasados]);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [livrosData, leitoresData, emprestimosData, atrasadosData] = await Promise.all([
        request('/livros'),
        request('/leitores'),
        request('/emprestimos'),
        request('/emprestimos/atrasados'),
      ]);
      setLivros(livrosData);
      setLeitores(leitoresData);
      setEmprestimos(emprestimosData);
      setAtrasados(atrasadosData);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateLivro(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await request('/livros', { method: 'POST', body: JSON.stringify({ ...livroForm, ano: Number(livroForm.ano), quantidadeExemplares: Number(livroForm.quantidadeExemplares) }) });
      setLivroForm(initialLivro);
      setSuccess('Livro cadastrado com sucesso.');
      await loadAll();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateLeitor(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await request('/leitores', { method: 'POST', body: JSON.stringify(leitorForm) });
      setLeitorForm(initialLeitor);
      setSuccess('Leitor cadastrado com sucesso.');
      await loadAll();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateEmprestimo(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await request('/emprestimos', { method: 'POST', body: JSON.stringify({ livroId: Number(emprestimoForm.livroId), leitorId: Number(emprestimoForm.leitorId) }) });
      setEmprestimoForm(initialEmprestimo);
      setSuccess('Empréstimo registrado com sucesso.');
      await loadAll();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  }

  async function devolver(id) {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await request(`/emprestimos/${id}/devolucao`, { method: 'PATCH' });
      setSuccess('Devolução registrada com sucesso.');
      await loadAll();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                <BookOpen className="h-4 w-4" />
                Sistema web de biblioteca
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Cadastre livros e leitores, controle empréstimos e acompanhe atrasos.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                A interface reúne as operações principais da biblioteca em um painel único, com feedback imediato para validação, limites de negócio e devoluções.
              </p>
            </div>
            <button
              onClick={loadAll}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/25 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Atualizar dados
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="mb-3 inline-flex rounded-xl bg-cyan-400/10 p-2 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-bold text-white">{value}</div>
                <div className="mt-1 text-sm text-slate-300">{label}</div>
              </div>
            ))}
          </div>
        </header>

        {(error || success) && (
          <div className={`flex items-start gap-3 rounded-2xl border p-4 ${error ? 'border-rose-400/30 bg-rose-500/10 text-rose-100' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'}`}>
            {error ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}
            <div className="text-sm leading-6">{error || success}</div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <Section icon={BookOpen} title="Cadastro de livros" subtitle="Informe título, autor, ano e quantidade de exemplares disponíveis.">
            <form onSubmit={handleCreateLivro} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Título">
                  <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400/60" value={livroForm.titulo} onChange={(e) => setLivroForm((s) => ({ ...s, titulo: e.target.value }))} placeholder="Dom Casmurro" />
                </Field>
                <Field label="Autor">
                  <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60" value={livroForm.autor} onChange={(e) => setLivroForm((s) => ({ ...s, autor: e.target.value }))} placeholder="Machado de Assis" />
                </Field>
                <Field label="Ano">
                  <input type="number" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60" value={livroForm.ano} onChange={(e) => setLivroForm((s) => ({ ...s, ano: e.target.value }))} placeholder="1899" />
                </Field>
                <Field label="Quantidade de exemplares">
                  <input type="number" min="1" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60" value={livroForm.quantidadeExemplares} onChange={(e) => setLivroForm((s) => ({ ...s, quantidadeExemplares: e.target.value }))} placeholder="3" />
                </Field>
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                Cadastrar livro
              </button>
            </form>
          </Section>

          <Section icon={UserRound} title="Cadastro de leitores" subtitle="Cada leitor possui nome e e-mail únicos. ">
            <form onSubmit={handleCreateLeitor} className="grid gap-4">
              <Field label="Nome">
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60" value={leitorForm.nome} onChange={(e) => setLeitorForm((s) => ({ ...s, nome: e.target.value }))} placeholder="Maria Silva" />
              </Field>
              <Field label="E-mail">
                <input type="email" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60" value={leitorForm.email} onChange={(e) => setLeitorForm((s) => ({ ...s, email: e.target.value }))} placeholder="maria@exemplo.com" />
              </Field>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                Cadastrar leitor
              </button>
            </form>
          </Section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Section icon={ClipboardList} title="Registrar empréstimo" subtitle="Selecione um livro e um leitor. O sistema valida exemplar disponível e limite de 3 empréstimos ativos por leitor.">
            <form onSubmit={handleCreateEmprestimo} className="grid gap-4 md:grid-cols-2">
              <Field label="Livro">
                <select className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400/60" value={emprestimoForm.livroId} onChange={(e) => setEmprestimoForm((s) => ({ ...s, livroId: e.target.value }))}>
                  <option value="">Selecione</option>
                  {livros.map((livro) => (
                    <option key={livro.id} value={livro.id}>
                      {livro.titulo} — {livro.autor}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Leitor">
                <select className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-400/60" value={emprestimoForm.leitorId} onChange={(e) => setEmprestimoForm((s) => ({ ...s, leitorId: e.target.value }))}>
                  <option value="">Selecione</option>
                  {leitores.map((leitor) => (
                    <option key={leitor.id} value={leitor.id}>
                      {leitor.nome} — {leitor.email}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60" disabled={saving || !livros.length || !leitores.length}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                  Registrar empréstimo
                </button>
              </div>
            </form>
          </Section>

          <Section icon={CalendarDays} title="Empréstimos atrasados" subtitle="Empréstimos ativos com data prevista de devolução vencida.">
            <div className="space-y-3">
              {atrasados.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-sm text-slate-300">
                  Nenhum empréstimo atrasado no momento.
                </div>
              ) : (
                atrasados.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{item.livro?.titulo}</div>
                        <div className="mt-1 text-sm text-rose-100/80">Leitor: {item.leitor?.nome}</div>
                      </div>
                      <span className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-100">Atrasado</span>
                    </div>
                    <div className="mt-3 text-sm text-rose-100/80">Prevista para devolução em {formatDate(item.dataPrevistaDevolucao)}</div>
                  </div>
                ))
              )}
            </div>
          </Section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Section icon={BookOpen} title="Livros cadastrados" subtitle="Visualize os títulos e a quantidade de exemplares informada.">
            <div className="space-y-3">
              {livros.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-sm text-slate-300">Nenhum livro cadastrado.</div>
              ) : (
                livros.map((livro) => (
                  <div key={livro.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{livro.titulo}</div>
                        <div className="mt-1 text-sm text-slate-300">{livro.autor} • {livro.ano}</div>
                      </div>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">{livro.quantidadeExemplares} exemplares</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Section>

          <Section icon={Users} title="Leitores cadastrados" subtitle="Lista de leitores registrados no sistema.">
            <div className="space-y-3">
              {leitores.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-sm text-slate-300">Nenhum leitor cadastrado.</div>
              ) : (
                leitores.map((leitor) => (
                  <div key={leitor.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="font-semibold text-white">{leitor.nome}</div>
                    <div className="mt-1 text-sm text-slate-300">{leitor.email}</div>
                  </div>
                ))
              )}
            </div>
          </Section>
        </div>

        <Section icon={ClipboardList} title="Empréstimos e devoluções" subtitle="Acompanhe empréstimos ativos e conclua a devolução quando necessário.">
          <div className="space-y-3">
            {emprestimos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-sm text-slate-300">Nenhum empréstimo registrado.</div>
            ) : (
              emprestimos.map((emprestimo) => {
                const devolvido = Boolean(emprestimo.dataDevolucao);
                return (
                  <div key={emprestimo.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold text-white">{emprestimo.livro?.titulo}</div>
                        <div className="text-sm text-slate-300">Leitor: {emprestimo.leitor?.nome}</div>
                        <div className="text-sm text-slate-400">Empréstimo: {formatDate(emprestimo.dataEmprestimo)} • Previsto: {formatDate(emprestimo.dataPrevistaDevolucao)}{devolvido ? ` • Devolvido: ${formatDate(emprestimo.dataDevolucao)}` : ''}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${devolvido ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border border-amber-400/20 bg-amber-400/10 text-amber-100'}`}>
                          {devolvido ? 'Devolvido' : 'Ativo'}
                        </span>
                        {!devolvido && (
                          <button onClick={() => devolver(emprestimo.id)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60" disabled={saving}>
                            <RotateCcw className="h-4 w-4" />
                            Registrar devolução
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Section>

        <footer className="pb-2 text-center text-sm text-slate-400">
          Sistema de biblioteca com foco em usabilidade, retorno imediato e tratamento de erros de regra de negócio.
        </footer>
      </div>
    </div>
  );
}

export default App;
