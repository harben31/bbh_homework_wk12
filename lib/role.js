class Role {
    constructor(title, deptId, mgrId){
        this.title = title,
        this.deptId = deptId,
        this.mgrId = mgrId
    };

    getTitle(){
        return this.title
    };

    getDeptId(){
        return this.deptId
    };

    getMgerId(){
        return this.mgrId
    };
};

module.exports = Role