package app.leitores;

import app.shared.RegraNegocioException;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LeitorService {
    private final LeitorRepository repository;

    public LeitorService(LeitorRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<LeitorController.LeitorResponse> listar() {
        return repository.findAllByOrderByNomeAscIdAsc().stream().map(this::toResponse).toList();
    }

    public LeitorController.LeitorResponse criar(LeitorController.LeitorRequest request) {
        repository.findByEmailIgnoreCase(request.email().trim()).ifPresent(l -> { throw new RegraNegocioException("Já existe um leitor cadastrado com este e-mail."); });
        Leitor leitor = new Leitor();
        leitor.setNome(request.nome().trim());
        leitor.setEmail(request.email().trim().toLowerCase());
        try {
            return toResponse(repository.save(leitor));
        } catch (DataIntegrityViolationException e) {
            throw new RegraNegocioException("Já existe um leitor cadastrado com este e-mail.");
        }
    }

    LeitorController.LeitorResponse toResponse(Leitor leitor) {
        return new LeitorController.LeitorResponse(leitor.getId(), leitor.getNome(), leitor.getEmail());
    }
}
