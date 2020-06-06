import React, {Component} from 'react'
import {Image, Container, Form, Button} from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import withWindowDimensions from './withWindowDimensions.jsx';
import rcfmeets from '../public/rcfmeets.png'
import '../public/style/Home.css'

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            errorPassword: ''
        }
    }

    handlePassword = (event) => {
        this.setState({
            password: event.target.value
        })
    }

    handleSubmit = (event) => {
        event.preventDefault();
        var errorPassword = "";

        if (this.state.password.length === 0) {
            errorPassword = "The password cannot be blank.";
            this.setState({
                errorPassword: errorPassword
            })
        } else if (this.state.password.localeCompare("renewal2021") != 0) {
            errorPassword = "Incorrect password. Please try again.";
            this.setState({
                errorPassword: errorPassword
            })
        } else {
            localStorage.setItem("token", "loggedIn")
            this.props.history.push({
                pathname: '/feed'
            });
        }
    }

    render() {
        if (this.props.isMobileSized) {
            return (
                <div>
                    <Container className="content-container-mobile">
                        <div class="card-wrapper">
                            <div className="card-content">
                                <h1 class="title">RCFgram</h1>
                                <Form className="login-form" onSubmit={this.handleSubmit}>
                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Control type="password" placeholder="Password" onChange = {this.handlePassword}/>
                                        <Form.Text className="red-text">
                                            {this.state.errorPassword}
                                        </Form.Text> 
                                    </Form.Group>
                                    <Button className="login-button" variant="primary" type="submit">
                                        Log In
                                    </Button>
                                </Form>
                            </div>
                            <div class="redirect-text-mobile">
                                <div class="redirect-one">
                                    Don't know the password? Ask <a href="https://m.me/matthew24kim" target="_blank">here!</a>
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            )
        } else {
            return (
                <div>
                    <Container className="content-container">
                        <div class="image-wrapper">
                            <Image className="image" src={rcfmeets} />
                        </div>
                        <div class="card-wrapper">
                            <Card className="login-card">
                                <div className="card-content">
                                    <h1 class="title">RCFgram</h1>
                                    <Form className="login-form" onSubmit={this.handleSubmit}>
                                        <Form.Group controlId="formBasicPassword">
                                            <Form.Control type="password" placeholder="Password" onChange = {this.handlePassword}/>
                                            <Form.Text className="red-text">
                                                {this.state.errorPassword}
                                            </Form.Text> 
                                        </Form.Group>
                                        <Button className="login-button" variant="primary" type="submit">
                                            Log In
                                        </Button>
                                    </Form>
                                </div>
                            </Card>
                            <Card className="redirect-card">
                                <div class="redirect-text">
                                    <div class="redirect-one">
                                        Don't know the password? Ask <a href="https://m.me/matthew24kim" target="_blank">here!</a>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    
                    </Container>
    
                        
                </div>
            )
        }


        
    }
}

export default withWindowDimensions(Home);