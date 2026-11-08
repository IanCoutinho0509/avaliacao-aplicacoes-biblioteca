# Aplicações A a F

Código-fonte das seis aplicações web de biblioteca avaliadas na pesquisa "Aplicação do Modelo 3C de Colaboração à
Interação entre Agentes Inteligentes Baseados em Grandes Modelos de Linguagem", Trabalho de Conclusão de Curso de Ian
Araujo Coutinho no Bacharelado em Ciência da Computação da FFCLRP-USP, com orientação do Prof. Dr. Cléver Ricardo
Guareis de Farias.

As seis foram construídas a partir do mesmo enunciado. Cada uma está na sua pasta, identificada só pela letra:

- [Aplicação A](aplicacao-a)
- [Aplicação B](aplicacao-b)
- [Aplicação C](aplicacao-c)
- [Aplicação D](aplicacao-d)
- [Aplicação E](aplicacao-e)
- [Aplicação F](aplicacao-f)

## O que cada aplicação faz

Um sistema de biblioteca com cadastro de livros, cadastro de leitores e controle de empréstimos.

- Um livro tem título, autor, ano e quantidade de exemplares. Só pode ser emprestado se houver exemplar disponível.
- Um leitor tem nome e e-mail e pode ter no máximo 3 empréstimos ativos ao mesmo tempo.
- Um empréstimo registra o livro, o leitor, a data do empréstimo e a data prevista de devolução, 14 dias depois. Na
  devolução, o exemplar volta a ficar disponível.
- Empréstimos ativos com a data prevista vencida estão atrasados e aparecem numa consulta própria.

## Onde olhar em cada pasta

| Caminho | O que é |
|---|---|
| `backend/src/main/java/app/` | O back-end, em Java 21 com Spring Boot |
| `backend/src/main/resources/schema.sql` | O esquema do banco de dados MySQL 8 |
| `frontend/src/` | O front-end, em React com Vite e Tailwind CSS |

Alguns arquivos são idênticos nas seis pastas, porque vieram de um mesmo esqueleto de projeto: `backend/pom.xml`,
`backend/src/main/resources/application.properties`, `frontend/package.json`, `frontend/package-lock.json`,
`frontend/vite.config.js`, `frontend/index.html`, `frontend/src/main.jsx` e `frontend/src/index.css`. Eles não
diferenciam as aplicações.
