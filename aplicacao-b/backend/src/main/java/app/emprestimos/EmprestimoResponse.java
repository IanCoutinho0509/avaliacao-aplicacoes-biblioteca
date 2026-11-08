package app.emprestimos;

import java.time.LocalDate;

public record EmprestimoResponse(
        Long id,
        LivroResumo livro,
        LeitorResumo leitor,
        LocalDate dataEmprestimo,
        LocalDate dataPrevistaDevolucao,
        LocalDate dataDevolucao,
        Boolean atrasado,
        Integer diasEmAtraso) {

    public static EmprestimoResponse fromEntity(Emprestimo emprestimo, LocalDate hoje) {
        boolean ativo = emprestimo.getDataDevolucao() == null;
        boolean atrasado = ativo && emprestimo.getDataPrevistaDevolucao().isBefore(hoje);
        Integer diasEmAtraso = atrasado ? (int) java.time.temporal.ChronoUnit.DAYS.between(emprestimo.getDataPrevistaDevolucao(), hoje) : null;
        return new EmprestimoResponse(
                emprestimo.getId(),
                new LivroResumo(emprestimo.getLivro().getId(), emprestimo.getLivro().getTitulo()),
                new LeitorResumo(emprestimo.getLeitor().getId(), emprestimo.getLeitor().getNome()),
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataDevolucao(),
                atrasado,
                diasEmAtraso);
    }

    public record LivroResumo(Long id, String titulo) {}
    public record LeitorResumo(Long id, String nome) {}
}
