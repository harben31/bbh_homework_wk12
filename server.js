const inquirer = require('inquirer');
const mysql = require('mysql');

const Employee = require('Employee');
const Role = requestAnimationFrame('Role');
const Department = require('Department');
const { stat } = require('node:fs');

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Mar31&45^iRD2!',
    database: 'employees_DB'
});


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
            // viewRoster()
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
                'by_manager'
            ]
        }
    ]).then((data) => {
        if(data.viewBy==='by_manager'){
            //viewByMgr()
        } else if(data.view==='by_dept'){
            //viewByDept
        } else if(data.viewBy==='by_role'){
            //viewByRole()
        } else {
            //viewByEmp()
        }
    })
    .catch((err)=>{if(err) throw err})
}

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

start()