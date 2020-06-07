import React, {Component} from 'react'
import {Navbar, Container} from 'react-bootstrap'
import withWindowDimensions from './withWindowDimensions.jsx';
import '../public/style/Footer.css'

class Footer extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        if (this.props.isMobileSized) {
            return(
                <div className="fixed-bottom-mobile">  
                    <Navbar fixed="bottom" color="light" className="icon-bar">
                        <Container className="icon-container">
                            <div class="icons">
                                <a href="https://www.instagram.com/pennrcf/" target="_blank">
                                    <i class="fab fa-instagram fa-2x"></i>
                                </a>
                            </div>
                            <div class="icons">
                                <a href="https://www.facebook.com/pennrcf/" target="_blank">
                                    <i class="fab fa-facebook-square fa-2x"></i>
                                </a>
                            </div>
                            <div class="icons">
                                <a href="https://m.me/rcfmeets" target="_blank">
                                    <i class="fab fa-facebook-messenger fa-2x"></i>
                                </a>
                            </div>
                        </Container>
                    </Navbar>
                </div>
            )
        } else {
            return(
                <div className="fixed-bottom">  
                    <Navbar color="light" className="icon-bar">
                        <Container className="icon-container">
                            <div class="icons">
                                <a href="https://www.instagram.com/pennrcf/" target="_blank">
                                    <i class="fab fa-instagram fa-2x"></i>
                                </a>
                            </div>
                            <div class="icons">
                                <a href="https://www.facebook.com/pennrcf/" target="_blank">
                                    <i class="fab fa-facebook-square fa-2x"></i>
                                </a>
                            </div>
                            <div class="icons">
                                <a href="https://m.me/rcfmeets" target="_blank">
                                    <i class="fab fa-facebook-messenger fa-2x"></i>
                                </a>
                            </div>
                        </Container>
                    </Navbar>
                </div>
            )
        }
    }
}

export default withWindowDimensions(Footer);