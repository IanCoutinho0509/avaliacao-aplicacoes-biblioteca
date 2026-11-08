package app.api;

import app.api.dto.LeitorRequest;
import app.api.dto.LeitorResponse;
import app.service.LeitorService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leitores")
public class LeitorController {
    private final LeitorService leitorService;

    public LeitorController(LeitorService leitorService) {
        this.leitorService = leitorService;
    }

    @GetMapping
    public List<LeitorResponse> listar() {
        return leitorService.listar();
    }

    @PostMapping
    public LeitorResponse criar(@Valid @RequestBody LeitorRequest request) {
        return leitorService.criar(request);
    }
}
