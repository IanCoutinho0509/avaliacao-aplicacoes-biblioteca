package app.reader;

import java.util.List;

import app.common.ValidationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReaderService {

    private final ReaderRepository readerRepository;

    public ReaderService(ReaderRepository readerRepository) {
        this.readerRepository = readerRepository;
    }

    public Reader create(Reader reader) {
        validate(reader);
        String email = reader.getEmail().trim();
        String name = reader.getName().trim();
        readerRepository.findByEmailIgnoreCase(email).ifPresent(existing -> {
            throw new ValidationException("Já existe um leitor com este e-mail");
        });
        reader.setEmail(email);
        reader.setName(name);
        return readerRepository.save(reader);
    }

    public List<Reader> list() {
        return readerRepository.findAll();
    }

    public Reader get(Long id) {
        return readerRepository.findById(id).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Leitor não encontrado"));
    }

    private void validate(Reader reader) {
        if (reader.getName() == null || reader.getName().isBlank()) throw new ValidationException("Nome é obrigatório");
        if (reader.getEmail() == null || reader.getEmail().isBlank()) throw new ValidationException("E-mail é obrigatório");
    }
}
