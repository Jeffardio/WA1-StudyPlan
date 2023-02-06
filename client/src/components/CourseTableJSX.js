import { Table} from 'react-bootstrap'
import CourseJSX from './CourseJSX'
 
function CourseTableJSX(props){
    const rows = []
    const courses = props.courses
    const fix = props.editMode ? 1 : 0
    courses.forEach((course,idx) => {
        rows.push(<CourseJSX course = {course} key = {course.code + fix} idx = {idx} editMode = {props.editMode} addCourse = {props.addCourse} />)
    });


    return(<>
        <Table bordered className="rounded" > 
            <thead className="bg-danger">
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Credits</th>
                    <th>#Students</th>
                    <th>Max #Students</th>
                    <th>Info</th>
                    {fix ? <th>Actions</th> : <></>}
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
        </>
)}
export default CourseTableJSX