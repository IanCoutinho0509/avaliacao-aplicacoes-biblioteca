package app.livros;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LivroRequest(
        @NotBlank @Size(max = 200) String titulo,
        @NotBlank @Size(max = 200) String autor,
        @NotNull Integer ano,
        @NotNull @Min(0) Integer quantidadeExemplares) {
}
