package app.leitores;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeitorRepository extends JpaRepository<Leitor, Long> {
    List<Leitor> findAllByOrderByNomeAscIdAsc();

    Optional<Leitor> findByEmailIgnoreCase(String email);
}
