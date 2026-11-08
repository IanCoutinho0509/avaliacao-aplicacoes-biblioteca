package app.leitores;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/leitores")
@RequiredArgsConstructor
public class LeitorController {

    private final LeitorService leitorService;

    @GetMapping
    public List<LeitorResponse> listar() {
        return leitorService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeitorResponse cadastrar(@Valid @RequestBody LeitorRequest request) {
        return leitorService.cadastrar(request);
    }
}
