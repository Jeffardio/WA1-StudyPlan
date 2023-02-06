import { Container, Alert } from "react-bootstrap";
function AlertDismissibleExample(props) {
    return (
      <Container fluid >
      <p></p>
      <Alert variant="danger" onClose={() => props.setShowErr(false)} dismissible>
        
          {props.err.message}
        
      </Alert>
      </Container>
    );
  
}

export default AlertDismissibleExample