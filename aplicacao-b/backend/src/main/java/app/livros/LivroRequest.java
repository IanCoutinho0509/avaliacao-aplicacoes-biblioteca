package app.livros;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record LivroRequest(
        @NotBlank String titulo,
        @NotBlank String autor,
        @NotNull Integer ano,
        @NotNull @Positive Integer quantidadeExemplares) {
}
