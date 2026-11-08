package app.emprestimos;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/emprestimos")
@Validated
public class EmprestimoController {

    private final EmprestimoService service;

    public EmprestimoController(EmprestimoService service) {
        this.service = service;
    }

    @PostMapping
    public EmprestimoResponse criar(@Valid @RequestBody EmprestimoRequest request) {
        return service.criar(request);
    }

    @PostMapping("/{id}/devolucao")
    public EmprestimoResponse devolver(@PathVariable Long id) {
        return service.devolver(id);
    }

    @GetMapping
    public List<EmprestimoResponse> listar() {
        return service.listar();
    }

    @GetMapping("/atrasados")
    public List<EmprestimoResponse> atrasados() {
        return service.listarAtrasados();
    }
}
