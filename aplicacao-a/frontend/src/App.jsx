import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Clock3, LoaderCircle, LibraryBig, RotateCcw, UserRoundPlus, Users } from 'lucide-react';

const initialBook = { titulo: '', autor: '', ano: '', quantidadeExemplares: '' };
const initialReader = { nome: '', email: '' };
const initialLoan = { livroId: '', leitorId: '' };

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.error || 'Erro inesperado';
    const errors = data?.errors || null;
    throw { status: response.status, message, errors };
  }
  return data;
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}

function Field({ label, children, hint, error }) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </label>
  );
}

function Panel({ title, icon: Icon, children, action }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300 ring-1 ring-cyan-300/20">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

export default function App() {
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loans, setLoans] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [bookForm, setBookForm] = useState(initialBook);
  const [readerForm, setReaderForm] = useState(initialReader);
  const [loanForm, setLoanForm] = useState(initialLoan);
  const [saving, setSaving] = useState({ book: false, reader: false, loan: false });

  const activeLoans = useMemo(() => loans.filter((loan) => loan.ativo), [loans]);

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const [booksData, readersData, loansData, overdueData] = await Promise.all([
        api('/api/livros'),
        api('/api/leitores'),
        api('/api/emprestimos'),
        api('/api/emprestimos/atrasados'),
      ]);
      setBooks(booksData);
      setReaders(readersData);
      setLoans(loansData);
      setOverdue(overdueData);
    } catch (err) {
      setError(err.message || 'Falha ao carregar os dados');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function handleBookSubmit(e) {
    e.preventDefault();
    setSaving((prev) => ({ ...prev, book: true }));
    setMessage(null);
    setError(null);
    try {
      await api('/api/livros', {
        method: 'POST',
        body: JSON.stringify({
          titulo: bookForm.titulo.trim(),
          autor: bookForm.autor.trim(),
          ano: Number(bookForm.ano),
          quantidadeExemplares: Number(bookForm.quantidadeExemplares),
        }),
      });
      setBookForm(initialBook);
      setMessage('Livro cadastrado com sucesso.');
      await refreshAll();
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).join(' · ') : err.message);
    } finally {
      setSaving((prev) => ({ ...prev, book: false }));
    }
  }

  async function handleReaderSubmit(e) {
    e.preventDefault();
    setSaving((prev) => ({ ...prev, reader: true }));
    setMessage(null);
    setError(null);
    try {
      await api('/api/leitores', {
        method: 'POST',
        body: JSON.stringify({
          nome: readerForm.nome.trim(),
          email: readerForm.email.trim(),
        }),
      });
      setReaderForm(initialReader);
      setMessage('Leitor cadastrado com sucesso.');
      await refreshAll();
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).join(' · ') : err.message);
    } finally {
      setSaving((prev) => ({ ...prev, reader: false }));
    }
  }

  async function handleLoanSubmit(e) {
    e.preventDefault();
    setSaving((prev) => ({ ...prev, loan: true }));
    setMessage(null);
    setError(null);
    try {
      await api('/api/emprestimos', {
        method: 'POST',
        body: JSON.stringify({
          livroId: Number(loanForm.livroId),
          leitorId: Number(loanForm.leitorId),
        }),
      });
      setLoanForm(initialLoan);
      setMessage('Empréstimo registrado com sucesso.');
      await refreshAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving((prev) => ({ ...prev, loan: false }));
    }
  }

  async function devolver(id) {
    setError(null);
    setMessage(null);
    try {
      await api(`/api/emprestimos/${id}/devolucao`, { method: 'POST' });
      setMessage('Devolução registrada. O exemplar voltou para o acervo.');
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(180deg,#07111f_0%,#0b1220_55%,#050816_100%)] text-slate-100">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
                <LibraryBig className="h-4 w-4" /> Biblioteca digital
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Controle de livros, leitores e empréstimos</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                  Cadastre o acervo, mantenha os leitores organizados, registre empréstimos e devoluções e acompanhe atrasos em tempo real.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
              <Stat label="Livros" value={books.length} />
              <Stat label="Leitores" value={readers.length} />
              <Stat label="Empréstimos ativos" value={activeLoans.length} />
              <Stat label="Atrasados" value={overdue.length} />
            </div>
          </div>
        </header>

        {message || error ? (
          <div className={`rounded-2xl border p-4 ${error ? 'border-rose-400/30 bg-rose-500/10 text-rose-100' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
              <p className="text-sm leading-6">{error || message}</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="Cadastrar livro" icon={BookOpen}>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <Field label="Título">
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" value={bookForm.titulo} onChange={(e) => setBookForm({ ...bookForm, titulo: e.target.value })} required />
              </Field>
              <Field label="Autor">
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" value={bookForm.autor} onChange={(e) => setBookForm({ ...bookForm, autor: e.target.value })} required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ano">
                  <input type="number" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" value={bookForm.ano} onChange={(e) => setBookForm({ ...bookForm, ano: e.target.value })} required />
                </Field>
                <Field label="Exemplares">
                  <input type="number" min="0" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" value={bookForm.quantidadeExemplares} onChange={(e) => setBookForm({ ...bookForm, quantidadeExemplares: e.target.value })} required />
                </Field>
              </div>
              <button disabled={saving.book} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
                {saving.book ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Salvar livro
              </button>
            </form>
          </Panel>

          <Panel title="Cadastrar leitor" icon={Users}>
            <form onSubmit={handleReaderSubmit} className="space-y-4">
              <Field label="Nome">
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" value={readerForm.nome} onChange={(e) => setReaderForm({ ...readerForm, nome: e.target.value })} required />
              </Field>
              <Field label="E-mail">
                <input type="email" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" value={readerForm.email} onChange={(e) => setReaderForm({ ...readerForm, email: e.target.value })} required />
              </Field>
              <button disabled={saving.reader} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-fuchsia-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-60">
                {saving.reader ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Salvar leitor
              </button>
            </form>
          </Panel>

          <Panel title="Registrar empréstimo" icon={RotateCcw}>
            <form onSubmit={handleLoanSubmit} className="space-y-4">
              <Field label="Livro" hint="Disponíveis: apenas livros com exemplares livres">
                <select className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" value={loanForm.livroId} onChange={(e) => setLoanForm({ ...loanForm, livroId: e.target.value })} required>
                  <option value="">Selecione...</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.titulo} — {book.exemplaresDisponiveis} disponíveis
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Leitor" hint="Cada leitor pode ter até 3 empréstimos ativos">
                <select className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" value={loanForm.leitorId} onChange={(e) => setLoanForm({ ...loanForm, leitorId: e.target.value })} required>
                  <option value="">Selecione...</option>
                  {readers.map((reader) => (
                    <option key={reader.id} value={reader.id}>
                      {reader.nome}
                    </option>
                  ))}
                </select>
              </Field>
              <button disabled={saving.loan} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
                {saving.loan ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Registrar empréstimo
              </button>
            </form>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Livros cadastrados" icon={BookOpen} action={<span className="text-sm text-slate-400">{books.length} itens</span>}>
            {loading ? <p className="text-slate-300">Carregando dados...</p> : books.length === 0 ? <p className="text-slate-400">Nenhum livro cadastrado ainda.</p> : <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-slate-950/40 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Título</th>
                    <th className="px-4 py-3 font-medium">Autor</th>
                    <th className="px-4 py-3 font-medium">Ano</th>
                    <th className="px-4 py-3 font-medium">Disponíveis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-white/5">
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-3 font-medium text-white">{book.titulo}</td>
                      <td className="px-4 py-3 text-slate-300">{book.autor}</td>
                      <td className="px-4 py-3 text-slate-300">{book.ano}</td>
                      <td className="px-4 py-3 text-slate-300">{book.exemplaresDisponiveis}/{book.quantidadeExemplares}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
          </Panel>

          <Panel title="Leitores cadastrados" icon={UserRoundPlus} action={<span className="text-sm text-slate-400">{readers.length} itens</span>}>
            {loading ? <p className="text-slate-300">Carregando dados...</p> : readers.length === 0 ? <p className="text-slate-400">Nenhum leitor cadastrado ainda.</p> : <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-slate-950/40 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-white/5">
                  {readers.map((reader) => (
                    <tr key={reader.id}>
                      <td className="px-4 py-3 font-medium text-white">{reader.nome}</td>
                      <td className="px-4 py-3 text-slate-300">{reader.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Empréstimos ativos e devoluções" icon={Clock3} action={<span className="text-sm text-slate-400">{activeLoans.length} ativos</span>}>
            {loading ? <p className="text-slate-300">Carregando dados...</p> : activeLoans.length === 0 ? <p className="text-slate-400">Nenhum empréstimo ativo no momento.</p> : <div className="space-y-3">
              {activeLoans.map((loan) => (
                <article key={loan.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold text-white">{loan.livroTitulo}</div>
                      <div className="text-sm text-slate-300">{loan.leitorNome}</div>
                      <div className="text-sm text-slate-400">Empréstimo em {formatDate(loan.dataEmprestimo)} · previsto para {formatDate(loan.dataPrevistaDevolucao)}</div>
                    </div>
                    <button onClick={() => devolver(loan.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 font-medium text-white transition hover:bg-white/15">
                      <RotateCcw className="h-4 w-4" />
                      Registrar devolução
                    </button>
                  </div>
                </article>
              ))}
            </div>}
          </Panel>

          <Panel title="Empréstimos atrasados" icon={AlertCircle} action={<span className="text-sm text-slate-400">{overdue.length} em atraso</span>}>
            {loading ? <p className="text-slate-300">Carregando dados...</p> : overdue.length === 0 ? <p className="text-slate-400">Nenhum empréstimo atrasado. Tudo em dia.</p> : <div className="space-y-3">
              {overdue.map((loan) => (
                <article key={loan.id} className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-amber-100">{loan.livroTitulo}</div>
                    <div className="text-sm text-amber-50/90">{loan.leitorNome}</div>
                    <div className="text-sm text-amber-50/80">Previsto para {formatDate(loan.dataPrevistaDevolucao)}</div>
                  </div>
                </article>
              ))}
            </div>}
          </Panel>
        </div>
      </main>
    </div>
  );
}
