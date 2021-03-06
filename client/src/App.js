import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute'
import RedirectRoute from './Components/RedirectRoute'
import withWindowDimensions from './Components/withWindowDimensions.jsx';
import Home from './Components/Home'
import Feed from './Components/Feed'
import Footer from './Components/Footer'


class App extends Component {

  constructor(props) {
    super(props);
  }

  render () {
    if (this.props.isMobiledSized) {
      return (
        <div>
          <BrowserRouter> 
            <RedirectRoute exact path = "/" component = {Home} />
            <ProtectedRoute exact path = "/feed" component = {Feed} />
          </BrowserRouter>
        </div>
      )
    } else {
      return (
        <div>
          <BrowserRouter> 
            <RedirectRoute exact path = "/" component = {Home} />
            <ProtectedRoute exact path = "/feed" component = {Feed} />
          </BrowserRouter>
          <Footer />
        </div>
      )
    }
    
  }
} 

export default withWindowDimensions(App);
