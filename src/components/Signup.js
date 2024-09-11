import React, { useEffect, useState } from 'react'
import { useNavigate  } from 'react-router-dom'


const Signup = (props) => {
    const [passwordsMatch, setPasswordsMatch] = useState(false)

    const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" })

    let navigate = useNavigate();

    useEffect(() => {
        setPasswordsMatch(credentials.password === credentials.cpassword)
    }, [credentials.password, credentials.cpassword])

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {name, email, password} = credentials;
        const response = await fetch("http://localhost:4500/api/auth/createuser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjY4YmFkYWM1NjhlYTMzYzNmYTA3ZjA4In0sImlhdCI6MTcyMDQzNDg1OX0.muhavBlZ72D8QzvppWt6NGkdTAbw9OsrNGHtSZRdbIE"
            },
            body: JSON.stringify({ name, email, password })

        });
        const json = await response.json();
        console.log(json);

        if(json.success){
            // save the auth token and redirect
            localStorage.setItem('token', json.authToken)
            navigate('/')
            props.showAlert("Account Created Successfully", "success")

        }
        else{
            props.showAlert("Invalid Details", "danger")
        }
    }

    const onChange= (e) => {
        setCredentials({...credentials, [e.target.name]: e.target.value})
    }




    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" name="name" onChange={onChange} id="name" aria-describedby="name"  />
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="email" name="email" onChange={onChange} aria-describedby="emailHelp" required />
                        <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" name='password' onChange={onChange} minLength={5} id="password" required />
                </div>

                <div className="mb-3">
                    <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" name='cpassword' onChange={onChange} minLength={5} id="cpassword" required />
                    {!passwordsMatch && <div className="form-text text-danger">Password & Confirm Password do not match</div>}
                </div>

                <button type="submit" className="btn btn-primary" disabled={!passwordsMatch}>Submit</button>
            </form>
        </div>
    )
}

export default Signup
