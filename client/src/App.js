import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Home from './Components/Home'

class App extends Component {

  render () {
    return (
      <div>
        <BrowserRouter> 
          <Route exact path = "/" component = {Home} />
        </BrowserRouter>
      </div>
    )
  }
} 

export default App;
