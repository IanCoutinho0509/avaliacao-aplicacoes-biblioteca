package app.service;

import java.util.List;

import app.domain.Livro;
import app.repository.LivroRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class LivroService {

    private final LivroRepository livroRepository;

    public LivroService(LivroRepository livroRepository) {
        this.livroRepository = livroRepository;
    }

    public Livro criar(@Valid LivroRequest request) {
        Livro livro = new Livro();
        livro.setTitulo(request.titulo());
        livro.setAutor(request.autor());
        livro.setAno(request.ano());
        livro.setQuantidadeExemplares(request.quantidadeExemplares());
        return livroRepository.save(livro);
    }

    public List<Livro> listar() {
        return livroRepository.findAll();
    }

    public Livro buscarPorId(Long id) {
        return livroRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Livro não encontrado"));
    }

    public record LivroRequest(
            @NotBlank String titulo,
            @NotBlank String autor,
            @NotNull Integer ano,
            @NotNull @Min(1) Integer quantidadeExemplares
    ) {
    }
}
