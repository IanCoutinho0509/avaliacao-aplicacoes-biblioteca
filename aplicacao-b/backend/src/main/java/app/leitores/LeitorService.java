package app.leitores;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import app.shared.BusinessException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeitorService {

    private final LeitorRepository leitorRepository;

    @Transactional(readOnly = true)
    public List<LeitorResponse> listar() {
        return leitorRepository.findAll().stream().map(LeitorResponse::fromEntity).toList();
    }

    @Transactional
    public LeitorResponse cadastrar(LeitorRequest request) {
        leitorRepository.findByEmailIgnoreCase(request.email()).ifPresent(l -> {
            throw new BusinessException("Já existe um leitor cadastrado com este e-mail.");
        });
        Leitor leitor = new Leitor();
        leitor.setNome(request.nome());
        leitor.setEmail(request.email());
        return LeitorResponse.fromEntity(leitorRepository.save(leitor));
    }
}
