import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, CircleAlert, Loader2, RefreshCw, RotateCcw, Search, UserRound, LibraryBig } from 'lucide-react';

const initialBook = { title: '', author: '', year: '', quantity: '' };
const initialReader = { name: '', email: '' };
const initialLoan = { bookId: '', readerId: '' };

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(body?.message || 'Falha na requisição');
  }
  return body;
}

function App() {
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loans, setLoans] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [bookForm, setBookForm] = useState(initialBook);
  const [readerForm, setReaderForm] = useState(initialReader);
  const [loanForm, setLoanForm] = useState(initialLoan);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [b, r, l, o] = await Promise.all([
        api('/books'),
        api('/readers'),
        api('/loans'),
        api('/loans/overdue'),
      ]);
      setBooks(b);
      setReaders(r);
      setLoans(l);
      setOverdue(o);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const availableBooks = useMemo(() => books.filter((b) => b.availableQuantity > 0), [books]);
  const activeLoans = useMemo(() => loans.filter((l) => !l.returnDate), [loans]);

  const submitBook = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null); setMessage(null);
    try {
      await api('/books', { method: 'POST', body: JSON.stringify({ ...bookForm, year: Number(bookForm.year), quantity: Number(bookForm.quantity) }) });
      setBookForm(initialBook); setMessage('Livro cadastrado com sucesso.'); await loadAll();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const submitReader = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null); setMessage(null);
    try { await api('/readers', { method: 'POST', body: JSON.stringify(readerForm) }); setReaderForm(initialReader); setMessage('Leitor cadastrado com sucesso.'); await loadAll(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const submitLoan = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null); setMessage(null);
    try { await api('/loans', { method: 'POST', body: JSON.stringify({ bookId: Number(loanForm.bookId), readerId: Number(loanForm.readerId) }) }); setLoanForm(initialLoan); setMessage('Empréstimo registrado.'); await loadAll(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const returnLoan = async (id) => {
    setBusy(true); setError(null); setMessage(null);
    try { await api(`/loans/${id}/return`, { method: 'POST' }); setMessage('Devolução registrada.'); await loadAll(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_35%)]" />
    <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1 text-sm text-blue-200"><LibraryBig size={16} /> Biblioteca</div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cadastro e empréstimos em um só lugar</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Gerencie livros, leitores, empréstimos e devoluções com retorno imediato das regras de negócio.</p>
        </div>
        <button onClick={loadAll} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/15 disabled:opacity-60" disabled={loading || busy}><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Atualizar</button>
      </header>

      {(message || error) && <div className={`mb-6 rounded-2xl border p-4 ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-100' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}><div className="flex items-start gap-3"><div className="mt-0.5">{error ? <CircleAlert size={20} /> : <CheckCircle2 size={20} />}</div><p>{error || message}</p></div></div>}

      {loading ? <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300"><Loader2 className="animate-spin" /> Carregando dados...</div> : <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Cadastrar livro" icon={<BookOpen size={18} />}>
          <form onSubmit={submitBook} className="grid gap-4 sm:grid-cols-2">
            <Field label="Título" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
            <Field label="Autor" value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} />
            <Field label="Ano" type="number" value={bookForm.year} onChange={(e) => setBookForm({ ...bookForm, year: e.target.value })} />
            <Field label="Quantidade" type="number" value={bookForm.quantity} onChange={(e) => setBookForm({ ...bookForm, quantity: e.target.value })} />
            <button className="sm:col-span-2 rounded-2xl bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-400 disabled:opacity-60" disabled={busy}>Salvar livro</button>
          </form>
        </Section>

        <Section title="Cadastrar leitor" icon={<UserRound size={18} />}>
          <form onSubmit={submitReader} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" value={readerForm.name} onChange={(e) => setReaderForm({ ...readerForm, name: e.target.value })} />
            <Field label="E-mail" type="email" value={readerForm.email} onChange={(e) => setReaderForm({ ...readerForm, email: e.target.value })} />
            <button className="sm:col-span-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60" disabled={busy}>Salvar leitor</button>
          </form>
        </Section>

        <Section title="Registrar empréstimo" icon={<CalendarDays size={18} />} className="xl:col-span-2">
          <form onSubmit={submitLoan} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <Select label={`Livro disponível (${availableBooks.length})`} value={loanForm.bookId} onChange={(e) => setLoanForm({ ...loanForm, bookId: e.target.value })} options={availableBooks.map((b) => ({ value: b.id, label: `${b.title} • disponível: ${b.availableQuantity}` }))} placeholder="Selecione um livro" />
            <Select label={`Leitor (${readers.length})`} value={loanForm.readerId} onChange={(e) => setLoanForm({ ...loanForm, readerId: e.target.value })} options={readers.map((r) => ({ value: r.id, label: `${r.name} • ${r.email}` }))} placeholder="Selecione um leitor" />
            <button className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60" disabled={busy || availableBooks.length === 0 || readers.length === 0}>Emprestar</button>
          </form>
        </Section>

        <Section title="Livros" icon={<BookOpen size={18} />}>
          <List items={books.map((b) => <div key={b.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{b.title}</h3><p className="text-sm text-slate-300">{b.author} • {b.year}</p></div><span className={`rounded-full px-3 py-1 text-xs font-medium ${b.availableQuantity > 0 ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>{b.availableQuantity}/{b.quantity}</span></div></div>)} empty="Nenhum livro cadastrado." />
        </Section>

        <Section title="Leitores" icon={<UserRound size={18} />}>
          <List items={readers.map((r) => <div key={r.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"><h3 className="font-semibold">{r.name}</h3><p className="text-sm text-slate-300">{r.email}</p></div>)} empty="Nenhum leitor cadastrado." />
        </Section>

        <Section title="Empréstimos ativos" icon={<Search size={18} />} className="xl:col-span-2">
          <List items={activeLoans.map((loan) => <div key={loan.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-semibold">{loan.book?.title} → {loan.reader?.name}</h3><p className="text-sm text-slate-300">Empréstimo: {loan.loanDate} • Prevista: {loan.dueDate}</p></div><button onClick={() => returnLoan(loan.id)} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 font-medium hover:bg-white/15 disabled:opacity-60" disabled={busy}><RotateCcw size={16} /> Devolver</button></div>)} empty="Nenhum empréstimo ativo." />
        </Section>

        <Section title="Empréstimos atrasados" icon={<CircleAlert size={18} />} className="xl:col-span-2">
          <List items={overdue.map((loan) => <div key={loan.id} className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4"><h3 className="font-semibold text-rose-100">{loan.book?.title} → {loan.reader?.name}</h3><p className="text-sm text-rose-200">Prevista: {loan.dueDate} • Não devolvido</p></div>)} empty="Nenhum empréstimo atrasado." />
        </Section>
      </div>}
    </main>
  </div>;
}

function Section({ title, icon, children, className = '' }) {
  return <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur ${className}`}>
    <div className="mb-5 flex items-center gap-2 text-lg font-semibold">{icon}{title}</div>
    {children}
  </section>;
}

function Field({ label, ...props }) {
  return <label className="grid gap-2 text-sm text-slate-300"><span>{label}</span><input {...props} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/60" /></label>;
}

function Select({ label, options, placeholder, ...props }) {
  return <label className="grid gap-2 text-sm text-slate-300"><span>{label}</span><select {...props} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-blue-400/60"><option value="">{placeholder}</option>{options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></label>;
}

function List({ items, empty }) {
  if (!items.length) return <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-6 text-slate-400">{empty}</div>;
  return <div className="grid gap-3">{items}</div>;
}

export default App;
