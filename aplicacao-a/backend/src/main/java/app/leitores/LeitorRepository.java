package app.leitores;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LeitorRepository extends JpaRepository<Leitor, Long> {
    Optional<Leitor> findByEmailIgnoreCase(String email);
}
