package app.service;

import app.api.dto.LeitorRequest;
import app.api.dto.LeitorResponse;
import app.domain.Leitor;
import app.repository.LeitorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeitorService {
    private final LeitorRepository leitorRepository;

    public LeitorService(LeitorRepository leitorRepository) {
        this.leitorRepository = leitorRepository;
    }

    public List<LeitorResponse> listar() {
        return leitorRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public LeitorResponse criar(LeitorRequest request) {
        Leitor leitor = new Leitor();
        leitor.setNome(request.getNome().trim());
        leitor.setEmail(request.getEmail().trim().toLowerCase());
        return toResponse(leitorRepository.save(leitor));
    }

    public Leitor buscarEntidade(Long id) {
        return leitorRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Leitor não encontrado"));
    }

    private LeitorResponse toResponse(Leitor leitor) {
        return new LeitorResponse(leitor.getId(), leitor.getNome(), leitor.getEmail());
    }
}
