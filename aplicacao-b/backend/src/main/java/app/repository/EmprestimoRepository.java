package app.repository;

import java.time.LocalDate;
import java.util.List;

import app.domain.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {
    long countByLivroIdAndDataDevolucaoIsNull(Long livroId);

    long countByLeitorIdAndDataDevolucaoIsNull(Long leitorId);

    List<Emprestimo> findByDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(LocalDate data);
}
