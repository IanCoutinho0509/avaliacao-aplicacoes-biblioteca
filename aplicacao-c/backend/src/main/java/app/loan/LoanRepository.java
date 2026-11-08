package app.loan;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    long countByReaderIdAndReturnDateIsNull(Long readerId);
    long countByBookIdAndReturnDateIsNull(Long bookId);
    List<Loan> findByReturnDateIsNullAndDueDateBefore(LocalDate date);
    List<Loan> findByReturnDateIsNull();
}
