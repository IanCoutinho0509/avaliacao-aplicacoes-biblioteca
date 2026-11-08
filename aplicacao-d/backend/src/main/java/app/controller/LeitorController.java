package app.controller;

import java.util.List;

import app.domain.Leitor;
import app.service.LeitorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leitores")
public class LeitorController {

    private final LeitorService leitorService;

    public LeitorController(LeitorService leitorService) {
        this.leitorService = leitorService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Leitor criar(@RequestBody @Valid LeitorService.LeitorRequest request) {
        return leitorService.criar(request);
    }

    @GetMapping
    public List<Leitor> listar() {
        return leitorService.listar();
    }
}
