package app.loan;

import java.time.LocalDate;
import java.util.List;

import app.book.Book;
import app.book.BookService;
import app.reader.Reader;
import app.reader.ReaderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookService bookService;
    private final ReaderService readerService;

    public LoanService(LoanRepository loanRepository, BookService bookService, ReaderService readerService) {
        this.loanRepository = loanRepository;
        this.bookService = bookService;
        this.readerService = readerService;
    }

    public Loan create(Long bookId, Long readerId) {
        Book book = bookService.get(bookId);
        Reader reader = readerService.get(readerId);

        if (book.getAvailableQuantity() == null || book.getAvailableQuantity() < 1) {
            throw new IllegalStateException("Não há exemplar disponível para este livro");
        }
        if (loanRepository.countByReaderIdAndReturnDateIsNull(readerId) >= 3) {
            throw new IllegalStateException("Leitor já possui o limite de 3 empréstimos ativos");
        }

        Loan loan = new Loan();
        loan.setBook(book);
        loan.setReader(reader);
        loan.setLoanDate(LocalDate.now());
        loan.setDueDate(LocalDate.now().plusDays(14));

        book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        bookService.save(book);
        return loanRepository.save(loan);
    }

    public Loan returnLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Empréstimo não encontrado"));
        if (loan.getReturnDate() != null) {
            throw new IllegalStateException("Empréstimo já foi devolvido");
        }
        loan.setReturnDate(LocalDate.now());
        Book book = loan.getBook();
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);
        bookService.save(book);
        return loanRepository.save(loan);
    }

    public List<Loan> list() {
        return loanRepository.findAll();
    }

    public List<Loan> overdue() {
        return loanRepository.findByReturnDateIsNullAndDueDateBefore(LocalDate.now());
    }
}
