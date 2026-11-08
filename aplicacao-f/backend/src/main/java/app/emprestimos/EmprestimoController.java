package app.emprestimos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {
    private final EmprestimoService service;

    public EmprestimoController(EmprestimoService service) {
        this.service = service;
    }

    @GetMapping
    public List<EmprestimoResponse> listar() {
        return service.listar();
    }

    @GetMapping("/atrasados")
    public List<EmprestimoResponse> listarAtrasados() {
        return service.listarAtrasados();
    }

    @PostMapping
    public EmprestimoResponse criar(@Valid @RequestBody EmprestimoRequest request) {
        return service.criar(request);
    }

    @PatchMapping("/{id}/devolucao")
    public EmprestimoResponse devolver(@PathVariable Long id) {
        return service.devolver(id);
    }

    public record EmprestimoRequest(@NotNull Long livroId, @NotNull Long leitorId) {}
    public record EmprestimoResponse(Long id, LivroResumo livro, LeitorResumo leitor, java.time.LocalDate dataEmprestimo, java.time.LocalDate dataPrevistaDevolucao, java.time.LocalDate dataDevolucao, Long livroId, Long leitorId) {}
    public record LivroResumo(Long id, String titulo) {}
    public record LeitorResumo(Long id, String nome) {}
}
