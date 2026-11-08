package app.service;

import app.api.dto.LivroRequest;
import app.api.dto.LivroResponse;
import app.domain.Livro;
import app.repository.LivroRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LivroService {
    private final LivroRepository livroRepository;

    public LivroService(LivroRepository livroRepository) {
        this.livroRepository = livroRepository;
    }

    public List<LivroResponse> listar() {
        return livroRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public LivroResponse criar(LivroRequest request) {
        Livro livro = new Livro();
        livro.setTitulo(request.getTitulo().trim());
        livro.setAutor(request.getAutor().trim());
        livro.setAno(request.getAno());
        livro.setExemplaresTotal(request.getExemplares());
        livro.setExemplaresDisponiveis(request.getExemplares());
        return toResponse(livroRepository.save(livro));
    }

    public Livro buscarEntidade(Long id) {
        return livroRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Livro não encontrado"));
    }

    public Livro salvar(Livro livro) {
        return livroRepository.save(livro);
    }

    private LivroResponse toResponse(Livro livro) {
        return new LivroResponse(livro.getId(), livro.getTitulo(), livro.getAutor(), livro.getAno(), livro.getExemplaresTotal(), livro.getExemplaresDisponiveis());
    }
}