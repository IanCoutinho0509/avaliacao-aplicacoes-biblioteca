package app.emprestimos;

import app.leitores.Leitor;
import app.leitores.LeitorRepository;
import app.livros.Livro;
import app.livros.LivroRepository;
import app.shared.RegraNegocioException;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmprestimoService {
    private final EmprestimoRepository emprestimoRepository;
    private final LivroRepository livroRepository;
    private final LeitorRepository leitorRepository;

    public EmprestimoService(EmprestimoRepository emprestimoRepository, LivroRepository livroRepository, LeitorRepository leitorRepository) {
        this.emprestimoRepository = emprestimoRepository;
        this.livroRepository = livroRepository;
        this.leitorRepository = leitorRepository;
    }

    @Transactional(readOnly = true)
    public List<EmprestimoController.EmprestimoResponse> listar() {
        return emprestimoRepository.findAllByOrderByIdDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EmprestimoController.EmprestimoResponse> listarAtrasados() {
        return emprestimoRepository.findAtrasados(LocalDate.now()).stream().map(this::toResponse).toList();
    }

    public EmprestimoController.EmprestimoResponse criar(EmprestimoController.EmprestimoRequest request) {
        Livro livro = livroRepository.findById(request.livroId()).orElseThrow(() -> new RegraNegocioException("Livro não encontrado."));
        Leitor leitor = leitorRepository.findById(request.leitorId()).orElseThrow(() -> new RegraNegocioException("Leitor não encontrado."));

        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            throw new RegraNegocioException("Não há exemplar disponível para este livro.");
        }
        long ativos = emprestimoRepository.countAtivosByLeitorId(leitor.getId());
        if (ativos >= 3) {
            throw new RegraNegocioException("Este leitor já possui o limite de 3 empréstimos ativos.");
        }

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livroRepository.save(livro);

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setLivro(livro);
        emprestimo.setLeitor(leitor);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(14));
        emprestimo.setDataDevolucao(null);
        return toResponse(emprestimoRepository.save(emprestimo));
    }

    public EmprestimoController.EmprestimoResponse devolver(Long id) {
        Emprestimo emprestimo = emprestimoRepository.findById(id).orElseThrow(() -> new RegraNegocioException("Empréstimo não encontrado."));
        if (emprestimo.getDataDevolucao() != null) {
            throw new RegraNegocioException("Este empréstimo já foi devolvido.");
        }
        emprestimo.setDataDevolucao(LocalDate.now());
        Livro livro = emprestimo.getLivro();
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
        livroRepository.save(livro);
        return toResponse(emprestimoRepository.save(emprestimo));
    }

    private EmprestimoController.EmprestimoResponse toResponse(Emprestimo emprestimo) {
        Livro livro = emprestimo.getLivro();
        Leitor leitor = emprestimo.getLeitor();
        return new EmprestimoController.EmprestimoResponse(
                emprestimo.getId(),
                new EmprestimoController.LivroResumo(livro.getId(), livro.getTitulo()),
                new EmprestimoController.LeitorResumo(leitor.getId(), leitor.getNome()),
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataDevolucao(),
                livro.getId(),
                leitor.getId());
    }
}
