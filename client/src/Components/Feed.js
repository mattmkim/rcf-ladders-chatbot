import React, {Component} from 'react'
import {Card, Navbar} from 'react-bootstrap'
import '../public/style/Feed.css'

class Feed extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data:[]
        }
    }

    async componentDidMount() {
        
    }

    render() {
        return (
            <div>
                <Navbar className="navbar-feed" bg="white">
                    <div class="title-feed">
                        RCFgram
                    </div>
                </Navbar>
                
            </div>
        )
    }
}

export default Feed;