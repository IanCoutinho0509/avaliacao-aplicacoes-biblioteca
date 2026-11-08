package app.livros;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LivroService {

    private final LivroRepository livroRepository;

    @Transactional(readOnly = true)
    public List<LivroResponse> listar() {
        return livroRepository.findAll().stream().map(LivroResponse::fromEntity).toList();
    }

    @Transactional
    public LivroResponse cadastrar(LivroRequest request) {
        Livro livro = new Livro();
        livro.setTitulo(request.titulo());
        livro.setAutor(request.autor());
        livro.setAno(request.ano());
        livro.setQuantidadeExemplares(request.quantidadeExemplares());
        livro.setExemplaresDisponiveis(request.quantidadeExemplares());
        return LivroResponse.fromEntity(livroRepository.save(livro));
    }
}
