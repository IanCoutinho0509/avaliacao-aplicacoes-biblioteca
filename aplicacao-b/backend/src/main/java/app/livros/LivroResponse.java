package app.livros;

public record LivroResponse(
        Long id,
        String titulo,
        String autor,
        Integer ano,
        Integer quantidadeExemplares,
        Integer exemplaresDisponiveis) {

    public static LivroResponse fromEntity(Livro livro) {
        return new LivroResponse(
                livro.getId(),
                livro.getTitulo(),
                livro.getAutor(),
                livro.getAno(),
                livro.getQuantidadeExemplares(),
                livro.getExemplaresDisponiveis());
    }
}
