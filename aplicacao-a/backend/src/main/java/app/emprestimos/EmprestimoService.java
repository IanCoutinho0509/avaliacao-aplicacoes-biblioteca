package app.emprestimos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import app.common.DomainException;
import app.leitores.Leitor;
import app.leitores.LeitorService;
import app.livros.Livro;
import app.livros.LivroService;

@Service
public class EmprestimoService {

    private static final int MAX_EMPRESTIMOS_ATIVOS = 3;

    private final EmprestimoRepository repository;
    private final LivroService livroService;
    private final LeitorService leitorService;

    public EmprestimoService(EmprestimoRepository repository, LivroService livroService, LeitorService leitorService) {
        this.repository = repository;
        this.livroService = livroService;
        this.leitorService = leitorService;
    }

    @Transactional
    public EmprestimoResponse criar(EmprestimoRequest request) {
        Livro livro = livroService.getReferencia(request.livroId());
        Leitor leitor = leitorService.getReferencia(request.leitorId());
        LocalDate dataEmprestimo = request.dataEmprestimo() != null ? request.dataEmprestimo() : LocalDate.now();

        if (livro.getExemplaresDisponiveis() == null || livro.getExemplaresDisponiveis() <= 0) {
            throw new DomainException(HttpStatus.CONFLICT, "Não há exemplares disponíveis para este livro");
        }

        long emprestimosAtivos = repository.countByLeitorIdAndDataDevolucaoIsNull(leitor.getId());
        if (emprestimosAtivos >= MAX_EMPRESTIMOS_ATIVOS) {
            throw new DomainException(HttpStatus.CONFLICT, "O leitor já possui o máximo de 3 empréstimos ativos");
        }

        livro.setExemplaresDisponiveis(livro.getExemplaresDisponiveis() - 1);
        livroService.salvar(livro);

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setLivro(livro);
        emprestimo.setLeitor(leitor);
        emprestimo.setDataEmprestimo(dataEmprestimo);
        emprestimo.setDataPrevistaDevolucao(dataEmprestimo.plusDays(14));
        emprestimo = repository.save(emprestimo);
        return toResponse(emprestimo);
    }

    @Transactional
    public EmprestimoResponse devolver(Long id) {
        Emprestimo emprestimo = repository.findById(id).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Empréstimo não encontrado"));
        if (emprestimo.getDataDevolucao() != null) {
            throw new DomainException(HttpStatus.CONFLICT, "Este empréstimo já foi devolvido");
        }
        emprestimo.setDataDevolucao(LocalDate.now());
        Livro livro = emprestimo.getLivro();
        livro.setExemplaresDisponiveis(livro.getExemplaresDisponiveis() + 1);
        livroService.salvar(livro);
        return toResponse(repository.save(emprestimo));
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarAtrasados() {
        return repository.findAtrasados(LocalDate.now()).stream().map(this::toResponse).toList();
    }

    private EmprestimoResponse toResponse(Emprestimo emprestimo) {
        return new EmprestimoResponse(
                emprestimo.getId(),
                emprestimo.getLivro().getId(),
                emprestimo.getLivro().getTitulo(),
                emprestimo.getLeitor().getId(),
                emprestimo.getLeitor().getNome(),
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataDevolucao(),
                emprestimo.getDataDevolucao() == null && emprestimo.getDataPrevistaDevolucao().isBefore(LocalDate.now()),
                emprestimo.getDataDevolucao() == null);
    }
}
