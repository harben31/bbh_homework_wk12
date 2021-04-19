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
    salary INT,
    PRIMARY KEY (id)
);

CREATE TABLE roles(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    dept_id INT,
    manager_id INT,
    PRIMARY KEY (id)
);

CREATE TABLE emp_info(
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    dept_id INT, 
    manager_id INT, 
    role_id INT,
    salary INT,
    PRIMARY KEY (id)
);


INSERT INTO dept (dept_name, manager_id)
VALUES ("accounting", 1),  ("engineering", 2), ("legal", 3);

INSERT INTO mgmt (first_name, last_name, dept_id, role_id, salary)
VALUES ("joe", "acct", 1, 1, 200000), ("bob", "engin", 2, 2, 300000), ("mary", "law", 3, 3, 400000);

INSERT INTO roles (title, dept_id, manager_id)
VALUES ("Lead Acct", 1, null),("Lead Engineer", 2, null), ("Lead Lawer", 3, null), 
("Jr Acct", 1, 1), ("Jr Engineer", 2, 2), ("Jr Lawer", 3, 3);

INSERT INTO emp_info (first_name, last_name, role_id, manager_id, dept_id, salary)
VALUES ("jane", "jrAcct", 4, 1, 1, 100000), ("fergus", "jrEng", 5, 2, 2, 120000), ("ginny", "jrLaw", 6, 3, 3, 130000);

SELECT * FROM mgmt;
SELECT * FROM dept;
SELECT * FROM roles;
SELECT * FROM emp_info; 