//TODO
// consolodate view fns & rewrite sql qrys
//add method to view all
//write sql for delete and update
//modularize edit fn better?
//write add fn & delete fn




const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table')

const Employee = require('./lib/employee');
const Role = require('./lib/role')
const Department = require('./lib/department');

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Mar31&45^iRD2!',
    database: 'employees_DB'
});

let baseQuery = `SELECT ?  
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN roles r
	ON emp.role_id = r.id
INNER JOIN dept d
	ON emp.dept_id = d.id;`

const allEmpQuery = `emp.first_name, emp.last_name, r.title, r.salary, d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS manager`

const allEmpTotQuery = `SELECT emp.first_name, emp.last_name, r.title, r.salary, d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS manager  
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN roles r
	ON emp.role_id = r.id
INNER JOIN dept d
	ON emp.dept_id = d.id
WHERE emp.id = ?;`

const mgrTotQuery = `SELECT concat(mgr.first_name,' ', mgr.last_name) AS manager, d.dept_name, concat(emp.first_name, ' ', emp.last_name, ' ', r.title) AS subordinates   
FROM emp_info emp
RIGHT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN roles r
	ON emp.role_id = r.id
INNER JOIN dept d
	ON emp.dept_id = d.id
WHERE mgr.id = ?;`

const rolesTotQuery = `SELECT  r.title, concat(emp.first_name, ' ', emp.last_name) AS employees, emp.id AS employee_id   
FROM emp_info emp
INNER JOIN roles r
	ON emp.role_id = r.id
WHERE r.id = ?;`

const deptTotQuery = `SELECT d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS dept_manager, concat(emp.first_name, ' ', emp.last_name) AS dept_employees, emp.id AS employee_id
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN dept d
	ON emp.dept_id = d.id
WHERE d.id = ?;`

const start = ()=>{
    inquirer.prompt([
        {
            type: 'list',
            name: 'greeting',
            message: 'What would you like to do?',
            choices: ['view_roster', 'edit_roster']
        }
    ]).then((data)=>{
        if(data.greeting==='edit_roster'){
            editRoster()
        } else {
            viewRoster()
        }
    })
    .catch((err)=>{if(err) throw err})
}

const viewRoster = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'viewBy',
            message: 'how would you like to view your roster?',
            choices: [
                'by_employee',
                'by_dept',
                'by_role',
                'by_manager',
                'by_all_employees'
            ]
        }
    ]).then((data) => {
        let cat;
        if(data.viewBy==='by_manager'){
            viewFn('emp_info', `SELECT * FROM emp_info WHERE manager_id IS NULL`, mgrTotQuery);
        } else if(data.viewBy==='by_dept'){
            viewFn('dept', `SELECT * FROM dept`, deptTotQuery);
        } else if(data.viewBy==='by_role'){
            viewFn('roles', `SELECT * FROM roles` , rolesTotQuery);
        } else if(data.viewBy==='by_employee'){
            viewFn('emp_info', `SELECT * FROM emp_info WHERE manager_id`, rolesTotQuery);
        } else {
            viewFn('emp_info', `SELECT * FROM emp_info`, allEmpTotQuery);
        }
    })
    .catch((err)=>{if(err) throw err})
}

const viewFn = (dbTable, sqlQueryOne, sqlQueryTwo) => {

    db.query(sqlQueryOne, // var 1
    (err, res)=>{
        if(err)throw err;
        console.log(res)
        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: dbTable, //var 1
                    message: `Select ${dbTable} to view`, //var 1
                    choices(){
                        const arr = []; 

                        res.forEach(( x )=>{ //var 2 // look to edit fn
                            switch(dbTable){
                                case 'emp_info':
                                    arr.push(`${x.first_name} ${x.last_name}`);
                                    break;
                                case 'dept':
                                    arr.push(x.dept_name);
                                    break;
                                case 'roles':
                                    arr.push(x.title);
                                    break;
                            }
                            
                        })
                        return arr
                    }
                }
            ])
            .then((data)=>{
                // console.log(data);

                res.forEach((rows) =>{ //var 1
                    let dbQuery;
                switch(dbTable){
                    case 'emp_info':
                        dbQuery = `${rows.first_name} ${rows.last_name}`;
                        break;
                    case 'dept':
                        dbQuery = rows.dept_name;
                        break;
                    case 'roles':
                        dbQuery = rows.title;
                        break;
                };
                    
                    if(dbQuery===data[dbTable]){//var 1 .. var 1
                        // console.log('true')
                        db.query(sqlQueryTwo, //var 3
                            rows.id, //var 1
                            (err, res)=>{
                                if(err) throw err;
                                console.log(res)
                                console.table(res);
                            })
                        db.end();
                    }
                })
            })
            .catch((err)=>{if(err) throw err})
    });

};

const editTable = (action, table) => {
    console.log(action, table);

    let tabIdent;
    let empTabIdent;
    if(table==='dept'){
        tabIdent = 'dept_name'
    } else if (table==='roles'){
        tabIdent = 'title';
    } else if(table==='emp_info'){
        tabIdent = 'first_name, last_name';
    }

  
    db.query(`SELECT ${ tabIdent } FROM ${ table }`,
    (err, res) => {
        if(err) throw err;

        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: 'rowSelect',
                    message: 'Where would you like to make a change?',
                
                    choices(){
                        arr = [];

                        res.forEach(( x )=>{

                            switch(table){
                                case 'emp_info':
                                    arr.push(`${x.first_name} ${x.last_name}`);
                                    break;
                                case 'dept':
                                    arr.push(x.dept_name);
                                    break;
                                case 'roles':
                                    arr.push(x.title);
                                    break;
                            }
                        });
                        return arr
                    }
                }
            ]).then((data)=>{
                db.query(`SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = N'${table}'; `,
                // table,
                (err, res) => {
                    if(err) throw err;
                    inquirer
                    .prompt([
                        {
                            type: 'rawlist',
                            name: 'colPick',
                            message: 'Where would you like to make a change?',
                            choices(){
                                const arr = [];
                                
                                res.forEach(({ COLUMN_NAME }) => {
                                    console.log( COLUMN_NAME );
                                    arr.push( COLUMN_NAME );
                                })
                                arr.shift();
                                return arr
                            }
                        }
                    ]).then((data)=>{

                    }).catch((err)=>{if(err) throw err})
                })
            }).catch((err)=>{if(err) throw err})
    })
    
}

const editRoster = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'tableEdit',
            message: 'What would you like to edit?',
            choices: [
                'Departments',
                'Roles',
                'Employees'
            ]
        },
        {
            type: 'list',
            name: 'editType',
            message: 'What action would you like to take?',
            choices: [
                'add_to',
                'delete_from',
                'update'
            ]
        }
    ])
    .then((data)=>{
        let tabVar;
        if(data.tableEdit==='Departments'){
            tabVar = 'dept'
        } else if(data.tableEdit==='Roles'){
            tabVar = 'roles'
        } else if(data.tableEdit==='Employees') {
            tabVar = 'emp_info'
        } 
        console.log(tabVar)
        editTable(data.editType, tabVar)
    })
    .catch((err)=>{if(err)throw err})
}

db.connect((err)=>{
    if(err)throw err;
    start()
});