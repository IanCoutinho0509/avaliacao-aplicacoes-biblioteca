package app.repository;

import java.util.Optional;

import app.domain.Leitor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeitorRepository extends JpaRepository<Leitor, Long> {
    Optional<Leitor> findByEmail(String email);
}
