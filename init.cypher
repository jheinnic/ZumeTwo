MATCH (author:Author)
DETACH DELETE author;

MATCH (book:Book)
DETACH DELETE book;

CREATE (author:Author {name: "John Heinnickel"})
MERGE (author)-[:WROTE]->(book:Book {title: "Coding 101"});

CREATE (author:Author {name: "David Holman"})
MERGE (author)-[:WROTE]->(book1:Book {title: "Miss Molly"})
MERGE (author)-[:WROTE]->(book2:Book {title: "Cooking With Fire"});

CREATE (author:Author {name: "Janice Lister"})
MERGE (author)-[:WROTE]->(book1:Book {title: "Space Bugs"})
MERGE (author)-[:WROTE]->(book2:Book {title: "Science"});

CREATE (author:Author {name: "Jim Burk"});
