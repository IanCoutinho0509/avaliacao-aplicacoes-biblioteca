import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookPlus,
  CircleAlert,
  Clock3,
  LoaderCircle,
  Menu,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  Users,
} from 'lucide-react';

const API_BASE = '/api';

function extractMessage(payload, status) {
  if (!payload) return `Erro HTTP ${status}`;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') {
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
    if (payload.detail) return payload.detail;
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      return payload.errors
        .map((item) => {
          if (typeof item === 'string') return item;
          return item.defaultMessage || item.message || item.field || JSON.stringify(item);
        })
        .join(' • ');
    }
  }
  return `Erro HTTP ${status}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    throw new Error(extractMessage(payload, response.status));
  }

  return payload;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/livros" replace />} />
        <Route path="/*" element={<LibraryShell />} />
      </Routes>
    </HashRouter>
  );
}

function LibraryShell() {
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ books: [], readers: [], loans: [], overdue: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [books, readers, loans, overdue] = await Promise.all([
        request('/livros'),
        request('/leitores'),
        request('/emprestimos'),
        request('/emprestimos/atrasados'),
      ]);
      setStats({
        books: Array.isArray(books) ? books : [],
        readers: Array.isArray(readers) ? readers : [],
        loans: Array.isArray(loans) ? loans : [],
        overdue: Array.isArray(overdue) ? overdue : [],
      });
    } catch (e) {
      setError(e.message || 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [refreshToken]);

  const refresh = () => setRefreshToken((v) => v + 1);

  const shared = { stats, loading, error, onReload: refresh, onSaved: refresh, navigate: nav };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.16),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(2,6,23,1))]" />

      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="flex items-center gap-3 text-left"
            onClick={() => nav('/livros')}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Biblioteca</div>
              <h1 className="text-lg font-semibold text-white">Gestão de livros, leitores e empréstimos</h1>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
        </div>

        <nav className={`border-t border-white/10 ${mobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <TopNav to="/livros" icon={BookOpen} label="Livros" />
            <TopNav to="/leitores" icon={Users} label="Leitores" />
            <TopNav to="/emprestimos" icon={RotateCcw} label="Empréstimos" />
            <TopNav to="/atrasados" icon={Clock3} label="Atrasados" />
            <div className="hidden lg:ml-auto lg:block">
              <StatusPills stats={stats} />
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Fluxo operacional
                </div>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">Controle tudo em um painel único</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  Cadastre livros e leitores, registre empréstimos e devoluções, acompanhe a disponibilidade de exemplares
                  e consulte automaticamente o que está atrasado.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <MiniMetric label="Livros" value={stats.books.length} tone="cyan" />
                <MiniMetric label="Leitores" value={stats.readers.length} tone="violet" />
                <MiniMetric label="Empréstimos" value={stats.loans.length} tone="emerald" />
              </div>
            </div>
            {error ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <div className="font-semibold">Não foi possível carregar os dados</div>
                  <div className="text-rose-100/90">{error}</div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Atalhos</h3>
            <div className="mt-4 grid gap-3">
              <ShortcutCard title="Cadastrar um livro" description="Título, autor, ano e quantidade de exemplares." onClick={() => nav('/livros')} />
              <ShortcutCard title="Cadastrar leitor" description="Nome e e-mail com validação visual e mensagens claras." onClick={() => nav('/leitores')} />
              <ShortcutCard title="Registrar empréstimo" description="Selecione livro e leitor e veja a previsão de devolução." onClick={() => nav('/emprestimos')} />
            </div>
          </div>
        </section>

        {loading ? <LoadingBanner /> : null}

        <Routes>
          <Route path="/livros" element={<BooksPage {...shared} />} />
          <Route path="/leitores" element={<ReadersPage {...shared} />} />
          <Route path="/emprestimos" element={<LoansPage {...shared} />} />
          <Route path="/atrasados" element={<OverduePage {...shared} />} />
          <Route path="*" element={<Navigate to="/livros" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function TopNav({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
          isActive ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

function StatusPills({ stats }) {
  const activeLoans = stats.loans.filter((loan) => !(loan.devolvido || loan.dataDevolucao || loan.data_devolucao)).length;
  const availableBooks = stats.books.reduce((sum, book) => sum + Number(book.exemplaresDisponiveis ?? book.disponiveis ?? 0), 0);
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <Pill>{stats.books.length} livros</Pill>
      <Pill>{stats.readers.length} leitores</Pill>
      <Pill>{activeLoans} ativos</Pill>
      <Pill>{availableBooks} disponíveis</Pill>
    </div>
  );
}

function Pill({ children }) {
  return <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{children}</span>;
}

function MiniMetric({ label, value, tone }) {
  const classes = {
    cyan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-200 ring-cyan-300/20',
    violet: 'from-violet-400/20 to-violet-400/5 text-violet-200 ring-violet-300/20',
    emerald: 'from-emerald-400/20 to-emerald-400/5 text-emerald-200 ring-emerald-300/20',
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${classes[tone]} p-3 ring-1`}>
      <div className="text-xs uppercase tracking-[0.22em] text-slate-300/80">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function ShortcutCard({ title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-300/30 hover:bg-white/10"
    >
      <div className="font-medium text-white">{title}</div>
      <div className="mt-1 text-sm text-slate-300">{description}</div>
    </button>
  );
}

function LoadingBanner() {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
      <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />
      Carregando dados da biblioteca...
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children, action }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/10 backdrop-blur sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-200">
            <Icon className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function BooksPage({ stats, onSaved }) {
  const [form, setForm] = useState({ titulo: '', autor: '', ano: '', quantidadeExemplares: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const books = stats.books;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await request('/livros', {
        method: 'POST',
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          autor: form.autor.trim(),
          ano: Number(form.ano),
          quantidadeExemplares: Number(form.quantidadeExemplares),
        }),
      });
      setForm({ titulo: '', autor: '', ano: '', quantidadeExemplares: '' });
      setMessage('Livro cadastrado com sucesso.');
      onSaved();
    } catch (e) {
      setMessage(e.message || 'Não foi possível cadastrar o livro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Cadastrar livro" subtitle="Informe os dados do acervo e a quantidade total de exemplares." icon={BookPlus}>
        <form className="grid gap-4" onSubmit={submit}>
          <Field label="Título" value={form.titulo} onChange={(v) => setForm((s) => ({ ...s, titulo: v }))} placeholder="Ex.: O Nome da Rosa" required />
          <Field label="Autor" value={form.autor} onChange={(v) => setForm((s) => ({ ...s, autor: v }))} placeholder="Ex.: Umberto Eco" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ano" type="number" value={form.ano} onChange={(v) => setForm((s) => ({ ...s, ano: v }))} placeholder="1980" required />
            <Field label="Exemplares" type="number" min="1" value={form.quantidadeExemplares} onChange={(v) => setForm((s) => ({ ...s, quantidadeExemplares: v }))} placeholder="3" required />
          </div>
          <ActionRow saving={saving} label="Salvar livro" />
          {message ? <InlineNotice tone={message.includes('sucesso') ? 'success' : 'error'}>{message}</InlineNotice> : null}
        </form>
      </SectionCard>

      <SectionCard
        title="Livros cadastrados"
        subtitle="Acompanhe o estoque total e os exemplares disponíveis para empréstimo."
        icon={BookOpen}
      >
        <DataTable
          emptyText="Nenhum livro cadastrado ainda."
          columns={['Título', 'Autor', 'Ano', 'Disponíveis', 'Total']}
          rows={books.map((book) => (
            <tr key={book.id} className="border-t border-white/5">
              <Td>{book.titulo}</Td>
              <Td>{book.autor}</Td>
              <Td>{book.ano}</Td>
              <Td>
                <StockBadge available={Number(book.exemplaresDisponiveis ?? book.disponiveis ?? 0)} total={Number(book.quantidadeExemplares ?? book.totalExemplares ?? 0)} />
              </Td>
              <Td>{book.quantidadeExemplares ?? book.totalExemplares ?? '—'}</Td>
            </tr>
          ))}
        />
      </SectionCard>
    </div>
  );
}

function ReadersPage({ stats, onSaved }) {
  const [form, setForm] = useState({ nome: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const readers = stats.readers;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await request('/leitores', {
        method: 'POST',
        body: JSON.stringify({ nome: form.nome.trim(), email: form.email.trim() }),
      });
      setForm({ nome: '', email: '' });
      setMessage('Leitor cadastrado com sucesso.');
      onSaved();
    } catch (e) {
      setMessage(e.message || 'Não foi possível cadastrar o leitor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Cadastrar leitor" subtitle="Cada leitor pode manter até 3 empréstimos ativos ao mesmo tempo." icon={Users}>
        <form className="grid gap-4" onSubmit={submit}>
          <Field label="Nome" value={form.nome} onChange={(v) => setForm((s) => ({ ...s, nome: v }))} placeholder="Ex.: Ana Costa" required />
          <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm((s) => ({ ...s, email: v }))} placeholder="ana@exemplo.com" required />
          <ActionRow saving={saving} label="Salvar leitor" />
          {message ? <InlineNotice tone={message.includes('sucesso') ? 'success' : 'error'}>{message}</InlineNotice> : null}
        </form>
      </SectionCard>

      <SectionCard title="Leitores cadastrados" subtitle="Lista organizada com identificação rápida por e-mail." icon={Users}>
        <DataTable
          emptyText="Nenhum leitor cadastrado ainda."
          columns={['Nome', 'E-mail']}
          rows={readers.map((reader) => (
            <tr key={reader.id} className="border-t border-white/5">
              <Td>{reader.nome}</Td>
              <Td>{reader.email}</Td>
            </tr>
          ))}
        />
      </SectionCard>
    </div>
  );
}

function LoansPage({ stats, onSaved }) {
  const [form, setForm] = useState({ livroId: '', leitorId: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const loans = stats.loans;
  const books = stats.books;
  const readers = stats.readers;

  const loanableBooks = useMemo(() => books.filter((book) => Number(book.exemplaresDisponiveis ?? book.disponiveis ?? 0) > 0), [books]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await request('/emprestimos', {
        method: 'POST',
        body: JSON.stringify({ livroId: Number(form.livroId), leitorId: Number(form.leitorId) }),
      });
      setForm({ livroId: '', leitorId: '' });
      setMessage('Empréstimo registrado com sucesso.');
      onSaved();
    } catch (e) {
      setMessage(e.message || 'Não foi possível registrar o empréstimo.');
    } finally {
      setSaving(false);
    }
  };

  const returnLoan = async (id) => {
    setMessage('');
    try {
      await request(`/emprestimos/${id}/devolver`, { method: 'PATCH' });
      setMessage('Devolução registrada com sucesso.');
      onSaved();
    } catch (e) {
      setMessage(e.message || 'Não foi possível registrar a devolução.');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Registrar empréstimo" subtitle="Escolha um livro disponível e um leitor cadastrado." icon={RotateCcw}>
        <form className="grid gap-4" onSubmit={submit}>
          <SelectField
            label="Livro"
            value={form.livroId}
            onChange={(v) => setForm((s) => ({ ...s, livroId: v }))}
            required
            options={loanableBooks.map((book) => ({ value: book.id, label: `${book.titulo} — ${book.autor} (${Number(book.exemplaresDisponiveis ?? book.disponiveis ?? 0)} disponíveis)` }))}
            placeholder={books.length === 0 ? 'Cadastre livros primeiro' : 'Selecione um livro'}
          />
          <SelectField
            label="Leitor"
            value={form.leitorId}
            onChange={(v) => setForm((s) => ({ ...s, leitorId: v }))}
            required
            options={readers.map((reader) => ({ value: reader.id, label: `${reader.nome} — ${reader.email}` }))}
            placeholder={readers.length === 0 ? 'Cadastre leitores primeiro' : 'Selecione um leitor'}
          />
          <ActionRow saving={saving} label="Registrar empréstimo" />
          <p className="text-xs leading-5 text-slate-400">A data prevista de devolução é calculada automaticamente para 14 dias após o empréstimo.</p>
          {message ? <InlineNotice tone={message.includes('sucesso') ? 'success' : 'error'}>{message}</InlineNotice> : null}
        </form>
      </SectionCard>

      <SectionCard title="Empréstimos ativos e encerrados" subtitle="Acompanhe o histórico e devolva com um clique quando necessário." icon={BookOpen}>
        <DataTable
          emptyText="Nenhum empréstimo cadastrado ainda."
          columns={['Livro', 'Leitor', 'Empréstimo', 'Prevista', 'Status', 'Ação']}
          rows={loans.map((loan) => {
            const devolvido = Boolean(loan.devolvido || loan.dataDevolucao || loan.data_devolucao);
            const atrasado = !devolvido && Boolean(loan.atrasado);
            const ativo = !devolvido;
            return (
              <tr key={loan.id} className="border-t border-white/5">
                <Td>{loan.livro?.titulo ?? loan.tituloLivro ?? `Livro #${loan.livroId}`}</Td>
                <Td>{loan.leitor?.nome ?? loan.nomeLeitor ?? `Leitor #${loan.leitorId}`}</Td>
                <Td>{formatDate(loan.dataEmprestimo ?? loan.data_emprestimo)}</Td>
                <Td>{formatDate(loan.dataPrevistaDevolucao ?? loan.data_prevista_devolucao)}</Td>
                <Td>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${atrasado ? 'bg-rose-500/15 text-rose-200' : ativo ? 'bg-amber-500/15 text-amber-200' : 'bg-emerald-500/15 text-emerald-200'}`}>
                    {atrasado ? 'Atrasado' : ativo ? 'Ativo' : 'Devolvido'}
                  </span>
                </Td>
                <Td>
                  {ativo ? (
                    <button
                      type="button"
                      onClick={() => returnLoan(loan.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Devolver
                    </button>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </Td>
              </tr>
            );
          })}
        />
      </SectionCard>
    </div>
  );
}

function OverduePage({ stats }) {
  const overdue = stats.overdue;
  return (
    <SectionCard title="Empréstimos atrasados" subtitle="Consulta dedicada aos empréstimos ativos com data prevista vencida." icon={Clock3}>
      <DataTable
        emptyText="Nenhum empréstimo atrasado no momento."
        columns={['Livro', 'Leitor', 'Emprestado em', 'Prevista', 'Dias em atraso']}
        rows={overdue.map((loan) => (
          <tr key={loan.id} className="border-t border-white/5">
            <Td>{loan.livro?.titulo ?? loan.tituloLivro ?? `Livro #${loan.livroId}`}</Td>
            <Td>{loan.leitor?.nome ?? loan.nomeLeitor ?? `Leitor #${loan.leitorId}`}</Td>
            <Td>{formatDate(loan.dataEmprestimo ?? loan.data_emprestimo)}</Td>
            <Td>{formatDate(loan.dataPrevistaDevolucao ?? loan.data_prevista_devolucao)}</Td>
            <Td>
              <span className="inline-flex rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-200">
                {loan.diasEmAtraso ?? loan.dias_atraso ?? '—'}
              </span>
            </Td>
          </tr>
        ))}
      />
    </SectionCard>
  );
}

function Field({ label, value, onChange, type = 'text', ...props }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
        {...props}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, placeholder, ...props }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActionRow({ saving, label }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {saving ? 'Salvando...' : label}
    </button>
  );
}

function InlineNotice({ tone, children }) {
  const styles = tone === 'success' ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100' : 'border-rose-400/20 bg-rose-500/10 text-rose-100';
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

function DataTable({ columns, rows, emptyText }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-100">
            {rows.length > 0 ? (
              rows
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-slate-400" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Td({ children }) {
  return <td className="px-4 py-3 align-top text-slate-200">{children}</td>;
}

function StockBadge({ available, total }) {
  const low = available === 0;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${low ? 'bg-rose-500/15 text-rose-200' : 'bg-emerald-500/15 text-emerald-200'}`}>
      {available}/{total}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export default App;
