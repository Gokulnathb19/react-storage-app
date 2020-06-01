import React, { Component } from 'react';
import axios from 'axios';
import qs from 'querystring';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      success : false,
      url : ""
    }
  }
  
  handleChange = (ev) => {
    this.setState({success: false, url : ""});
    
  }  // Perform the upload
  handleUpload = (ev) => {
    let file = this.uploadInput.files[0];
    // Split the filename to get the name and type
    let fileParts = this.uploadInput.files[0].name.split('.');
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    console.log("Preparing the upload", fileName, fileType);
    
    fetch("//ec2-18-218-16-34.us-east-2.compute.amazonaws.com:3001/sign_s3",{
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      //mode: 'no-cors',
      //make sure to serialize your JSON body
      body: qs.stringify({
        fileName : fileName,
        fileType : fileType
      })
    })
    .then(response => response.json())
    .then(response => {
      console.log('inside response', response);
      var returnData = response.data.returnData;
      var signedRequest = returnData.signedRequest;
      var url = returnData.url;
      this.setState({url: url})
      console.log("Recieved a signed request " + signedRequest);
           // Put the fileType in the headers for the upload
      var options = {
        headers: {
          'Content-Type': fileType
        }
      };
      axios.put(signedRequest,file,options)
      .then(result => {
        console.log("Response from s3")
        this.setState({success: true});
      })
      .catch(error => {
        alert("ERROR " + JSON.stringify(error));
      })
    })
    .catch(error => {
      console.log('error in post request');
      alert(JSON.stringify(error));
    })
  }
  
  
  render() {
    const Success_message = () => (
      <div style={{padding:50}}>
        <h3 style={{color: 'green'}}>SUCCESSFUL UPLOAD</h3>
        <a href={this.state.url}>Access the file here</a>
        <br/>
      </div>
    )
    return (
      <div className="App">
        <center>
          <h1>UPLOAD A FILE</h1>
          {this.state.success ? <Success_message/> : null}
          <input onChange={this.handleChange} ref={(ref) => { this.uploadInput = ref; }} type="file"/>
          <br/>
          <button onClick={this.handleUpload}>UPLOAD</button>
        </center>
      </div>
    );
  }
}export default App;