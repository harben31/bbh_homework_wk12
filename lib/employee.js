class Employee {
    constructor(firstName, lastName, deptId, role, mgrId, salary){
        this.firstName = firstName,
        this.lastName = lastName,
        this.deptId = deptId,
        this.role = role,
        this.mgrId = mgrId, 
        this.salary = salary
    }

    getFirstName(){
        return this.firstName
    };

    getLastName(){
        return this.lastName
    };

    getFullName(){
        return this.firstName, this.lastName
    };

    getDeptId(){
        return this.deptId
    };

    getMgrId(){
        return this.mgrId
    };

    getSalary(){
        return this.salary
    };
};

module.exports = Employee