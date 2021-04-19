DROP DATABASE IF EXISTS employees_DB;
CREATE DATABASE employees_DB;

USE employees_DB;

CREATE TABLE dept(
    id INT NOT NULL AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL,
    manager_id INT,
    PRIMARY KEY (id) 
);

CREATE TABLE mgmt(
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    dept_id INT,
    role_id INT,
    PRIMARY KEY (id)
);

CREATE TABLE roles(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    dept_id INT,
    manager_id INT,
    PRIMARY KEY (id)
);

CREATE TABLE emp-info(
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    dept_id INT, 
    manager_id INT, 
    role_id INT,
    salary INT
    PRIMARY KEY (id)
)