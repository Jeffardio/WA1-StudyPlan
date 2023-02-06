const {Course} = require('./classes/Course')
const {StudyPlan} = require('./classes/StudyPlan')

const API_URL = 'http://localhost:3001/api'


const logIn = async (credentials) => {
    try {
        const response = await fetch(API_URL + '/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
            });
        if(response.ok) {
            const user = await response.json();
            return user;
        }
        else {
            
            //const errDetails = await response.text();
            return false;
        }
  } catch (e) {
      throw e
    }
}


  
const getUserInfo = async () => {
    try {
    const response = await fetch(API_URL + '/sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
        throw user  // an object with the error coming from the server
    }} catch(e){
        throw e
    }
  };
  
const logOut = async() => {
    try {
        const response = await fetch(API_URL + '/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
        });
        if (response.ok)
            return null;
        else {
            throw new Error()
        }
    } catch(e){
        throw e
    }  
}


//Protected APIs


/**
 * To use properly this API, the user must have a valid session running otherwise 401 status code. On success, if a study plan is associated to the user this API will return it, otherwise the server will respond with 404 status code.
 * @returns {Promise<StudyPlan>}
 */
async function getStudyPlan(){
    const url = API_URL + '/studyplan'
    try {
        const response = await fetch(url, {
            credentials: 'include',
          })

        if(response.ok){
            let study_plan = await response.json()
            study_plan = new StudyPlan(study_plan.courses.map((cs) => new Course(cs.code, cs.name, cs.credits, cs.max_stud, cs.act, cs.pre, cs.incs, cs.pre_name)), study_plan.act_cfu, study_plan.min, study_plan.max)
            return study_plan
        }
        else if (response.status === 404){
            return new StudyPlan([],0,0,0)
        }
        else {
            throw new Error("cannot retrieve information about your study plan for some reasons, try to refresh the page... :(")
        }
    } catch(e) {
        throw new TypeError(e)
    } 
}

/* Api used to get all the courses available*/
async function getAllCourses(){
    const url = API_URL + '/courses'
    try {
        const response = await fetch(url)
        if(response.ok){
            let courses = (await response.json()).courses
            courses = courses.map((cs) => {
                cs = new Course(cs.code, cs.name, cs.credits, cs.max_stud, cs.act, cs.pre, cs.incs, cs.pre_name);
                return cs
            })
            return courses
        }
        else {
            throw new Error("cannot retrieve information about courses for some reasons, try to refresh the page... :(")

        }
    } catch(e) {
        throw new TypeError(e)
    }
}


/* Delete the study plan associated to the user if any. If he does not have one, this API will have no effect.*/
async function deleteStudyPlan(){
    const url = API_URL + '/studyplan'
    try {
        const response = await fetch(url, {
            method : 'DELETE', 
            credentials: 'include'
        })
        if (response.ok){
            return true
        }
        else {
            throw new Error("cannot delete your study plan for some reasons, try to refresh the page... :(")
        }

    } catch(e){
        throw new TypeError(e)
    }
}




/*The body will contain the a list of courses and optionally the full time parameter, in order to specify if there is not a study plan 
associated to the user, if it is a full time or part time student. If a study plan already exist this parameter will be ignored. This PUT will fail if the courses in the list will not satisfy all the constraints. On success the study plan of the user will be updated and will contain all the courses specified in the course list*/
async function updateStudyPlan(sp, full){
    const url = API_URL + '/studyplan'
    const course_list = sp.courses.map((c) => c.code)

    try{
        const response = await fetch(url, {
            credentials: 'include',
            method: 'PUT',
            headers: {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({'courses' : course_list, full: full })
        })
        if(response.ok){
            return true
        }
        else {
            const txt = await response.json()
            throw txt.err
        }
    } 
    catch(e){
        /*catch errors details*/
        throw new TypeError(e)
    }

}



const API = {getStudyPlan, getAllCourses, deleteStudyPlan, updateStudyPlan, getUserInfo, logIn, logOut}

export default API



