CREATE TABLE IF NOT EXISTS livros (
    id BIGINT NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    ano INT NOT NULL,
    quantidade_exemplares INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS leitores (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_leitores_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS emprestimos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    livro_id BIGINT NOT NULL,
    leitor_id BIGINT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao DATE NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_emprestimos_livro FOREIGN KEY (livro_id) REFERENCES livros (id),
    CONSTRAINT fk_emprestimos_leitor FOREIGN KEY (leitor_id) REFERENCES leitores (id),
    CONSTRAINT idx_emprestimos_livro_id UNIQUE (id, livro_id)
);
