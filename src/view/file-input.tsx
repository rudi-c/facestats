import * as React from 'react';
import { connect } from 'react-redux';

interface FileInputHelperProps {
  onChange: (any) => any
}
class FileInputHelper extends React.Component<FileInputHelperProps, {}> {
  constructor(props) {
    super(props);

    let win = window as any;
    if (!win.File || !win.FileReader || !win.FileList || !win.Blob) {
      console.warn('The File APIs are not fully supported by your browser.');
    }
  }
  handleChange = e => {
    const file = e.target.files[0];
    this.props.onChange(file);
  }
  render() {
    return <input type="file" onChange={this.handleChange} />;
  }
}

const RenderFileInput = function({ onFileChange }): JSX.Element {
  return (
    <form>
      <label htmlFor="my-file-input">Upload a File:</label>
      <FileInputHelper onChange={onFileChange}>
      </FileInputHelper>
    </form>
  );
}

const mapStateToProps = function(state, ownProps) {
    return ownProps;
}

const FileInput = connect(mapStateToProps)(RenderFileInput)

export default FileInput