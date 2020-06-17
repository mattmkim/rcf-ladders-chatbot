import React from 'react'
import { Route, Redirect } from 'react-router-dom';
// a protected route will reroute back to the root if your username is not locally stored.
export const RedirectRoute = ({ component: Component, ... rest}) => {
    return (
        <Route
         {...rest }
         render = {props => {
             if(localStorage.getItem("token")) {
                 return <Redirect to= "/feed"/>
             } else {
                return <Component {...props} />
             }
         }}
        />
    )
}

export default RedirectRoute;