package app.livros;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "livros")
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String titulo;

    @NotBlank
    @Size(max = 200)
    private String autor;

    @NotNull
    private Integer ano;

    @NotNull
    @Min(0)
    @Column(name = "quantidade_exemplares")
    private Integer quantidadeExemplares;

    @NotNull
    @Min(0)
    @Column(name = "exemplares_disponiveis")
    private Integer exemplaresDisponiveis;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
    public Integer getQuantidadeExemplares() { return quantidadeExemplares; }
    public void setQuantidadeExemplares(Integer quantidadeExemplares) { this.quantidadeExemplares = quantidadeExemplares; }
    public Integer getExemplaresDisponiveis() { return exemplaresDisponiveis; }
    public void setExemplaresDisponiveis(Integer exemplaresDisponiveis) { this.exemplaresDisponiveis = exemplaresDisponiveis; }
}
