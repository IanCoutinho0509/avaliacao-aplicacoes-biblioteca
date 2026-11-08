package app.leitores;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import app.common.DomainException;

@Service
public class LeitorService {

    private final LeitorRepository repository;

    public LeitorService(LeitorRepository repository) {
        this.repository = repository;
    }

    public LeitorResponse criar(LeitorRequest request) {
        repository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            throw new DomainException(HttpStatus.CONFLICT, "Já existe um leitor com este e-mail");
        });

        Leitor leitor = new Leitor();
        leitor.setNome(request.nome());
        leitor.setEmail(request.email());
        leitor = repository.save(leitor);
        return toResponse(leitor);
    }

    public List<LeitorResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public Leitor getReferencia(Long id) {
        return repository.findById(id).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Leitor não encontrado"));
    }

    private LeitorResponse toResponse(Leitor leitor) {
        return new LeitorResponse(leitor.getId(), leitor.getNome(), leitor.getEmail());
    }
}
