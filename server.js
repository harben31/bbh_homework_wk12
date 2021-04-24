//TODO
//add start to end of fns
//add view saleries opt
//emp titles on all mgr query
//make dept & role ?'s choices not number

const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Mar31&45^iRD2!',
    database: 'employees_DB'
});

const allEmpTotQuery = `SELECT emp.first_name, emp.last_name, r.title, emp.id AS employee_id, r.salary, d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS manager  
    FROM emp_info emp
    LEFT JOIN emp_info  mgr
        ON emp.manager_id = mgr.id
    INNER JOIN roles r
        ON emp.role_id = r.id
    INNER JOIN dept d
        ON emp.dept_id = d.id
    WHERE emp.id = ?;`

const allEmpTotQueryAll = `SELECT emp.first_name, emp.last_name, r.title, emp.id AS employee_id, r.salary, d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS manager  
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN roles r
	ON emp.role_id = r.id
INNER JOIN dept d
	ON emp.dept_id = d.id`

const empTotQueryAll = `SELECT emp.first_name, emp.last_name, r.title, emp.id AS employee_id, r.salary, d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS manager  
    FROM emp_info emp
    LEFT JOIN emp_info  mgr
        ON emp.manager_id = mgr.id
    INNER JOIN roles r
        ON emp.role_id = r.id
    INNER JOIN dept d
        ON emp.dept_id = d.id
    WHERE emp.manager_id`

const mgrTotQuery = `SELECT concat(mgr.first_name,' ', mgr.last_name) AS manager, d.dept_name, r.title, mgr.id AS manager_id, concat(emp.first_name, ' ', emp.last_name, ' ', r.title) AS subordinates   
    FROM emp_info emp
    RIGHT JOIN emp_info  mgr
        ON emp.manager_id = mgr.id
    INNER JOIN roles r
        ON mgr.role_id = r.id
    INNER JOIN dept d
        ON emp.dept_id = d.id
    WHERE mgr.id = ?;`

const mgrTotQueryAll = `SELECT concat(mgr.first_name,' ', mgr.last_name) AS manager, d.dept_name, r.title, mgr.id AS manager_id, concat(emp.first_name, ' ', emp.last_name) AS subordinates   
    FROM emp_info emp
    INNER JOIN emp_info  mgr
        ON emp.manager_id = mgr.id
    INNER JOIN roles r
        ON mgr.role_id = r.id
    INNER JOIN dept d
        ON emp.dept_id = d.id
    WHERE mgr.manager_id IS NULL
    ORDER BY manager`

const rolesTotQuery = `SELECT  r.title, r.salary, concat(emp.first_name, ' ', emp.last_name) AS employees, emp.id AS employee_id   
    FROM emp_info emp
    INNER JOIN roles r
        ON emp.role_id = r.id
    WHERE r.id = ?;`

const rolesTotQueryAll = `SELECT  r.title, r.salary, concat(emp.first_name, ' ', emp.last_name) AS employees, emp.id AS employee_id   
    FROM emp_info emp
    INNER JOIN roles r
        ON emp.role_id = r.id
    ORDER BY r.id`

const deptTotQuery = `SELECT d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS dept_manager, concat(emp.first_name, ' ', emp.last_name) AS dept_employees, emp.id AS employee_id
    FROM emp_info emp
    LEFT JOIN emp_info  mgr
        ON emp.manager_id = mgr.id
    INNER JOIN dept d
        ON emp.dept_id = d.id
    WHERE d.id = ?;`

const deptTotQueryAll = `SELECT d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS dept_manager, concat(emp.first_name, ' ', emp.last_name) AS dept_employees, emp.id AS employee_id
    FROM emp_info emp
    LEFT JOIN emp_info  mgr
        ON emp.manager_id = mgr.id
    INNER JOIN dept d
        ON emp.dept_id = d.id
    ORDER BY d.dept_name`

//kick off  fn; delegates to edit fns or view fns per user input
const start = ()=>{
    inquirer.prompt([
        {
            type: 'list',
            name: 'greeting',
            message: 'What would you like to do?',
            choices: ['view_roster', 'edit_roster', 'exit']
        }
    ]).then((data)=>{
        if(data.greeting==='edit_roster'){
            editRoster()
        } else if(data.greeting==='view_roster'){
            viewRoster()
        } else {
            db.end()
        }
    })
    .catch((err)=>{if(err) throw err})
}

//1st fn for view opt funnels info in to 2nd view fn
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
            viewFn('emp_info', `SELECT * FROM emp_info WHERE manager_id IS NULL`, mgrTotQuery, mgrTotQueryAll);
        } else if(data.viewBy==='by_dept'){
            viewFn('dept', `SELECT * FROM dept`, deptTotQuery, deptTotQueryAll);
        } else if(data.viewBy==='by_role'){
            viewFn('roles', `SELECT * FROM roles` , rolesTotQuery, rolesTotQueryAll);
        } else if(data.viewBy==='by_employee'){
            viewFn('emp_info', `SELECT * FROM emp_info WHERE manager_id`, allEmpTotQuery, empTotQueryAll);
        } else {
            viewFn('emp_info', `SELECT * FROM emp_info`, allEmpTotQuery, allEmpTotQueryAll);
        }
    })
    .catch((err)=>{if(err) throw err})
};

