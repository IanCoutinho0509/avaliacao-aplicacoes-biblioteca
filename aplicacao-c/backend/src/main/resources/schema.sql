CREATE TABLE IF NOT EXISTS livros (
    id BIGINT NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(200) NOT NULL,
    ano INT NOT NULL,
    quantidade_exemplares INT NOT NULL,
    exemplares_disponiveis INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_livros_quantidade CHECK (quantidade_exemplares >= 0),
    CONSTRAINT chk_livros_disponiveis CHECK (exemplares_disponiveis >= 0),
    CONSTRAINT chk_livros_disponiveis_menor_igual CHECK (exemplares_disponiveis <= quantidade_exemplares)
);

CREATE TABLE IF NOT EXISTS leitores (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_leitores_email (email)
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
    CONSTRAINT fk_emprestimos_leitor FOREIGN KEY (leitor_id) REFERENCES leitores (id)
);
