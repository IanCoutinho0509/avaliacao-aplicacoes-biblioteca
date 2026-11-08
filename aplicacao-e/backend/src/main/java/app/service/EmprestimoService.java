package app.service;

import app.api.dto.EmprestimoRequest;
import app.api.dto.EmprestimoResponse;
import app.domain.Emprestimo;
import app.domain.Leitor;
import app.domain.Livro;
import app.repository.EmprestimoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmprestimoService {
    private static final int LIMITE_ATIVOS = 3;

    private final EmprestimoRepository emprestimoRepository;
    private final LivroService livroService;
    private final LeitorService leitorService;

    public EmprestimoService(EmprestimoRepository emprestimoRepository, LivroService livroService, LeitorService leitorService) {
        this.emprestimoRepository = emprestimoRepository;
        this.livroService = livroService;
        this.leitorService = leitorService;
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarAtrasados() {
        return emprestimoRepository.findByDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(LocalDate.now())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listar() {
        return emprestimoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public EmprestimoResponse criar(EmprestimoRequest request) {
        Livro livro = livroService.buscarEntidade(request.getLivroId());
        Leitor leitor = leitorService.buscarEntidade(request.getLeitorId());

        if (livro.getExemplaresDisponiveis() == null || livro.getExemplaresDisponiveis() <= 0) {
            throw new RegraNegocioException("Não há exemplar disponível para este livro");
        }
        long ativos = emprestimoRepository.countByLeitorIdAndDataDevolucaoIsNull(leitor.getId());
        if (ativos >= LIMITE_ATIVOS) {
            throw new RegraNegocioException("Leitor atingiu o limite de 3 empréstimos ativos");
        }

        livro.setExemplaresDisponiveis(livro.getExemplaresDisponiveis() - 1);
        livroService.salvar(livro);

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setLivro(livro);
        emprestimo.setLeitor(leitor);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(14));
        return toResponse(emprestimoRepository.save(emprestimo));
    }

    @Transactional
    public EmprestimoResponse devolver(Long id) {
        Emprestimo emprestimo = emprestimoRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Empréstimo não encontrado"));
        if (emprestimo.getDataDevolucao() != null) {
            throw new RegraNegocioException("Empréstimo já foi devolvido");
        }
        emprestimo.setDataDevolucao(LocalDate.now());
        Livro livro = emprestimo.getLivro();
        livro.setExemplaresDisponiveis(livro.getExemplaresDisponiveis() + 1);
        livroService.salvar(livro);
        return toResponse(emprestimoRepository.save(emprestimo));
    }

    private EmprestimoResponse toResponse(Emprestimo emprestimo) {
        boolean ativo = emprestimo.getDataDevolucao() == null;
        boolean atrasado = ativo && emprestimo.getDataPrevistaDevolucao().isBefore(LocalDate.now());
        return new EmprestimoResponse(
                emprestimo.getId(),
                emprestimo.getLivro().getId(),
                emprestimo.getLivro().getTitulo(),
                emprestimo.getLeitor().getId(),
                emprestimo.getLeitor().getNome(),
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataDevolucao(),
                atrasado,
                ativo
        );
    }
}
