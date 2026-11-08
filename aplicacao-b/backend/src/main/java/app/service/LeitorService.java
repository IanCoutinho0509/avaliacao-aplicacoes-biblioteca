package app.service;

import java.util.List;

import app.domain.Leitor;
import app.exception.RegraNegocioException;
import app.repository.LeitorRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class LeitorService {

    private final LeitorRepository leitorRepository;

    public LeitorService(LeitorRepository leitorRepository) {
        this.leitorRepository = leitorRepository;
    }

    @Transactional
    public Leitor criar(@Valid LeitorRequest request) {
        leitorRepository.findByEmail(request.email()).ifPresent(leitor -> {
            throw new RegraNegocioException("Já existe leitor cadastrado com este e-mail");
        });
        Leitor leitor = new Leitor();
        leitor.setNome(request.nome());
        leitor.setEmail(request.email());
        return leitorRepository.save(leitor);
    }

    public List<Leitor> listar() {
        return leitorRepository.findAll();
    }

    public Leitor buscarPorId(Long id) {
        return leitorRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Leitor não encontrado"));
    }

    public record LeitorRequest(@NotBlank String nome, @NotBlank @Email String email) {
    }
}
