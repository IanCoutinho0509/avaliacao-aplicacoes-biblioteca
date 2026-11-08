package app.leitores;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LeitorRequest(
        @NotBlank @Size(max = 200) String nome,
        @NotBlank @Email @Size(max = 255) String email) {
}
