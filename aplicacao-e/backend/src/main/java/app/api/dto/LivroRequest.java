package app.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class LivroRequest {
    @NotBlank
    private String titulo;

    @NotBlank
    private String autor;

    @NotNull
    private Integer ano;

    @NotNull
    @Min(0)
    private Integer exemplares;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
    public Integer getExemplares() { return exemplares; }
    public void setExemplares(Integer exemplares) { this.exemplares = exemplares; }
}
