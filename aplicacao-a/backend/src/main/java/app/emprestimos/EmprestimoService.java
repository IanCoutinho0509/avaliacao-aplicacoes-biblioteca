package app.emprestimos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import app.leitores.Leitor;
import app.leitores.LeitorRepository;
import app.livros.Livro;
import app.livros.LivroRepository;
import app.shared.BusinessException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmprestimoService {

    private final EmprestimoRepository emprestimoRepository;
    private final LivroRepository livroRepository;
    private final LeitorRepository leitorRepository;

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listar() {
        LocalDate hoje = LocalDate.now();
        return emprestimoRepository.findAll().stream().map(e -> EmprestimoResponse.fromEntity(e, hoje)).toList();
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarAtrasados() {
        LocalDate hoje = LocalDate.now();
        return emprestimoRepository.findAtrasados(hoje).stream().map(e -> EmprestimoResponse.fromEntity(e, hoje)).toList();
    }

    @Transactional
    public EmprestimoResponse registrar(EmprestimoRequest request) {
        Livro livro = livroRepository.findById(request.livroId())
                .orElseThrow(() -> new BusinessException("Livro não encontrado."));
        Leitor leitor = leitorRepository.findById(request.leitorId())
                .orElseThrow(() -> new BusinessException("Leitor não encontrado."));
        if (livro.getExemplaresDisponiveis() == null || livro.getExemplaresDisponiveis() <= 0) {
            throw new BusinessException("Não há exemplar disponível para este livro.");
        }
        long ativos = emprestimoRepository.countByLeitorIdAndDataDevolucaoIsNull(leitor.getId());
        if (ativos >= 3) {
            throw new BusinessException("Este leitor já possui 3 empréstimos ativos.");
        }
        livro.setExemplaresDisponiveis(livro.getExemplaresDisponiveis() - 1);
        livroRepository.save(livro);

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setLivro(livro);
        emprestimo.setLeitor(leitor);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(14));
        return EmprestimoResponse.fromEntity(emprestimoRepository.save(emprestimo), LocalDate.now());
    }

    @Transactional
    public EmprestimoResponse devolver(Long id) {
        Emprestimo emprestimo = emprestimoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Empréstimo não encontrado."));
        if (emprestimo.getDataDevolucao() != null) {
            throw new BusinessException("Este empréstimo já foi devolvido.");
        }
        emprestimo.setDataDevolucao(LocalDate.now());
        Livro livro = emprestimo.getLivro();
        livro.setExemplaresDisponiveis(livro.getExemplaresDisponiveis() + 1);
        livroRepository.save(livro);
        return EmprestimoResponse.fromEntity(emprestimoRepository.save(emprestimo), LocalDate.now());
    }
}
