CREATE DATABASE square_big_query; 

--\c into todo_database 

CREATE TABLE team_members(
    id SERIAL PRIMARY KEY,
    entrys text[],
    created_at date NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE customers(
    id SERIAL PRIMARY KEY,
    entrys text[],
    created_at date NOT NULL DEFAULT CURRENT_DATE
);


CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    entrys text[],
    created_at date NOT NULL DEFAULT CURRENT_DATE
);