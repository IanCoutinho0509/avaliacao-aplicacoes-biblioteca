package app.emprestimos;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record EmprestimoRequest(
        @NotNull Long livroId,
        @NotNull Long leitorId,
        LocalDate dataEmprestimo) {
}
