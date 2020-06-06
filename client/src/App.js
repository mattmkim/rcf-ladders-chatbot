import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute'
import Home from './Components/Home'
import Feed from './Components/Feed'
import Footer from './Components/Footer'


class App extends Component {

  render () {
    return (
      <div>
        <BrowserRouter> 
          <Route exact path = "/" component = {Home} />
          <ProtectedRoute exact path = "/feed" component = {Feed} />
          <Footer />
        </BrowserRouter>
      </div>
    )
  }
} 

export default App;
