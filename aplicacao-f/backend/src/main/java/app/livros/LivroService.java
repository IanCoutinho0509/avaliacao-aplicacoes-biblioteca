package app.livros;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LivroService {
    private final LivroRepository repository;

    public LivroService(LivroRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<LivroController.LivroResponse> listar() {
        return repository.findAllOrderByTitulo().stream().map(this::toResponse).toList();
    }

    public LivroController.LivroResponse criar(LivroController.LivroRequest request) {
        Livro livro = new Livro();
        livro.setTitulo(request.titulo().trim());
        livro.setAutor(request.autor().trim());
        livro.setAno(request.ano());
        livro.setQuantidadeExemplares(request.quantidadeExemplares());
        livro.setQuantidadeDisponivel(request.quantidadeExemplares());
        return toResponse(repository.save(livro));
    }

    LivroController.LivroResponse toResponse(Livro livro) {
        return new LivroController.LivroResponse(livro.getId(), livro.getTitulo(), livro.getAutor(), livro.getAno(), livro.getQuantidadeExemplares(), livro.getQuantidadeDisponivel(), livro.getQuantidadeDisponivel());
    }
}
