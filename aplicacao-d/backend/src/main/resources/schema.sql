CREATE TABLE IF NOT EXISTS livro (
    id BIGINT NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(200) NOT NULL,
    ano INT NOT NULL,
    quantidade_exemplares INT NOT NULL,
    quantidade_disponivel INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_livro_quantidades CHECK (quantidade_exemplares >= 0 AND quantidade_disponivel >= 0 AND quantidade_disponivel <= quantidade_exemplares)
);

CREATE TABLE IF NOT EXISTS leitor (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_leitor_email (email)
);

CREATE TABLE IF NOT EXISTS emprestimo (
    id BIGINT NOT NULL AUTO_INCREMENT,
    livro_id BIGINT NOT NULL,
    leitor_id BIGINT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao DATE NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_emprestimo_livro FOREIGN KEY (livro_id) REFERENCES livro (id),
    CONSTRAINT fk_emprestimo_leitor FOREIGN KEY (leitor_id) REFERENCES leitor (id),
    INDEX idx_emprestimo_data_prevista (data_prevista_devolucao),
    INDEX idx_emprestimo_data_devolucao (data_devolucao),
    INDEX idx_emprestimo_livro_ativo (livro_id, data_devolucao),
    INDEX idx_emprestimo_leitor_ativo (leitor_id, data_devolucao)
);
