const {Course} = require('./Course')


class StudyPlan{
    /**
     * 
     * @param {Array<Course>} list_of_courses List of courses
     * @param {Boolean} full Full time or part-time
     * 
     */
    constructor(list_of_courses,act_cfu, min, max){
        if (act_cfu === undefined){
            this.courses = list_of_courses
            this.act_cfu = list_of_courses.reduce((prev, curr) =>  prev + curr.credits,0)
            return 
        }
        this.courses = list_of_courses
        this.act_cfu = act_cfu
        this.min = min
        this.max = max
        
        
    }

    
    
    setFull(full){
        if (full === -1){
            this.max = 0
            this.min = 0
            return
        }
        this.max = full ? 80 : 40
        this.min = full ? 60 : 20
    }
    /**
     * 
     * @param {Course} course 
     * @returns {Boolean} Returns true if the preparatory constraint is satisfied for the course specified by the course param.
     */
    checkPrepCourse(course){
        if (!course.pre){
            return true
        }
        return this.courses.some((crs) => crs.code === course.pre)
    }

    /**
     * 
     * @param {Course} course 
     * @returns {Course[]} Returns an array that contains all the courses of the study plan that are incompatible with the course specified by the course param. Return an empty array if there are none.
     */
    checkIncCourses(course){
        const incs = []
       
        course.incs.forEach((inc) => {
            const c = this.courses.find((cs) => cs.code === inc.code)
            if (c !== undefined)
                incs.push(c) 
            return incs})
        return incs
    }

    /**
     * 
     * @param {Course} course 
     * @returns {Boolean} Returns true if this course, wheter is added, does not violate the maximum credits constraint
     */
    checkCredits(course) {
        return this.act_cfu + course.credits <= this.max
    }

    checkLimit(course){
        if(!course.max_stud) return true
        return course.max_stud > course.act
    }

    checkAlreadyPresent(course){
        return !this.courses.some((c) => {return  c.code === course.code} )
    }
    /**
     * 
     * @param {Course} course 
     * @returns {Object} Return an object which properties (incs, pre, credits) describe if the course specified by the course param, wheter is added, violates some constraints. 
     */
    canBeAdded(course){
        const constraints = {incs : [], pre: true, credits: true, added: true}
        constraints["incs"] = this.checkIncCourses(course)
        constraints["pre"] = this.checkPrepCourse(course)
        constraints["credits"] = this.checkCredits(course)
        constraints["limit"] = this.checkLimit(course)
        //constraints["added"] = this.checkAlreadyPresent(course) 
        return constraints
    }

    canBeRemoved(course){
        const constraints = {pre: !this.courses.some((c) => {
            if (c.pre === course.code){
                course.setAdvanced(c.code)
                return true
            }
            return false
        }), credits: true, incs : [], limit: true}
        return constraints
    }

    updatedStudyPlan(addedCourse){
        const newSp = new StudyPlan([...this.courses, addedCourse], this.act_cfu + addedCourse.credits, this.min, this.max)
        return newSp
    }


    removeFromStudyPlan(removedCourse){
        return new StudyPlan(this.courses.filter((c) => c.code !== removedCourse.code),this.act_cfu - removedCourse.credits,this.min,this.max)
    }

    isValid(){
        return this.max >= this.act_cfu && this.min <= this.act_cfu
    }
}

module.exports = {StudyPlan}