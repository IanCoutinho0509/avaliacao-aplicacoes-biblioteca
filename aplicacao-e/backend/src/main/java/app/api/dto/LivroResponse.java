package app.api.dto;

import java.time.LocalDate;

public class LivroResponse {
    private Long id;
    private String titulo;
    private String autor;
    private Integer ano;
    private Integer exemplaresTotal;
    private Integer exemplaresDisponiveis;

    public LivroResponse(Long id, String titulo, String autor, Integer ano, Integer exemplaresTotal, Integer exemplaresDisponiveis) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.ano = ano;
        this.exemplaresTotal = exemplaresTotal;
        this.exemplaresDisponiveis = exemplaresDisponiveis;
    }

    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getAutor() { return autor; }
    public Integer getAno() { return ano; }
    public Integer getExemplaresTotal() { return exemplaresTotal; }
    public Integer getExemplaresDisponiveis() { return exemplaresDisponiveis; }
}
