package app.livros;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/livros")
@Validated
public class LivroController {
    private final LivroService service;

    public LivroController(LivroService service) {
        this.service = service;
    }

    @GetMapping
    public List<LivroResponse> listar() {
        return service.listar();
    }

    @PostMapping
    public LivroResponse criar(@Valid @RequestBody LivroRequest request) {
        return service.criar(request);
    }

    public record LivroRequest(
            @NotBlank String titulo,
            @NotBlank String autor,
            @NotNull Integer ano,
            @NotNull @Positive Integer quantidadeExemplares) {
    }

    public record LivroResponse(Long id, String titulo, String autor, Integer ano, Integer quantidadeExemplares, Integer quantidadeDisponivel, Integer disponiveis) {
    }
}