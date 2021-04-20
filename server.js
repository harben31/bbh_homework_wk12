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
	ON emp.dept_id = d.id;`

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

const deptTotQuery = `SELECT d.dept_name, concat(mgr.first_name,' ', mgr.last_name) AS dept_manager, concat(emp.first_name, emp.last_name) AS dept_employees  
FROM emp_info emp
LEFT JOIN emp_info  mgr
	ON emp.manager_id = mgr.id
INNER JOIN dept d
	ON emp.dept_id = d.id
ORDER BY d.id;`

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
            //editRoster()
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
            // viewDept()
            cat = deptTotQuery;
        } else if(data.viewBy==='by_role'){
            viewRoles();
            cat = 'roles';
        } else if(data.viewBy==='by_employee'){
            // viewEmp()
            cat = 'emp_info WHERE manager_id'
        } else {
            //viewAllEmp()
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

const viewRoles = () => {
    db.query(`SELECT * FROM roles`, 
    (err, res)=>{
        if(err)throw err;
        inquirer
            .prompt([
                {
                    type: 'rawlist',
                    name: 'roles',
                    message: 'Select role to view',
                    choices(){
                        const titleArr = []; //add view all mgr 

                        res.forEach(({ title })=>{
                            titleArr.push(title)
                        })
                        return titleArr
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

const viewBy = (cat) => {
    db.query(cat,
        
    (err, res)=>{
        if(err)throw err;
        console.log(res);
        console.table(res);
    });
    db.end();
};

const editRoster = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'editBy',
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
                'delete_from'
            ]
        }
    ])
    .then((data)=>{
        if(data.editBy==='Departments' && data.editType==='add_to'){
            //addToDept()
        } else if(data.editBy==='Departments' && data.editType==='delete_from'){
            //deleteFromDept
        }else if(data.editBy==='Roles' && data.editType==='add_to'){
            //addToRoles()
        } else if(data.editBy==='Roles' && data.editType==='delete_from'){
            //deleteFromRoles()
        } else if(data.editBy==='Employees' && data.editType==='add_to') {
            // addToEmp()
        } else if(data.editBy==='Employees' && data.editType==='delete_from'){
            //deleteFromEmp()
        }
    })
    .catch((err)=>{if(err)throw err})
}

db.connect((err)=>{
    if(err)throw err;
    start()
});