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

const colEditFn = (dta, tbl, id) => {
    let colEditQuest;
    switch(dta){
        case 'manager_id' || 'id' || 'dept_id '||'role_id':
            colEditQuest = {
                type: 'number',
                name: 'colChange',
                message: 'Enter new data'
            };
            break;
        default: 
            colEditQuest = {
                type: 'input',
                name: 'colChange',
                message: 'Enter new data'
            }
    }

    inquirer
        .prompt([
            colEditQuest
        ]).then((data)=>{
            db.query(`UPDATE ${tbl} SET ${dta} = '${data.colChange}' WHERE ${tbl}.id = ${id}`, (err, res) => {
                if(err) throw err;
            })
            db.end();
        }).catch((err)=>{if(err) throw err})
}

const colPickFn = (tbl, id) => {
    db.query(`SELECT COLUMN_NAME  
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = N'${tbl}'; `,
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

                        colEditFn(data.colPick, tbl, id);

                    }).catch((err)=>{if(err) throw err})
                })
}

const editTable = (action, table) => { //1st fn
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

  
    db.query(`SELECT ${ tabIdent }, id FROM ${ table }`,
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
                            };
                        });
                        return arr
                    }
                }
            ]).then((data)=>{ 
                console.log('272 data', data);
                console.log('273 res', res)
                res.forEach((rows) =>{ //var 1
                    let dbQuery;
                switch(table){
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
                    
                    if(dbQuery===data.rowSelect){//var 1 .. var 1
                        // console.log('true')

                        if(action==='delete_from'){
                            console.log('delete')
                            deleteFn(table, rows.id);
                        } else if(action==='add_to'){
                            console.log('add')
                            //addFn(table)
                        } else {
                            colPickFn(table, rows.id);
                            console.log('s89 success', rows.id);
                        };
                    };
                })
            
            }).catch((err)=>{if(err) throw err})
    })
    
}

const deleteFn = (tbl, rowId) => {
    db.query(`DELETE FROM ${tbl} WHERE id=${rowId}`,
    (err, res) => {
        if(err) throw err;
        console.log(res)
    });
    db.end()
};


//needs to be cleaned. addQuery wont work until .then
// const addFn = (tbl) => {

    let addQuest;
    let addQuery;

    if(tbl==='roles'){
        addQuest = [{
            type: 'input',
            name: 'rolesTitle',
            message: 'Enter new title',
        },
        {
            type: 'number',
            name: 'rolesSalary',
            message: 'Enter salary for new role'
        },
        {
            type: 'list',
            name: 'isMgr',
            message: 'Is this role a managerial role?',
            choices: ['yes', 'no']
        },
        {
            type: 'number',
            name: 'rolesManagerId',
            message: 'Enter assigned managers ID number',
            when: (answers)=>answers.isMgr==='no'
        },
        {
            type: 'number',
            name: 'rolesDeptId',
            message: 'Enter the ID number for the department this new role will be assigned'
        }]

        addQuery = `INSERT INTO roles (title, dept_id, manager_id, salary)
        VALUES ("${data.rolesNumber}", ${data.rolesDeptId}, null, ${data.rolesSalary})` 

    } else if (tbl==='emp_info'){
        addQuest = [{
            type: 'input',
            name: 'empFirstName',
            message: 'Enter new employees first name'
        },
        {
            type: 'input',
            name: 'empLastName',
            message: 'Enter new employees last name'
        },
        {
            type: 'number',
            name: 'empDept',
            message: 'Enter the ID number for the new employees assigned dept'
        },
        {
            type: 'number',
            name: 'empRoleId',
            message: 'Enter ID number for the new employees role'
        },
        {
            type: 'list',
            name: 'isMgr',
            message: 'Is this Employee a manager?',
            choices: ['yes', 'no']
        },
        {
            type: 'number',
            name: 'empMgrId',
            message: 'Enter new employees assigned manager\'s Id',
            where: (answers) => answers.isMgr === 'no'
        }];

    let mgrId;    
    if(data.isMgr==='yes'){
        mgrId = NULL;
    } else {
        mgrId = data.empMgrId;
    }
    addQuery = `INSERT INTO emp_info (first_name, last_name, role_id, manager_id, dept_id)
    VALUES ("${data.empFirstName}", "${data.empLastName}", ${data.empRoleId}, ${isMgr}, ${data.empDept})`
    } else if (tbl==='dept'){
        addQuest = [
            {
                type: 'input',
                name: 'newDept',
                message: 'Enter name of new department'
            },
        ];

        addQuery = `INSERT INTO dept (dept_name)
        VALUES ("${data.newDept}")`
    }
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
    .catch((err)=>{if(err)throw err});
}

db.connect((err)=>{
    if(err)throw err;
    start()
});