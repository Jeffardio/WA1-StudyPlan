import {BsArrowsExpand, BsArrowsCollapse} from 'react-icons/bs'
import { FcInfo } from "react-icons/fc";
import { IoIosAddCircleOutline } from "react-icons/io";
import { GiCancel } from "react-icons/gi"
import { Button } from 'react-bootstrap'
import { useState } from 'react'
function CourseJSX(props){

    const [expanded, setExp] = useState(false)
    const [expandedCns, setExpCns] = useState(false)
    const course = props.course
    let color = 'bg-light'//props.idx % 2 ? 'bg-secondary' : 'bg-light bg-gradient'
    let info = " "
    let info1 = " "
    let info2 = " "
    let description = " "
    let description1 = " "
    let description2 = " "
    let description3 = " "
    let description4 = " "
    let add = false

    const setExpand = (val) => {
        if (val === true) {
            setExp(val);
            setExpCns(!val)
        }
        else {
            setExp(expandedCns ? true : false);
            setExpCns(false);
        }
    }

    const setExpandCns = (val) => {
        if (val === true) {
            setExp(!val);
            setExpCns(val)
        }
        else {
            setExp(false);
            setExpCns(expanded ? true : false);
        }
    }
    
    /*Set the information to visualize on component expansion */
    if (!course.pre && course.incs.length === 0){
        info += 'This course has no constraints.'
        info = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{info}</div>

    }
    if (course.pre) {
        info1 += "Preparatory course: " + course.pre +' (' + course.pre_name + ')'
        info1 = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{info1}</div>
    }
    if (course.incs.length){
        info2 += "Incompatible course(s): "
        course.incs.forEach((c,idx) => {
            if (idx){
                info2 += ', '
            }
            info2 += c.code + ' (' + c.name + ')'
        });
        info2 = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{info2}</div>
    }
    
    /*Why I cannot add/remove a course*/
    if (props.editMode){
        if(course.cns.incs.length !== 0){
            description += "Incompatible course(s): "
            course.cns.incs.forEach((c,idx) => {
                if (idx){
                    description += ', '
                }
                description += c.code + ' (' + c.name + ')'
            });
            description = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{description}</div>
        }
        if(!course.cns.credits){
            description1 += "Maximum limit of credits"
            description1 = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{description1}</div>

        }
        if (!course.cns.pre && course.adv){
            description2 += "This is a preparatory course of: " + course.adv.code + " (" + course.adv.name + ")"
            description2 = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{description2}</div>

        }
        else if(!course.cns.pre){
            description2 += "Preparatory course: " + course.pre + ' (' + course.pre_name + ')'
            description2 = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{description2}</div>
        }
        if (!course.cns.added){
            description4 += "Already present in the study plan"
            description4 = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{description4}</div>
        }
        else if(!course.cns.limit && !props.removeCourse) {
            description3 +="Limit of students reached"
            description3 = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{description3}</div>
        }
        
        else if(course.cns.pre && course.cns.credits && course.cns.incs.length === 0 && course.cns.limit && course.cns.added){
            description += "All constraints are satisfied"
            description = <div>{props.idx % 2 ? <FcInfo/> : <FcInfo/>}{description}</div>
            add = true
        }
    }
    
    let button = ''
    /*Setting the appropriate button*/
    let expCon = expandedCns || expanded
    if(props.editMode){
        if(add && !props.removeCourse){
            
            button = <td className='text-center align-middle' rowSpan={expCon? 2 : 1}><Button onClick = {() => {props.addCourse(course)}}><IoIosAddCircleOutline
            />{' '}Add</Button></td> 
        }
        else if (add && props.removeCourse){
            button = <td className='text-center align-middle' rowSpan={expCon ? 2 : 1}><Button variant="warning"onClick = {() => {props.removeCourse(course)}}><GiCancel/>{' '}Remove</Button></td>   
        }
        else if(!add){
            button = <td className='text-center align-middle' rowSpan={expCon ? 2 : 1}><Button variant="danger "onClick = {() => {setExpandCns(expCon ? false : true)}}>{expCon ? <BsArrowsCollapse/> : <BsArrowsExpand/>}{' '}Why?</Button></td>
        }
    }

   
    let buttonInfo = <td className='text-center align-middle' rowSpan={expCon ? 2 : 1}><Button onClick = {() => {setExpand(expCon ? false : true)}}>{expCon ? <BsArrowsCollapse/> : <BsArrowsExpand/>}{' '}Info</Button></td>


    if(props.editMode && !add){
        color = ' text-light  bg-secondary'
    }

    return(
        <>
        <tr className={color}>
            <td>{course.code}</td>
            <td>{course.name}</td>
            <td>{course.credits}</td>
            <td>{course.act}</td>
            <td>{course.max_stud}</td>
            {buttonInfo}
            {button}
        </tr>
        
        {(expandedCns) &&
        <tr className={color + ' '}>
            <th className=' align-middle'>{"Reasons"}</th>
            <td colSpan = "5" className = ""> 
                <div style={{height: '1px'}}></div>
                {description}
                {description1}
                {description2}
                {description3}
                {description4}
                <div style={{height: '1px'}}></div>
            </td>
        </tr>}
        {(expanded) &&
        <tr className={color + ' '}>
            <th className=' align-middle'>{'General constraints'}</th>
            <td colSpan = "5" className = ""> 
                <div style={{height: '1px'}}></div>
                {info}
                {info1}
                {info2}
                <div style={{height: '1px'}}></div>
            </td>
        </tr>}
        
        </>
    )
}


export default CourseJSX