import axios from 'axios';

export async function sendTranslateRequest(toLanguage, fromLanguage, folderNameForBlob) {

    toLanguage = toLanguage === null || toLanguage === undefined ? 'en' : toLanguage;
    const jsonData = createJsonForAzureRequest(toLanguage, fromLanguage, folderNameForBlob);

    let translationDetails = '';
    await axios.post(process.env.REACT_APP_AzureCognitiveServiceEndpoint + process.env.REACT_APP_Route, jsonData, {
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.REACT_APP_AzureCognitiveServiceKey
        }
    }).then(async response => {
        if (response.status !== 202) {
            console.log('Server Error while sending translation request', response);
            return response;
        }
        else {
            translationDetails = await getRequestStatus(translationDetails);
        }
    }).catch(error => {
        console.log('Exception while sending translation request', error, error.response.data.error.message);
        return error;
    });

    console.log(translationDetails);
};

async function getRequestStatus(translationDetails) {;
    await axios.get(process.env.REACT_APP_AzureCognitiveServiceEndpoint + process.env.REACT_APP_Route, {
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.REACT_APP_AzureCognitiveServiceKey
        }
    }).then(async response => {
        if (response.status === 200) {
            translationDetails = response.data.value[0];
            if (translationDetails === undefined || translationDetails === '' || translationDetails.status === 'ValidationFailed') {
                return translationDetails;
            }
            if (translationDetails.status === 'Succeeded') {
                return translationDetails;
            }
            else if (translationDetails.status === 'Running' || translationDetails.status === 'NotStarted'){
                while (translationDetails.status !== 'Succeeded') {
                    if (translationDetails === undefined || translationDetails === '' || translationDetails.status === 'ValidationFailed') {
                        return translationDetails;
                    }
                    await function(){ new Promise(resolve => setTimeout(resolve, 5000)); }
                    translationDetails = await getRequestStatusByTranslationId(translationDetails.id, translationDetails);
                }
            }
        }
    }).catch(error => {
        console.log('Exception while 1st get translation status', error);
    });

    return translationDetails
}

async function getRequestStatusByTranslationId(translationId, translationDetails) {
    await axios.get(process.env.REACT_APP_AzureCognitiveServiceEndpoint + process.env.REACT_APP_Route + translationId, {
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.REACT_APP_AzureCognitiveServiceKey
        }
    }).then(response => {
        if (response.status === 200) {
            translationDetails = response.data;
        }
        else{
            console.log('Server Error while getting translation status by Id', response);
        }
    }).catch(error => {
        console.log('Exception while 1st get translation status', error);
    });

    return translationDetails;
}

// Do not modify this function, as it creates a JSON object that is used to send a request to Azure Cognitive Services.
function createJsonForAzureRequest(languageTo, languageFrom = "", specificFolder = "") {
    let json = `{"inputs": [{"source": {"sourceUrl":"${process.env.REACT_APP_SourceURL}" ,"storageSource": "AzureBlob"`;
    if (specificFolder !== "") {
        json += `,"filter": {"prefix": "${process.env.REACT_APP_FolderName}/${specificFolder}"}`;
    }
    if (languageFrom !== "") {
        json += `,"language": "${languageFrom}"}`;
    } else {
        json += "}";
    }
    json += `, "targets": [{"targetUrl":"${process.env.REACT_APP_TargetURL}","storageSource": "AzureBlob","category": "general","language": "${languageTo}"}]}]}`;

    return json;
}

export function LanguageSupported() {
    return (
        <>
            <option defaultValue="" value="">Choose...</option>
            <option value="en">English</option>
            <option value="de">Dutch</option>
            <option value="3">Three</option>
        </>
    );
}