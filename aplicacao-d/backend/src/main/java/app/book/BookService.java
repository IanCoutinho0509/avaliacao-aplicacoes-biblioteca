package app.book;

import java.util.List;

import app.common.ValidationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public Book create(Book book) {
        validate(book);
        book.setAvailableQuantity(book.getQuantity());
        return bookRepository.save(book);
    }

    public List<Book> list() {
        return bookRepository.findAll();
    }

    public Book get(Long id) {
        return bookRepository.findById(id).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Livro não encontrado"));
    }

    public Book save(Book book) {
        return bookRepository.save(book);
    }

    private void validate(Book book) {
        if (book.getTitle() == null || book.getTitle().isBlank()) throw new ValidationException("Título é obrigatório");
        if (book.getAuthor() == null || book.getAuthor().isBlank()) throw new ValidationException("Autor é obrigatório");
        if (book.getYear() == null || book.getYear() < 0) throw new ValidationException("Ano deve ser válido");
        if (book.getQuantity() == null || book.getQuantity() < 1) throw new ValidationException("Quantidade deve ser pelo menos 1");
    }
}
