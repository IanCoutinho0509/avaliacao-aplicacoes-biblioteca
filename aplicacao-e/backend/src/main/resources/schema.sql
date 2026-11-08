CREATE TABLE IF NOT EXISTS livros (
    id BIGINT NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    ano INT NOT NULL,
    exemplares_total INT NOT NULL,
    exemplares_disponiveis INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_livros_exemplares CHECK (exemplares_total >= 0 AND exemplares_disponiveis >= 0 AND exemplares_disponiveis <= exemplares_total)
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
    CONSTRAINT fk_emprestimos_livro FOREIGN KEY (livro_id) REFERENCES livros(id),
    CONSTRAINT fk_emprestimos_leitor FOREIGN KEY (leitor_id) REFERENCES leitores(id)
);