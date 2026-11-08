package app.api.dto;

import java.time.LocalDate;

public class EmprestimoResponse {
    private final Long id;
    private final Long livroId;
    private final String livroTitulo;
    private final Long leitorId;
    private final String leitorNome;
    private final LocalDate dataEmprestimo;
    private final LocalDate dataPrevistaDevolucao;
    private final LocalDate dataDevolucao;
    private final boolean atrasado;
    private final boolean ativo;

    public EmprestimoResponse(Long id, Long livroId, String livroTitulo, Long leitorId, String leitorNome,
                             LocalDate dataEmprestimo, LocalDate dataPrevistaDevolucao, LocalDate dataDevolucao,
                             boolean atrasado, boolean ativo) {
        this.id = id;
        this.livroId = livroId;
        this.livroTitulo = livroTitulo;
        this.leitorId = leitorId;
        this.leitorNome = leitorNome;
        this.dataEmprestimo = dataEmprestimo;
        this.dataPrevistaDevolucao = dataPrevistaDevolucao;
        this.dataDevolucao = dataDevolucao;
        this.atrasado = atrasado;
        this.ativo = ativo;
    }

    public Long getId() { return id; }
    public Long getLivroId() { return livroId; }
    public String getLivroTitulo() { return livroTitulo; }
    public Long getLeitorId() { return leitorId; }
    public String getLeitorNome() { return leitorNome; }
    public LocalDate getDataEmprestimo() { return dataEmprestimo; }
    public LocalDate getDataPrevistaDevolucao() { return dataPrevistaDevolucao; }
    public LocalDate getDataDevolucao() { return dataDevolucao; }
    public boolean isAtrasado() { return atrasado; }
    public boolean isAtivo() { return ativo; }
}
