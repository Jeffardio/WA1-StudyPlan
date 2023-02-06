import { Table, Container, Row, Col, Form, Button} from 'react-bootstrap'
import { useState} from 'react'
import CourseJSX from './CourseJSX'
import { StudyPlan } from '../classes/StudyPlan'
function StudyPlanJSX(props){
    
    const studyPlan = props.studyPlan
    let courses = null

    const updateStudyPlan = (sp) => {
        if(props.editMode){
            props.updateStudyPlan(sp)
        }
    }

    const createStudyPlan = (sp) => {
        props.updateStudyPlan(sp)
    }
    
    const fix = props.editMode ? 1 : 0
    if(studyPlan.min !== 0){
        courses = []
        studyPlan.courses.forEach(course => {
            courses.push(<CourseJSX course = {course} key = {course.code + fix} removeCourse = {props.removeCourse} editMode = {props.editMode}/>)
        });
    }

    const onSubmit = async function(event){
        event.preventDefault();
        props.deleteStudyPlan()
    }
    
    return(courses ? 
        <>
        <p></p>
        <h3>Your study plan (Actual number of credits: {studyPlan.act_cfu} - Min: {studyPlan.min + ' '} - Max: {studyPlan.max}) </h3>
        <Container fluid className="flex-grow-1 justify-content-center d-flex align-items-center">
            <Container  className="flex-grow-1 overflow-auto justify-content-center  align-items-center" style ={{maxHeight : '12rem', minHeight:'12rem',overflow: "auto"}}>
        <Table  bordered> 
            <thead className='bg-danger'>
                <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Credits</th>
                <th>#Students</th>
                <th>Max #Students</th>
                <th>Info</th>
                {props.editMode ? <th>Actions</th>: ''}
                </tr>
            </thead>
            <tbody>
                {courses}
            </tbody>
        </Table>
        
        </Container>
        
        </Container>
        <div className="position-relative">
        <Button variant = "success" onClick = {() => {
            if(!props.editMode){
                props.updateMode(true)
            }
            updateStudyPlan(true)
            }}>{props.editMode? 'Save' : 'Edit'}</Button>{' '}
        {props.editMode && <><Button className = "position-relative end-0" variant="warning" onClick = {() => {updateStudyPlan(false)}}>
                        Cancel
        </Button>{' '}
        <Button variant = "danger" onClick={(event) => onSubmit(event)}>Delete</Button>
        </>}
        </div>
        </> : <StudyPlanForm createStudyPlan = {createStudyPlan}/>
    )
}


function StudyPlanForm(props){
    const [check, setCheck] = useState(false)
    const onSubmit = async function(event){
        event.preventDefault();
        const sp = new StudyPlan([])
        sp.setFull(check)
        props.createStudyPlan(sp)
    }
    return(
        <>
        <p></p>
        <h2>You don't have a study plan yet</h2>
        <Container fluid className="flex-grow-1 justify-content-center d-flex align-items-center">
            <Container  className="flex-grow-1 overflow-auto justify-content-center  align-items-center" style ={{maxHeight : '14rem', minHeight:'14rem',overflow: "auto"}}>
            <Row>
                <Col >
                    <div>Are you a full-time or a part-time student?</div>
                    <div>Do not check if you are a part-time one</div>
                </Col>
                <Col>
                <Form>
                    <div key={0} className="mb-3">
                        <Form.Check checked={check} type="checkbox" id="checkbox" label="Fulltime" onChange = {() => setCheck(!check)}/>
                        
                    </div>
                </Form>
                </Col>
                <Col>
                    <Button   variant="success" type="submit" onClick={(event) => onSubmit(event)}>
                            Create
                    </Button>
                </Col>
            </Row>
            </Container>
        </Container>
        </>
    )
}
export default StudyPlanJSX