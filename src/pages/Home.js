import './../pagesCSS/Home.css';
import { LanguageSupported, sendTranslateRequest } from './../AzureHelper/AzureTranslatorHelper.js';
import { uploadFilesToBlob, downlaodBlobFile } from './../AzureHelper/BlobHelper.js';
import LoadingSpinner from './../Common/LoadingSpinner.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {

  const [fromLanguage, setFromLanguage] = useState('');
  const [toLanguage, setToLanguage] = useState('');
  const [fileList, setFileList] = useState('');
  const [fileNameList, setFileNameList] = useState([]);

  const handleTranslateButtonClick = async () => {

    document.getElementById('loadingSpinnerText').innerText = 'Processing...';
    document.getElementById('translateButton').style.display = 'none';
    document.getElementById('loadingSpinner').style.display = 'block';

    const time = new Date();
    const folderNameForBlob = time.getFullYear() + "-" + time.getMonth() + "-" + time.getDate() + "-" + time.getHours() + "-" + time.getMinutes() + "-" + time.getSeconds() + "/";

    // Upload files to blob
    document.getElementById('loadingSpinnerText').innerText = 'Uploading...';
    const fileNameList = await uploadFilesToBlob(fileList, folderNameForBlob)
    console.log('file names', fileNameList);

    // Send translation request
    document.getElementById('loadingSpinnerText').innerText = 'Translating...';
    await sendTranslateRequest(toLanguage, fromLanguage, folderNameForBlob);

    // Set file names to state for rendering
    setFileNameList(fileNameList);

    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('translateButton').style.display = 'block';
  };

  const handleFromLanguageChange = (event) => {
    console.log(event.target.value);
    setFromLanguage(event.target.value);
  };

  const handleToLanguageChange = (event) => {
    console.log(event.target.value);
    setToLanguage(event.target.value);
  };

  const handleFileUploadChange = (event) => {
    setFileList(event.target.files);
    console.log('file', fileList);
  };

  const handleDownloadButtonClick = filePath => () => {
    console.log('Downlaod Button click', filePath);
    downlaodBlobFile(filePath, toLanguage);
  };

  return (
    <>
      <div className="card col-lg-6 col-md-9 col-sm-9 center">
        <div className="card-header">
          <h1>Azure File Translator</h1>
        </div>
        <div className="card-body">
          <p className="card-text">Convert text documents to another language using Azure Cognitive services.</p>
          <p>For language code help <Link to="https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support" target="_blank">click here.</Link></p>
          <h2 className="card-title">Upload</h2>
          <br />
          <div className='row d-flex justify-content-center' >

            <div className="col-auto position-relative">
              <div className="input-group mb-3">
                <label className="input-group-text" htmlFor="inputFromLanguage">From Language</label>
                <select className="custom-select" id="inputFromLanguage" onChange={handleFromLanguageChange}>
                  <LanguageSupported />
                </select>
              </div>
            </div>

            <div className="col-auto position-relative">
              <div className="input-group mb-3">
                <label className="input-group-text" htmlFor="inputToLanguage">To Language</label>
                <select className="custom-select" id="inputToLanguage" onChange={handleToLanguageChange}>
                  <LanguageSupported />
                </select>
              </div>
            </div>

          </div>
        </div>
        <div className="input-group mb-3 w-50 mx-auto">
          <input type="file" className="form-control" id="inputGroupFile01" multiple onChange={handleFileUploadChange} />
          <label className="input-group-text" htmlFor="inputGroupFile01">Upload</label>
        </div>

        <br />
        <button className="btn btn-primary btn-lg mx-auto w-25" id='translateButton' onClick={handleTranslateButtonClick}> Translate </button>
        <LoadingSpinner />
        <br />
      </div>

      {fileNameList.map((item) => {
        return (
          <div className="card col-lg-4 col-md-5 col-sm-5 center-without-text" id='showTranslatedFilesBox' key={item}>
            <div className="card-header">
              <h4>Download Translated Files</h4>
            </div>
            <ol className='list-group list-group-numbered' id='showTranslatedFilesList'>
              <li className="list-group-item" >
                <Link>
                  <span onClick={handleDownloadButtonClick(item)}>{item.replace(/^.*[\\/]/, '')}</span>
                </Link>
              </li>
            </ol>
          </div>
        );
      })}

    </>
  );
}
