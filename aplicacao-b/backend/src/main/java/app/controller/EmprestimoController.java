package app.controller;

import java.util.List;

import app.domain.Emprestimo;
import app.service.EmprestimoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Emprestimo criar(@RequestBody @Valid EmprestimoService.CriarEmprestimoRequest request) {
        return emprestimoService.criar(request);
    }

    @PatchMapping("/{id}/devolucao")
    public Emprestimo devolver(@PathVariable @NotNull Long id) {
        return emprestimoService.devolver(id);
    }

    @GetMapping
    public List<Emprestimo> listar() {
        return emprestimoService.listar();
    }

    @GetMapping("/atrasados")
    public List<Emprestimo> listarAtrasados() {
        return emprestimoService.listarAtrasados();
    }
}
