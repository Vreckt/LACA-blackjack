module.exports = {
    ErrorCode: errorMessage = (errorCode = 0) => {
        let message = '';
        switch (errorCode) {
            case 1 : 
                message = 'Error - The table was not found!';
                break;
            case 2 : 
                message = 'An Error occurred during the creation of the table';
                break;
            default : 
                message = 'Unknown';
                break;
        }
        return message;
    }
};