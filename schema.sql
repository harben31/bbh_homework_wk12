DROP DATABASE IF EXISTS employees_DB;
CREATE DATABASE employees_DB;

USE employees_DB;

CREATE TABLE dept(
    id INT NOT NULL AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id) 
);

CREATE TABLE roles(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    dept_id INT,
    manager_id INT,
	salary DECIMAL,
    PRIMARY KEY (id)
);

CREATE TABLE emp_info(
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    dept_id INT, 
    manager_id INT, 
    role_id INT,
    PRIMARY KEY (id)
);


INSERT INTO dept (dept_name)
VALUES ("accounting"),  ("engineering"), ("legal");

INSERT INTO roles (title, dept_id, manager_id, salary)
VALUES ("Lead Acct", 1, null, 111000),("Lead Engineer", 2, null, 222000), ("Lead Lawer", 3, null, 333000), 
("Jr Acct", 1, 1, 11000), ("Jr Engineer", 2, 2, 22000), ("Jr Lawer", 3, 3, 33000);

INSERT INTO emp_info (first_name, last_name, role_id, manager_id, dept_id)
VALUES ("joe", "acct", 1, null, 1), ("bob", "engin", 2, null, 2), ("mary", "law", 3, null, 3), ("jane", "jrAcct", 4, 1, 1), ("fergus", "jrEng", 5, 2, 2), ("ginny", "jrLaw", 6, 3, 3);

INSERT INTO emp_info (first_name, last_name, role_id, manager_id, dept_id)
VALUES ("Bilbo", "accBag", 4, 1, 1),("Sam", "accGam", 4, 1, 1),("Frodo", "engBag", 5, 2, 2),
("Pipin", "engTook", 5, 2, 2),("Bob", "lawBlah", 6, 3, 3),("Dick", "lawWolf", 6, 3, 3);

SELECT * FROM dept;
SELECT * FROM roles;
SELECT * FROM emp_info; 

SELECT * FROM roles WHERE 1=0;

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = N'roles';

SELECT * FROM emp_info WHERE manager_id IS NULL;

--query to display one of all emp
SELECT emp.first_name, emp.last_name, r.title, emp.id AS employee_id, r.salary, d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS manager  
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN roles r
	ON emp.role_id = r.id
INNER JOIN dept d
	ON emp.dept_id = d.id
WHERE emp.id = ?;

--query to display all employees at once
SELECT emp.first_name, emp.last_name, r.title, emp.id AS employee_id, r.salary, d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS manager  
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN roles r
	ON emp.role_id = r.id
INNER JOIN dept d
	ON emp.dept_id = d.id;
    
--query to display one non mgr employee by id
SELECT emp.first_name, emp.last_name, r.title, emp.id AS employee_id, r.salary, d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS manager  
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN roles r
	ON emp.role_id = r.id
INNER JOIN dept d
	ON emp.dept_id = d.id
WHERE emp.manager_id;

--query to display one mgr by id
SELECT concat(mgr.first_name,' ', mgr.last_name) AS manager, d.dept_name, r.title, mgr.id AS manager_id, concat(emp.first_name, ' ', emp.last_name, ' ', r.title) AS subordinates   
FROM emp_info emp
RIGHT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN roles r
	ON mgr.role_id = r.id
INNER JOIN dept d
	ON emp.dept_id = d.id
WHERE mgr.id = ?;

--query to display all mgrs
SELECT concat(mgr.first_name,' ', mgr.last_name) AS manager, d.dept_name, r.title, mgr.id AS manager_id, concat(emp.first_name, ' ', emp.last_name) AS subordinates   
FROM emp_info emp
INNER JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN roles r
	ON mgr.role_id = r.id
INNER JOIN dept d
	ON emp.dept_id = d.id
WHERE mgr.manager_id IS NULL
ORDER BY manager;

--query to display one roll w/ employees
SELECT  r.title, r.salary, concat(emp.first_name, ' ', emp.last_name) AS employees, emp.id AS employee_id   
FROM emp_info emp
INNER JOIN roles r
	ON emp.role_id = r.id
WHERE r.id = ?;

--query to display all roles w/employees
SELECT  r.title, r.salary, concat(emp.first_name, ' ', emp.last_name) AS employees, emp.id AS employee_id   
FROM emp_info emp
INNER JOIN roles r
	ON emp.role_id = r.id
ORDER BY r.id;

--query to display one dept w/ employees
SELECT d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS dept_manager, concat(emp.first_name, ' ', emp.last_name) AS dept_employees, emp.id AS employee_id
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN dept d
	ON emp.dept_id = d.id
WHERE d.id = ?;

--query to display all depts w/ employees
SELECT d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS dept_manager, concat(emp.first_name, ' ', emp.last_name) AS dept_employees, emp.id AS employee_id
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN dept d
	ON emp.dept_id = d.id
ORDER BY d.dept_name;