//2nd & LAST view fn determines how user views data
const viewFn = (dbTable, sqlQueryOne, sqlQueryTwo, sqlQueryThree) => {

    db.query(sqlQueryOne, // var 1
    (err, res)=>{
        if(err)throw err;
        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: dbTable,
                    message: `Select ${dbTable} to view`,
                    choices(){
                        const arr = ['view all']; 

                        res.forEach(( x )=>{
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

                if(data[dbTable]==='view all'){
                    db.query(sqlQueryThree, 
                        (err, res)=>{
                            if(err) throw err;
                            console.table(res);
                        });
                    };

                res.forEach((rows) =>{
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
                    
                    if(dbQuery===data[dbTable]){
                        db.query(sqlQueryTwo,
                            rows.id,
                            (err, res)=>{
                                if(err) throw err;
                                console.table(res);
                                // start();
                            })
                    }
                });

                setTimeout(()=>{
                    start();
                }, 1000)
                // db.end();             
            }).catch((err)=>{if(err) throw err})
    });

};

//1st edit fn detrmines what table to edit and how
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

        editTable(data.editType, tabVar)
    })
    .catch((err)=>{if(err)throw err});
};

//2nd edit fn delegates thr add fn; narrows to row id; delegates delete; passes row id to update, 
const editTable = (action, table) => { //1st fn

    let tabIdent;
    let empTabIdent;
    if(table==='dept'){
        tabIdent = 'dept_name'
    } else if (table==='roles'){
        tabIdent = 'title';
    } else if(table==='emp_info'){
        tabIdent = 'first_name, last_name';
    }

    let rowSelectQuest;
    
    if(action==='add_to'){
        addFn(table);
        return;
    } else if (action==='delete_from'){
        rowSelectQuest = 'Select which item to delete'
    } else if(action==='update') {
        rowSelectQuest = 'Select item you wish to update'
    }

  
    db.query(`SELECT ${ tabIdent }, id FROM ${ table }`,
    (err, res) => {
        if(err) throw err;

        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: 'rowSelect',
                    message: rowSelectQuest,
                
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

                        if(action==='delete_from'){
                            deleteFn(table, rows.id);
                        } else {
                            colPickFn(table, rows.id);
                        };
                    };
                })
            
            }).catch((err)=>{if(err) throw err})
    })
    
};

//3rd edit fn; 1st only update  fn; picks a colomn to edit
const colPickFn = (tbl, id) => {
    db.query(`SELECT COLUMN_NAME  
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = N'${tbl}'; `,
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
};

//4th edit fn; 2nd & LAST update only fn; obtains data from user and queries db to update 
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
            // db.end();
            start();
        }).catch((err)=>{if(err) throw err})
};

//5th edit fn; 1st & LAST delete fn; queries db and deletes selected row
const deleteFn = (tbl, rowId) => {
    db.query(`DELETE FROM ${tbl} WHERE id=${rowId}`,
    (err, res) => {
        if(err) throw err;
    });
    start();
    // db.end();
};

//6th edit fn; 1st & LAST add fn; prompts user to input data given the table specified; queries db to add
const addFn = (tbl) => {

    let addQuest;
    
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
            name: 'mgrId',
            message: 'Enter assigned managers ID number',
            when: (answers)=>answers.isMgr==='no'
        },
        {
            type: 'number',
            name: 'rolesDeptId',
            message: 'Enter the ID number for the department this new role will be assigned'
        }]

        
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
            name: 'mgrId',
            message: 'Enter new employees assigned manager\'s Id',
            where: (answers) => answers.isMgr === 'no'
        }];

    } else if (tbl==='dept'){
        addQuest = [
            {
                type: 'input',
                name: 'newDept',
                message: 'Enter name of new department'
            }
        ];
    };

    inquirer
        .prompt(
            addQuest
        )
        .then((data)=>{
            let mgrId;    
            if(data.isMgr==='yes'){
                mgrId = 'NULL';
            } else {
                mgrId = data.mgrId;
            }
            let addQuery;
            if(tbl==='roles'){
                addQuery = `INSERT INTO roles (title, dept_id, manager_id, salary)
        VALUES ("${data.rolesTitle}", ${data.rolesDeptId}, ${mgrId}, ${data.rolesSalary})` 
            } else if(tbl==='dept'){
                addQuery = `INSERT INTO dept (dept_name)
        VALUES ("${data.newDept}")`
            } else if(tbl==='emp_info'){
                addQuery = `INSERT INTO emp_info (first_name, last_name, role_id, manager_id, dept_id)
                VALUES ("${data.empFirstName}", "${data.empLastName}", ${data.empRoleId}, ${mgrId}, ${data.empDept})`
            };

            db.query(addQuery,
                (err, res)=>{
                    if(err) throw err;
                });
                start();
                // db.end();           
        }).catch((err)=>{if(err) throw err})
};

db.connect((err)=>{
    if(err)throw err;
    start()
});