import * as React from 'react';
import { connect } from 'react-redux';

class FileInputHelper extends React.Component<any, any> {
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

const RenderFileInput = function({ onFileChange }): JSX.Element {
  return (
    <form>
      <label htmlFor="my-file-input">Upload a File:</label>
      <FileInputHelper id="my-file-input" onChange={onFileChange}>
      </FileInputHelper>
    </form>
  );
}

const mapStateToProps = function(state, ownProps) {
    return ownProps;
}

const FileInput = connect(mapStateToProps)(RenderFileInput)

export default FileInput