package app.repository;

import app.domain.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {
    long countByLeitorIdAndDataDevolucaoIsNull(Long leitorId);

    List<Emprestimo> findByDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(java.time.LocalDate data);
}
