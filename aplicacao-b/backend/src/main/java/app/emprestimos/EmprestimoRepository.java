package app.emprestimos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    @Query("select e from Emprestimo e where e.dataDevolucao is null")
    List<Emprestimo> findAtivos();

    @Query("select e from Emprestimo e where e.dataDevolucao is null and e.dataPrevistaDevolucao < :hoje")
    List<Emprestimo> findAtrasados(@Param("hoje") LocalDate hoje);

    long countByLeitorIdAndDataDevolucaoIsNull(Long leitorId);
}
