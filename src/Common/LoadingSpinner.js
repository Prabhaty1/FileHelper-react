import loadingSpinnerImage from './loadingSpinner.svg';
function LoadingSpinner() {
    return (
        <div>
            <div style={{display: "none"}} role="status" id="loadingSpinner">
                <img src={loadingSpinnerImage} height="100" width="100" alt="Processing" />
                <h1 id="loadingSpinnerText" className="loadingText"><p>Loading...</p></h1>
            </div>
        </div>
    )
};
export default LoadingSpinner;