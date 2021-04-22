//TODO
// consolodate view fns & rewrite sql qrys
//add method to view all
//write sql for delete and update
//modularize edit fn better?




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

const rolesTotQuery = `SELECT  r.title, concat(emp.first_name, ' ', emp.last_name) AS employees   
FROM emp_info emp
INNER JOIN roles r
	ON emp.role_id = r.id
WHERE r.title = ?;`

const deptTotQuery = `SELECT d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS dept_manager, concat(emp.first_name, ' ', emp.last_name) AS dept_employees  
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN dept d
	ON emp.dept_id = d.id
WHERE dept_name = ?;`

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
            viewMgr()
            cat = mgrTotQuery;
        } else if(data.viewBy==='by_dept'){
            viewDept()
            cat = deptTotQuery;
        } else if(data.viewBy==='by_role'){
            viewRoles();
            // viewFn('roles', 'title', rolesTotQuery)
            cat = 'roles';
        } else if(data.viewBy==='by_employee'){
            viewEmp()
            cat = 'emp_info WHERE manager_id'
        } else {
            viewAllEmp()
            cat = allEmpTotQuery;
        }
        // viewBy(cat);
    })
    .catch((err)=>{if(err) throw err})
}

const viewMgr = () => {
    db.query(`SELECT * FROM emp_info WHERE manager_id IS NULL`, 
    (err, res)=>{
        if(err)throw err;
        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: 'mgrFullName',
                    message: 'Select manager to view',
                    choices(){
                        const nameArr = []; //add view all mgr 

                        res.forEach(({ first_name, last_name })=>{
                            nameArr.push(first_name+' '+last_name)
                        })
                        return nameArr
                    }
                }
            ])
            .then((data)=>{
                console.log(data)
                res.forEach((emp_info) =>{
                    const dbQuery = emp_info.first_name.toLowerCase()+ ' '+emp_info.last_name.toLowerCase();
                    const inqAns = data.mgrFullName.toLowerCase()
                    if(dbQuery===inqAns){
                        db.query(mgrTotQuery, 
                            emp_info.id,
                            (err, res)=>{
                                if(err) throw err;
                                console.table(res);
                            })
            
                    }
                })
            })
        });
        // db.end(); ends fn before query can fire
};

// const viewFn = (dbTable, column, sqlQuery) => {

//     db.query(`SELECT * FROM ${dbTable}`, // var 1
//     (err, res)=>{
//         x=column;
//         if(err)throw err;
//         console.log(res)
//         inquirer
//             .prompt([
//                 {
//                     type: 'rawlist',
//                     name: dbTable, //var 1
//                     message: `Select ${dbTable} to view`, //var 1
//                     choices(){
//                         const arr = []; 

//                         res.forEach(({ x })=>{ //var 2
//                             arr.push( x ) //var 2
//                         })
//                         return arr
//                     }
//                 }
//             ])
//             .then((data)=>{
//                 console.log(data)
//                 res.forEach((dbTable) =>{ //var 1
//                     if(dbTable[x]===data[dbTable]){//var 1 .. var 1
//                         db.query(sqlQuery, //var 3
//                             data.dbTable, //var 1
//                             (err, res)=>{
//                                 if(err) throw err;
//                                 console.table(res);
//                             })
            
//                     }
//                 })
//             })
//             .catch((err)=>{if(err) throw err})
//         });
//         // db.end(); ends fn before query can fire
// };

/*consolodate w/ rolesfn*/
const viewDept = () => {
    db.query(`SELECT * FROM dept`, 
    (err, res)=>{
        if(err)throw err;
        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: 'dept',
                    message: 'Select dept to view',
                    choices(){
                        const arr = []; //add view all

                        res.forEach(({ dept_name })=>{
                            arr.push(dept_name)
                        })
                        return arr
                    }
                }
            ])
            .then((data)=>{
                console.log(data)
                res.forEach((dept) =>{
                    if(dept.dept_name===data.dept){
                        db.query(deptTotQuery, 
                            data.dept,
                            (err, res)=>{
                                if(err) throw err;
                                console.table(res);
                            })
            
                    }
                })
            })
        });
        // db.end(); ends fn before query can fire
};

