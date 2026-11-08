package app.emprestimos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {
    long countByLeitorIdAndDataDevolucaoIsNull(Long leitorId);

    @Query("select e from Emprestimo e where e.dataDevolucao is null and e.dataPrevistaDevolucao < :hoje order by e.dataPrevistaDevolucao asc, e.id asc")
    List<Emprestimo> findAtrasados(@Param("hoje") LocalDate hoje);

    List<Emprestimo> findByDataDevolucaoIsNullOrderByIdAsc();
}
