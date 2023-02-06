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

    /**
     * 
     * @param {Number} full 
     * @returns {void}
     */
    
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

    /**
     * 
     * @param {Course} course 
     * @returns {Boolean} Return true if the course doesn't have a max student limit otherwise returns true or false 
     * if the number of actual students is lower then the maximum.
     */
    checkLimit(course){
        //NOTA
        //return true
        if(!course.max_stud) return true
        return course.max_stud > course.act
    }

    /**
     * 
     * @param {Course} course 
     * @returns {Boolean} Return true if the course is already present in the study plan, otherwise false.
     */
    checkAlreadyPresent(course){

        const bool = !this.courses.some((c) =>{ 
            return c.code === course.code})
        return bool
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
        constraints["credits"] = true//this.checkCredits(course)
        constraints["limit"] = this.checkLimit(course)
        constraints["added"] = this.checkAlreadyPresent(course)
        return constraints
    }

    /**
     * 
     * @param {Course} course 
     * @returns {Object} Returns an object with the eventual constraints that explain why the course cannot be removed.
     */
    canBeRemoved(course){
        const constraints = {pre: !this.courses.some((c) => {
            if (c.pre === course.code){
                course.setAdvanced(c)
                return true
            }
            return false
        }), credits: true, incs : [], limit: true, added: true}
        return constraints
    }

    /**
     * 
     * @param {Course} addedCourse 
     * @returns {StudyPlan} Returns a study plan which is a copy of this, with the addedCourse added to it.
     */
    updatedStudyPlan(addedCourse){
        const cs = new Course(addedCourse.code, addedCourse.name, addedCourse.credits, addedCourse.max_stud, addedCourse.act, addedCourse.pre, addedCourse.incs, addedCourse.pre_name);
        const newSp = new StudyPlan([...this.courses, cs], this.act_cfu + addedCourse.credits, this.min, this.max)
        return newSp
    }

    /**
     * 
     * @param {Course} removedCourse 
     * @returns {StudyPlan} Return a study plan which is a copy of this, with the removedCourse removed.
     */

    removeFromStudyPlan(removedCourse){
        return new StudyPlan(this.courses.filter((c) => c.code !== removedCourse.code),this.act_cfu - removedCourse.credits,this.min,this.max)
    }

    /**
     * 
     * @returns {Boolean} Returns true if the sum of the actual number of cfu respects the limits.
     */
    isValid(){
        return this.max >= this.act_cfu && this.min <= this.act_cfu
    }
}

module.exports = {StudyPlan}