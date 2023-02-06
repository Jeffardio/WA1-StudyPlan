import {Container,Form, Card, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API'
import AlertDismissibleExample from './AlertDismissibleExample';


function LoginForm(props) {
    const [email, setEmail] = useState("jacopo@studenti.polito.it")
    const [pwd, setPwd] = useState("jacopo")
    const [err, setErr] = useState(0)
    const [showErr, setShowErr] = useState('');
    let emailError = ""
    let pwdError = ""
    const navigate = useNavigate();

    if (err === 3 || err === 1){
        emailError = "Please, insert a valid email"
    } 

    if (err === 3 || err === 2){
        pwdError = "Please, insert the password"
    }

    if(err === 4){
        emailError = " "
        pwdError ="Email or password are incorrect"
    }

    const onSubmit = async (event) => {
        event.preventDefault(); 
        const re = /\S+@\S+\.\S+/
        /*this check is already done by the email input, so it can be avoided*/
        if (!re.test(email) && pwd === ""){
            setErr(3) /*Email not valid and password has not been inserted*/
        }
        else if (!re.test(email)){
            setErr(1) /*Email not valid*/
        }
        else if (pwd === "") {
            setErr(2) /*pwd has not been inserted*/
        }
        else {
            const credentials = {username : email, password : pwd}
            try {
                const user = await API.logIn(credentials)
                if (user === false){
                    setErr(4)
                    return
                }
                navigate('/')
                props.setupUser(user)
                setErr(0)
            }
            catch (e) {
                setShowErr(new Error("Error: something went wrong during the login procedure, try to refresh the page... :("))
            }
        }
    }
    return (
    <>
        {showErr? <AlertDismissibleExample err = {showErr} setShowErr = {setShowErr}/> : ''}
        <Container fluid className="flex-grow-1 justify-content-center d-flex align-items-center" >
            <Card border="success" style={{ padding : '4rem'}}>
                <Form  onSubmit={onSubmit}>
                    <Form.Group className="mb-2" controlId="formGroupEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="email@address.dom" value = {email} onChange = {(e) => setEmail(e.target.value)} className = {emailError && "border border-danger "}/>
                        {emailError && <ErrorMessage className='mt-1' text = {emailError}/>}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formGroupPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" value = {pwd} onChange = {(e) => setPwd(e.target.value)} className = {pwdError && "border border-danger "}/>
                        {pwdError &&<ErrorMessage className='mt-1' text = {pwdError} />}
                    </Form.Group>
                    <Button variant="success" type="submit" >
                        Login
                    </Button>
                </Form>
            </Card>
        </Container>
    </>
    )
}



function ErrorMessage(props) {
    return (
        <div className='text-danger'>{props.text}</div>
    )
}
export default LoginForm