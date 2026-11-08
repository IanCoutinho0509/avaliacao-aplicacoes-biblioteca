package app.livros;

public record LivroResponse(
        Long id,
        String titulo,
        String autor,
        Integer ano,
        Integer quantidadeExemplares,
        Integer exemplaresDisponiveis) {
}
