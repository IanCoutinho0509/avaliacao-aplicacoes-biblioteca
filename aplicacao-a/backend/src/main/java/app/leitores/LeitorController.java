package app.leitores;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/leitores")
@Validated
public class LeitorController {

    private final LeitorService service;

    public LeitorController(LeitorService service) {
        this.service = service;
    }

    @PostMapping
    public LeitorResponse criar(@Valid @RequestBody LeitorRequest request) {
        return service.criar(request);
    }

    @GetMapping
    public List<LeitorResponse> listar() {
        return service.listar();
    }
}