const viewRoles = () => {
    db.query(`SELECT * FROM roles`, 
    (err, res)=>{
        if(err)throw err;
        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: 'roles',
                    message: 'Select roles to view',
                    choices(){
                        const arr = []; //add view all mgr 

                        res.forEach(({ title })=>{
                            arr.push(title)
                        })
                        return arr
                    }
                }
            ])
            .then((data)=>{
                console.log(data)
                res.forEach((roles) =>{
                    if(roles.title===data.roles){
                        db.query(rolesTotQuery, 
                            data.roles,
                            (err, res)=>{
                                if(err) throw err;
                                console.table(res);
                            })
            
                    }
                })
            })
        });
        // db.end(); ends fn before query can fire
};

const viewAllEmp = () => {
    db.query(`SELECT * FROM emp_info`, 
    (err, res)=>{
        if(err)throw err;
        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: 'emp_info',
                    message: 'Select employee to view',
                    choices(){
                        const arr = []; //add view all mgr 

                        res.forEach(({ first_name, last_name })=>{
                            arr.push(first_name+' '+last_name);
                        });
                        return arr
                    }
                }
            ])
            .then((data)=>{
                console.log(data)
                res.forEach((emp_info) =>{
                    const dbQuery = emp_info.first_name.toLowerCase()+ ' '+emp_info.last_name.toLowerCase();
                    const inqAns = data.emp_info.toLowerCase()
                    if(dbQuery===inqAns){
                        db.query(allEmpTotQuery,
                            emp_info.id,
                            (err, res)=>{
                                if(err) throw err;
                                console.table(res);
                            })
            
                    }
                })
            })
        });
        // db.end(); ends fn before query can fire
};

const viewEmp = () => {
    db.query(`SELECT * FROM emp_info WHERE manager_id`, 
    (err, res)=>{
        if(err)throw err;
        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: 'emp_info',
                    message: 'Select employee to view',
                    choices(){
                        const arr = []; //add view all mgr 

                        res.forEach(({ first_name, last_name })=>{
                            arr.push(first_name+' '+last_name)
                        })
                        return arr
                    }
                }
            ])
            .then((data)=>{
                console.log(data)
                res.forEach((emp_info) =>{
                    const dbQuery = emp_info.first_name.toLowerCase()+ ' ' +emp_info.last_name.toLowerCase();
                    const inqAns = data.emp_info.toLowerCase()
                    if(dbQuery===inqAns){
                        db.query(allEmpTotQuery, 
                            emp_info.id,
                            (err, res)=>{
                                if(err) throw err;
                                console.table(res);
                            })
                    }
                })
                db.end(); 
            })
        });
       
        //ends fn before query can fire
};

// const viewBy = (cat) => {
//     db.query(cat,
        
//     (err, res)=>{
//         if(err)throw err;
//         console.log(res);
//         console.table(res);
//     });
//     db.end();
// };

//edit or view -> edit -> table to edit -> 

const editTable = (action, table) => {
    console.log(action, table);

    let tabIdent;
    let empTabIdent;
    if(table==='dept'){
        tabIdent = 'dept_name'
    } else if (table==='roles'){
        tabIdent = 'title';
    } else if(table==='emp_info'){
        tabIdent = 'first_name, last_name',
        empTabIdent = ['first_name']['last_name'];
    }

  
    db.query(`SELECT ${ tabIdent } FROM ${ table }`,
    // [tabIdent, table],
    (err, res) => {
        if(err) throw err;
        
        console.log('line  384 ' + tabIdent+' '+table)
        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: 'rowSelect',
                    message: 'Where would you like to make a change?',
                
                    choices(){
                        arr = [];

                        res.forEach(( x )=>{
                            console.log(x);

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
                    console.log(res)
                    inquirer
                    .prompt([
                        {
                            type: 'rawlist',
                            name: 'colPick',
                            message: 'Where would you like to make a change?',
                            choices(){
                                const arr = [];
                                
                                res.forEach(({ COLUMN_NAME }) => {
                                    console.log(COLUMN_NAME);
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