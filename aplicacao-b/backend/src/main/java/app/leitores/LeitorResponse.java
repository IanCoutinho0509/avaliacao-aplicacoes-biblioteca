package app.leitores;

public record LeitorResponse(
        Long id,
        String nome,
        String email) {

    public static LeitorResponse fromEntity(Leitor leitor) {
        return new LeitorResponse(leitor.getId(), leitor.getNome(), leitor.getEmail());
    }
}
