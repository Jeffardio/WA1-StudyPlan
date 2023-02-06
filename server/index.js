'use strict'

const express = require('express');
const PORT = 3001;
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const db = require('./dao').dao
const {  validationResult, body, param } = require('express-validator');
const { StudyPlan } = require('./classes/StudyPlan');

const app = new express();
app.use(morgan('dev'));
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
  };
app.use(cors(corsOptions));


app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}/`));

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    try {
        const user = await db.getLoginUser(username, password)
        if(!user)
            return cb(null, false, 'Incorrect username or password.');
        return cb(null, user);
    } catch(e){
        return cb(null, "dbErr" ,e)
    }
  }));

passport.serializeUser(function (user, cb) {
    cb(null, user);
  });
  
passport.deserializeUser(async function (user, cb) { // this user is id + email + name
    
    return cb(null, user);
    // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  });

app.use(session({
    secret: "Study plan",
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.authenticate('session'));

app.post('/api/sessions',
  body('username').isEmail(),
  body('password').notEmpty(),
function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if(!user === "dbErr")
            return res.status(500).json(info)
        if (!user) {
          // display wrong login messages
          return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
          if (err)
            return next(err);
          // req.user contains the authenticated user, we send all the user info back
          const user = {name: req.user.name , full: req.user.full}
          return res.status(201).json(user);
        });
    })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
if(req.isAuthenticated()) {
    const user = {name: req.user.name , full: req.user.full}
    res.json(user);}
else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
        console.log("Deleting sessions...")
        res.end();
    });
});


app.get('/api/courses',async (req, res) => {
    try {
        const courses = await db.getAllCourses()
        for(const course of courses) {
            course.setIncompabilities(await db.getIncompatibilities(course.code))
        }
        courses.sort((a,b) => a.name.localeCompare(b.name))
        res.status(200).json({courses : courses})
    } catch(e) {
        res.status(500).json({err: "Cannot retrieve the list of all courses..."})
    }
})


const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({error: 'Not authorized'});
  }

app.use(isLoggedIn)



app.get('/api/studyplan', async (req,res) => {
    const student_id = req.user.stud_id
    try {
        const student = await db.getStudent(student_id)
        if (student.full === -1) return res.status(404).json()
        const study_plan = await db.getStudyPlan(student_id)
        for (const course of study_plan.courses){
            course.setIncompabilities(await db.getIncompatibilities(course.code))
        }
        

        study_plan.setFull(student.full)
        study_plan.courses.sort((a,b) => a.name.localeCompare(b.name))
        res.status(200).json(study_plan)
    } catch(e) {
        console.log(e) 
        res.status(500).json({err: "Cannot retrieve the study plan"})
    }
})




/**
 *
 */



app.delete('/api/studyplan', async (req, res) => {
    const student_id = req.user.stud_id
    try {
        const study_plan = await db.getStudyPlan(student_id)
        for (const course of study_plan.courses){
            await db.removeCourse(student_id, course.code)
        }
        await db.updateFullTime(student_id, -1)
        return res.status(200).json()
    } catch (e) {
        console.log(e)
        res.status(500).json({err: "" + e})
    }
})

app.put('/api/studyplan',body('full').isIn([undefined, 0, 1]), async(req, res) => {
    const student_id = req.user.stud_id
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({err : "Error: please provide a valid value for the full param"});
    }
    try {
        /*Check if the student has a already a study plan or not*/
        const user = await db.getStudent(student_id)
        let full = user.full
        /*if the student does not have a study plan and the full flag has not be sent*/
        if (full === -1  && req.body.full === undefined){
            return res.status(400).json({err : "Error: please provide a valid value for the full param"});
        }
        if (full === -1) {
            full = req.body.full === 0 ? 0 : 1
        }
        
        /*All the constraints must be verified only with the information saved in the database, otherwise the checks can be bypassed*/
        /*to prevent inserting two times the same courses*/
        const updatedStudyPlan = [...(new Set(req.body.courses))]
        
        /*check if someone is trying to insert a not-existent course*/
        const allCourses = await db.getAllCourses()
        const courses = (allCourses).map((c) => c.code);
        if (updatedStudyPlan.some((course_code) => !courses.includes(course_code))){
            return res.status(422).json({err : "Error: A course that you are trying to insert does not exist."})
        }

        /*check if all constraints are satisfied*/
        const study_plan = await db.getStudyPlan(student_id)
        /*let's set the incompatibilites*/
        for(const course of allCourses) {
            course.setIncompabilities(await db.getIncompatibilities(course.code))
        }
        const check =  submitValidation(updatedStudyPlan,study_plan,allCourses, full)
        if(check){
            return res.status(422).json({err: "Error: " + check})
        }

        /*everything seems ok, let's start to update information*/
        await db.startTransaction();
        if(user.full === -1){
            await db.updateFullTime(student_id,req.body.full)
        }
        

        /*removing the course that are not anymore in the new version of the study plan*/
        for(const course of study_plan.courses){
            if (!updatedStudyPlan.some((c) => c === course.code)){
                await db.removeCourse(student_id, course.code)
            }
        }

        /*adding the course that were not in the previous version of the study plan*/
        for(const c of updatedStudyPlan){
            if(!study_plan.courses.some((course) => c === course.code)){
                await db.addCourse(student_id, c)
            }
        }
        await db.commitTransaction()
        /*everything went ok, enjoy your study plan*/
        
        return res.status(200).json()
    } catch(e){
        await db.rollbackTransaction()
        console.log(e)
        res.status(500).json({err: "Error: " + e})
    }
})


/**
 * 
 * @param {StudyPlan} updatedStudyPlan The version of the study plan to be verified
 * @param {StudyPlan} study_plan The old study plan
 * @param {Course[]} allCourses Array of all the courses
 * @param {Boolean} full Full-time or part-time option
 * @returns {String} The return value describes the first violated constraints encountered.
 */
function submitValidation(updatedStudyPlan, study_plan, allCourses, full){
    
    const sp = new StudyPlan(allCourses.filter((c) => updatedStudyPlan.some((code) => code === c.code) ), undefined,0,0)
    sp.setFull(full)
    if (sp.act_cfu > sp.max)
        return 'Maximum amount of cfu has been reached'
    if(sp.act_cfu < sp.min)
        return 'Minimum amount of cfu has not been reached'
    for (const course of sp.courses){
        course.setConstraints(sp.canBeAdded(course))
        const doNotCheckMax = study_plan.courses.some((c) => c.code === course.code)
        const check = course.checkConstraints(doNotCheckMax)
        if (check)
            return check
    }

}