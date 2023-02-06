import { Container } from "react-bootstrap"

function Spinner(){
    return(<>
        
        <Container fluid className="flex-grow-1 justify-content-center d-flex align-items-center">
            <Container  className="flex-grow-1  justify-content-center  align-items-center" style ={{maxHeight : '15rem'}}>
    <div className="d-flex align-items-center justify-content-center h-100 ">
        <div className="spinner-border" role="status" style={{width: "3rem", height: "3rem"}}></div>
      </div>
      </Container>
      </Container>
    </>
    )
}

export default Spinner