MATCH (author:Author)
OPTIONAL MATCH (author)-[:WROTE]->(book:Book)
WITH author, count(book) AS numBooks ORDER BY numBooks, author.name
RETURN author.name, numBooks;

