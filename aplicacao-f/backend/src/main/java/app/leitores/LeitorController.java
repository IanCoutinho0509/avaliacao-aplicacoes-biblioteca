package app.leitores;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leitores")
@Validated
public class LeitorController {
    private final LeitorService service;

    public LeitorController(LeitorService service) {
        this.service = service;
    }

    @GetMapping
    public List<LeitorResponse> listar() {
        return service.listar();
    }

    @PostMapping
    public LeitorResponse criar(@Valid @RequestBody LeitorRequest request) {
        return service.criar(request);
    }

    public record LeitorRequest(@NotBlank String nome, @NotBlank @Email String email) {}
    public record LeitorResponse(Long id, String nome, String email) {}
}
