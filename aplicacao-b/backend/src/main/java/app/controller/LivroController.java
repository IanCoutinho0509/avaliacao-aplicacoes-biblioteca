package app.controller;

import java.util.List;
import java.util.Map;

import app.domain.Livro;
import app.service.LivroService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final LivroService livroService;

    public LivroController(LivroService livroService) {
        this.livroService = livroService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Livro criar(@RequestBody @Valid LivroService.LivroRequest request) {
        return livroService.criar(request);
    }

    @GetMapping
    public List<Livro> listar() {
        return livroService.listar();
    }
}
