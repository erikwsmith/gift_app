import React, {useState, useRef, useEffect} from 'react';
import {Button, Accordion, Modal} from 'react-bootstrap';

const NavBar = () => {    
    const [username, setUsername]=useState('');
    const [password, setPassword]=useState('');
    const [users, setUsers] = useState([]);
    const [loggedUser, setLoggedUser] = useState({});
    const [otherUsers, setOtherUsers] = useState([]);    
    const [showModal, setShowModal] = useState(false);
    const [showDeleteMsg, setShowDeleteMsg] = useState(false);
    const [gifts, setGifts] = useState([]);
    
    const giftsRef = ([]);

    const userContainer = document.getElementById("userContainer");
    const loginContainer = document.getElementById("loginContainer");
    const mainContent = document.getElementById("mainContent");
    const loginError = document.getElementById("loginError");
    const accordionBtn = document.getElementById("accordion-btn");
    const panelEl = document.querySelectorAll(".panel");
   
    //fetch User data from MongoDB
    useEffect( ()=> {
        const fetchData = async()=>{
            const userQuery = await fetch('http://localhost:4000/users');
            let userJSON = await userQuery.json();            
                setUsers(userJSON);      
        };
        fetchData();  
        console.log("Component rendered!");       
    }, [loggedUser]);    

    const fetchGifts = async() => {
        const giftSearch = await fetch('http://localhost:4000/users/' + loggedUser._id);
        let giftData = await giftSearch.json();         
        setLoggedUser(giftData);
             
    }
    const addUserGift = async() => {
        const firstName = loggedUser.first_name;
        const lastName = loggedUser.last_name; 
        const giftName = document.getElementById("gift-name-input");
        const giftQty = document.getElementById("gift-qty-input");
        const giftDesc = document.getElementById("gift-desc-input");
        const giftURL = document.getElementById("gift-url-input");       
        
        const newGiftObj = {
            "name": giftName.value,
            "quantity": giftQty.value,
            "description": giftDesc.value,
            "url" : giftURL.value
        };        
        const newArray = [...gifts, newGiftObj];
        setGifts(prev => [...prev, newGiftObj]);
        //newArray.push(newGiftObj);        
        giftsRef.current = newArray;     
        
        const user = {firstName, lastName, username, password, "gifts": newArray}; 
                
        await fetch('http://localhost:4000/users/' + loggedUser._id, {
            method: 'PATCH',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(fetchGifts)
    }
    
    const deleteUserGift = async(id) => {        
        const firstName = loggedUser.first_name;
        const lastName = loggedUser.last_name;         
        const deletedIndex = loggedUser.gifts.findIndex((x)=>x._id == id);
        
        if(!loggedUser.gifts[deletedIndex].claimed){
            loggedUser.gifts.splice(deletedIndex, 1);
                    
            const user = {firstName, lastName, username, password, "gifts": loggedUser.gifts};
            const response = await fetch('http://localhost:4000/users/' + loggedUser._id, {
                method: 'PATCH',
                body: JSON.stringify(user),
                headers: {
                    'Content-Type': 'application/json'
                }
            })          
            if(response.ok){
                console.log("Successful!");             
                setGifts(loggedUser.gifts);  
                fetchGifts();   
            } else {
                alert("Something went wrong. Please try again.")
            }
        } else {
            setShowDeleteMsg(true);
        }        
    }
    const handleSubmit = (e)=>{
       e.preventDefault();
        const checkUsername = users.find((x)=>(x.username? x.username : '').toLowerCase() === username.toLowerCase());
        if(checkUsername){
            //console.log(checkUsername);
            setLoggedUser(checkUsername);
            if(checkUsername.password === password){
                userContainer.classList.remove("hidden");
                mainContent.classList.remove("main-content-hidden");
                loginContainer.classList.add("hidden");
                panelEl.forEach((e)=>{e.classList.add("panel-hidden")}); 
                const otherUsers = users.filter((x)=>x._id !== checkUsername._id);
                setOtherUsers(otherUsers);
                setGifts(checkUsername.gifts);
                giftsRef.current = checkUsername.gifts;
                console.log(giftsRef.current);                        
            } else {
                console.log("Password does not match");
                loginError.innerText = "Login Error: Password does not match";
                loginError.classList.remove("login-hidden");
            }     
        } else {
            console.log("Username not found.");
            loginError.innerText = "Login Error: Username not found";
            loginError.classList.remove("login-hidden");
        }      
    };
    const handleLogOut = ()=> {
        userContainer.classList.add("hidden");
        mainContent.classList.add("main-content-hidden");
        loginContainer.classList.remove("hidden");  
        loginError.classList.add("login-hidden");
        accordionBtn.classList.remove("active");
        setUsername("");
        setPassword("");
        setOtherUsers([]);
        setGifts([]);
    }
   const handleAccordion = (e) => {
        const thisEl = e.target;
        thisEl.classList.toggle("active");
        const nextElement = e.target.nextElementSibling;
        nextElement.classList.toggle("panel-hidden");
   }
   const handleAddGift = () => {
        setShowModal(true);         
   }
   const handleCloseModal = () => {
        setShowModal(false);
   }
   const handleCloseDeleteMsg = ()=>{
        setShowDeleteMsg(false);
   }
   const handleGiftSubmit = () => {  
        addUserGift();                
        setShowModal(false);            
   }
   const handleGiftDelete = (gift_id) => {   
        console.log(gift_id);   
        deleteUserGift(gift_id);                   
   }
   
   const handleClaim = async(otherUserGift, otherUserID)=> {        
        const otherUserRecord = otherUsers.filter((rec)=> rec._id === otherUserID);
        const selectedGift = otherUserRecord[0].gifts.filter((gift) => gift._id === otherUserGift);
        const selectedGiftIndex = (otherUserRecord[0].gifts).findIndex((x)=>x._id === otherUserGift);
        //console.log(selectedGiftIndex);
        const newGiftArray = [...otherUserRecord[0].gifts];
        //console.log(newGiftArray[selectedGiftIndex]);

        if(selectedGift[0].claimed && selectedGift[0].claimedBy === loggedUser._id){
            newGiftArray[selectedGiftIndex].claimed = false;
            newGiftArray[selectedGiftIndex].claimedBy = "";
            //console.log("You removed your claim on this gift!");
            //console.log(newGiftArray);            
        }else{
            newGiftArray[selectedGiftIndex].claimed = true;
            newGiftArray[selectedGiftIndex].claimedBy = loggedUser._id;
            //console.log("You just claimed it!");
            //console.log(newGiftArray);
        }
        const user = {"gifts": newGiftArray};
            const response = await fetch('http://localhost:4000/users/' + otherUserID, {
                method: 'PATCH',
                body: JSON.stringify(user),
                headers: {
                    'Content-Type': 'application/json'
                }
            })          
            if(response.ok){
                console.log("Successful!"); 
                fetchGifts();
            } else {
                alert("Something went wrong. Please try again.")
            }                
    }
    return (
        <>
            <div className="navbar">
                <div className="logo-container">
                    <img src={require("../images/gift-xxl.png")} alt=""></img>
                    <span className="app-name">Wish List</span>   
                </div>
                <div id="userContainer" className="user-container hidden">
                    <span className="user-name">{loggedUser.first_name}</span>
                    <button className="logout-btn" onClick={handleLogOut}>Log Out</button>
                </div>
            </div>            
            <div id="loginContainer" className="login-container">
                <div id="loginError" className="login-hidden">Login Error: </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="username" className="label" >Username</label>
                    <input id="userInput" type="text" name="username" value={username} 
                        onChange={(e)=> setUsername(e.target.value)} required>                        
                    </input>
                    <label htmlFor="password" className="label">Password</label>
                    <input id="passwordInput" type="password" name="password" value={password} 
                        onChange={(e)=> setPassword(e.target.value)} required>                        
                    </input>
                    <button className="login-btn">Log In</button>
                </form>
            </div>
            <div id="mainContent" className="main-content-hidden">
                <div id="accordion-container">
                    <button id="accordion-btn" className="accordion" onClick={(e)=> {handleAccordion(e)}}>Gifts for Me</button>                    
                        <div className="panel panel-hidden">
                            <div className="add-gift" onClick={handleAddGift}>
                                <button className="add-gift-btn">Add New Gift</button>
                            </div>
                            {loggedUser.gifts && loggedUser.gifts.map((gift, index) => 
                                <div key={index} className="gift-div">
                                    <div className="gift-details">
                                        <div className="gift-title">{gift.name}</div>
                                        <div className="gift-field"><span className="gift-category">Quantity: </span>{gift.quantity}</div>
                                        <div className="gift-field"><span className="gift-category">Description: </span>{gift.description}</div>
                                        <div className="gift-field">
                                            <span className="gift-category">URL: </span>
                                            <a href={gift.url} target="blank">{gift.url}</a>
                                        </div>
                                    </div>
                                    <div className="user-gift-btn-container">
                                        <button className="remove-gift-btn" onClick={(e)=>handleGiftDelete(gift._id)}>Delete Gift</button>
                                    </div>
                                </div>                             
                            )}
                        </div>
                    
                    {otherUsers && otherUsers.map((user) => 
                        <div key={user._id}>
                        <button className="accordion" onClick={(e)=> {handleAccordion(e)}}>{`${user.first_name} ${user.last_name}`}</button>   
                        <div className="panel panel-hidden">                      
                            {user.gifts && user.gifts.map((gift, index) =>
                                <div key={`${gift._id} - ${index}`} className="gift-div">
                                <div className="gift-details">
                                    <div className="gift-title">{gift.name}</div>
                                    <div className="gift-field"><span className="gift-category">Quantity: </span>{gift.quantity}</div>
                                    <div className="gift-field"><span className="gift-category">Description: </span>{gift.description}</div>
                                    <div className="gift-field">
                                        <span className="gift-category">URL: </span>
                                        <a href={gift.url} target='blank'>{gift.url}</a>
                                    </div>
                                </div>
                                <div className="user-gift-btn-container">
                                { gift.claimed && gift.claimedBy !== loggedUser._id ?
                                    
                                    <button className="claimed-btn" >
                                        <span className="claimed">Claimed by Other User</span>
                                    </button> : 
                                    gift.claimedBy === loggedUser._id ?
                                       
                                        <button className="claimedByUser-btn" onClick={(e)=>{handleClaim(gift._id, user._id)}}>
                                            <span className="claimed">Remove My Claim</span>
                                        </button> :
                                        <button className="claim-btn" onClick={(e)=>{handleClaim(gift._id, user._id)}}>
                                            <span className="claim">Claim</span>
                                        </button>                                                                                                       
                                }                                                                   
                                </div>
                                </div>
                            )}                 
                        </div>
                        </div>                      
                    )}                   
                </div>
            </div> 
            <Modal show={showModal} onHide={handleCloseModal} backdrop='static' keyboard='false' style={{marginTop: 135}}>
                <Modal.Body className="modal-body" >
                    <h2 style={{textAlign: 'center'}}>Add New Gift</h2>
                    <label>Item:</label><input type="text" id="gift-name-input" required></input>
                    <label>Quantity:</label><input type="number" defaultValue={1} min={1} id="gift-qty-input"></input>
                    <label>Description:</label><input type="text" id="gift-desc-input"></input>
                    <label>URL:</label><input type="text" id="gift-url-input"></input>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="fw-bold btn-info mx-auto submit-gift-btn" onClick={handleGiftSubmit}>Add Gift</Button>
                    <Button className=" btn-secondary mx-auto cancel-gift-btn" onClick={handleCloseModal}>Cancel</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showDeleteMsg} onHide={handleCloseDeleteMsg} backdrop='static' keyboard='false' style={{marginTop: 135}}>
                <Modal.Body className="modal-body" >
                    <h4 style={{textAlign: "center"}}>Unable to delete.</h4>
                    <h5 style={{textAlign: "center"}}>Another user has claimed this gift.</h5>                        
                </Modal.Body>
                <Modal.Footer>
                    <Button className=" btn-dark mx-auto cancel-gift-btn" onClick={handleCloseDeleteMsg}>OK</Button>                   
                </Modal.Footer>
            </Modal>
     </>
    )
};

export default NavBar;