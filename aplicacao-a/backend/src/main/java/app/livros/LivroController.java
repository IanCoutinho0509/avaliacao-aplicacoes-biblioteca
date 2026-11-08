package app.livros;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/livros")
@RequiredArgsConstructor
@Validated
public class LivroController {

    private final LivroService livroService;

    @GetMapping
    public List<LivroResponse> listar() {
        return livroService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LivroResponse cadastrar(@Valid @RequestBody LivroRequest request) {
        return livroService.cadastrar(request);
    }
}
