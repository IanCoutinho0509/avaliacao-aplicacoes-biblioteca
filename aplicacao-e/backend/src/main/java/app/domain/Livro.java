package app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "livros")
public class Livro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titulo;

    @NotBlank
    private String autor;

    @NotNull
    private Integer ano;

    @Min(0)
    @Column(name = "exemplares_total")
    private Integer exemplaresTotal;

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
    public Integer getExemplaresTotal() { return exemplaresTotal; }
    public void setExemplaresTotal(Integer exemplaresTotal) { this.exemplaresTotal = exemplaresTotal; }
    public Integer getExemplaresDisponiveis() { return exemplaresDisponiveis; }
    public void setExemplaresDisponiveis(Integer exemplaresDisponiveis) { this.exemplaresDisponiveis = exemplaresDisponiveis; }
}
