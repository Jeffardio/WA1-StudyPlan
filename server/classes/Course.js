

class Course{
    constructor(code, name, credits, max_stud , act, pre, incs, pre_name){
        this.code = code
        this.name = name
        this.credits = credits
        this.max_stud = max_stud
        this.act = act
        this.pre = pre
        this.pre_name = pre_name
        /*list of the incompatible courses*/
        if (incs)
            this.incs = incs
        else
            this.incs = []
        this.cns = {pre: false, incs: [], credits: false, limit: false, added: false}
        this.adv = ''
        
    }


    setIncompabilities(incs){
        this.incs = incs
    }

    setConstraints(cns){
        
        this.cns = cns 
    }

    setAdvanced(course){
        this.adv = course
    }

    checkConstraints(doNotCheckMax){
        if (this.cns.pre === false)
            return 'The course ' + this.pre + ' (' + this.pre_name +') ' + 'which is a preparatory course for ' + this.code + ' (' + this.name + ') ' + ' is not present in the study plan'
        if (this.cns.incs.length !== 0)
        return 'Remove the incompatible course(s) of ' + this.code + " (" + this.name + ")" 
        if (this.cns.limit === false && doNotCheckMax === false)
            return 'Maximum number of student that wants to attend ' + this.code + ' (' + this.name + ') ' + 'has been reached'
        if (this.cns.added === false)
            return "You can not add the same course (" + this.code +") twice"
        return ''
    }

}


module.exports = {Course}