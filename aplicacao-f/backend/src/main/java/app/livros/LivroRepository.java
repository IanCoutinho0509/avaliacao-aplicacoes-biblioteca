package app.livros;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LivroRepository extends JpaRepository<Livro, Long> {
    @Query("select l from Livro l order by l.titulo asc, l.id asc")
    List<Livro> findAllOrderByTitulo();

    @Query("select l from Livro l where l.id = :id")
    Optional<Livro> findByIdForUpdate(@Param("id") Long id);
}
