import { BlobServiceClient } from "@azure/storage-blob";
import axios from 'axios';

export async function uploadFilesToBlob(fileList, fileNameSuffixForBlob) {

    const blobServiceClient = new BlobServiceClient(
        process.env.REACT_APP_SourceContainerConnectionString
    );
    const containerClient = blobServiceClient.getContainerClient(process.env.REACT_APP_FolderName);

    let fileNameList = [];
    for (let file of fileList) {
        await uploadFileToBlob(file, fileNameSuffixForBlob, containerClient);
        fileNameList.push(fileNameSuffixForBlob + file.name);
    }

    return fileNameList;
};

export async function downlaodBlobFile(filePath, toLanguage) {
    const blobServiceClient = new BlobServiceClient(
        process.env.REACT_APP_TargetContainerConnectionString
    );
    const containerClient = blobServiceClient.getContainerClient(process.env.REACT_APP_FolderName);
    const getFileDetails = containerClient.getBlockBlobClient(filePath);
    const fileDownloadUrl = getFileDetails.url;

    axios.get(fileDownloadUrl)
        .then(response => {
            console.log(response);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = url
            link.download = createFileNameFromPath(filePath, toLanguage);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        })
        .catch(error => {
            console.log('Error while downloading file', error);
        });
}

function createFileNameFromPath(filePath, toLanguage) {

    let fileNameWithExtension = filePath.replace(/^.*[\\/]/, '');
    let pos = fileNameWithExtension.lastIndexOf(".");
    let fileName = fileNameWithExtension.substr(0, pos < 0 ? fileNameWithExtension.length : pos) + '_' + toLanguage;

    fileNameWithExtension = fileName + fileNameWithExtension.substr(pos);
    return fileNameWithExtension;
}

async function uploadFileToBlob(file, fileNameSuffixForBlob, containerClient) {
    const blockBlobClient = containerClient.getBlockBlobClient(fileNameSuffixForBlob + file.name);

    const result = await blockBlobClient.uploadBrowserData(file, {
        onProgress: ev => console.log(ev)
    });
    console.log(result);
};