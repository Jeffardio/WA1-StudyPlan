import { Col, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useNavigate} from 'react-router-dom'
import { useState } from 'react'
function MenuOptions(props){
    const [currActive, setCurrActive] = useState(0)
    const navigate = useNavigate()
    let classes = "list-group-item";
    return (
        <>
        <Col className="col-2 p-2 bg-dark bg-opacity-25">
            <div className="list-group" id = "filters">
                <Button variant = {currActive === 0 ? "success" : "outline-success"} key={0} type="button" 
                className={currActive === 0 ? '':classes} 
                onClick = {() => {setCurrActive(0); navigate("/courses")}}>All courses</Button>
                <Button  variant = {currActive === 1 ? "success": "outline-success"} key= {1} type="button" 
                className={currActive === 1 ? '': classes}  
                onClick={() => {setCurrActive(1); navigate("/studyplan")}}>Create a study plan</Button>
            </div>
        </Col>
        </>
    )
}

export default MenuOptions