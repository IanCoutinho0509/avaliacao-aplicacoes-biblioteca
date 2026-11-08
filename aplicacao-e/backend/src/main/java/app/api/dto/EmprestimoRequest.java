package app.api.dto;

import jakarta.validation.constraints.NotNull;

public class EmprestimoRequest {
    @NotNull
    private Long livroId;

    @NotNull
    private Long leitorId;

    public Long getLivroId() { return livroId; }
    public void setLivroId(Long livroId) { this.livroId = livroId; }
    public Long getLeitorId() { return leitorId; }
    public void setLeitorId(Long leitorId) { this.leitorId = leitorId; }
}
