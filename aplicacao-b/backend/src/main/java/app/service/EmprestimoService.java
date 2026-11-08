package app.service;

import java.time.LocalDate;
import java.util.List;

import app.domain.Emprestimo;
import app.domain.Leitor;
import app.domain.Livro;
import app.exception.RegraNegocioException;
import app.repository.EmprestimoRepository;
import app.repository.LeitorRepository;
import app.repository.LivroRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class EmprestimoService {

    private final EmprestimoRepository emprestimoRepository;
    private final LivroRepository livroRepository;
    private final LeitorRepository leitorRepository;

    public EmprestimoService(EmprestimoRepository emprestimoRepository, LivroRepository livroRepository, LeitorRepository leitorRepository) {
        this.emprestimoRepository = emprestimoRepository;
        this.livroRepository = livroRepository;
        this.leitorRepository = leitorRepository;
    }

    @Transactional
    public Emprestimo criar(@Valid CriarEmprestimoRequest request) {
        Livro livro = livroRepository.findById(request.livroId())
                .orElseThrow(() -> new IllegalArgumentException("Livro não encontrado"));
        Leitor leitor = leitorRepository.findById(request.leitorId())
                .orElseThrow(() -> new IllegalArgumentException("Leitor não encontrado"));

        long emprestimosLivroAtivos = emprestimoRepository.countByLivroIdAndDataDevolucaoIsNull(livro.getId());
        if (emprestimosLivroAtivos >= livro.getQuantidadeExemplares()) {
            throw new RegraNegocioException("Não há exemplar disponível para este livro");
        }

        long emprestimosLeitorAtivos = emprestimoRepository.countByLeitorIdAndDataDevolucaoIsNull(leitor.getId());
        if (emprestimosLeitorAtivos >= 3) {
            throw new RegraNegocioException("Leitor atingiu o limite de 3 empréstimos ativos");
        }

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setLivro(livro);
        emprestimo.setLeitor(leitor);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(14));
        return emprestimoRepository.save(emprestimo);
    }

    @Transactional
    public Emprestimo devolver(Long id) {
        Emprestimo emprestimo = emprestimoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empréstimo não encontrado"));
        if (emprestimo.getDataDevolucao() != null) {
            throw new RegraNegocioException("Empréstimo já foi devolvido");
        }
        emprestimo.setDataDevolucao(LocalDate.now());
        return emprestimoRepository.save(emprestimo);
    }

    public List<Emprestimo> listar() {
        return emprestimoRepository.findAll();
    }

    public List<Emprestimo> listarAtrasados() {
        return emprestimoRepository.findByDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(LocalDate.now());
    }

    public record CriarEmprestimoRequest(@NotNull Long livroId, @NotNull Long leitorId) {
    }
}
