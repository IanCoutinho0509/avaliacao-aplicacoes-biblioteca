package app.api.dto;

public class LeitorResponse {
    private final Long id;
    private final String nome;
    private final String email;

    public LeitorResponse(Long id, String nome, String email) {
        this.id = id;
        this.nome = nome;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
}
