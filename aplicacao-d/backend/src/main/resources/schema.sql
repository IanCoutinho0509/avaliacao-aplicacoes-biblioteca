CREATE TABLE IF NOT EXISTS books (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(200) NOT NULL,
    year INT NOT NULL,
    quantity INT NOT NULL,
    available_quantity INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS readers (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_readers_email (email)
);

CREATE TABLE IF NOT EXISTS loans (
    id BIGINT NOT NULL AUTO_INCREMENT,
    book_id BIGINT NOT NULL,
    reader_id BIGINT NOT NULL,
    loan_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_loans_book FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT fk_loans_reader FOREIGN KEY (reader_id) REFERENCES readers (id)
);