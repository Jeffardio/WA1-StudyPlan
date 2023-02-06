const {Course} = require('./classes/Course')
const sqlite = require('sqlite3')
const crypto = require('crypto');
const { StudyPlan } = require('./classes/StudyPlan');

const db = new sqlite.Database(('course.db'), (err) => {
    if (err)
        throw err;
})


/**
 * Interface to the database.
 */
class Dao {

    constructor () {  
    }

    /**
     * 
     * @param {Number} stud_id Student identifier 
     * @returns {Promise<Student>} Returns a Promise that contains the student info with the student identifier equal to the stud_id param.
     */
    getStudent(stud_id){
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM student WHERE stud_id = ?"
            db.get(sql, [stud_id], (err, row) => {
                if (err){
                    console.log("Cannot retrieve the student info...")
                    console.log('ERR: ' + err)
                    reject(err)
                }
                if (row){
                    const user = {stud_id: row.stud_id, username: row.email, name: row.name, full : row.full};
                    resolve(user)
                }
                resolve(false)
            })
        })
    }

    getLoginUser(email, password){
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM student WHERE email = ?';
            db.get(sql, [email], (err, row) => {
              if (err) { 
                reject(err); 
              }
              else if (row === undefined) { 
                resolve(false); 
              }
              else {
                const user = {stud_id: row.stud_id, username: row.email, name: row.name, full : row.full};
                crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
                  if (err) reject(err);
                  if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)){
                    resolve(false);
                  }
                  else
                    resolve(user);
                });
              }
            });
          });
    }

    insertUser(stud_id, name, email, password, salt, full){
        return new Promise ((resolve, reject) => {
            const sql = "INSERT INTO USER (stud_id, name, email, hash, salt, full) VALUES (?,?,?,?,?,?)"
            db.run(sql,[stud_id, name, email, password, salt, full], function (err) {
                if (err) {
                    console.log('ERR: ' + err)
                    reject(err)
                }
                resolve(this.changes)
            })
        })
    }

    /**
     * 
     * @param {Number} stud_id Student identifier 
     * @param {Boolean} full If 1 means full time, 0 part-time , -1 if the student do not have a study plan yet.
     * @returns {Promise<Number>} Return a Promise that on success guarantees that the time information about the study plan of that student has been successfully updated. 
     */
    updateFullTime(stud_id, full){
        return new Promise((resolve, reject) => {
            const sql = "UPDATE student SET full = ? WHERE stud_id = ?"
            db.run(sql,[full, stud_id], function (err) {
                if (err) {
                    console.log("Cannot update this student...")
                    console.log('Err: ' + err)
                    reject(err)
                }
                resolve(this.changes)
            })
        })
    }
    
    /** 
     * @param {Number} stud_id student identifier
     * @returns {Promise<StudyPlan>}       Return a Promise that 'contains' the study plan of the student associated to the stud_id param.
    */

    getStudyPlan(stud_id){
        return new Promise((resolve, reject) => {
            const sql = "SELECT C.code, C.name, C.credits, C.max_stud, C.act, C.pre, P.name as pre_name FROM (SELECT * FROM course, study_plan WHERE code = course AND student = ?) C LEFT JOIN course P ON C.pre = P.code "
            db.all(sql, [stud_id], (err, rows) => {
                if (err){
                    console.log("Cannot retrieve study plan")
                    console.log("ERR: " + err)
                    reject(err)
                }
                const study_plan = new StudyPlan(rows.map(
                    (row) =>{
                        return new Course(row.code, row.name, row.credits,row.max_stud, row.act, row.pre,[], row.pre_name)
                    }))
                resolve(study_plan)
            })
        })
    }

    /**
     * @returns {Promise<Course[]>} Return a Promise that 'contains' all the courses stored in the database.
     */
    getAllCourses() {
        return new Promise ((resolve, reject) => {
            const sql = "SELECT  C.code, C.name, C.credits, C.max_stud, C.act, C.pre, P.name as pre_name FROM course C LEFT JOIN course P ON C.pre = P.code"
            db.all(sql,[], (err, rows) => {
                if(err){
                    console.log("Cannot retrieve all the courses")
                    console.log("ERR: " + err)
                    reject(err)
                }
                resolve(rows.map((row) =>{
                    return new Course(row.code, row.name, row.credits,row.max_stud, row.act, row.pre,[],row.pre_name)
                }))
            })
        })
    }
    /**
     * 
     * @param {Number} code  The course code
     * @returns {Promise<Course[]} Return a Promise that 'contains' an array of the courses which are incompatible with the course specified by the code param.
     */
    getIncompatibilities(code) {
        return new Promise ((resolve, reject) => {
            const sql = "SELECT code, name, credits, max_stud, act, pre FROM course as C, incompatibility as I WHERE I.course = ? and I.incomp = C.code "
            db.all(sql,[code], (err, rows) => {
                if (err) {
                    console.log("Cannot retrieve incompatibilities of course " + code)
                    console.log("ERR: " + err)
                    reject(err)
                }
                resolve(rows.map((row) => {
                    
                    return new Course(row.code, row.name, row.credits,row.max_stud, row.act, row.pre)
                }))
            })
        })
    }
    
    /**
     * 
     * @param {String} course Code of a course 
     * @returns {Number}    The number of students that have chosen in their study plans the course specified by the course param.
     */
    getNumberOfStudents(course) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT COUNT(*) as n FROM study_plan WHERE course = ?"
            db.all(sql, [course], (err, res) => {
                if  (err) {
                    console.log("Cannot retrieve the actual number of students that have selected this course")
                    console.log("ERR: " + err)
                    reject(err)
                }
                resolve(res[0].n)
            })
        })
    }

    /**
     * 
     * @param {Number} student Student Id
     * @param {String} course Code course
     * @returns {Promise<>} Return a Promise that if it resolved means that the course has been added to that student's study plan. 
     */
    addCourse(student, course) {
        return new Promise((resolve, reject) => {
                const sql = "INSERT INTO study_plan (student, course) VALUES (?,?)"
                db.run(sql, [student, course], (err) =>{
                    if (err) {
                        console.log("Cannot insert this course...")
                        console.log("ERR: " + err)
                        reject(err)
                    }
                    this.incrementAct(resolve, reject, course)
                })
            })
        
    }

    /*Hoping that this update will not fail, otherwise a rollback is needed.*/
    incrementAct(resolve, reject, course){
        const sql = "UPDATE course SET act = act + 1 WHERE code = ?"
        db.run(sql, [course], function (err)  {
            if (err) {
                console.log("Cannot update the actual number of students...")
                console.log("ERR: " + err)
                reject(err)
            }   
            resolve(this.changes)
        })
    }

    /**
     * 
     * @param {Number} student Student identifier
     * @param {String} course Course identifier
     * @returns {Promise<Number>} Return a Promise that 'contains' 1 if the course has been deleted successfully from the study plan of the student.
     */
    removeCourse(student, course) {
        const decrementAct = this.decrementAct
        return new Promise((resolve, reject) => {
           
                const sql = "DELETE FROM study_plan WHERE student = ? AND course = ?"
                db.run(sql, [student, course], function (err){
                    if (err) {
                        console.log("Cannot delete this course from the study plan...")
                        console.log("ERR: " + err)
                        reject(err)
                    }
                    if (this.changes) {
                        decrementAct(resolve, reject, course)
                    }
                    resolve(0)
                })
            
        })
    }

    decrementAct(resolve, reject, course){
        const sql = "UPDATE course SET act = act - 1 WHERE code = ?"
        db.run(sql, [course], function (err)  {
            if (err) {
                console.log("Cannot update the actual number of students...")
                console.log("ERR: " + err)
                reject(err)
            }
            resolve(this.changes)            
        })
    }

    

    /**
     * 
     * @param {Number} student Student identifier
     * @returns {Promise<Course[]>} Return a Promise that 'contains' all the courses that have not been selected by the student specified bt the student param.
     */
    getNotChosenCourses(student){
        return new Promise((resolve, reject) => {
            const sql = "SELECT code, name, credits, max_stud, act, pre FROM course WHERE code NOT IN (SELECT course FROM study_plan WHERE student = ? ) "
            db.all(sql, [student], (err, rows) => {
                if  (err) {
                    console.log("Cannot retrieve the not chosen courses")
                    console.log("ERR: " + err)
                    reject(err)
                }
                resolve(rows.map((row) => {
                    return new Course(row.code, row.name, row.credits,row.max_stud, row.act, row.pre)
                }))
            })
        })
    }

    /**
     * 
     * @param {String} course_code Course code 
     * @returns {Promise<Course>} Return a Promise that 'contains' the course specified by the course_code param.
     */
    getCourse(course_code){
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM course where code = ?"
            db.all(sql, [course_code], (err, rows) => {
                if (err) {
                    console.log("Cannot retrieve this course")
                    console.log("ERR: " + err)
                    reject(err)
                }
                if (rows.length === 0) resolve(false)
                const row = rows[0]
                resolve(new Course(row.code, row.name, row.credits,row.max_stud, row.act, row.pre))
            })
        })
    }

    startTransaction(){
        return new Promise((resolve, reject) => {
            db.run('BEGIN', (err) => {
                if(err)
                    reject(err)
                resolve(true)
            })
        })
    }

    commitTransaction(){
        return new Promise((resolve, reject) => {
            db.run('COMMIT', (err) =>{
                if(err)
                    reject(err)
                resolve(true)
            })
        })
    }

    rollbackTransaction(){
        return new Promise((resolve, reject) => {
            db.run('ROLLBACK', (err) =>{
                if(err)
                    reject(err)
                resolve(true)
            })
        })
    }
}

    




/* function used to add a student
function addUser() {
    const email = "jacopo@studenti.polito.it"
    const stud_id = 0
    const name = "Jacopo"
    const salt = crypto.randomBytes(32).toString('hex')
    const password = "jacopo"
    const full = false
    crypto.scrypt(password, salt, 32, function(err,
        hashedPassword) {
            const sql = "INSERT INTO STUDENT (stud_id, name, email, password, salt, full) VALUES (?,?,?,?,?,?)";
            hashedPassword = hashedPassword.toString('hex')
            db.run(sql, [stud_id, name, email, hashedPassword, salt, full], (err) => {
                console.log(err)
            });
    });
}
*/




const dao = new Dao()

module.exports = {dao}