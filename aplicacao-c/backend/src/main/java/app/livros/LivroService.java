package app.livros;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class LivroService {

    private final LivroRepository repository;

    public LivroService(LivroRepository repository) {
        this.repository = repository;
    }

    public LivroResponse criar(LivroRequest request) {
        Livro livro = new Livro();
        livro.setTitulo(request.titulo());
        livro.setAutor(request.autor());
        livro.setAno(request.ano());
        livro.setQuantidadeExemplares(request.quantidadeExemplares());
        livro.setExemplaresDisponiveis(request.quantidadeExemplares());
        livro = repository.save(livro);
        return toResponse(livro);
    }

    public List<LivroResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public Livro getReferencia(Long id) {
        return repository.findById(id).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Livro não encontrado"));
    }

    public void salvar(Livro livro) {
        repository.save(livro);
    }

    private LivroResponse toResponse(Livro livro) {
        return new LivroResponse(livro.getId(), livro.getTitulo(), livro.getAutor(), livro.getAno(), livro.getQuantidadeExemplares(), livro.getExemplaresDisponiveis());
    }
}
