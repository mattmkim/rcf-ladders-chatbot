import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Home from './Components/Home'
import Feed from './Components/Feed'

class App extends Component {

  render () {
    return (
      <div>
        <BrowserRouter> 
          <Route exact path = "/" component = {Home} />
          <Route exact path = "/feed" component = {Feed} />
        </BrowserRouter>
      </div>
    )
  }
} 

export default App;
