package app.api;

import app.api.dto.EmprestimoRequest;
import app.api.dto.EmprestimoResponse;
import app.service.EmprestimoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {
    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @GetMapping
    public List<EmprestimoResponse> listar() {
        return emprestimoService.listar();
    }

    @GetMapping("/atrasados")
    public List<EmprestimoResponse> atrasados() {
        return emprestimoService.listarAtrasados();
    }

    @PostMapping
    public EmprestimoResponse criar(@Valid @RequestBody EmprestimoRequest request) {
        return emprestimoService.criar(request);
    }

    @PatchMapping("/{id}/devolucao")
    public EmprestimoResponse devolver(@PathVariable Long id) {
        return emprestimoService.devolver(id);
    }
}
