import * as React from 'react';

const Analyzer = require("worker!../analysis/analyzer.ts")

class FileInput extends React.Component<any, any> {
  static propTypes = {
    onChange: React.PropTypes.func,
  }
  constructor(props) {
    super(props);

    let win = window as any;
    if (!win.File || !win.FileReader || !win.FileList || !win.Blob) {
      console.warn('The File APIs are not fully supported by your browser.');
    }
  }
  handleChange = e => {
    let file = e.target.files[0];

    new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = e => {
        console.log("File loaded");
        resolve(reader.result);
      };

      console.log("Start reading file...");
      reader.readAsText(file);
    })
    .then(result => {
      this.props.onChange(result);
    });
  }
  render() {
    return <input type="file" onChange={this.handleChange} />;
  }
}

function onWorkerMessage(message) {
    console.log("Received message from worker.");
    console.log(message);
}

export default class extends React.Component<any, any> {
  handleChange = (result) => {
      if ((window as any).Worker) {
          let worker = new Analyzer();
          worker.addEventListener('message', onWorkerMessage);
          console.log("Sending to worker");
          worker.postMessage(result);
      } else {
          console.warn('Web workers not supported');
      }
  }

  render() {
    return (
      <form>
        <label htmlFor="my-file-input">Upload a File:</label>
        <FileInput id="my-file-input" onChange={this.handleChange}>
        </FileInput>
      </form>
    );
  }
}