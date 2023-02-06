import MyNavBar from './MyNavBar'
import CourseTableJSX from './CourseTableJSX'
import { Container, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import StudyPlanJSX from './StudyPlanJSX'
import { useState,useEffect } from 'react'
import API from '../API'
import { StudyPlan } from '../classes/StudyPlan'
import Spinner from './Spinner'
import AlertDismissibleExample from './AlertDismissibleExample'
export function LoggedPage(props){
    const [studyPlan, setStudyPlan] = useState(new StudyPlan([],0,0,0))
    const [courses, setCourses] = useState([])
    const [loadingCourses, setLoadingCourses] = useState(false)
    const [loadingStudyPlan, setLoadingStudyPlan] = useState(false)
    const [showErr, setShowErr] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(location.pathname !== '/edit' ? false : true)

    useEffect(() => {    
        async function getAllCourses(sp){
            try {
            setLoadingCourses(true)
            const cs = await API.getAllCourses()
            cs.forEach(c => {
                const constraints  = sp.canBeAdded(c)
                c.setConstraints(constraints)
            });
            setLoadingCourses(false)
            setCourses(cs)
            }
            catch (e) {
                setLoadingCourses(false)
                setShowErr(e)
            }
        }
        
        async function getSP(){
            try {
                setLoadingStudyPlan(true)
                const sp = await API.getStudyPlan()
                //await API.addCourse()
                if (sp.max === 0 ){
                    setStudyPlan(sp)
                    setLoadingStudyPlan(false)
                    return sp
                }
                sp.courses.forEach((c) => c.setConstraints(sp.canBeRemoved(c)))
                setStudyPlan(sp)
                setLoadingStudyPlan(false)
                return sp
            } catch(e) {
                setLoadingStudyPlan(false)
                setShowErr(e)
                return new StudyPlan([],0,0,0)
            }
        }

        async function getSpAndCourses(){
                const sp  = await getSP()
                await getAllCourses(sp)
        }
        /*on login/logged-in refresh we have to get the study plan and the list of courses*/
        getSpAndCourses()
    },[])

    const updateStudyPlan = async (sp) =>{
        async function refresh(){
            setLoadingStudyPlan(true)
            setLoadingCourses(true)
            const sp = await API.getStudyPlan()
            const courses = await API.getAllCourses()
            sp.courses.forEach((c) => c.setConstraints(sp.canBeRemoved(c)))
            courses.forEach(c => {
                const constraints  = sp.canBeAdded(c)
                c.setConstraints(constraints)
            });
            setLoadingCourses(false)
            setCourses(courses)
            setStudyPlan(sp)
            setLoadingStudyPlan(false)
        }
        /*means that the user click on the cancel button*/
        if(sp === false) {
            try {
                await refresh()
                updateMode(false)
                setShowErr('')
                return
            } catch(e) {
                setShowErr(e)
            }
        }


        else if(sp === true){
            try {
                
                if (studyPlan.act_cfu > studyPlan.max){
                    throw  new Error('Error: maximum amount of cfu has been reached')
                }
                if(studyPlan.act_cfu < studyPlan.min){
                    throw new Error('Error: minimum amount of cfu has not been reached')
                }
                await API.updateStudyPlan(studyPlan, studyPlan.min === 20 ? 0 : 1)

                
                updateMode(false)
                setShowErr('')
                return
            } catch (e) {
                setShowErr(e)
                updateMode(true)
                //setLoadingStudyPlan(false)
                return
            }
        }
        /*Fresh study plan, sp will be an empty StudyPlan object*/ 
        else {
            setStudyPlan(sp)
            updateMode(true)
        }
    }

    const deleteStudyPlan = async () => {
        try{
            setLoadingCourses(true)
            setLoadingStudyPlan(true)
            await API.deleteStudyPlan()
            const nullSp =  new StudyPlan([],0,0,0)
            setStudyPlan(nullSp)
            const initCourses = await API.getAllCourses()
            initCourses.forEach(c => {
                const constraints  = nullSp.canBeAdded(c)
                c.setConstraints(constraints)
            });
            setShowErr('')
            setCourses(initCourses)
            updateMode(false)
            setLoadingCourses(false)
            setLoadingStudyPlan(false)
        }
        catch(e){
            setShowErr(e)
            updateMode(true)
        }
    }

    const updateMode = (val) =>{
        if(val === true){
            navigate('/edit')
        }
        else {
            navigate('/')
        }
        setEditMode(val)
    }

    const addCourse = (cs) => {
        //NOTA
        cs.act += 1
        const sp = studyPlan.updatedStudyPlan(cs)
        const updCourses = courses.map(c => {
            c.setConstraints(sp.canBeAdded(c))
            return c
        })
        setCourses(updCourses)
        sp.courses.forEach((c) => c.setConstraints(sp.canBeRemoved(c)))
        sp.courses.sort((a,b) => a.name.localeCompare(b.name))
        updateStudyPlan(sp)
    }

    const removeCourse = (cs) => {
        const sp = studyPlan.removeFromStudyPlan(cs)
        const updCourses = [...courses]
        /* cs is an object not owned by the full course list*/
        updCourses.forEach((c) => {
            c.setConstraints(sp.canBeAdded(c))
            if (cs.code === c.code){
                c.act -=1
            }
        })
        sp.courses.forEach((c) => c.setConstraints(sp.canBeRemoved(c)))
        setCourses(updCourses)
        updateStudyPlan(sp)
    }
    
   
    return(
        <>    
        <div className ="d-flex flex-column h-100">
            <MyNavBar handleLogout = {props.handleLogout} setShowErr = {setShowErr} user = {props.user}/>
            <Container fluid className="flex-grow-1">
                <Row className = "h-100"> 
                    <p></p>
                    <h3>Courses offered</h3>
                    {!loadingCourses ? <CourseTableWrapper courses={courses} editMode = {editMode}  addCourse = {addCourse}/>
                    :
                    <Spinner/>} 
                    {showErr? <AlertDismissibleExample err = {showErr} setShowErr = {setShowErr}/> : ''}
                    {!loadingStudyPlan ? 
                    <StudyPlanJSX updateMode = {updateMode} editMode= {editMode} studyPlan ={studyPlan} updateStudyPlan={updateStudyPlan} removeCourse = {removeCourse} deleteStudyPlan={deleteStudyPlan}/>
                     :
                    <>
                    <p></p>
                    <h3>Your study plan</h3>
                    <Spinner/>
                    </>}
                </Row>      
            </Container>
      </div>
        </>
    )
}

export function CourseTableWrapper(props){
    return (
    <>
        
        <Container fluid className="flex-grow-1 justify-content-center d-flex align-items-center">
            <Container  className="flex-grow-1 overflow-auto justify-content-center  align-items-center" style ={{maxHeight : '12rem',overflow: "auto"}}>
                <CourseTableJSX courses = {props.courses} editMode = {props.editMode} addCourse = {props.addCourse}/>
            </Container>
        </Container>
    </>
    )
}





