package app.reader;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReaderRepository extends JpaRepository<Reader, Long> {
    Optional<Reader> findByEmailIgnoreCase(String email);
}
