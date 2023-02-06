import 'bootstrap/dist/css/bootstrap.min.css'
import {Container} from 'react-bootstrap'
import Spinner from './Spinner'
import CourseTableJSX from './CourseTableJSX';
import MyNavBar from './MyNavBar'
import { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import API from '../API';
import AlertDismissibleExample from './AlertDismissibleExample';
function Homepage(props) {
  const [loading, setLoadingCourses] = useState(true)
  const [courses, setCourses] = useState([])
  const [showErr, setShowErr] = useState('');
  useEffect(() => {
    async function getCs(){
      try {
        setLoadingCourses(true)
        const cs = await API.getAllCourses()
        setCourses(cs)
        setLoadingCourses(false)
      } catch(e){
        setLoadingCourses(false)
        setShowErr(new Error("Error: cannot retrieve information about courses for some reasons, try to refresh the page... :("))
      }
    }
    getCs()
  },[])
  const isLoginForm = props.setupUser ? true : false
  return (
    <>      
    <div className ="d-flex flex-column h-100">
      <MyNavBar isLoginForm = {isLoginForm}/>
      {!props.setupUser ?
      <>
      {showErr? <AlertDismissibleExample err = {showErr} setShowErr = {setShowErr}/> : ''}

      <p></p>
      <h1>Courses offered</h1>
      
        <Container fluid className="flex-grow-1 justify-content-center d-flex align-items-center">
         
         {!loading? <Container  className="flex-grow-1 overflow-auto justify-content-center  align-items-center" style ={{maxHeight : '30rem',overflow: "auto"}}>
            <CourseTableJSX courses = {courses}/>
        </Container> :
        
          <Spinner></Spinner>
        
      }
        </Container>


  </>
      :
      <LoginForm setupUser={props.setupUser}/>}
    </div>
</>
  );
}

export default Homepage;
