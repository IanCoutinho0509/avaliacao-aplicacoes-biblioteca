package app.loan;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    public List<Loan> list() {
        return loanService.list();
    }

    @GetMapping("/overdue")
    public List<Loan> overdue() {
        return loanService.overdue();
    }

    @PostMapping
    public Loan create(@RequestBody CreateLoanRequest request) {
        return loanService.create(request.getBookId(), request.getReaderId());
    }

    @PostMapping("/{id}/return")
    public Loan returnLoan(@PathVariable Long id) {
        return loanService.returnLoan(id);
    }

    public static class CreateLoanRequest {
        private Long bookId;
        private Long readerId;

        public Long getBookId() { return bookId; }
        public void setBookId(Long bookId) { this.bookId = bookId; }
        public Long getReaderId() { return readerId; }
        public void setReaderId(Long readerId) { this.readerId = readerId; }
    }
}
